import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../../css/UpdateExpensePage.css';
import { updateExpense, getExpenseById } from '../../controllers/expenseController';
import { FaArrowLeft, FaSave, FaPlus, FaTrash, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import Spinner from '../../components/Spinner';


const UpdateExpensePage = () => {
  const navigate = useNavigate();
  const { expenseId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formValid, setFormValid] = useState(false);

  const [expense, setExpense] = useState({
    expenseId: '',
    project: '',
    employee: '',
    paidby: '',
    natureOfFund: [''],
    debit: '',
    credit: '',
    date: '',
    updatedDate: '',
    createdDate: '',
    remarks: ''
  });

  // Available categories matching ExpensesPage
  const categories = [
    "Salary",
    "Advance", 
    "Personal Expense",
    "Project Expense",
    "Misc"
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Enhanced form validation with debugging
  useEffect(() => {
    const isValid = 
      expense.project?.trim() !== '' && 
      expense.employee?.trim() !== '' && 
      expense.paidby?.trim() !== '' && 
      expense.natureOfFund?.every(fund => fund?.trim() !== '') &&
      (expense.debit !== '' || expense.credit !== '') && 
      expense.date !== '';
    
    setFormValid(isValid);
  }, [expense]);

  useEffect(() => {
    const fetchExpenseData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getExpenseById(expenseId);
        
        // Enhanced handling of natureOfFund data
        let natureOfFundArray = [''];
        
        if (Array.isArray(data.natureOfFund)) {
          natureOfFundArray = data.natureOfFund.map(nf => 
            typeof nf === 'object' && nf !== null ? nf.type : nf
          );
        } else if (typeof data.natureOfFund === 'object' && data.natureOfFund !== null) {
          natureOfFundArray = [data.natureOfFund.type];
        } else if (data.natureOfFund) {
          natureOfFundArray = [data.natureOfFund];
        }

        // Ensure we have at least one empty field if no data
        if (natureOfFundArray.length === 0 || natureOfFundArray.every(fund => !fund)) {
          natureOfFundArray = [''];
        }

        const formattedExpense = {
          expenseId: data.expenseId || data._id || '',
          project: data.project || '',
          employee: data.employee || '',
          paidby: data.paidby || data.paidBy || '',
          natureOfFund: natureOfFundArray,
          debit: data.debit || '',
          credit: data.credit || '',
          date: formatDate(data.date),
          updatedDate: formatDate(data.updatedDate),
          createdDate: formatDate(data.createdDate),
          remarks: data.remarks || ''
        };

        setExpense(formattedExpense);
        
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load expense data';
        setError(errorMessage);
        
        // Auto-redirect after showing error
        setTimeout(() => {
          navigate('/dashboard/expenses-page');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (expenseId) {
      fetchExpenseData();
    } else {
      setError('No expense ID provided');
      navigate('/dashboard/expenses-page');
    }
  }, [expenseId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNatureOfFundChange = (index, value) => {
    const newNatureOfFund = [...expense.natureOfFund];
    newNatureOfFund[index] = value;
    setExpense(prev => ({
      ...prev,
      natureOfFund: newNatureOfFund
    }));
  };

  const addNatureOfFund = () => {
    setExpense(prev => ({
      ...prev,
      natureOfFund: [...prev.natureOfFund, '']
    }));
  };

  const removeNatureOfFund = (index) => {
    if (expense.natureOfFund.length > 1) {
      const updatedNatureOfFund = [...expense.natureOfFund];
      updatedNatureOfFund.splice(index, 1);
      setExpense(prev => ({
        ...prev,
        natureOfFund: updatedNatureOfFund
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formValid) return;
    
    setLoading(true);
    
    try {
      const formatSQLDate = (date) => {
        if (!date) return null;
        return new Date(date).toISOString().split('T')[0];
      };
      
      const updatedExpense = {
        ...expense,
        natureOfFund: expense.natureOfFund
          .filter(type => type.trim() !== '')
          .map(type => ({ type: type.trim() })),
        date: formatSQLDate(expense.date),
        updatedDate: formatSQLDate(new Date()),
        createdDate: formatSQLDate(expense.createdDate || new Date()),
        debit: expense.debit ? Number(expense.debit) : 0,
        credit: expense.credit ? Number(expense.credit) : 0
      };

      await updateExpense(expenseId, updatedExpense);
      alert('Expense updated successfully!');
      navigate('/dashboard/expenses-page');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update expense. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced error display
  if (error) {
    return (
      <div className="update-expense-container error-container">
        <div className="error-message">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <p>Redirecting to expenses list...</p>
          <button 
            onClick={() => navigate('/dashboard/expenses-page')}
            className="update-exp-cancel-btn"
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back to Expenses
          </button>
        </div>
      </div>
    );
  }

  // Enhanced loading display
  if (loading && !expense.project) {
    return (
      <div className="update-expense-container loading-container">
        <Spinner />
        <p>Loading expense data...</p>
      </div>
    );
  }

  return (
    <div className="update-expense-container">
      

      <div className="update-expense-header">
        <h2>
          <FaMoneyBillWave style={{ marginRight: '10px', verticalAlign: 'middle' }} /> 
          Update Expense
        </h2>
        <p>Review and modify expense details below</p>
       
      </div>
      
      <form onSubmit={handleSubmit} className="update-expense-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Project <span className="required"></span></label>
            <input
              type="text"
              name="project"
              value={expense.project || ''}
              onChange={handleChange}
              placeholder="Enter project name"
              required
              className={expense.project ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Employee <span className="required"></span></label>
            <input
              type="text"
              name="employee"
              value={expense.employee || ''}
              onChange={handleChange}
              placeholder="Enter employee name"
              required
              className={expense.employee ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group">
            <label>Paid By <span className="required"></span></label>
            <input
              type="text"
              name="paidby"
              value={expense.paidby || ''}
              onChange={handleChange}
              placeholder="Enter payer name"
              required
              className={expense.paidby ? 'valid-input' : ''}
            />
          </div>
          
          <div className="form-group full-width">
            <label>Nature of Fund <span className="required"></span></label>
            <div className="nature-fund-container">
              {expense.natureOfFund.map((type, index) => (
                <div key={index} className="nature-fund-row">
                  <select
                    value={type || ''}
                    onChange={(e) => handleNatureOfFundChange(index, e.target.value)}
                    className={`nature-input ${type ? 'valid-input' : ''}`}
                    required
                  >
                    <option value="">Select fund type</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {expense.natureOfFund.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeNatureOfFund(index)} 
                      className="remove-btn"
                      title="Remove this item"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          
          </div>
          
          <div className="form-group">
            <label>Debit (₹) <span className="required"></span></label>
            <input
              type="number"
              name="debit"
              value={expense.debit || ''}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={expense.debit ? 'valid-input' : ''}
            />
            <small className="field-note">Amount to be paid/spent</small>
          </div>
          
          <div className="form-group">
            <label>Credit (₹)</label>
            <input
              type="number"
              name="credit"
              value={expense.credit || ''}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={expense.credit ? 'valid-input' : ''}
            />
            <small className="field-note">Amount received/advance</small>
          </div>
          
          <div className="form-group">
            <label>Date <span className="required"></span></label>
            <div className="date-input-wrapper">
              <input
                type="date"
                name="date"
                value={expense.date || ''}
                onChange={handleChange}
                required
                className={expense.date ? 'valid-input' : ''}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
              />
              <FaCalendarAlt className="date-icon" />
            </div>
          </div>
          
          <div className="form-group full-width">
            <label>Remarks</label>
            <textarea
              name="remarks"
              value={expense.remarks || ''}
              onChange={handleChange}
              placeholder="Add any additional information about this expense"
              rows="3"
              className={expense.remarks ? 'valid-input' : ''}
              maxLength={500}
            />
            <small className="field-note">
              {expense.remarks ? expense.remarks.length : 0}/500 characters
            </small>
          </div>
        </div>

        {/* Balance calculation display */}
        {(expense.debit || expense.credit) && (
          <div className="balance-display">
            <h4>Financial Summary</h4>
            <div className="balance-grid">
              <div className="balance-item">
                <span>Debit:</span>
                <span className="debit-amount">₹{Number(expense.debit || 0).toFixed(2)}</span>
              </div>
              <div className="balance-item">
                <span>Credit:</span>
                <span className="credit-amount">₹{Number(expense.credit || 0).toFixed(2)}</span>
              </div>
              <div className="balance-item total">
                <span>Balance:</span>
                <span className={`balance-amount ${
                  (Number(expense.credit || 0) - Number(expense.debit || 0)) >= 0 ? 'positive' : 'negative'
                }`}>
                  ₹{Math.abs(Number(expense.credit || 0) - Number(expense.debit || 0)).toFixed(2)}
                  {(Number(expense.credit || 0) - Number(expense.debit || 0)) >= 0 ? ' (Credit)' : ' (Debit)'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="form-actions">
          <button
            type="button"
            className="update-exp-cancel-btn"
            onClick={() => navigate('/dashboard/expenses-page')}
            disabled={loading}
          >
            <FaArrowLeft style={{ marginRight: '5px' }} /> Back
          </button>
          <button 
            type="submit" 
            className={`update-exp-submit-btn ${formValid ? 'btn-enabled' : 'btn-disabled'}`}
            disabled={loading || !formValid}
          >
            {loading ? (
              <>
                <Spinner /> Updating...
              </>
            ) : (
              <>
                <FaSave style={{ marginRight: '5px' }} /> Update Expense
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateExpensePage;