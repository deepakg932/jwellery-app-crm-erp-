import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryItems() {
  const [items, setItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [units, setUnits] = useState([]);
  
  // Only need purities and materials
  const [materials, setMaterials] = useState([]);
  const [metalPurities, setMetalPurities] = useState([]);
  const [stonePurities, setStonePurities] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  // === FETCH METAL PURITIES ===
  const fetchMetalPurities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getPurities());
      
      let puritiesData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.purity)) {
        puritiesData = res.data.purity;
      } else if (Array.isArray(res.data)) {
        puritiesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        puritiesData = res.data.data;
      }
      
      // Map metal purities from your API response
      const mappedPurities = puritiesData
        .filter(item => item.metal_type) // Only items with metal_type (gold/silver)
        .map((purity) => ({
          _id: getId(purity),
          purity_name: purity.purity_name || "", // e.g., "22k"
          metal_type: purity.metal_type || "", // e.g., "gold"
          percentage: purity.percentage || 0,
          // We'll use metal_type as both the type and ID since we don't have separate metals API
          metal_id: purity.metal_type, // Use metal_type as ID
          ...purity
        }));
      
      console.log("Mapped metal purities:", mappedPurities);
      setMetalPurities(mappedPurities);
      return mappedPurities;
    } catch (err) {
      console.error("Fetch metal purities error:", err);
      setError("Failed to load metal purities");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH STONE PURITIES ===
  const fetchStonePurities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getAllStonePurities());
      
      let puritiesData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.purity)) {
        puritiesData = res.data.purity;
      } else if (Array.isArray(res.data)) {
        puritiesData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        puritiesData = res.data.data;
      }
      
      // Map stone purities from your API response
      const mappedPurities = puritiesData.map((purity) => ({
        _id: getId(purity),
        stone_purity: purity.stone_purity || "", // e.g., "VVS", "22"
        stone_type: purity.stone_type || "", // e.g., "Dimond"
        percentage: purity.percentage || 0,
        // We'll use stone_type as both the type and ID since we don't have separate stones API
        stone_id: purity.stone_type, // Use stone_type as ID
        ...purity
      }));
      
      console.log("Mapped stone purities:", mappedPurities);
      setStonePurities(mappedPurities);
      return mappedPurities;
    } catch (err) {
      console.error("Fetch stone purities error:", err);
      setError("Failed to load stone purities");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH MATERIAL TYPES ===
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      
      const url = API_ENDPOINTS.getMaterialTypes();
      console.log("Fetching material types from:", url);
      
      const res = await axios.get(url);
      console.log("Material Types API Response:", res.data);
      
      let materialData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        materialData = res.data.data;
      }
      
      const mappedMaterials = materialData.map((item) => ({
        _id: item._id,
        material_type: item.material_type || '',
        ...item
      }));
      
      setMaterials(mappedMaterials);
      return mappedMaterials;
    } catch (err) {
      console.error("Fetch material types error:", err);
      setError("Failed to load material types");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory categories
  const fetchInventoryCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryCategories());
      
      let categoriesData = [];

      console.log("Inventory categories response:", res.data);
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      }
      
      const mappedCategories = categoriesData.map((cat) => ({
        _id: getId(cat),
        name: cat.name || "",
        ...cat
      }));
      
      setInventoryCategories(mappedCategories);
      return mappedCategories;
    } catch (err) {
      console.error("Fetch inventory categories error:", err);
      setError("Failed to load inventory categories");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch units
  const fetchUnits = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getUnits());
      
      let unitsData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        unitsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        unitsData = res.data;
      } else if (res.data && Array.isArray(res.data.units)) {
        unitsData = res.data.units;
      }
      
      const mappedUnits = unitsData.map((unit) => ({
        _id: getId(unit),
        name: unit.name || unit.unit_name || "",
        ...unit
      }));
      
      setUnits(mappedUnits);
      return mappedUnits;
    } catch (err) {
      console.error("Fetch units error:", err);
      setError("Failed to load units");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH INVENTORY ITEMS ===
  const fetchInventoryItems = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryItems());
      
      let itemsData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        itemsData = res.data;
      } else if (res.data && Array.isArray(res.data.items)) {
        itemsData = res.data.items;
      }
      
      const mappedItems = itemsData.map((item) => ({
        _id: getId(item),
        item_name: item.item_name || "",
        sku_code: item.sku_code || "",
        inventory_category_id: item.inventory_category_id?._id || "",
        inventory_category_name: item.inventory_category_id?.name || "",
        
        // Material Type Info
        material_type_id: item.material_type_id?._id || "",
        material_type_name: item.material_type_id?.material_type || "",
        
        // Metals and stones arrays
        metals: item.metals || [],
        stones: item.stones || [],
        
        // Tracking
        track_by: item.track_by || "weight",
        total_weight: item.total_weight || null,
        total_quantity: item.total_quantity || null,
        unit_id: item.unit_id?._id || item.unit_id || "",
        unit_name: item.unit_id?.name || "",
        
        status: item.status !== false,
        createdAt: item.createdAt || "",
        updatedAt: item.updatedAt || "",
        ...item
      }));
      
      console.log("Mapped inventory items:", mappedItems);
      setItems(mappedItems);
      return mappedItems;
    } catch (err) {
      console.error("Fetch inventory items error:", err);
      setError("Failed to load inventory items");
      return [];
    } finally {
      setLoading(false);
    }
  };

// === ADD INVENTORY ITEM ===
const addInventoryItem = async (itemData) => {
  try {
    setLoading(true);
    
    console.log("Received itemData from form:", itemData);
    
    // Prepare payload - try different variations to see what works
    const payload = {
      item_name: itemData.item_name,
      inventory_category_id: itemData.inventory_category_id,
      track_by: itemData.track_by,
      status: itemData.status !== undefined ? itemData.status : true
    };
    
    // Add quantity/weight based on track_by
    if (itemData.track_by === "weight" || itemData.track_by === "both") {
      payload.weight = itemData.weight || null;
    }
    if (itemData.track_by === "quantity" || itemData.track_by === "both") {
      payload.quantity = itemData.quantity || null;
    }
    
    // Add unit_id if present (for metals/materials)
    if (itemData.unit_id) {
      payload.unit_id = itemData.unit_id;
    }
    
    // Handle metal items
    if (itemData.metal_type_name) {
      payload.metal_type_name = itemData.metal_type_name;
      payload.metal_purity_name = itemData.metal_purity_name;
      
      // Try sending metal_purity_id if available
      if (itemData.metal_purity_id) {
        payload.metal_purity_id = itemData.metal_purity_id;
      }
    }
    // Handle stone items - TRY DIFFERENT FORMATS
    else if (itemData.stone_type) {
      // Try format 1: Just names
      payload.stone_type = itemData.stone_type;
      payload.stone_purity_name = itemData.stone_purity_name;
      
      // Try format 2: With ID
      if (itemData.stone_purity_id) {
        payload.stone_purity_id = itemData.stone_purity_id;
      }
      
      // Try format 3: Backend might expect stone_type_name instead of stone_type
      payload.stone_type_name = itemData.stone_type;
      
      // For stones, ensure quantity is set
      if (!payload.quantity && itemData.quantity) {
        payload.quantity = itemData.quantity;
      }
    }
    // Handle material items
    else if (itemData.material_type_id) {
      payload.material_type_id = itemData.material_type_id;
    }
    
    console.log("Sending payload to API:", JSON.stringify(payload, null, 2));
    
    const res = await axios.post(API_ENDPOINTS.createInventoryItem(), payload);
    console.log("Add inventory item response:", res.data);
    
    let newItem = {};
    
    if (res.data && res.data.success && res.data.data) {
      const item = res.data.data;
      newItem = {
        _id: getId(item),
        item_name: item.item_name || "",
        sku_code: item.sku_code || "",
        inventory_category_id: item.inventory_category_id?._id || "",
        inventory_category_name: item.inventory_category_id?.name || "",
        
        // Type info
        material_type_id: item.material_type_id?._id || "",
        material_type_name: item.material_type_id?.material_type || "",
        
        // Metals and stones
        metals: item.metals || [],
        stones: item.stones || [],
        other_materials: item.other_materials || [],
        
        // Tracking
        track_by: item.track_by || "weight",
        total_weight: item.total_weight || item.weight || null,
        total_quantity: item.total_quantity || item.quantity || null,
        unit_id: item.unit_id?._id || item.unit_id || "",
        unit_name: item.unit_id?.name || "",
        
        status: item.status !== false,
        createdAt: item.createdAt || "",
        updatedAt: item.updatedAt || "",
      };
    } else {
      newItem = {
        _id: `temp-${Date.now()}`,
        ...itemData
      };
    }
    
    setItems(prev => [...prev, newItem]);
    await fetchInventoryItems();
    
    return newItem;
  } catch (err) {
    console.error("Add inventory item error:", err);
    setError("Failed to add inventory item");
    throw err;
  } finally {
    setLoading(false);
  }
};
// === UPDATE INVENTORY ITEM ===
const updateInventoryItem = async (id, itemData) => {
  try {
    setLoading(true);
    
    console.log("Received itemData for update:", itemData);
    
    // Prepare payload - consistent with addInventoryItem
    const payload = {
      item_name: itemData.item_name,
      inventory_category_id: itemData.inventory_category_id,
      track_by: itemData.track_by,
      status: itemData.status !== undefined ? itemData.status : true
    };
    
    // Add quantity/weight based on track_by - CONSISTENT WITH ADD
    if (itemData.track_by === "weight" || itemData.track_by === "both") {
      payload.weight = itemData.weight || itemData.total_weight || null;
    }
    if (itemData.track_by === "quantity" || itemData.track_by === "both") {
      payload.quantity = itemData.quantity || itemData.total_quantity || null;
    }
    
    // Add unit_id if present
    if (itemData.unit_id) {
      payload.unit_id = itemData.unit_id;
    }
    
    // Handle metal items - CONSISTENT WITH ADD
    if (itemData.metal_type_name) {
      payload.metal_type_name = itemData.metal_type_name;
      payload.metal_purity_name = itemData.metal_purity_name;
      
      if (itemData.metal_purity_id) {
        payload.metal_purity_id = itemData.metal_purity_id;
      }
    }
    // Handle stone items - CONSISTENT WITH ADD
    else if (itemData.stone_type || itemData.stone_type_name) {
      // Use the same logic as add
      payload.stone_type = itemData.stone_type || itemData.stone_type_name;
      payload.stone_purity_name = itemData.stone_purity_name;
      
      if (itemData.stone_purity_id) {
        payload.stone_purity_id = itemData.stone_purity_id;
      }
      
      payload.stone_type_name = itemData.stone_type || itemData.stone_type_name;
      
      // For stones, ensure quantity is set
      if (!payload.quantity && (itemData.quantity || itemData.total_quantity)) {
        payload.quantity = itemData.quantity || itemData.total_quantity;
      }
    }
    // Handle material items
    else if (itemData.material_type_id) {
      payload.material_type_id = itemData.material_type_id;
    }
    
    // IMPORTANT: If you're updating existing metals/stones arrays, include them
    // But make sure backend expects this format - check your add function
    // If backend creates metals/stones from individual fields in add,
    // you might need similar individual fields for update
    if (itemData.metals && itemData.metals.length > 0) {
      payload.metals = itemData.metals;
    }
    if (itemData.stones && itemData.stones.length > 0) {
      payload.stones = itemData.stones;
    }
    
    console.log("Sending update payload to API:", JSON.stringify(payload, null, 2));
    
    const res = await axios.put(API_ENDPOINTS.updateInventoryItem(id), payload);
    console.log("Update inventory item response:", res.data);
    
    let updatedItem = {};
    if (res.data && res.data.success && res.data.data) {
      const item = res.data.data;
      updatedItem = {
        _id: getId(item) || id,
        item_name: item.item_name || "",
        sku_code: item.sku_code || "",
        inventory_category_id: item.inventory_category_id?._id || "",
        inventory_category_name: item.inventory_category_id?.name || "",
        
        // Type info
        material_type_id: item.material_type_id?._id || "",
        material_type_name: item.material_type_id?.material_type || "",
        
        // Metals and stones - CHECK RESPONSE STRUCTURE
        metals: item.metals || [],
        stones: item.stones || [],
        other_materials: item.other_materials || [],
        
        // Tracking - USE SAME FIELD NAMES AS ADD
        track_by: item.track_by || "weight",
        total_weight: item.total_weight || item.weight || null,
        total_quantity: item.total_quantity || item.quantity || null,
        unit_id: item.unit_id?._id || item.unit_id || "",
        unit_name: item.unit_id?.name || "",
        
        // Also include weight/quantity for form compatibility
        weight: item.weight || item.total_weight || null,
        quantity: item.quantity || item.total_quantity || null,
        
        status: item.status !== false,
        createdAt: item.createdAt || "",
        updatedAt: item.updatedAt || "",
      };
    } else {
      // Fallback to original data if response doesn't have expected structure
      updatedItem = {
        _id: id,
        ...itemData
      };
    }
    
    setItems(prev => 
      prev.map((item) => (item._id === id ? updatedItem : item))
    );
    
    await fetchInventoryItems();
    
    return updatedItem;
  } catch (err) {
    console.error("Update inventory item error:", err);
    setError("Failed to update inventory item");
    throw err;
  } finally {
    setLoading(false);
  }
};
  // === DELETE INVENTORY ITEM ===
  const deleteInventoryItem = async (id) => {
    try {
      setLoading(true);
      
      await axios.delete(API_ENDPOINTS.deleteInventoryItem(id));
      
      setItems(prev => prev.filter((item) => item._id !== id));
      await fetchInventoryItems();
      
    } catch (err) {
      console.error("Delete inventory item error:", err);
      setError("Failed to delete inventory item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // === FETCH ALL DATA ===
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchInventoryCategories(),
        fetchUnits(),
        fetchMetalPurities(),
        fetchStonePurities(),
        fetchMaterials(),
        fetchInventoryItems()
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return {
    // Data
    items,
    inventoryCategories,
    units,
    metalPurities,
    stonePurities,
    materials,
    
    // Loading States
    loading,
    error,
    
    // CRUD Operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Fetch Functions
    fetchInventoryItems,
    fetchInventoryCategories,
    fetchUnits,
    fetchMetalPurities,
    fetchStonePurities,
    fetchMaterials,
    
    // Helper
    getId,
  };
}