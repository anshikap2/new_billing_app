import axios from "axios";
import { API_BASE } from "../config/config";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  if (!token) throw new Error("Authorization token is missing");

  return {
    Authorization: `Bearer ${token}`,
    "ngrok-skip-browser-warning": "true"
  };
};

// Expenses
export const getExpenses = async () => {
  const cached = localStorage.getItem("expenses");
  

  const response = await axios.get(`${API_BASE}/exp/expenses`, {
    headers: getAuthHeaders()
  });

  localStorage.setItem("expenses", JSON.stringify(response.data));
  return response.data;
};

// Employees
export const getEmployees = async () => {
  const cached = localStorage.getItem("employees");
  if (cached) return JSON.parse(cached);

  const response = await axios.get(`${API_BASE}/emp/employees`, {
    headers: getAuthHeaders()
  });

  localStorage.setItem("employees", JSON.stringify(response.data));
  return response.data;
};

// Projects
export const getProjects = async () => {
  const cached = localStorage.getItem("projects");
  if (cached) return JSON.parse(cached);

  const response = await axios.get(`${API_BASE}/proj/projects`, {
    headers: getAuthHeaders()
  });

  localStorage.setItem("projects", JSON.stringify(response.data));
  return response.data;
};

export const deleteExpense = async (expenseId) => {
  const response = await axios.delete(`${API_BASE}/exp/expenses/${expenseId}`, {
    headers: getAuthHeaders(),
  });

  // Clear local cache
  localStorage.removeItem("expenses");
  return response.data;
};


const getExpenseById = async (id) => {
  try {
    const response = await fetch(`/exp/expenses/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch expense: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching expense:', error);
    throw error;
  }
};

// Update expense
export const updateExpense = async (expenseId, updatedData) => {
  try {
    console.log(`Updating expense with ID: ${expenseId}`);
    console.log(`API URL: ${API_BASE}/exp/expenses/${expenseId}`);
    console.log('Update data:', updatedData);
    
    const response = await axios.put(
      `${API_BASE}/exp/expenses/${expenseId}`,
      updatedData,
      {
        headers: getAuthHeaders(),
      }
    );
    
    // Clear local cache
    localStorage.removeItem('expenses');
    
    return response.data;
  } catch (error) {
    console.error(`Error updating expense with ID ${expenseId}:`, error);
    if (error.response) {
      console.error('Server response:', error.response.data);
      console.error('Status code:', error.response.status);
    }
    throw error;
  }
};
