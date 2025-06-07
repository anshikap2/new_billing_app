

import { useState, useEffect } from "react";
import axios from "axios";
import { fetchInvoices ,searchInvoice} from "../models/invoiceModel";

const useInvoices = () => {
  const [search, setSearch] = useState("");
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [query,setQuery] =useState("");

  // Fetch invoices when the page changes
  useEffect(() => {
    const getInvoices = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchInvoices(page, 10);

        if (!Array.isArray(data)) {
          console.error("❌ Expected an array, but got:", data);
          setError("Invalid data format");
          setInvoices([]);
          setFilteredInvoices([]);
          return;
        }

        setInvoices(data);
        setFilteredInvoices(data); // Initially, show all invoices
        setTotalPages(1); // Update as per API response if available
      } catch (err) {
        console.error("🔥 Error fetching invoices:", err);
        setError("Failed to load invoices");
        setInvoices([]);
        setFilteredInvoices([]);
      } finally {
        setLoading(false);
      }
    };

    getInvoices();
  }, [page]);

  // Debounce search input (wait 500ms before setting query)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedQuery) {
      const fetchSearchResults = async () => {
        try {
          const result = await searchInvoice(debouncedQuery);
          console.log("🔍 Setting Filtered Invoices:", result); // Debugging
          setFilteredInvoices(result); // ✅ Update table data
        } catch (error) {
          console.error("🔥 Error searching invoices:", error);
          setFilteredInvoices([]); // Show empty results if search fails
        }
      };
  
      fetchSearchResults();
    } else {
      setFilteredInvoices(invoices); // ✅ Reset to full list when search is cleared
    }
  }, [debouncedQuery, invoices]);
  
  

  return {
    search,
    setSearch,
    filteredInvoices,
    loading,
    error,
    setInvoices,
    page,
    setPage,
    totalPages,
  };
};

export default useInvoices;