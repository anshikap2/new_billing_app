import React, { useMemo } from "react";
import { useDashboardData } from "../controllers/dashboardController";
import { FaFileInvoice, FaMoneyBillWave } from "react-icons/fa";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";
import { Link } from "react-router-dom";
import "../css/Dashboard.css";

// 🔹 Chart.js Registration (Fixes "category not registered" error)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Add these chart options
const getDarkModeColors = (isDarkMode) => ({
  gridColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  textColor: isDarkMode ? '#e0e0e0' : '#666',
  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
});

const chartOptions = (isDarkMode = false) => ({
  maintainAspectRatio: true,
  responsive: true,
  layout: {
    padding: {
      top: 15,
      right: 15,
      bottom: 25,
      left: 15
    }
  },
  plugins: {
    legend: {
      position: 'bottom',
      align: 'center',
      labels: {
        color: getDarkModeColors(isDarkMode).textColor,
        boxWidth: 12,
        padding: 15,
        font: {
          size: 12
        }
      }
    }
  },
  scales: {
    y: {
      grid: {
        color: getDarkModeColors(isDarkMode).gridColor,
        borderColor: getDarkModeColors(isDarkMode).borderColor
      },
      ticks: {
        color: getDarkModeColors(isDarkMode).textColor
      }
    },
    x: {
      grid: {
        color: getDarkModeColors(isDarkMode).gridColor,
        borderColor: getDarkModeColors(isDarkMode).borderColor
      },
      ticks: {
        color: getDarkModeColors(isDarkMode).textColor
      }
    }
  }
});

export default function Dashboard() {
  const {
    totalInvoices = 10,
    filteredInvoices = [],
    pendingPayment = 5000,
    paidInvoice = 15000,
    invoiceData,
    monthlyRevenue,
    profitTrend,
    highestSaleProduct,
    loading,
  } = useDashboardData();

  // Memoize recent transactions
  const recentTransactions = useMemo(() => {
    return filteredInvoices.slice(0, 5);
  }, [filteredInvoices]);

  // Define status colors with exact status matches
  const statusColors = {
    Paid: "bg-green-500",
    Pending: "bg-yellow-400",
    Overdue: "bg-red-500",
    Unpaid: "bg-orange-500"
  };

  // Memoize chart data
  const memoizedMonthlyRevenue = useMemo(() => monthlyRevenue, [monthlyRevenue]);
  const memoizedInvoiceData = useMemo(() => invoiceData, [invoiceData]);
  const memoizedProfitTrend = useMemo(() => profitTrend, [profitTrend]);
  const memoizedHighestSaleProduct = useMemo(() => highestSaleProduct, [highestSaleProduct]);

  const isDarkMode = document.body.classList.contains('dark-mode');

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {/* Top Bar */}
        <div className="topbar">
          <input type="text" placeholder="Search..." />
          <div className="profile">Admin</div>
        </div>

        {/* Invoice Statistics */}
        <div className="stats-grid">
          <div className="card">
            <FaFileInvoice className="icon" />
            <h3>Total Invoices</h3>
            <p>{totalInvoices}</p>
          </div>

          <div className="card pending">
            <FaMoneyBillWave className="icon" />
            <h3>Pending Payments</h3>
            <p>₹{pendingPayment}</p>
          </div>

          <div className="card paid">
            <FaMoneyBillWave className="icon" />
            <h3>Paid Invoices</h3>
            <p>₹{paidInvoice}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Monthly Revenue</h3>
            {memoizedMonthlyRevenue?.datasets?.length ? (
              <Bar data={memoizedMonthlyRevenue} options={chartOptions(isDarkMode)} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>

          <div className="chart-card">
            <h3>Invoice Status</h3>
            {memoizedInvoiceData?.datasets?.length ? (
              <Doughnut data={memoizedInvoiceData} options={chartOptions(isDarkMode)} />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
        </div>

        <div className="charts-grid-2">
          <div className="chart-card profit-chart">
            <h3>Profit Trend</h3>
            {memoizedProfitTrend?.datasets?.length ? (
              <Line 
                data={memoizedProfitTrend} 
                options={{
                  ...chartOptions(isDarkMode),
                  plugins: {
                    ...chartOptions(isDarkMode).plugins,
                    title: {
                      ...chartOptions(isDarkMode).plugins.title,
                      text: 'Profit Trend Analysis'
                    }
                  }
                }} 
              />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
          <div className="chart-card">
            <h3>Highest Sale Product</h3>
            {memoizedHighestSaleProduct?.datasets?.length ? (
              <Pie 
                data={memoizedHighestSaleProduct} 
                options={{
                  ...chartOptions(isDarkMode),
                  plugins: {
                    ...chartOptions(isDarkMode).plugins,
                    title: {
                      ...chartOptions(isDarkMode).plugins.title,
                      text: 'Top Selling Products'
                    }
                  }
                }} 
              />
            ) : (
              <p>Loading chart...</p>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="transactions">
          <div className="transactions-header">
            <h3>Recent Transactions</h3>
            <Link to="/dashboard/invoices" className="view-all-link">
              View All
            </Link>
          </div>
          <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length > 0 ? (
                recentTransactions.map((invoice, index) => (
                  <tr key={invoice.invoice_id || `invoice-${index}`}>
                    <td>{invoice.invoice_number || "N/A"}</td>
                    <td>{invoice.first_name} {invoice.last_name}</td>
                    <td>₹{invoice.total_amount}</td>
                    <td>
                      <span className={`status-label ${statusColors[invoice.status] || "bg-gray-400"}`}>
                        {invoice.status || "Unknown"}
                      </span>
                    </td>
                    <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No recent transactions found</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </main>
    </div>
  );
}
