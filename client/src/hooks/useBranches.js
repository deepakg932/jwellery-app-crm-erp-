// import { useState, useEffect } from "react";
// import axios from "axios";
// import { API_ENDPOINTS } from "@/api/api";

// export default function useBranches() {
//     const [branches, setBranches] = useState([]);
//     const [branchTypes, setBranchTypes] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [loadingTypes, setLoadingTypes] = useState(false);
//     const [error, setError] = useState("");
//     const [typesError, setTypesError] = useState("");

//     // Fetch all branch types
//    const fetchBranchTypes = async () => {
//   try {
//     setLoadingTypes(true);
//     setTypesError("");

//     const url = API_ENDPOINTS.getBranchTypes();
//     console.log("Fetching branch types from:", url);

//     const res = await axios.get(url);
//     console.log("Branch types API Response:", res.data);

//     let typesData = [];

//     // ✅ Correct handling
//     if (res.data?.status && Array.isArray(res.data.data)) {
//       typesData = res.data.data;
//     }

//     const mappedTypes = typesData.map((item) => ({
//       _id: item._id,
//       branch_type: item.branch_type,
//     }));

//     console.log("Fetched branch types:", mappedTypes);
//     setBranchTypes(mappedTypes);
//   } catch (err) {
//     console.error("Fetch branch types error:", err);
//     setTypesError("Failed to load branch types");
//   } finally {
//     setLoadingTypes(false);
//   }
// };


//     // Fetch all branches
//     const fetchBranches = async () => {
//         try {
//             setLoading(true);
//             setError("");

//             const url = API_ENDPOINTS.getBranches();
//             console.log("Fetching branches from:", url);

//             const res = await axios.get(url);
//             console.log("Branches GET Response:", res.data);

//             let branchesData = [];

//             if (res.data?.success) {
//                 branchesData = Array.isArray(res.data.data) ? res.data.data : [];
//             }

//             // Map API response to our format
//             const mappedBranches = branchesData.map((item) => ({
//                 _id: item._id || item.id,
//                 branch_name: item.branch_name || item.name || "", // Handle both 'name' and 'branch_name'
//                 branch_type: item.branch_type?.branch_type || item.branch_type?.name || "", // Extract from object
//                 branch_type_id: item.branch_type?._id || item.branch_type?.id || "",
//                 address: item.address || "",
//                 phone: item.phone || "",
//                 status: item.status !== false,
//             }));

//             console.log("Mapped branches:", mappedBranches);
//             setBranches(mappedBranches);
//         } catch (err) {
//             console.error("Fetch branches error:", err);
//             setError("Failed to load branches");
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Add a new branch
//     const addBranch = async (branchData) => {
//         try {
//             setLoading(true);
//             setError("");

//             const url = API_ENDPOINTS.createBranch();
            
//             // Format data according to API expectations
//             const formattedData = {
//                 branch_name: branchData.branch_name.trim(),
//                 branch_type: branchData.branch_type, // This should be the ID string
//                 address: branchData.address.trim(),
//                 phone: branchData.phone.trim(),
//                 status: branchData.status,
//             };

//             console.log("Adding branch at:", url, "Data:", formattedData);

//             const res = await axios.post(url, formattedData);
//             console.log("Add branch response:", res.data);

//             let newBranch = {
//                 _id: `temp-${Date.now()}`,
//                 branch_name: branchData.branch_name,
//                 branch_type: "",
//                 branch_type_id: branchData.branch_type,
//                 address: branchData.address,
//                 phone: branchData.phone,
//                 status: branchData.status !== false,
//             };

//             if (res.data?.success && res.data.data) {
//                 const responseData = res.data.data;
//                 newBranch = {
//                     _id: responseData._id,
//                     branch_name: responseData.branch_name || branchData.branch_name,
//                     branch_type: responseData.branch_type?.branch_type || "", // Extract from nested object
//                     branch_type_id: responseData.branch_type?._id || branchData.branch_type,
//                     address: responseData.address || branchData.address,
//                     phone: responseData.phone || branchData.phone,
//                     status: responseData.status !== false,
//                 };
//             }

//             console.log("New branch to add:", newBranch);
            
//             // Update local state
//             setBranches(prev => [...prev, newBranch]);
            
//             // Refetch to ensure consistency
//             setTimeout(() => {
//                 fetchBranches();
//             }, 500);

//             return newBranch;
//         } catch (err) {
//             console.error("Add branch error:", err);
//             setError("Failed to add branch");
//             throw err;
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Update a branch
//     const updateBranch = async (id, branchData) => {
//         try {
//             setLoading(true);
//             setError("");

//             const url = API_ENDPOINTS.updateBranch(id);
            
//             // Format data according to API expectations
//             const formattedData = {
//                 branch_name: branchData.branch_name.trim(),
//                 branch_type: branchData.branch_type, // This should be the ID string
//                 address: branchData.address.trim(),
//                 phone: branchData.phone?.trim() || "",
//                 status: branchData.status,
//             };

//             console.log("Updating branch at:", url, "Data:", formattedData);

//             const res = await axios.put(url, formattedData);
//             console.log("Update branch response:", res.data);

//             if (res.data?.success) {
//                 const responseData = res.data.data || res.data;
//                 const updatedData = {
//                     _id: responseData._id || id,
//                     branch_name: responseData.branch_name || branchData.branch_name,
//                     branch_type: responseData.branch_type?.branch_type || branchData.branch_type_name || "",
//                     branch_type_id: responseData.branch_type?._id || branchData.branch_type,
//                     address: responseData.address || branchData.address,
//                     phone: responseData.phone || branchData.phone,
//                     status: responseData.status !== false,
//                 };

//                 console.log("Updated branch data:", updatedData);
                
//                 // Update local state
//                 setBranches(prev => prev.map(item => 
//                     item._id === id ? updatedData : item
//                 ));
                
//                 // Refetch to ensure consistency
//                 setTimeout(() => {
//                     fetchBranches();
//                 }, 500);

//                 return updatedData;
//             } else {
//                 throw new Error(res.data?.message || "Failed to update branch");
//             }
//         } catch (err) {
//             console.error("Update branch error:", err);
//             setError("Failed to update branch");
//             throw err;
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Delete a branch
//     const deleteBranch = async (id) => {
//         try {
//             setLoading(true);
//             setError("");

//             const url = API_ENDPOINTS.deleteBranch(id);
//             console.log("Deleting branch at:", url);

//             const res = await axios.delete(url);
//             console.log("Delete response:", res.data);

//             if (res.data?.success) {
//                 setBranches(prev => prev.filter((item) => item._id !== id));
//             } else {
//                 throw new Error(res.data?.message || "Failed to delete branch");
//             }
//         } catch (err) {
//             console.error("Delete branch error:", err);
//             setError("Failed to delete branch");
//             throw err;
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchBranchTypes();
//         fetchBranches();
//     }, []);

//     return {
//         branches,
//         branchTypes,
//         loading,
//         loadingTypes,
//         error,
//         typesError,
//         addBranch,
//         updateBranch,
//         deleteBranch,
//         fetchBranches,
//         fetchBranchTypes,
//     };
// }

import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useBranches() {
    const [branches, setBranches] = useState([]);
    const [branchTypes, setBranchTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingTypes, setLoadingTypes] = useState(false);
    const [error, setError] = useState("");
    const [typesError, setTypesError] = useState("");

    // Fetch all branch types
    const fetchBranchTypes = async () => {
        try {
            setLoadingTypes(true);
            setTypesError("");

            const url = API_ENDPOINTS.getBranchTypes();
            console.log("Fetching branch types from:", url);

            const res = await axios.get(url);
            console.log("Branch types API Response:", res.data);

            let typesData = [];

            if (res.data?.status && Array.isArray(res.data.data)) {
                typesData = res.data.data;
            }

            const mappedTypes = typesData.map((item) => ({
                _id: item._id,
                branch_type: item.branch_type,
            }));

            console.log("Fetched branch types:", mappedTypes);
            setBranchTypes(mappedTypes);
        } catch (err) {
            console.error("Fetch branch types error:", err);
            setTypesError("Failed to load branch types");
        } finally {
            setLoadingTypes(false);
        }
    };

    // Fetch all branches
    const fetchBranches = async () => {
        try {
            setLoading(true);
            setError("");

            const url = API_ENDPOINTS.getBranches();
            console.log("Fetching branches from:", url);

            const res = await axios.get(url);
            console.log("Branches GET Response:", res.data);

            let branchesData = [];

            // Handle both response formats
            if (res.data?.success) {
                if (Array.isArray(res.data.data)) {
                    branchesData = res.data.data;
                } else if (Array.isArray(res.data.data?.branches)) {
                    branchesData = res.data.data.branches;
                }
            }

            // Map API response to our format
            const mappedBranches = branchesData.map((item) => {
                // Extract branch_type name
                let branchTypeName = "";
                let branchTypeId = "";
                
                if (item.branch_type) {
                    if (typeof item.branch_type === 'object') {
                        branchTypeName = item.branch_type.branch_type || item.branch_type.name || "";
                        branchTypeId = item.branch_type._id || item.branch_type.id || "";
                    } else if (typeof item.branch_type === 'string') {
                        branchTypeName = item.branch_type;
                    }
                }

                return {
                    _id: item._id || item.id,
                    branch_name: item.branch_name || item.name || "",
                    branch_code: item.branch_code || item.code || "",
                    branch_type: branchTypeName,
                    branch_type_id: branchTypeId,
                    contact_person: item.contact_person || "",
                    address: item.address || "",
                    phone: item.phone || "",
                    is_warehouse: item.is_warehouse || false,
                    status: item.status !== false,
                    createdAt: item.createdAt || "",
                };
            });

            console.log("Mapped branches:", mappedBranches);
            setBranches(mappedBranches);
        } catch (err) {
            console.error("Fetch branches error:", err);
            setError("Failed to load branches");
        } finally {
            setLoading(false);
        }
    };

    // Add a new branch
    const addBranch = async (branchData) => {
        try {
            setLoading(true);
            setError("");

            const url = API_ENDPOINTS.createBranch();
            
            // Format data according to API expectations
            const formattedData = {
                branch_name: branchData.branch_name.trim(),
                branch_type: branchData.branch_type, // Send branch_type ID
                contact_person: branchData.contact_person.trim(),
                address: branchData.address.trim(),
                phone: branchData.phone.trim(),
                is_warehouse: branchData.is_warehouse,
                status: branchData.status,
            };

            console.log("Adding branch at:", url, "Data:", formattedData);

            const res = await axios.post(url, formattedData);
            console.log("Add branch response:", res.data);

            let newBranch = {
                _id: `temp-${Date.now()}`,
                branch_name: branchData.branch_name,
                branch_type: "",
                branch_type_id: branchData.branch_type,
                contact_person: branchData.contact_person,
                address: branchData.address,
                phone: branchData.phone,
                is_warehouse: branchData.is_warehouse,
                status: branchData.status !== false,
            };

            if (res.data?.success && res.data.data) {
                const responseData = res.data.data;
                newBranch = {
                    _id: responseData._id,
                    branch_name: responseData.branch_name || branchData.branch_name,
                    branch_code: responseData.branch_code || "",
                    branch_type: responseData.branch_type?.branch_type || "",
                    branch_type_id: responseData.branch_type?._id || branchData.branch_type,
                    contact_person: responseData.contact_person || branchData.contact_person,
                    address: responseData.address || branchData.address,
                    phone: responseData.phone || branchData.phone,
                    is_warehouse: responseData.is_warehouse || branchData.is_warehouse,
                    status: responseData.status !== false,
                    createdAt: responseData.createdAt || new Date().toISOString(),
                };
            }

            console.log("New branch to add:", newBranch);
            
            // Update local state
            setBranches(prev => [...prev, newBranch]);
            
            // Refetch to ensure consistency
            setTimeout(() => {
                fetchBranches();
            }, 500);

            return newBranch;
        } catch (err) {
            console.error("Add branch error:", err);
            setError("Failed to add branch");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update a branch
    const updateBranch = async (id, branchData) => {
        try {
            setLoading(true);
            setError("");

            const url = API_ENDPOINTS.updateBranch(id);
            
            // Format data according to API expectations
            const formattedData = {
                branch_name: branchData.branch_name.trim(),
                branch_type: branchData.branch_type,
                contact_person: branchData.contact_person.trim(),
                address: branchData.address.trim(),
                phone: branchData.phone.trim(),
                is_warehouse: branchData.is_warehouse,
                status: branchData.status,
            };

            console.log("Updating branch at:", url, "Data:", formattedData);

            const res = await axios.put(url, formattedData);
            console.log("Update branch response:", res.data);

            if (res.data?.success) {
                const responseData = res.data.data || res.data;
                const updatedData = {
                    _id: responseData._id || id,
                    branch_name: responseData.branch_name || branchData.branch_name,
                    branch_code: responseData.branch_code || "",
                    branch_type: responseData.branch_type?.branch_type || "",
                    branch_type_id: responseData.branch_type?._id || branchData.branch_type,
                    contact_person: responseData.contact_person || branchData.contact_person,
                    address: responseData.address || branchData.address,
                    phone: responseData.phone || branchData.phone,
                    is_warehouse: responseData.is_warehouse || branchData.is_warehouse,
                    status: responseData.status !== false,
                };

                console.log("Updated branch data:", updatedData);
                
                // Update local state
                setBranches(prev => prev.map(item => 
                    item._id === id ? updatedData : item
                ));
                
                return updatedData;
            } else {
                throw new Error(res.data?.message || "Failed to update branch");
            }
        } catch (err) {
            console.error("Update branch error:", err);
            setError("Failed to update branch");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a branch
    const deleteBranch = async (id) => {
        try {
            setLoading(true);
            setError("");

            const url = API_ENDPOINTS.deleteBranch(id);
            console.log("Deleting branch at:", url);

            const res = await axios.delete(url);
            console.log("Delete response:", res.data);

            if (res.data?.success) {
                setBranches(prev => prev.filter((item) => item._id !== id));
            } else {
                throw new Error(res.data?.message || "Failed to delete branch");
            }
        } catch (err) {
            console.error("Delete branch error:", err);
            setError("Failed to delete branch");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranchTypes();
        fetchBranches();
    }, []);

    return {
        branches,
        branchTypes,
        loading,
        loadingTypes,
        error,
        typesError,
        addBranch,
        updateBranch,
        deleteBranch,
        fetchBranches,
        fetchBranchTypes,
    };
}