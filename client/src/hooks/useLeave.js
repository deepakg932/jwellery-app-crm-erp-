import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export const useLeave = () => {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([]);

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getEmployees();
      const res = await axios.get(url);

      let employeesData = [];

      if (res.data?.data && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        employeesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        employeesData = res.data;
      } else if (res.data?.employees && Array.isArray(res.data.employees)) {
        employeesData = res.data.employees;
      }

      const mappedEmployees = employeesData.map((item) => ({
        _id: item._id || item.id || "",
        employee_id: item.employee_id || "",
        salutation: item.salutation || "",
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || item.mobile || "",
        mobile: item.mobile || item.phone || "",
        gender: item.gender || "",
        date_of_birth: item.date_of_birth || "",
        profile_picture: item.profile_picture || item.image || "",
        fullImageUrl: item.fullImageUrl || item.image || "",
        designation_id: item.designation_id?._id || item.designation_id || "",
        designation_name:
          item.designation_id?.designation_name || item.designation_name || "",
        department_id: item.department_id?._id || item.department_id || "",
        department_name:
          item.department_id?.department_name || item.department_name || "",
        user_role: item.user_role?._id || item.user_role || "",
        role_name: item.user_role?.role_name || item.role_name || "",
        reporting_to: item.reporting_to?._id || item.reporting_to || "",
        reporting_to_name: item.reporting_to?.name || "",
        joining_date: item.joining_date || "",
        basic_salary: item.basic_salary || 0,
        status: item.status === "active",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        country: item.country || "",
        about: item.about || "",
        language: item.language || "English",
        createdAt: item.createdAt || "",
        updatedAt: item.updatedAt || "",
        created_by: item.created_by || null,
      }));

      setEmployees(mappedEmployees);
      return mappedEmployees;
    } catch (err) {
      console.error("Fetch employees error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            `Error ${err.response.status}: Failed to load employees`,
        );
      } else if (err.request) {
        setError(
          "No response from server. Please check your internet connection.",
        );
      } else {
        setError("Failed to load employees. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all leaves
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getLeaves();
      console.log("Fetching leaves from:", url);

      const res = await axios.get(url);
      console.log("Leaves API Response:", res.data);

      let leavesData = [];

      if (res.data?.success && Array.isArray(res.data.data)) {
        leavesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        leavesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        leavesData = res.data.data;
      }

      const mappedLeaves = leavesData.map((item) => ({
        _id: item._id || item.id,
        employee_id: item.employee_id || item.employeeId,
        employee_name: item.employee_id.name || item.employeeName || "",
        leave_type_id: item.leave_type_id || item.leaveTypeId,
        leave_type_name: item.leave_type_id.leave_type_name || item.leaveTypeName || "",
        duration_type: item.duration_type || item.durationType || "full_day",
        from_date: item.from_date || item.fromDate || "",
        to_date: item.to_date || item.toDate || "",
        reason: item.reason || "",
        attachment: item.attachment || "",
        status: item.status || "pending",
        applied_on:
          item.applied_on || item.appliedOn || new Date().toISOString(),
        approved_by: item.approved_by || item.approvedBy || "",
        approved_on: item.approved_on || item.approvedOn || "",
        remarks: item.remarks || "",
      }));

      setLeaves(mappedLeaves);
      return mappedLeaves;
    } catch (err) {
      console.error("Fetch leaves error:", err);
      setError("Failed to load leaves");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch leave types
  const fetchLeaveTypes = useCallback(async () => {
    try {
      const url = API_ENDPOINTS.getLeaveTypes();
      const res = await axios.get(url);

      let typesData = [];
      if (res.data?.success && Array.isArray(res.data.data)) {
        typesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        typesData = res.data;
      }

      setLeaveTypes(typesData);
      return typesData;
    } catch (err) {
      console.error("Fetch leave types error:", err);
      return [];
    }
  }, []);

  // Add a new leave
  const addLeave = async (leaveData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createLeave();
      console.log("Adding leave at:", url, "Data:", leaveData);

      const formData = new FormData();
      Object.keys(leaveData).forEach((key) => {
        if (key === "attachment" && leaveData[key] instanceof File) {
          formData.append("attachment", leaveData[key]);
        } else if (leaveData[key] !== undefined && leaveData[key] !== null) {
          formData.append(key, leaveData[key]);
        }
      });

      const res = await axios.post(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Add leave response:", res.data);
      await fetchLeaves();
      toast.success("Leave applied successfully!");

      return res.data;
    } catch (err) {
      console.error("Add leave error:", err);
      setError("Failed to apply leave");
      toast.error(err.response?.data?.message || "Failed to apply leave");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update leave
  const updateLeave = async (id, leaveData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateLeave(id);

      const formData = new FormData();
      Object.keys(leaveData).forEach((key) => {
        if (key === "attachment" && leaveData[key] instanceof File) {
          formData.append("attachment", leaveData[key]);
        } else if (leaveData[key] !== undefined && leaveData[key] !== null) {
          formData.append(key, leaveData[key]);
        }
      });

      const res = await axios.put(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Update leave response:", res.data);
      await fetchLeaves();
      toast.success("Leave updated successfully!");

      return res.data;
    } catch (err) {
      console.error("Update leave error:", err);
      setError("Failed to update leave");
      toast.error(err.response?.data?.message || "Failed to update leave");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete leave
  const deleteLeave = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteLeave(id);
      const res = await axios.delete(url);

      console.log("Delete leave response:", res.data);
      await fetchLeaves();
      toast.success("Leave deleted successfully!");

      return res.data;
    } catch (err) {
      console.error("Delete leave error:", err);
      setError("Failed to delete leave");
      toast.error(err.response?.data?.message || "Failed to delete leave");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize with data
  useEffect(() => {
    fetchLeaves();
    fetchLeaveTypes();
    fetchEmployees();
  }, [fetchLeaves, fetchLeaveTypes,]);

  return {
    leaves,
    leaveTypes,
    employees,
    loading,
    error,
    addLeave,
    updateLeave,
    deleteLeave,
    fetchLeaves,
    fetchLeaveTypes,
    fetchEmployees,
  };
};
