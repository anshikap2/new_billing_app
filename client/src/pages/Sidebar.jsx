import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FaHome, FaFileInvoiceDollar, FaShoppingCart, FaUser, FaSignOutAlt, FaUsers, FaChartBar, FaBoxOpen, FaMoneyBillWave, FaBuilding, FaBars } from "react-icons/fa";
import "../css/Sidebar.css";
import { MdInventory } from 'react-icons/md';

const Sidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const navigate = useNavigate();

  const toggleSidebar = (e) => {
    e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 768 && !e.target.closest('.sidebar') && !e.target.closest('.sidebar-toggle')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <aside className={`sidebar ${isSidebarOpen ? 'active' : ''}`}>
        <nav>
          <ul>
            <li><Link onClick={handleLinkClick} to="/dashboard/home"><FaHome /> Dashboard</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/customers"><FaUsers /> Customers</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/invoices"><FaFileInvoiceDollar /> Invoices</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/product-page"><FaBoxOpen /> Products/Services</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/inventory-page"><MdInventory /> Inventory</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/purchase-page"><FaShoppingCart/> Purchase</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/organization-page"><FaBuilding /> Organization</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/expenses-page"><FaMoneyBillWave /> Expenses</Link></li>
            <li><Link onClick={handleLinkClick} to="/dashboard/report"><FaChartBar /> Reports</Link></li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
