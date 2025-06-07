import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthForm from "../pages/AuthForm";
import Homepage from "../pages/homepage/Homepage";
import DashboardLayout from "../pages/DashboardLayout";
import CustomerList from "../pages/customer/CustomerList";
import CustomerForm from "../pages/customer/CustomerForm";
import CustomerViewForm from "../pages/customer/CustomerViewForm";
import CustomerUpdateDialog from "../pages/customer/CustomerUpdateDialog";
import InvoiceTable from "../pages/Invoice/InvoiceTable";
import InvoiceUpdateDialogbox from "../pages/Invoice/InvoiceUpdateDialogbox";
import Dashboardd from "../pages/dashboard/Dashboardd";
import AddInvoicePage from "../pages/Invoice/AddInvoicePage";
import InvoicePdf from "../pages/Invoice/InvoicePdf";
import ProductPage from "../pages/product/ProductPage";
import CreateProductPage from "../pages/product/CreateProductPage";
import UpdateProductPage from "../pages/product/UpdateProductPage";
import InventoryPage from "../pages/inventory/InventoryPage";
import ExpensesPage from "../pages/expenses/ExpensesPage";
import ProtectedRoutes from "./ProtectedRoutes";
import OrganizationPage from "../pages/organization/OrganizationPage";
import ExpensesGraphPage from "../pages/expenses/ExpensesGraphPage";
import UserProfilePage from "../pages/headerbar/UserProfilePage";
import AddOrganizationPage from "../pages/organization/AddOragnizationPage";
import UpdateOrganizationPage from "../pages/organization/UpdateOrganizationPage";
import ReportPage from "../pages/report/ReportPage";
import CreateExpensePage from "../pages/expenses/CreateExpensePage";
import UpdateExpensePage from "../pages/expenses/UpdateExpensePage";
import AddEmployee from "../pages/employee/AddEmployee";
import AddProject from "../pages/project/AddProject";
import PurchasePage from "../pages/purchase/PurchasePage"
import UpdatePurchasePage from "../pages/purchase/UpdatePurchasePage";
import CreatePurchasePage from "../pages/purchase/CreatePurchasePage";
import ProjectPage from "../pages/project/ProjectPage";
import EmployeePage from "../pages/employee/EmployeePage";
import ProjectUpdate from "../pages/project/ProjectUpdate";
import EmployeeUpdate from "../pages/employee/EmployeeUpdate";


const AppRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("authToken"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("authToken"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/home" element={<Homepage />} />
      <Route
        path="/auth"
        element={isAuthenticated ? <Navigate to="/dashboard/home" replace /> : <AuthForm />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard/*"
        element={
          isAuthenticated ? (
            <ProtectedRoutes>
              <DashboardLayout />
            </ProtectedRoutes>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      >
        <Route index element={<Navigate to="/dashboard/home" replace />} />
        <Route path="home" element={<Dashboardd />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="invoices" element={<InvoiceTable />} />
        <Route path="update-invoice" element={<InvoiceUpdateDialogbox />} />
        <Route path="createinvoice" element={<AddInvoicePage />} />
        <Route path="invoice/:invoiceId" element={<InvoicePdf />} />
        <Route path="product-page" element={<ProductPage />} />
        <Route path="createproduct" element={<CreateProductPage />} />
        <Route path="updateProduct" element={<UpdateProductPage />} />
        <Route path="inventory-page" element={<InventoryPage />} />
        <Route path="expenses-page" element={<ExpensesPage />} />
        <Route path="add-employee" element={<AddEmployee />} />
        <Route path="add-project" element={<AddProject/>} />
        <Route path="create-expense" element={<CreateExpensePage />} />
        <Route path="update-expense/:expenseId" element={<UpdateExpensePage />} />
        <Route path="customer-form" element={<CustomerForm />} />
        <Route path="customer-view" element={<CustomerViewForm />} />
        <Route path="update-customer" element={<CustomerUpdateDialog />} />
        <Route path="graph-expenses" element={<ExpensesGraphPage />} />
        <Route path="organization-page" element={<OrganizationPage />} />
        <Route path="profile-page" element={<UserProfilePage />} />
        <Route path="add-organization" element={<AddOrganizationPage />} />
        <Route path="update-organization/:orgId" element={<UpdateOrganizationPage />} />
        <Route path="purchase-page" element={<PurchasePage />} />
        <Route path="create-purchase" element={<CreatePurchasePage />} />
        <Route path="update-purchase" element={<UpdatePurchasePage />} />
        <Route path="report" element={<ReportPage />} />
        <Route path="project-page" element={<ProjectPage />} />
        <Route path="employee-page" element={<EmployeePage />} />
        <Route path="update-project/:projectId" element={<ProjectUpdate />} />
        <Route path="update-employee/:employeeId" element={<EmployeeUpdate />} />
      </Route>

      {/* Redirect all unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;

