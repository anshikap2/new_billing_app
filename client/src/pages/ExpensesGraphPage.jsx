import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { ExpenseModel } from "../models/expenseModel";
import "../css/ExpensesGraphPage.css"; // Import CSS for styling

const ExpensesGraphPage = ({ onClose }) => {
  // Use categories from expense model
  const categoryExpenses = Object.values(ExpenseModel.CATEGORIES).map(category => ({
    name: category,
    value: ExpenseModel.SAMPLE_DATA.filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0)
  }));

  // Daily expenses from sample data
  const dailyExpenses = ExpenseModel.SAMPLE_DATA.reduce((acc, expense) => {
    const date = new Date(expense.date).toLocaleDateString('en-US', { weekday: 'short' });
    acc[date] = (acc[date] || 0) + expense.amount;
    return acc;
  }, {});

  const dailyExpensesData = Object.entries(dailyExpenses).map(([name, amount]) => ({
    name,
    amount
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF19AF"];

  return (
    <div className="expenses-graph-container">
      <div className="expense-graph-title">
        <h2>Expenses Analysis</h2>
      </div>
      
      <button className="close-button" onClick={onClose}>Close</button>
    
      <div className="charts-wrapper">
        <div className="chart-container">
          <h3>Daily Expense Distribution</h3>
          <BarChart width={400} height={300} data={dailyExpensesData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `₹${value}`} />
            <Bar dataKey="amount" fill="#8884d8" />
          </BarChart>
        </div>
    
        <div className="chart-container">
          <h3>Category-wise Distribution</h3>
          <PieChart width={400} height={400}>
            <Pie
              data={categoryExpenses}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#82ca9d"
              label={({ name, value }) => `${name}: ₹${value}`}
              dataKey="value"
            >
              {categoryExpenses.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `₹${value}`} />
            <Legend />
          </PieChart>
        </div>
      </div>
    </div>
  );
};

export default ExpensesGraphPage;