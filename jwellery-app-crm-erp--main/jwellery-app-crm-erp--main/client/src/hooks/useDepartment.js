// hooks/useDepartment.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export const useDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all departments
  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getDepartments();
      console.log("Fetching departments from:", url);

      const res = await axios.get(url);
      console.log("Departments API Response:", res.data);

      // Extract data from API response
      let departmentData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        departmentData = res.data.data;
      } else if (Array.isArray(res.data)) {
        departmentData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        departmentData = res.data.data;
      }

      // Map the data to ensure consistent structure
      const mappedDepartments = departmentData.map((item) => ({
        _id: item._id || item.id,
        department_name: item.department_name || item.name || "",
        status: item.status,
      }));

      console.log("Fetched departments:", mappedDepartments);
      setDepartments(mappedDepartments);
      return mappedDepartments;
    } catch (err) {
      console.error("Fetch departments error:", err);
      setError("Failed to load departments");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new department
  const addDepartment = async (departmentData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createDepartment();
      console.log("Adding department at:", url, "Data:", departmentData);

      const payload = {
        department_name: departmentData.department_name || "",
      };

      const res = await axios.post(url, payload);
      console.log("Add department response:", res.data);

      // Refresh the list from API
      await fetchDepartments();

      return res.data;
    } catch (err) {
      console.error("Add department error:", err);
      setError("Failed to add department");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing department
  const updateDepartment = async (id, departmentData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateDepartment(id);
      console.log("Updating department at:", url, "Data:", departmentData);

      const payload = {
        department_name: departmentData.department_name || "",
      };

      const res = await axios.put(url, payload);
      console.log("Update department response:", res.data);

      // Refresh the list from API
      await fetchDepartments();

      return res.data;
    } catch (err) {
      console.error("Update department error:", err);
      setError("Failed to update department");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a department
  const deleteDepartment = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteDepartment(id);
      console.log("Deleting department at:", url);

      const res = await axios.delete(url);
      console.log("Delete department response:", res.data);

      // Refresh the list from API
      await fetchDepartments();

      return res.data;
    } catch (err) {
      console.error("Delete department error:", err);
      setError("Failed to delete department");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize with data
  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    loading,
    error,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    fetchDepartments,
  };
};
