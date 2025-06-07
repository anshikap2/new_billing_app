import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { getEmployees, deleteEmployee } from '../../controllers/employeeController';
import Spinner from '../../components/Spinner';
import "../../css/EmployeePage.css";

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployees();
      if (!Array.isArray(data)) {
        throw new Error('Invalid employee data received');
      }
      setEmployees(data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load employees';
      setError(errorMessage);
      console.error('Error loading employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        setLoading(true);
        await deleteEmployee(employeeId);
        await fetchEmployees();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredEmployees = employees.filter(employee => 
    `${employee?.firstName} ${employee?.lastName}`?.toLowerCase().includes(search.toLowerCase()) ||
    employee?.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="employee-container">
      <div className="Employee-fixed-header">
        <h1 className="employee-title">Employees Management</h1>
         <div className="employee-controls">
        <div className="employee-search-bar">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          className="employee-create-btn"
          onClick={() => navigate('/dashboard/add-employee')}
        >
          <FaPlus /> Add New Employee
        </button>
      </div>
      </div>

     

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="table-container">
          <table className="employee-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Department</th>
                <th>Join Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>{`${employee.firstName || ''} ${employee.lastName || ''}`}</td>
                  <td>{employee.email}</td>
                  <td>{employee.position}</td>
                  <td>{employee.department}</td>
                  <td>{employee.joinDate ? new Date(employee.joinDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => navigate(`/dashboard/update-employee/${employee.id}`)}
                        title="Edit Employee"
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(employee.id)}
                        title="Delete Employee"
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

export default EmployeePage;
