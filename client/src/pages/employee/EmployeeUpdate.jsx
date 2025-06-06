import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployeeById, updateEmployee } from '../../controllers/employeeController';
import "../../css/EmployeeUpdate.css";

const EmployeeUpdate = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    joinDate: '',
    salary: '',
    address: '',
    emergencyContact: ''
  });

  useEffect(() => {
    const parsedId = parseInt(employeeId);
    if (!parsedId || isNaN(parsedId)) {
      setError('Invalid employee ID');
      setTimeout(() => navigate('/dashboard/employees'), 2000);
      return;
    }
    fetchEmployee(parsedId);
  }, [employeeId, navigate]);

  const fetchEmployee = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEmployeeById(id);
      
      if (!data) {
        throw new Error('Employee not found');
      }

      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
        position: data.position || '',
        department: data.department || '',
        joinDate: data.joinDate?.split('T')[0] || '',
        salary: data.salary || '',
        address: data.address || '',
        emergencyContact: data.emergencyContact || ''
      });
    } catch (err) {
      setError(err.message);
      setTimeout(() => navigate('/dashboard/employees'), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Format date
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];  // Returns YYYY-MM-DD
      };

      // Format data for submission
      const formattedData = {
        id: parseInt(employeeId),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        position: formData.position.trim(),
        department: formData.department.trim(),
        joinDate: formatDate(formData.joinDate),
        salary: formData.salary ? parseFloat(formData.salary).toFixed(2) : '0.00',
        address: formData.address.trim(),
        emergencyContact: formData.emergencyContact.trim()
      };

      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'position'];
      const missingFields = requiredFields.filter(field => !formattedData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Please fill in required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formattedData.email)) {
        throw new Error('Please enter a valid email address');
      }

      await updateEmployee(employeeId, formattedData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard/employee'), 1500);
    } catch (err) {
      setError(err.message || 'Failed to update employee');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (success) return <div className="success">Employee updated successfully!</div>;

  return (
    <div className="employee-update-container">
      <h2>Update Employee</h2>
      <form onSubmit={handleSubmit} className="employee-form">
        <div className="form-row">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Join Date</label>
            <input
              type="date"
              name="joinDate"
              value={formData.joinDate}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
          />
        </div>

        <div className="form-group">
          <label>Emergency Contact</label>
          <input
            type="text"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard/employees')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Employee'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeUpdate;
