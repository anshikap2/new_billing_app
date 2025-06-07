import React, { useState, useEffect } from "react";
import axiosInstance from '../../utils/axiosConfig';
import "../../css/UpdateOrganizationPage.css";
import { API_BASE } from "../../config/config";
import qs from "qs";

export default function UpdateOrganizationPage({ organization, onClose, setOrganizations }) {
  const [updatedOrg, setUpdatedOrg] = useState(organization || {});
  const [gstEntries, setGstEntries] = useState([]);
  const [logoFile, setLogoFile] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);

  useEffect(() => {
    // Initialize with organization data or empty object
    setUpdatedOrg(organization || {});
    
    if (organization?.gst_details) {
      const gstArray = Object.entries(organization.gst_details).map(([stateCode, details]) => ({
        stateCode,
        gstNumber: details.gst_number,
        lastInvoiceNumber: details.last_invoice_number,
        address: details.address || ''
      }));
      setGstEntries(gstArray);
    } else {
      setGstEntries([]);
    }
  }, [organization]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedOrg((prev) => ({ ...prev, [name]: value }));
  };

  const handleGstChange = (index, field, value) => {
    const newGstEntries = [...gstEntries];
    newGstEntries[index][field] = value;
    setGstEntries(newGstEntries);
  };

  const addGstEntry = () => {
    setGstEntries([...gstEntries, { stateCode: '', gstNumber: '', lastInvoiceNumber: 0, address: '' }]);
  };

  const removeGstEntry = (index) => {
    setGstEntries(gstEntries.filter((_, i) => i !== index));
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (300KB limit for signature)
      if (file.size > 300 * 1024) {
        alert('Signature file size should be less than 300KB');
        return;
      }
      setSignatureFile(file);
      setUpdatedOrg(prev => ({
        ...prev,
        signature_image: URL.createObjectURL(file)
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (500KB limit for logo)
      if (file.size > 500 * 1024) {
        alert('Logo file size should be less than 500KB');
        return;
      }
      setLogoFile(file);
      setUpdatedOrg(prev => ({
        ...prev,
        logo_image: URL.createObjectURL(file)
      }));
    }
  };

  const handleUpdate = async () => {
    if (!updatedOrg.org_id) {
      alert("❌ Organization ID is required");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("❌ User not authenticated. Please log in.");
      return;
    }

    try {
      // Convert form data to clean object first
      const updateData = {
        name: updatedOrg.name,
        type: updatedOrg.type,
        email: updatedOrg.email,
        phone: updatedOrg.phone,
        website: updatedOrg.website,
        reg_number: updatedOrg.reg_number,
        pan_number: updatedOrg.pan_number,
        invoice_prefix: updatedOrg.invoice_prefix,
        bank_name: updatedOrg.bank_name,
        acc_name: updatedOrg.acc_name,
        ifsc: updatedOrg.ifsc,
        branch: updatedOrg.branch,
        acc_num: updatedOrg.acc_num
      };

      // Filter out empty values
      const cleanData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => 
          value !== undefined && value !== null && value !== ''
        )
      );

      // Add GST details if any exist
      const gst_details = {};
      gstEntries.forEach(entry => {
        if (entry.stateCode && entry.gstNumber) {
          gst_details[entry.stateCode.toUpperCase()] = {
            gst_number: entry.gstNumber,
            last_invoice_number: parseInt(entry.lastInvoiceNumber || 0),
            address: entry.address || ''
          };
        }
      });

      if (Object.keys(gst_details).length > 0) {
        cleanData.gst_details = JSON.stringify(gst_details);
      }

      // Validate if there's any data to update
      if (Object.keys(cleanData).length === 0 && !logoFile && !signatureFile) {
        alert("❌ No changes detected to update");
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      // Add clean data to FormData
      Object.entries(cleanData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Add files if they exist
      if (logoFile) {
        formData.append('logo_image', logoFile);
      }
      if (signatureFile) {
        formData.append('signature_image', signatureFile);
      }

      console.log('Updating with data:', Object.fromEntries(formData.entries()));

      const response = await axiosInstance({
        method: 'put',
        url: `${API_BASE}/organization/update`,
        params: { org_id: updatedOrg.org_id },
        data: formData,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.status === 200) {
        console.log("✅ Update successful:", response.data);
        alert("✅ Organization updated successfully!");
        setOrganizations((prevOrgs) =>
          prevOrgs.map((org) =>
            org.org_id === updatedOrg.org_id ? { ...org, ...updatedOrg } : org
          )
        );
        onClose();
      }
    } catch (error) {
      console.error("❌ Error updating organization:", error);
      const errorMessage = error.response?.data?.message || error.message;
      alert(`❌ Failed to update organization: ${errorMessage}`);
      
      if (error.response) {
        console.error('Error Response:', {
          data: error.response.data,
          status: error.response.status,
          headers: error.response.headers
        });
      }
    }
  };

  return (
    <div className="update-organization-modal">
      <div className="update-organization-wrapper">
        <button className="update-organization-close" onClick={onClose}>&times;</button>
        <div className="update-organization-title">Update Organization</div>
        <div className="update-organization-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Organization Logo</label>
              {updatedOrg.logo_image ? (
                <div className="logo-preview">
                  <img 
                    src={updatedOrg.logo_image} 
                    alt="Current logo" 
                    className="preview-image"
                  />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => {
                      setUpdatedOrg(prev => ({...prev, logo_image: ''}));
                      setLogoFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  name="logo_image"
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="file-input"
                />
              )}
            </div>

            <div className="form-group full-width">
              <label>Signature Image</label>
              {updatedOrg.signature_image ? (
                <div className="signature-preview">
                  <img 
                    src={updatedOrg.signature_image} 
                    alt="Current signature" 
                    className="preview-image"
                  />
                  <button 
                    type="button" 
                    className="remove-image"
                    onClick={() => {
                      setUpdatedOrg(prev => ({...prev, signature_image: ''}));
                      setSignatureFile(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <input
                  type="file"
                  name="signature_image"
                  onChange={handleSignatureChange}
                  accept="image/*"
                  className="file-input"
                />
              )}
            </div>

            <div className="form-group">
              <label>Name</label>
              <input type="text" name="name" value={updatedOrg.name || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Type</label>
              <input type="text" name="type" value={updatedOrg.type || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={updatedOrg.email || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input type="text" name="phone" value={updatedOrg.phone || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Website</label>
              <input type="text" name="website" value={updatedOrg.website || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input type="text" name="reg_number" value={updatedOrg.reg_number || ""} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>PAN Number</label>
              <input type="text" name="pan_number" value={updatedOrg.pan_number || ""} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Invoice Prefix</label>
              <input type="text" name="invoice_prefix" value={updatedOrg.invoice_prefix || ""} onChange={handleChange} placeholder="e.g., INV, ORG" />
            </div>
          </div>

          <div className="gst-section">
            <h3>GST Details</h3>
            <div className="gst-entries">
              {gstEntries.map((entry, index) => (
                <div key={index} className="gst-entry-card">
                  <div className="gst-entry-inputs">
                    <div className="form-group gst-input-field">
                      <label className="gst-label">State Code</label>
                      <div className="gst-input-container">
                        <input
                          type="text"
                          className="gst-input"
                          placeholder="e.g., KA, MH"
                          value={entry.stateCode}
                          onChange={(e) => handleGstChange(index, 'stateCode', e.target.value.toUpperCase())}
                          maxLength="2"
                        />
                      </div>
                    </div>
                    <div className="form-group gst-input-field">
                      <label className="gst-label">GST Number</label>
                      <div className="gst-input-container">
                        <input
                          type="text"
                          className="gst-input"
                          placeholder="Enter GST Number"
                          value={entry.gstNumber}
                          onChange={(e) => handleGstChange(index, 'gstNumber', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>GST Address</label>
                      <textarea
                        placeholder="Enter complete address for this GST registration"
                        value={entry.address || ''}
                        onChange={(e) => handleGstChange(index, 'address', e.target.value)}
                        className="gst-address-input"
                        rows="3"
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="remove-gst-btn"
                    onClick={() => removeGstEntry(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="add-gst-btn" onClick={addGstEntry}>
              + Add New GST Entry
            </button>
          </div>

          <div className="bank-section">
            <h3 className="section-title">Bank Details</h3>
            <div className="bank-details-grid">
              <div className="form-group">
                <label className="required-field">Bank Name</label>
                <input 
                  type="text" 
                  name="bank_name" 
                  value={updatedOrg.bank_name || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., State Bank of India"
                  className="bank-input"
                />
              </div>

              <div className="form-group">
                <label className="required-field">Account Name</label>
                <input 
                  type="text" 
                  name="acc_name" 
                  value={updatedOrg.acc_name || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., Company Name"
                  className="bank-input"
                />
              </div>

              <div className="form-group">
                <label className="required-field">Account Number</label>
                <input 
                  type="text" 
                  name="acc_num" 
                  value={updatedOrg.acc_num || ""} 
                  onChange={handleChange} 
                  placeholder="Enter 11-16 digit account number"
                  className="bank-input"
                  maxLength="16"
                />
              </div>

              <div className="form-group">
                <label className="required-field">IFSC Code</label>
                <input 
                  type="text" 
                  name="ifsc" 
                  value={updatedOrg.ifsc || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., SBIN0123456"
                  className="bank-input"
                  maxLength="11"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label>Branch</label>
                <input 
                  type="text" 
                  name="branch" 
                  value={updatedOrg.branch || ""} 
                  onChange={handleChange} 
                  placeholder="e.g., Main Branch, City"
                  className="bank-input"
                />
              </div>
            </div>
          </div>

        </div>
        <div className="form-actions">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-save" onClick={handleUpdate}>Update Organization</button>
        </div>
      </div>
    </div>
  );
}