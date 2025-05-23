import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaTrash,
  FaEdit,
  FaUserPlus,
  FaFolderPlus,
} from "react-icons/fa";
import Spinner from "../components/Spinner";
import ExpensesGraphPage from "./ExpensesGraphPage";
import { ExpenseModel } from "../models/expenseModel";
import "../css/ExpensesPage.css";
import { getExpenses, deleteExpense } from "../controllers/expenseController";

const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isGraphOpen, setIsGraphOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedRow, setExpandedRow] = useState(null);

  const categories = [
    "All",
    "Salary",
    "Advance",
    "Personal Expense",
    "Project Expense",
    "Misc",
  ];

  const navigate = useNavigate();

  useEffect(() => {
    console.debug(`[ExpensesPage] Fetching expenses for page ${page}`);
    fetchExpenses();
  }, [page]);

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getExpenses();
      
      console.log(`Received ${data.length} expense records from API`);
      console.log("Raw expenses data from API:", data);

      console.log("[ExpensesPage] Fetched expenses:", data);
      const mappedExpenses = data.map((exp) => new ExpenseModel(exp));
      setExpenses(mappedExpenses);
      setFilteredExpenses(mappedExpenses);
      setTotalPages(10); // Update if API supports pagination
    } catch (err) {
      setError("Failed to load expenses");
      console.error("[ExpensesPage] Error loading expenses:", err);
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.debug(
      `[ExpensesPage] Filtering expenses with search="${search}" and category="${selectedCategory}"`
    );
    setFilteredExpenses(
      expenses.filter((expense) => {
        let natureFundStr = "";
        if (Array.isArray(expense.natureOfFund)) {
          natureFundStr = expense.natureOfFund.join(" ").toLowerCase();
        } else if (
          typeof expense.natureOfFund === "object" &&
          expense.natureOfFund !== null
        ) {
          natureFundStr = expense.natureOfFund.type?.toLowerCase() || "";
        } else {
          natureFundStr = String(expense.natureOfFund || "").toLowerCase();
        }

        const matchesSearch =
          expense.project.toLowerCase().includes(search.toLowerCase()) ||
          expense.employee.toLowerCase().includes(search.toLowerCase()) ||
          natureFundStr.includes(search.toLowerCase());

        const matchesCategory =
          selectedCategory === "All" ||
          (Array.isArray(expense.natureOfFund)
            ? expense.natureOfFund.includes(selectedCategory)
            : typeof expense.natureOfFund === "object"
            ? expense.natureOfFund.type === selectedCategory
            : expense.natureOfFund === selectedCategory);

        return matchesSearch && matchesCategory;
      })
    );
  }, [search, expenses, selectedCategory]);

  const toggleRowExpansion = (expenseId) => {
    console.debug(`[ExpensesPage] Toggle row expansion for expenseId: ${expenseId}`);
    setExpandedRow(expandedRow === expenseId ? null : expenseId);
  };

  const handleAddEmployee = () => {
    console.debug("[ExpensesPage] Navigate to Add Employee page");
    navigate("/dashboard/add-employee");
  };

  const handleAddProject = () => {
    console.debug("[ExpensesPage] Navigate to Add Project page");
    navigate("/dashboard/add-project");
  };

  // Delete expense handler
  const handleDelete = async (expenseId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this expense?"
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      console.debug(`[ExpensesPage] Deleting expense with id: ${expenseId}`);
      await deleteExpense(expenseId);
      console.debug("[ExpensesPage] Expense deleted, refreshing list...");
      await fetchExpenses();
    } catch (err) {
      setError("Failed to delete expense");
      console.error("[ExpensesPage] Error deleting expense:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const totalDebit = filteredExpenses.reduce(
    (sum, exp) => sum + (Number(exp.debit) || 0),
    0
  );
  const totalCredit = filteredExpenses.reduce(
    (sum, exp) => sum + (Number(exp.credit) || 0),
    0
  );

  const displayNatureOfFund = (natureOfFund) => {
    if (Array.isArray(natureOfFund)) {
      return natureOfFund.join(", ");
    } else if (typeof natureOfFund === "object" && natureOfFund !== null) {
      return natureOfFund.type || "";
    } else {
      return natureOfFund || "";
    }
  };

  return (
    <div className="expense-container">
      <div className="expense-fixed-header">
        <div className="expense-title">
          <h2>Expenses</h2>
        </div>
        <div className="expense-controls">
          <select
            value={selectedCategory}
            onChange={(e) => {
              console.debug("[ExpensesPage] Category changed to:", e.target.value);
              setSelectedCategory(e.target.value);
            }}
            className="category-select"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search Expense"
              value={search}
              onChange={(e) => {
                console.debug("[ExpensesPage] Search changed to:", e.target.value);
                setSearch(e.target.value);
              }}
            />
            <span className="search-icon">
              <FaSearch className="search-icon" />
            </span>
          </div>
          <button
            className="action-button create-btn"
            onClick={() => {
              console.debug("[ExpensesPage] Navigate to Create Expense page");
              navigate("/dashboard/create-expense");
            }}
          >
            Create New
          </button>
          <button className="action-button emp-btn" onClick={handleAddEmployee}>
            <FaUserPlus /> Add Emp
          </button>
          <button
            className="action-button project-btn"
            onClick={handleAddProject}
          >
            <FaFolderPlus /> Add Project
          </button>
          <button
            className="action-button graph-btn"
            onClick={() => {
              console.debug("[ExpensesPage] Open Graph view");
              setIsGraphOpen(true);
            }}
          >
            Graph
          </button>
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="spinner-overlay">
            <Spinner />
          </div>
        ) : error ? (
          <p className="error-message">❌ Error: {error}</p>
        ) : (
          <table className="expense-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Employee Name</th>
                <th>Funds</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {!loading && !error && filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <React.Fragment key={expense.expenseId}>
                    <tr
                      onClick={() => toggleRowExpansion(expense.expenseId)}
                      className={`expense-row ${
                        expandedRow === expense.expenseId ? "expanded" : ""
                      }`}
                    >
                      <td>{expense.project}</td>
                      <td>{expense.employee}</td>
                      <td>{displayNatureOfFund(expense.natureOfFund)}</td>
                      <td>₹{expense.debit}</td>
                      <td>₹{expense.credit}</td>
                      <td className="expense-action">
                        <span className="action-buttons">
                          <button
                            className="action-btn edit-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              console.debug(`[ExpensesPage] Edit clicked for expenseId: ${expense.expenseId}`);
                              navigate(
                                `/dashboard/update-expense/${expense.expenseId}`
                              );
                            }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(expense.expenseId);
                            }}
                          >
                            <FaTrash />
                          </button>
                        </span>
                      </td>
                    </tr>
                    {expandedRow === expense.expenseId && (
                      <tr className="expanded-details">
                        <td colSpan="6">
                          <div className="details-grid">
                            <div className="detail-section">
                              <h4>Financial Details</h4>
                              <p>
                                <strong>Debit:</strong> ₹{expense.debit}
                              </p>
                              <p>
                                <strong>Credit:</strong> ₹{expense.credit}
                              </p>
                              <p>
                                <strong>Balance (Due - Advance):</strong> ₹
                                {(
                                  Number(expense.credit || 0) -
                                  Number(expense.debit || 0)
                                ).toFixed(2)}
                              </p>
                            </div>

                            <div className="detail-section">
                              <h4>Employee Information</h4>
                              <p>
                                <strong>Project:</strong> {expense.project}
                              </p>
                              <p>
                                <strong>Employee:</strong> {expense.employee}
                              </p>
                              <p>
                                <strong>Date:</strong>{" "}
                                {new Date(expense.date).toLocaleDateString()}
                              </p>
                              <p>
                                <strong>Updated Date:</strong>{" "}
                                {new Date(
                                  expense.updatedDate
                                ).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="detail-section">
                              <h4>Additional Information</h4>
                              <p>
                                <strong>Remarks:</strong> {expense.remarks}
                              </p>
                              <p>
                                <strong>Paid By:</strong> {expense.paidby}
                              </p>
                              {expense.paidbyDetails && (
                                <p>
                                  <strong>Payment Details:</strong>{" "}
                                  {expense.paidbyDetails}
                                </p>
                              )}
                              <p>
                                <strong>Created Date:</strong>{" "}
                                {new Date(
                                  expense.createdDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-expenses">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan="3"
                  style={{ textAlign: "right", fontWeight: "bold" }}
                >
                  Total:
                </td>
                <td style={{ fontWeight: "bold" }}>₹{totalDebit}</td>
                <td style={{ fontWeight: "bold" }}>₹{totalCredit}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => {
            console.debug(`[ExpensesPage] Previous page clicked. Current page: ${page}`);
            setPage(page - 1);
          }}
        >
          Previous
        </button>
        <span>
          {" "}
          Page {page} of {totalPages}{" "}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => {
            console.debug(`[ExpensesPage] Next page clicked. Current page: ${page}`);
            setPage(page + 1);
          }}
        >
          Next
        </button>
      </div>

      {isGraphOpen && (
        <ExpensesGraphPage
          onClose={() => {
            console.debug("[ExpensesPage] Close graph view");
            setIsGraphOpen(false);
          }}
          expenses={filteredExpenses}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
