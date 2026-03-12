import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export const useLeaveType = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all leave types
  const fetchLeaveTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getLeaveTypes();
      console.log("Fetching leave types from:", url);

      const res = await axios.get(url);
      console.log("Leave Types API Response:", res.data);

      // Extract data from API response
      let leaveTypeData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        leaveTypeData = res.data.data;
      } else if (Array.isArray(res.data)) {
        leaveTypeData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        leaveTypeData = res.data.data;
      }

      // Map the data to ensure consistent structure with all fields
      const mappedLeaveTypes = leaveTypeData.map((item) => ({
        _id: item._id || item.id,
        leave_type_name: item.leave_type_name || item.name || "",
        leave_paid_status: item.leave_paid_status || "Paid",
        leave_allotment_type: item.leave_allotment_type || "",
        no_of_leaves: item.no_of_leaves || "",
        monthly_limit: item.monthly_limit || "",
        is_active: item.is_active !== undefined ? item.is_active : true,
        created_at:
          item.createdAt || item.created_at || new Date().toISOString(),
        updated_at:
          item.updatedAt || item.updated_at || new Date().toISOString(),
      }));

      console.log("Fetched leave types:", mappedLeaveTypes);
      setLeaveTypes(mappedLeaveTypes);
      return mappedLeaveTypes;
    } catch (err) {
      console.error("Fetch leave types error:", err);
      setError("Failed to load leave types");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a new leave type
  const addLeaveType = async (leaveTypeData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createLeaveType();
      console.log("Adding leave type at:", url, "Data:", leaveTypeData);

      const payload = {
        leave_type_name: leaveTypeData.leave_type_name || "",
        leave_paid_status: leaveTypeData.leave_paid_status || "Paid",
        leave_allotment_type: leaveTypeData.leave_allotment_type || "",
        no_of_leaves: leaveTypeData.no_of_leaves || "",
        monthly_limit: leaveTypeData.monthly_limit || "",
        is_active:
          leaveTypeData.is_active !== undefined
            ? leaveTypeData.is_active
            : true,
      };

      const res = await axios.post(url, payload);
      console.log("Add leave type response:", res.data);

      // Refresh the list from API
      await fetchLeaveTypes();

      return res.data;
    } catch (err) {
      console.error("Add leave type error:", err);
      setError("Failed to add leave type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing leave type
  const updateLeaveType = async (id, leaveTypeData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateLeaveType(id);
      console.log("Updating leave type at:", url, "Data:", leaveTypeData);

      const payload = {
        leave_type_name: leaveTypeData.leave_type_name || "",
        leave_paid_status: leaveTypeData.leave_paid_status || "Paid",
        leave_allotment_type: leaveTypeData.leave_allotment_type || "",
        no_of_leaves: leaveTypeData.no_of_leaves || "",
        monthly_limit: leaveTypeData.monthly_limit || "",
        is_active:
          leaveTypeData.is_active !== undefined
            ? leaveTypeData.is_active
            : true,
      };

      const res = await axios.put(url, payload);
      console.log("Update leave type response:", res.data);

      // Refresh the list from API
      await fetchLeaveTypes();

      return res.data;
    } catch (err) {
      console.error("Update leave type error:", err);
      setError("Failed to update leave type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a leave type
  const deleteLeaveType = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteLeaveType(id);
      console.log("Deleting leave type at:", url);

      const res = await axios.delete(url);
      console.log("Delete leave type response:", res.data);

      // Refresh the list from API
      await fetchLeaveTypes();

      return res.data;
    } catch (err) {
      console.error("Delete leave type error:", err);
      setError("Failed to delete leave type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize with data
  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  return {
    leaveTypes,
    loading,
    error,
    addLeaveType,
    updateLeaveType,
    deleteLeaveType,
    fetchLeaveTypes,
  };
};
