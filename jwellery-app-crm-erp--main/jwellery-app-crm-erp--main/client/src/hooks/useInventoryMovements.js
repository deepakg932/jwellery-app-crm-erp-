// hooks/useInventoryMovements.js
import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryMovements() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all inventory movements
  const fetchMovements = async (params = {}) => {
    try {
      setLoading(true);
      setError("");
      
      const res = await axios.get(API_ENDPOINTS.getInventoryMovements(), { params });
      
      let movementsData = [];
      
      // Handle different API response formats
      if (res.data?.success && Array.isArray(res.data.data)) {
        movementsData = res.data.data;
      } else if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        movementsData = res.data.fetched;
      } else if (Array.isArray(res.data)) {
        movementsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        movementsData = res.data.data;
      }
      
      // Map and structure the data
      const mappedMovements = movementsData.map(movement => ({
        _id: movement._id,
        item_id: movement.item_id?._id || movement.item_id,
        item: movement.item_id || movement.item,
        movement_type: movement.movement_type,
        from_location_id: movement.from_location_id?._id || movement.from_location_id,
        from_location: movement.from_location_id || movement.from_location,
        to_location_id: movement.to_location_id?._id || movement.to_location_id,
        to_location: movement.to_location_id || movement.to_location,
        quantity: movement.quantity,
        weight: movement.weight,
        cost_per_unit: movement.cost_per_unit,
        total_cost: movement.total_cost,
        reference_type: movement.reference_type, // GRN, SALES, TRANSFER, etc.
        reference_id: movement.reference_id,
        reference_number: movement.reference_number,
        remarks: movement.remarks,
        date: movement.date || movement.createdAt,
        created_by: movement.created_by,
        createdAt: movement.createdAt,
        updatedAt: movement.updatedAt
      }));
      
      setMovements(mappedMovements);
      return mappedMovements;
      
    } catch (err) {
      console.error("Error fetching inventory movements:", err);
      setError("Failed to load inventory movements");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get movement by ID
  const getMovementById = async (id) => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryMovementById(id));
      
      if (res.data?.success) {
        return res.data.data || res.data;
      }
      return null;
    } catch (err) {
      console.error("Error fetching movement:", err);
      setError("Failed to load movement details");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get movements by item ID
  const getMovementsByItemId = async (itemId) => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getMovementsByItemId(itemId));
      
      let movementsData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        movementsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        movementsData = res.data;
      }
      
      return movementsData;
    } catch (err) {
      console.error("Error fetching item movements:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Get stock ledger for an item
  const getStockLedger = async (itemId, locationId = null) => {
    try {
      setLoading(true);
      const params = { itemId };
      if (locationId) params.locationId = locationId;
      
      const res = await axios.get(API_ENDPOINTS.getStockLedger(), { params });
      
      if (res.data?.success) {
        return res.data.data || res.data;
      }
      return [];
    } catch (err) {
      console.error("Error fetching stock ledger:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    fetchMovements();
  }, []);

  return {
    movements,
    loading,
    error,
    fetchMovements,
    getMovementById,
    getMovementsByItemId,
    getStockLedger
  };
}