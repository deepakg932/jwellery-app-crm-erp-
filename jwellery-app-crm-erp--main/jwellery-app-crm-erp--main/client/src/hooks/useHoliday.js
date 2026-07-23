// hooks/useHoliday.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

export const useHoliday = () => {
  const [holidays, setHolidays] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all designations
  const fetchDesignations = async () => {
    try {
      const url = API_ENDPOINTS.getDesignations();
      const res = await axios.get(url);

      let designationsData = [];

      // Handle the response structure from your API
      if (res.data?.success && Array.isArray(res.data.data)) {
        // Extract the designation_id objects from each item in the data array
        designationsData = res.data.data.map((item) => item.designation_id);
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        designationsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        designationsData = res.data;
      }

      // Remove duplicates based on _id (in case there are multiple items with same designation)
      const uniqueDesignations = Array.from(
        new Map(designationsData.map((item) => [item._id, item])).values(),
      );

      const mappedDesignations = uniqueDesignations.map((item) => ({
        _id: item._id || item.id,
        designation_name: item.designation_name || item.name || "",
        status: item.status || "active",
      }));

      setDesignations(mappedDesignations);
      return mappedDesignations;
    } catch (err) {
      console.error("Fetch designations error:", err);
      return [];
    }
  };

  // Fetch all departments
  const fetchDepartments = async () => {
    try {
      const url = API_ENDPOINTS.getDepartments();
      const res = await axios.get(url);

      let departmentsData = [];
      if (res.data?.data && Array.isArray(res.data.data)) {
        departmentsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        departmentsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        departmentsData = res.data;
      }

      const mappedDepartments = departmentsData.map((item) => ({
        _id: item._id || item.id,
        department_name: item.department_name || item.name || "",
        status: item.status || "active",
      }));

      setDepartments(mappedDepartments);
      return mappedDepartments;
    } catch (err) {
      console.error("Fetch departments error:", err);
      return [];
    }
  };

  // Fetch all holidays
  const fetchHolidays = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getHolidays();
      console.log("Fetching holidays from:", url);

      const res = await axios.get(url);
      console.log("Holidays API Response:", res.data);

      // Extract data from API response
      let holidayData = [];

      // Check if response has success: true and data array
      if (res.data?.success && Array.isArray(res.data.data)) {
        holidayData = res.data.data;
      } else if (Array.isArray(res.data)) {
        holidayData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        holidayData = res.data.data;
      }

      // Map the data to ensure consistent structure matching AddHolidayForm
      const mappedHolidays = holidayData.map((item) => ({
        _id: item._id || item.id,
        occasion: item.occasion || item.holiday_name || item.name || "",
        occasion_date:
          item.occasion_date || item.holiday_date || item.date || "",

        // Handle department_id as array of objects
        department_id: item.department_id || [],
        department_name: Array.isArray(item.department_id)
          ? item.department_id.map((dept) => dept.department_name).join(", ")
          : item.department_id?.department_name || "",

        // Handle designation_id as array of objects
        designation_id: item.designation_id || [],
        designation_name: Array.isArray(item.designation_id)
          ? item.designation_id.map((des) => des.designation_name).join(", ")
          : item.designation_id?.designation_name || item.designations || "",

        // Handle employment_types array of objects with value property
        employment_type: Array.isArray(item.employment_types)
          ? item.employment_types.map((emp) => emp.value || emp).join(", ")
          : item.employment_type || [],

        // For display purposes - create comma-separated string of employment type values
        employment_type_names: Array.isArray(item.employment_types)
          ? item.employment_types
              .map((emp) => emp.value || emp.name || emp.type || emp)
              .filter(Boolean)
              .join(", ")
          : item.employment_type?.value ||
            item.employment_type?.name ||
            item.employment_type?.type ||
            item.employment_type ||
            "",

        description: item.description || "",
        status: item.status || "active",
        created_at:
          item.createdAt || item.created_at || new Date().toISOString(),
        updated_at:
          item.updatedAt || item.updated_at || new Date().toISOString(),
      }));

      console.log("Fetched holidays:", mappedHolidays);
      setHolidays(mappedHolidays);
      return mappedHolidays;
    } catch (err) {
      console.error("Fetch holidays error:", err);
      setError("Failed to load holidays");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Add a single holiday
  const addHoliday = async (payload) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createHoliday();
      console.log("Adding holidays at:", url, "Data:", payload);

      // If payload has holidays array (bulk creation)
      if (payload.holidays && Array.isArray(payload.holidays)) {
        // Send the payload as is with holidays array and common fields
        const response = await axios.post(url, payload);
        console.log("Add holidays response:", response.data);

        // Refresh the list
        await fetchHolidays();

        // Show success message
        toast.success("Holiday added successfully!");

        return response.data;
      }
      // Handle single holiday creation (backward compatibility)
      else {
        const cleanData = {
          occasion: payload.occasion || "",
          occasion_date: payload.occasion_date || "",
          department_id: payload.department_id || [],
          designation_id: payload.designation_id || "",
          employment_type:
            payload.employment_type || payload.employment_types || [],
          description: payload.description || "",
        };

        const response = await axios.post(url, cleanData);
        console.log("Add holiday response:", response.data);

        await fetchHolidays();
        toast.success("Holiday added successfully!");

        return response.data;
      }
    } catch (err) {
      console.error("Add holiday error:", err);
      setError("Failed to add holiday");
      toast.error(err.response?.data?.message || "Failed to add holiday");
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Update an existing holiday
  const updateHoliday = async (id, holidayData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateHoliday(id);
      console.log("Updating holiday at:", url, "Data:", holidayData);

      let payload;

      // Check if the data is in the new format (with departments/designations as objects)
      if (
        holidayData.departments &&
        Array.isArray(holidayData.departments) &&
        holidayData.departments[0]?.value
      ) {
        // Handle new format - send as is with objects
        payload = {
          occasion: holidayData.occasion || "",
          occasion_date: holidayData.occasion_date || "",
          // Send the full objects with value and label
          departments: holidayData.departments || [],
          designations: holidayData.designations || [],
          employment_types: holidayData.employment_types || [],
          description: holidayData.description || "",
        };

        console.log("Using new format payload:", payload);
      }
      // Check if it's the bulk format (with holidays array)
      else if (holidayData.holidays && Array.isArray(holidayData.holidays)) {
        // This is for bulk update - send as is
        payload = holidayData;
        console.log("Using bulk format payload:", payload);
      }
      // Handle old format (backward compatibility)
      else {
        // Transform the payload to match backend expected structure
        payload = {
          occasion: holidayData.occasion || "",
          occasion_date: holidayData.occasion_date || "",
          // Extract IDs from the value/label objects if they exist
          department_id:
            holidayData.departments?.map((dept) => dept.value) ||
            holidayData.department_id ||
            [],
          designation_id:
            holidayData.designations?.map((des) => des.value) ||
            holidayData.designation_id ||
            [],
          employment_type:
            holidayData.employment_types?.map((type) => type.value) ||
            holidayData.employment_type ||
            [],
          description: holidayData.description || "",
        };

        console.log("Using transformed old format payload:", payload);
      }

      const res = await axios.put(url, payload);
      console.log("Update holiday response:", res.data);

      // Refresh the list from API
      await fetchHolidays();
      toast.success("Holiday updated successfully!");

      return res.data;
    } catch (err) {
      console.error("Update holiday error:", err);
      setError("Failed to update holiday");
      toast.error(err.response?.data?.message || "Failed to update holiday");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a holiday
  const deleteHoliday = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteHoliday(id);
      console.log("Deleting holiday at:", url);

      const res = await axios.delete(url);
      console.log("Delete holiday response:", res.data);

      // Refresh the list from API
      await fetchHolidays();
      toast.success("Holiday deleted successfully!");

      return res.data;
    } catch (err) {
      console.error("Delete holiday error:", err);
      setError("Failed to delete holiday");
      toast.error(err.response?.data?.message || "Failed to delete holiday");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Bulk delete holidays
  const bulkDeleteHolidays = async (ids) => {
    try {
      setLoading(true);
      setError("");

      // If your API supports bulk delete
      const url =
        API_ENDPOINTS.bulkDeleteHolidays?.() ||
        `${API_ENDPOINTS.getHolidays()}`;

      const res = await axios.post(url, { ids });
      console.log("Bulk delete response:", res.data);

      // Refresh the list from API
      await fetchHolidays();
      toast.success(`${ids.length} holidays deleted successfully!`);

      return res.data;
    } catch (err) {
      console.error("Bulk delete error:", err);
      setError("Failed to delete holidays");
      toast.error(err.response?.data?.message || "Failed to delete holidays");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Toggle holiday active status
  const toggleHolidayStatus = async (id, currentStatus) => {
    try {
      setLoading(true);

      const url = API_ENDPOINTS.updateHoliday(id);
      const payload = { is_active: !currentStatus };

      const res = await axios.patch(url, payload);
      console.log("Toggle status response:", res.data);

      // Refresh the list from API
      await fetchHolidays();
      toast.success(
        `Holiday ${!currentStatus ? "activated" : "deactivated"} successfully!`,
      );

      return res.data;
    } catch (err) {
      console.error("Toggle status error:", err);
      toast.error(
        err.response?.data?.message || "Failed to update holiday status",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get holiday by ID
  const getHolidayById = useCallback(
    (id) => {
      return holidays.find((holiday) => holiday._id === id) || null;
    },
    [holidays],
  );

  // Initialize with data
  useEffect(() => {
    fetchHolidays();
    fetchDesignations();
    fetchDepartments();
  }, [fetchHolidays]);

  return {
    holidays,
    designations,
    departments,
    loading,
    error,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    bulkDeleteHolidays,
    toggleHolidayStatus,
    getHolidayById,
    fetchHolidays,
    fetchDesignations,
    fetchDepartments,
  };
};
