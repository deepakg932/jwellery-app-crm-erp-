import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useEmployees() {
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
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

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const url = API_ENDPOINTS.getEmployees();
      console.log("Fetching employees from:", url);

      const res = await axios.get(url);
      console.log("Employees API Response:", res.data);

      let employeesData = [];

      // Handle your specific response structure
      if (res.data?.data && Array.isArray(res.data.data)) {
        employeesData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        employeesData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        employeesData = res.data;
      }

      const mappedEmployees = employeesData.map((item) => ({
        _id: item._id || item.id,
        name: item.name || "",
        email: item.email || "",
        phone: item.phone || item.mobile || "",
        pan_number: item.pan_number || "",
        aadhaar_number: item.aadhaar_number || "",
        address: item.address || "",
        city: item.city || "",
        state: item.state || "",
        country: item.country || "",
        pincode: item.pincode || "",
        role_id: item.role_id?._id || item.role_id || "",
        role_name: item.role_id?.role_name || item.role_name || "",
        basic_salary: item.basic_salary || 0,
        image: item.image || item.profile_image || "",
        status: item.status === "active",
        createdAt: item.createdAt || "",
      }));

      console.log("Fetched employees:", mappedEmployees);
      setEmployees(mappedEmployees);
    } catch (err) {
      console.error("Fetch employees error:", err);
      setError(err.response?.data?.message || "Failed to load employees");
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

      // Append all fields except image
      Object.keys(employeeData).forEach((key) => {
        if (
          key !== "image" &&
          employeeData[key] !== undefined &&
          employeeData[key] !== null
        ) {
          formData.append(key, employeeData[key]);
        }
      });

      // Append image if exists
      if (employeeData.image && employeeData.image instanceof File) {
        formData.append("image", employeeData.image);
      }

      const res = await axios.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Add employee response:", res.data);

      let newEmployee = {
        _id: `temp-${Date.now()}`,
        ...employeeData,
        status: employeeData.status ? "active" : "inactive",
      };

      if (res.data?.status === true && res.data.data) {
        const responseData = res.data.data;

        // Find the role
        const role = roles.find((r) => r._id === employeeData.role_id);

        newEmployee = {
          _id: responseData._id,
          name: responseData.name || employeeData.name,
          email: responseData.email || employeeData.email,
          phone: responseData.phone || employeeData.phone,
          pan_number: responseData.pan_number || employeeData.pan_number,
          aadhaar_number:
            responseData.aadhaar_number || employeeData.aadhaar_number,
          address: responseData.address || employeeData.address,
          city: responseData.city || employeeData.city,
          state: responseData.state || employeeData.state,
          country: responseData.country || employeeData.country,
          pincode: responseData.pincode || employeeData.pincode,
          role_id: responseData.role_id || employeeData.role_id,
          role_name: role?.role_name || employeeData.role_name || "",
          basic_salary: responseData.basic_salary || employeeData.basic_salary,
          image: responseData.image || employeeData.image || "",
          status: responseData.status === "active",
          createdAt: responseData.createdAt || new Date().toISOString(),
        };
      }

      console.log("New employee to add:", newEmployee);

      // Update local state
      setEmployees((prev) => [...prev, newEmployee]);

      // Refetch to ensure consistency
      setTimeout(() => {
        fetchEmployees();
      }, 500);

      return newEmployee;
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

      // Append all fields except image
      Object.keys(employeeData).forEach((key) => {
        if (
          key !== "image" &&
          employeeData[key] !== undefined &&
          employeeData[key] !== null
        ) {
          formData.append(key, employeeData[key]);
        }
      });

      // Append image if exists and is a File
      if (employeeData.image && employeeData.image instanceof File) {
        formData.append("image", employeeData.image);
      }

      const res = await axios.put(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Update employee response:", res.data);

      if (res.data?.success || res.data?.status === true) {
        const responseData = res.data.data || res.data;

        // Find the role
        const role = roles.find((r) => r._id === employeeData.role_id);

        const updatedData = {
          _id: responseData._id || id,
          name: responseData.name || employeeData.name,
          email: responseData.email || employeeData.email,
          phone: responseData.phone || employeeData.phone,
          address: responseData.address || employeeData.address,
          city: responseData.city || employeeData.city,
          state: responseData.state || employeeData.state,
          country: responseData.country || employeeData.country,
          pincode: responseData.pincode || employeeData.pincode,
          role_id: responseData.role_id || employeeData.role_id,
          role_name: role?.role_name || employeeData.role_name || "",
          basic_salary: responseData.basic_salary || employeeData.basic_salary,
          image: responseData.image || employeeData.image || "",
          status: responseData.status === "active",
          updatedAt: responseData.updatedAt || new Date().toISOString(),
        };

        console.log("Updated employee data:", updatedData);

        // Update local state immediately
        setEmployees((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, ...updatedData } : item
          )
        );

        // Return the updated data
        return updatedData;
      } else {
        throw new Error(res.data?.message || "Failed to update employee");
      }
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

  useEffect(() => {
    // Fetch roles first, then employees
    const fetchData = async () => {
      await fetchRoles();
      await fetchEmployees();
    };

    fetchData();
  }, []);

  return {
    employees,
    roles,
    loading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    fetchEmployees,
    fetchRoles,
  };
}
