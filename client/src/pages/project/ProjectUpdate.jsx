import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getProjectById, updateProject } from '../../controllers/projectController';
import "../../css/ProjectUpdate.css";

const ProjectUpdate = () => {
  const { projectId } = useParams();  // Change from { id } to { projectId }
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    projectName: '',
    projectCode: '',
    clientName: '',
    startDate: '',
    estimatedEndDate: '',
    status: 'In Progress',
    budget: '',
    projectManager: '',
    teamMembers: '',
    priority: 'Medium',
    description: ''
  });

  useEffect(() => {
    const parsedId = parseInt(projectId);  // Changed from projectId to parsedId
    if (!parsedId || isNaN(parsedId)) {
      setError('Invalid project ID');
      setTimeout(() => navigate('/dashboard/project'), 2000);
      return;
    }
    fetchProject(parsedId);
  }, [projectId, navigate]);  // Updated dependency array

  const fetchProject = async (projectId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProjectById(projectId);
      
      if (!data) {
        throw new Error('Project not found');
      }

      // Match data structure with server model
      setFormData({
        projectName: data.projectName || '',
        projectCode: data.projectCode || '',
        clientName: data.clientName || '',
        startDate: data.startDate?.split('T')[0] || '',
        estimatedEndDate: data.estimatedEndDate?.split('T')[0] || '',
        status: data.status || 'In Progress',
        budget: data.budget || '',
        projectManager: data.projectManager || '',
        teamMembers: data.teamMembers || '',
        priority: data.priority || 'Medium',
        description: data.description || ''
      });
    } catch (err) {
      setError(err.message);
      setTimeout(() => navigate('/dashboard/project'), 2000);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Format dates to YYYY-MM-DD
      const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date format');
        }
        return date.toISOString().split('T')[0];
      };

      // Format data for submission
      const formattedData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget).toFixed(2) : '0.00',
        startDate: formatDate(formData.startDate),
        estimatedEndDate: formatDate(formData.estimatedEndDate),
        projectName: formData.projectName.trim(),
        projectCode: formData.projectCode.trim(),
        clientName: formData.clientName.trim(),
        projectManager: formData.projectManager.trim(),
        teamMembers: formData.teamMembers.trim(),
        description: formData.description.trim()
      };

      // Validate dates
      if (!formattedData.startDate) {
        throw new Error('Invalid start date');
      }

      if (formattedData.startDate > formattedData.estimatedEndDate) {
        throw new Error('Start date cannot be after end date');
      }

      await updateProject(projectId, formattedData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/project');
      }, 1500); // Wait 1.5 seconds before navigation
    } catch (err) {
      setError(err.message || 'Failed to update project');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (success) return <div className="success">Project updated successfully!</div>;

  return (
    <div className="project-update-container">
      <h2>Update Project</h2>
      <form onSubmit={handleSubmit} className="project-form">
        <div className="form-group">
          <label>Project Name</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Project Code</label>
            <input
              type="text"
              name="projectCode"
              value={formData.projectCode}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Estimated End Date</label>
            <input
              type="date"
              name="estimatedEndDate"
              value={formData.estimatedEndDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Budget</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Project Manager</label>
          <input
            type="text"
            name="projectManager"
            value={formData.projectManager}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Team Members</label>
          <input
            type="text"
            name="teamMembers"
            value={formData.teamMembers}
            onChange={handleChange}
            placeholder="Comma separated names"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/dashboard/project')} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Project'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectUpdate;
