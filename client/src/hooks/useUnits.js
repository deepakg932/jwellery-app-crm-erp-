// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { API_ENDPOINTS } from "@/api/api";

// const useUnits = () => {
//   const [units, setUnits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const fetchUnits = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(API_ENDPOINTS.getUnits());

//       if (
//         response.data &&
//         response.data.data &&
//         Array.isArray(response.data.data)
//       ) {
//         setUnits(response.data.data);
//       } else {
//         console.warn("Unexpected response format:", response.data);
//         setUnits([]);
//       }
//     } catch (err) {
//       setError(err.message || "Failed to fetch units");
//       console.error("Error fetching units:", err);
//       setUnits([]);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const addUnit = async (name) => {
//     try {
//       const response = await axios.post(API_ENDPOINTS.createUnit(), { name });
//       const newUnit = response.data.data;
//       setUnits((prev) => [...prev, newUnit]);
//       return newUnit;
//     } catch (err) {
//       throw err;
//     }
//   };

//   const updateUnit = async (id, data) => {
//     try {
//       const response = await axios.put(API_ENDPOINTS.updateUnit(id), data);
//       const updatedUnit = response.data.data;
//       setUnits((prev) =>
//         prev.map((unit) => (unit._id === id ? updatedUnit : unit))
//       );
//       return updatedUnit;
//     } catch (err) {
//       throw err;
//     }
//   };

//   const deleteUnit = async (id) => {
//     try {
//       // Replace hardcoded URL with API_ENDPOINTS
//       await axios.delete(API_ENDPOINTS.deleteUnit(id));
//       setUnits((prev) => prev.filter((unit) => unit._id !== id));
//     } catch (err) {
//       throw err;
//     }
//   };

//   useEffect(() => {
//     fetchUnits();
//   }, [fetchUnits]);

//   return {
//     units,
//     loading,
//     error,
//     addUnit,
//     updateUnit,
//     deleteUnit,
//   };
// };

// export default useUnits;


import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

const useUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_ENDPOINTS.getUnits());

      let unitsData = [];
      
      // Multiple response format handling
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        unitsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        unitsData = response.data;
      } else if (response.data && Array.isArray(response.data.units)) {
        unitsData = response.data.units;
      }
      
      setUnits(unitsData);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch units");
      console.error("Error fetching units:", err);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addUnit = async (unitData) => {
    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINTS.createUnit(), unitData);
      
      let newUnit = {};
      if (response.data && response.data.success && response.data.data) {
        newUnit = response.data.data;
      } else {
        // Fallback
        newUnit = {
          _id: `temp-${Date.now()}`,
          ...unitData
        };
      }
      
      setUnits(prev => [...prev, newUnit]);
      return newUnit;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUnit = async (id, data) => {
    try {
      setLoading(true);
      const response = await axios.put(API_ENDPOINTS.updateUnit(id), data);
      
      let updatedUnit = {};
      if (response.data && response.data.success && response.data.data) {
        updatedUnit = response.data.data;
      } else {
        updatedUnit = { _id: id, ...data };
      }
      
      setUnits(prev =>
        prev.map((unit) => (unit._id === id ? updatedUnit : unit))
      );
      return updatedUnit;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUnit = async (id) => {
    try {
      setLoading(true);
      await axios.delete(API_ENDPOINTS.deleteUnit(id));
      setUnits((prev) => prev.filter((unit) => unit._id !== id));
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, [fetchUnits]);

  return {
    units,
    loading,
    error,
    addUnit,
    updateUnit,
    deleteUnit,
    fetchUnits,
  };
};

export default useUnits;
