import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all roles
  const fetchRoles = async () => {
    try {
      setError("");

      const url = API_ENDPOINTS.getRoles();
      console.log("Fetching roles from:", url);

      const res = await axios.get(url);
      console.log("Roles API Response:", res.data);

      let rolesData = [];

      // Handle your specific response structure
      if (res.data?.data && Array.isArray(res.data.data)) {
        rolesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        rolesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        rolesData = res.data;
      }

      const mappedRoles = rolesData.map((role) => ({
        _id: role._id || role.id,
        role_name: role.role_name || role.name || "",
        status: role.status || "active",
      }));

      console.log("Fetched roles:", mappedRoles);
      setRoles(mappedRoles);
      return mappedRoles;
    } catch (err) {
      console.error("Fetch roles error:", err);
      setError(err.response?.data?.message || "Failed to load roles");
      return [];
    }
  };

  // Fetch all designations
  const fetchDesignations = async () => {
    try {
      const url = API_ENDPOINTS.getDesignations();
      const res = await axios.get(url);
      
      let designationsData = [];
      if (res.data?.data && Array.isArray(res.data.data)) {
        designationsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        designationsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        designationsData = res.data;
      }

      const mappedDesignations = designationsData.map((item) => ({
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
      designation_name: item.designation_id?.designation_name || item.designation_name || "",
      department_id: item.department_id?._id || item.department_id || "",
      department_name: item.department_id?.department_name || item.department_name || "",
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
      setError(err.response.data?.message || `Error ${err.response.status}: Failed to load employees`);
    } else if (err.request) {
      setError("No response from server. Please check your internet connection.");
    } else {
      setError("Failed to load employees. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  // Add a new employee
  const addEmployee = async (employeeData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.createEmployee();
      console.log("Adding employee at:", url, "Data:", employeeData);

      // Create FormData for file upload
      const formData = new FormData();

      // Append all fields
      Object.keys(employeeData).forEach((key) => {
        if (
          key !== "profile_picture" &&
          employeeData[key] !== undefined &&
          employeeData[key] !== null &&
          employeeData[key] !== ""
        ) {
          formData.append(key, employeeData[key]);
        }
      });

      // Append profile picture if exists
      if (employeeData.profile_picture && employeeData.profile_picture instanceof File) {
        formData.append("profile_picture", employeeData.profile_picture);
      }

      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Add employee response:", res.data);

      // Refetch to ensure consistency
      await fetchEmployees();
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Add employee error:", err);
      setError(err.response?.data?.message || "Failed to add employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update an employee
  const updateEmployee = async (id, employeeData) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.updateEmployee(id);
      console.log("Updating employee at:", url, "Data:", employeeData);

      // Create FormData for file upload
      const formData = new FormData();

      // Append all fields
      Object.keys(employeeData).forEach((key) => {
        if (
          key !== "profile_picture" &&
          employeeData[key] !== undefined &&
          employeeData[key] !== null &&
          employeeData[key] !== ""
        ) {
          formData.append(key, employeeData[key]);
        }
      });

      // Append profile picture if exists and is a File
      if (employeeData.profile_picture && employeeData.profile_picture instanceof File) {
        formData.append("profile_picture", employeeData.profile_picture);
      }

      const res = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Update employee response:", res.data);

      // Update local state by refetching
      await fetchEmployees();

      return { success: true, data: res.data };
    } catch (err) {
      console.error("Update employee error:", err);
      setError(err.response?.data?.message || "Failed to update employee");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete an employee
  const deleteEmployee = async (id) => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.deleteEmployee(id);
      console.log("Deleting employee at:", url);

      const res = await axios.delete(url);
      console.log("Delete response:", res.data);

      if (res.data?.success === true || res.data?.status === true) {
        // Remove from local state immediately
        setEmployees((prev) => prev.filter((item) => item._id !== id));
        
        // Return success indicator
        return { success: true };
      } else {
        throw new Error(res.data?.message || "Failed to delete employee");
      }
    } catch (err) {
      console.error("Delete employee error:", err);
      setError(err.response?.data?.message || "Failed to delete employee");
      
      // Return error indicator
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get employee by ID
  const getEmployeeById = (id) => {
    return employees.find(emp => emp._id === id) || null;
  };

  useEffect(() => {
    // Fetch all required data
    const fetchData = async () => {
      await Promise.all([
        fetchRoles(),
        fetchDesignations(),
        fetchDepartments(),
        fetchEmployees()
      ]);
    };

    fetchData();
  }, []);

  return {
    employees,
    roles,
    designations,
    departments,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    fetchEmployees,
    fetchRoles,
    fetchDesignations,
    fetchDepartments,
  };
}