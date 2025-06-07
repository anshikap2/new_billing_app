import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getProjects, deleteProject } from '../../controllers/projectController';
import ProjectUpdate from './ProjectUpdate';
import Spinner from '../../components/Spinner';
import "../../css/ProjectPage.css";

const ProjectPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      if (!Array.isArray(data)) {
        throw new Error('Invalid project data received');
      }
      setProjects(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load projects';
      setError(errorMessage);
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add error handling for failed API responses
  const handleError = (error) => {
    console.error('API Error:', error);
    let errorMessage = 'An unexpected error occurred';
    
    if (error.response) {
      // Server responded with error
      errorMessage = error.response.data.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // No response received
      errorMessage = 'No response from server';
    }
    
    setError(errorMessage);
  };

  const handleDelete = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setLoading(true);
        await deleteProject(projectId);
        await fetchProjects(); // Refresh the list
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to delete project');
        console.error('Delete error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProjects = projects.filter(project => 
    project?.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  // Update table structure to match API response
  return (
    <div className="project-container">
      <div className="Project-fixed-header">
        <h1 className="project-title">Projects Management</h1>
        <div className="project-controls">
        <div className="project-search-bar">
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="product-create-btn"
          onClick={() => navigate('/dashboard/add-project')}
        >
          <FaPlus /> Add New Project
        </button>
      </div>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="table-container">
          <table className="project-table">
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Project Code</th>
                <th>Client</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id || 'unknown'}>
                  <td>{project.projectName || 'Untitled'}</td>
                  <td>{project.projectCode || 'N/A'}</td>
                  <td>{project.clientName || 'No Client'}</td>
                  <td>{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'No Date'}</td>
                  <td>
                    <span className={`project-table status ${(project.status || '').toLowerCase().replace(' ', '-')}`}>
                      {project.status || 'Unknown'}
                    </span>
                  </td>
                  <td>₹{(project.budget || 0).toLocaleString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/dashboard/update-project/${project.id}`)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(project.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectPage;