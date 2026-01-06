import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryItems() {
  const [items, setItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [metalTypes, setMetalTypes] = useState([]);
  const [stoneTypes, setStoneTypes] = useState([]);
  const [branches, setBranches] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  // === FETCH BRANCHES ===
  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getBranches());
      
      let branchesData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        branchesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        branchesData = res.data;
      }
      
      const mappedBranches = branchesData
        .filter(branch => branch.status !== false)
        .map((branch) => ({
          _id: getId(branch),
          name: branch.name || "",
          code: branch.code || "",
          address: branch.address || "",
          city: branch.city || "",
          state: branch.state || "",
          country: branch.country || "",
          phone: branch.phone || "",
          email: branch.email || "",
          is_warehouse: branch.is_warehouse || false,
          status: branch.status !== false,
          ...branch
        }));
      
      setBranches(mappedBranches);
      return mappedBranches;
    } catch (err) {
      console.error("Fetch branches error:", err);
      setError("Failed to load branches");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH METAL TYPES ===
  const fetchMetalTypes = async () => {
    try {
      setLoading(true);
      // Assuming you have an API for metal types
      const res = await axios.get(API_ENDPOINTS.getMetalTypes || '/api/metals');
      
      let metalData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        metalData = res.data.data;
      } else if (Array.isArray(res.data)) {
        metalData = res.data;
      }
      
      // Map common metal types if API doesn't exist
      const defaultMetals = [
        { _id: "gold", name: "Gold", purities: ["24k", "22k", "18k", "14k"] },
        { _id: "silver", name: "Silver", purities: ["925", "999"] },
        { _id: "platinum", name: "Platinum", purities: ["950", "900"] },
        { _id: "diamond", name: "Diamond" },
        { _id: "other", name: "Other" }
      ];
      
      const mappedMetals = metalData.length > 0 ? metalData.map((metal) => ({
        _id: getId(metal),
        name: metal.name || metal.metal_type || "",
        purities: metal.purities || [],
        ...metal
      })) : defaultMetals;
      
      setMetalTypes(mappedMetals);
      return mappedMetals;
    } catch (err) {
      console.error("Fetch metal types error:", err);
      // Return default metals if API fails
      const defaultMetals = [
        { _id: "gold", name: "Gold", purities: ["24k", "22k", "18k", "14k"] },
        { _id: "silver", name: "Silver", purities: ["925", "999"] },
        { _id: "platinum", name: "Platinum", purities: ["950", "900"] },
      ];
      setMetalTypes(defaultMetals);
      return defaultMetals;
    } finally {
      setLoading(false);
    }
  };

  // === FETCH STONE TYPES ===
  const fetchStoneTypes = async () => {
    try {
      setLoading(true);
      // Assuming you have an API for stone types
      const res = await axios.get(API_ENDPOINTS.getStoneTypes || '/api/stones');
      
      let stoneData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
        stoneData = res.data.data;
      } else if (Array.isArray(res.data)) {
        stoneData = res.data;
      }
      
      // Map common stone types if API doesn't exist
      const defaultStones = [
        { _id: "diamond", name: "Diamond" },
        { _id: "ruby", name: "Ruby" },
        { _id: "sapphire", name: "Sapphire" },
        { _id: "emerald", name: "Emerald" },
        { _id: "pearl", name: "Pearl" },
        { _id: "other", name: "Other" }
      ];
      
      const mappedStones = stoneData.length > 0 ? stoneData.map((stone) => ({
        _id: getId(stone),
        name: stone.name || stone.stone_type || "",
        ...stone
      })) : defaultStones;
      
      setStoneTypes(mappedStones);
      return mappedStones;
    } catch (err) {
      console.error("Fetch stone types error:", err);
      // Return default stones if API fails
      const defaultStones = [
        { _id: "diamond", name: "Diamond" },
        { _id: "ruby", name: "Ruby" },
        { _id: "sapphire", name: "Sapphire" },
        { _id: "emerald", name: "Emerald" },
      ];
      setStoneTypes(defaultStones);
      return defaultStones;
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
        item_code: item.item_code || item.sku_code || "",
        description: item.description || "",
        inventory_category_id: item.inventory_category_id || "",
        inventory_category_name: item.inventory_category_id?.name || "",
        
        // Jewelry Details
        item_type: item.item_type || "jewelry",
        
        // Metals Array
        metals: Array.isArray(item.metals) ? item.metals.map(metal => ({
          metal_type: metal.metal_type || "",
          purity: metal.purity || "",
          weight: metal.weight || 0,
          color: metal.color || "",
          hallmark: metal.hallmark || ""
        })) : [],
        
        // Stones Array
        stones: Array.isArray(item.stones) ? item.stones.map(stone => ({
          stone_type: stone.stone_type || "",
          shape: stone.shape || "",
          color: stone.color || "",
          clarity: stone.clarity || "",
          carat_weight: stone.carat_weight || 0,
          quantity: stone.quantity || 0,
          certificate_type: stone.certificate_type || ""
        })) : [],
        
        // Rates and Costs
        gold_rate: item.gold_rate || 0,
        stone_rate: item.stone_rate || 0,
        metal_weight: item.metal_weight || 0,
        total_carat: item.total_carat || 0,
        metal_cost: item.metal_cost || 0,
        stone_cost: item.stone_cost || 0,
        
        // Making Charges
        making_charges: item.making_charges || 0,
        making_type: item.making_type || "percentage",
        wastage_percentage: item.wastage_percentage || 0,
        wastage_charges: item.wastage_charges || 0,
        
        // Pricing
        total_cost_price: item.total_cost_price || 0,
        profit_margin: item.profit_margin || 0,
        selling_price: item.selling_price || 0,
        mrp: item.mrp || 0,
        discount_type: item.discount_type || "none",
        discount_value: item.discount_value || 0,
        final_price: item.final_price || 0,
        
        // Tax
        gst_percentage: item.gst_percentage || 0,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        total_tax: item.total_tax || 0,
        price_with_tax: item.price_with_tax || 0,
        
        // Branch/Location
        branch_id: item.branch_id || "",
        branch_name: item.branch_id?.name || "",
        current_stock: item.current_stock || 0,
        minimum_stock: item.minimum_stock || 0,
        stock_status: item.stock_status || "in_stock",
        location_type: item.location_type || "showcase",
        
        // Status
        status: item.status || "active",
        is_new_arrival: item.is_new_arrival || false,
        images: Array.isArray(item.images) ? item.images : [],
        tags: Array.isArray(item.tags) ? item.tags : [],
        
        createdAt: item.created_at || item.createdAt || "",
        updatedAt: item.updated_at || item.updatedAt || "",
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
      
      // Prepare payload matching backend structure
      const payload = {
        item_name: itemData.item_name,
        item_code: itemData.item_code,
        description: itemData.description || "",
        inventory_category_id: itemData.inventory_category_id,
        branch_id: itemData.branch_id,
        
        // Item type (assuming jewelry)
        item_type: "jewelry",
        
        // Metals array
        metals: itemData.metals || [],
        
        // Stones array
        stones: itemData.stones || [],
        
        // Rates
        gold_rate: parseFloat(itemData.gold_rate) || 0,
        stone_rate: parseFloat(itemData.stone_rate) || 0,
        
        // Making charges
        making_charges: parseFloat(itemData.making_charges) || 0,
        making_type: itemData.making_type || "percentage",
        wastage_percentage: parseFloat(itemData.wastage_percentage) || 5,
        profit_margin: parseFloat(itemData.profit_margin) || 20,
        
        // Stock
        current_stock: parseInt(itemData.current_stock) || 1,
        minimum_stock: parseInt(itemData.minimum_stock) || 1,
        location_type: itemData.location_type || "showcase",
        
        // Pricing
        mrp: parseFloat(itemData.mrp) || 0,
        discount_type: itemData.discount_type || "none",
        discount_value: parseFloat(itemData.discount_value) || 0,
        
        // Tax
        gst_percentage: parseFloat(itemData.gst_percentage) || 3,
        
        // Status
        status: itemData.status || "active",
        is_new_arrival: itemData.is_new_arrival || true,
        
        // Arrays
        images: itemData.images || [],
        tags: itemData.tags || []
      };
      
      // Calculate additional fields (these can be calculated on backend too)
      if (itemData.metals && itemData.metals.length > 0) {
        payload.metal_weight = itemData.metals.reduce((sum, metal) => sum + (metal.weight || 0), 0);
      }
      
      if (itemData.stones && itemData.stones.length > 0) {
        payload.total_carat = itemData.stones.reduce((sum, stone) => sum + (stone.carat_weight || 0), 0);
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
          item_code: item.item_code || item.sku_code || "",
          description: item.description || "",
          inventory_category_id: item.inventory_category_id || "",
          inventory_category_name: item.inventory_category_id?.name || "",
          
          // Jewelry Details
          item_type: item.item_type || "jewelry",
          
          // Metals
          metals: Array.isArray(item.metals) ? item.metals : [],
          
          // Stones
          stones: Array.isArray(item.stones) ? item.stones : [],
          
          // Rates and Costs
          gold_rate: item.gold_rate || 0,
          stone_rate: item.stone_rate || 0,
          metal_weight: item.metal_weight || 0,
          total_carat: item.total_carat || 0,
          metal_cost: item.metal_cost || 0,
          stone_cost: item.stone_cost || 0,
          
          // Making Charges
          making_charges: item.making_charges || 0,
          making_type: item.making_type || "percentage",
          wastage_percentage: item.wastage_percentage || 0,
          wastage_charges: item.wastage_charges || 0,
          
          // Pricing
          total_cost_price: item.total_cost_price || 0,
          profit_margin: item.profit_margin || 0,
          selling_price: item.selling_price || 0,
          mrp: item.mrp || 0,
          discount_type: item.discount_type || "none",
          discount_value: item.discount_value || 0,
          final_price: item.final_price || 0,
          
          // Tax
          gst_percentage: item.gst_percentage || 0,
          cgst: item.cgst || 0,
          sgst: item.sgst || 0,
          total_tax: item.total_tax || 0,
          price_with_tax: item.price_with_tax || 0,
          
          // Branch/Location
          branch_id: item.branch_id || "",
          branch_name: item.branch_id?.name || "",
          current_stock: item.current_stock || 0,
          minimum_stock: item.minimum_stock || 0,
          stock_status: item.stock_status || "in_stock",
          location_type: item.location_type || "showcase",
          
          // Status
          status: item.status || "active",
          is_new_arrival: item.is_new_arrival || false,
          images: Array.isArray(item.images) ? item.images : [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          
          createdAt: item.created_at || item.createdAt || "",
          updatedAt: item.updated_at || item.updatedAt || "",
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
      
      // Prepare payload matching backend structure
      const payload = {
        item_name: itemData.item_name,
        item_code: itemData.item_code,
        description: itemData.description || "",
        inventory_category_id: itemData.inventory_category_id,
        branch_id: itemData.branch_id,
        
        // Metals array
        metals: itemData.metals || [],
        
        // Stones array
        stones: itemData.stones || [],
        
        // Rates
        gold_rate: parseFloat(itemData.gold_rate) || 0,
        stone_rate: parseFloat(itemData.stone_rate) || 0,
        
        // Making charges
        making_charges: parseFloat(itemData.making_charges) || 0,
        making_type: itemData.making_type || "percentage",
        wastage_percentage: parseFloat(itemData.wastage_percentage) || 5,
        profit_margin: parseFloat(itemData.profit_margin) || 20,
        
        // Stock
        current_stock: parseInt(itemData.current_stock) || 1,
        minimum_stock: parseInt(itemData.minimum_stock) || 1,
        location_type: itemData.location_type || "showcase",
        
        // Pricing
        mrp: parseFloat(itemData.mrp) || 0,
        discount_type: itemData.discount_type || "none",
        discount_value: parseFloat(itemData.discount_value) || 0,
        
        // Tax
        gst_percentage: parseFloat(itemData.gst_percentage) || 3,
        
        // Status
        status: itemData.status || "active",
        is_new_arrival: itemData.is_new_arrival || false,
      };
      
      console.log("Sending update payload to API:", JSON.stringify(payload, null, 2));
      
      const res = await axios.put(API_ENDPOINTS.updateInventoryItem(id), payload);
      console.log("Update inventory item response:", res.data);
      
      let updatedItem = {};
      if (res.data && res.data.success && res.data.data) {
        const item = res.data.data;
        updatedItem = {
          _id: getId(item) || id,
          item_name: item.item_name || "",
          item_code: item.item_code || item.sku_code || "",
          description: item.description || "",
          inventory_category_id: item.inventory_category_id || "",
          inventory_category_name: item.inventory_category_id?.name || "",
          
          // Metals
          metals: Array.isArray(item.metals) ? item.metals : [],
          
          // Stones
          stones: Array.isArray(item.stones) ? item.stones : [],
          
          // Rates and Costs
          gold_rate: item.gold_rate || 0,
          stone_rate: item.stone_rate || 0,
          metal_weight: item.metal_weight || 0,
          total_carat: item.total_carat || 0,
          metal_cost: item.metal_cost || 0,
          stone_cost: item.stone_cost || 0,
          
          // Pricing
          total_cost_price: item.total_cost_price || 0,
          profit_margin: item.profit_margin || 0,
          selling_price: item.selling_price || 0,
          
          // Branch/Location
          branch_id: item.branch_id || "",
          branch_name: item.branch_id?.name || "",
          current_stock: item.current_stock || 0,
          minimum_stock: item.minimum_stock || 0,
          
          // Status
          status: item.status || "active",
          
          createdAt: item.created_at || item.createdAt || "",
          updatedAt: item.updated_at || item.updatedAt || "",
        };
      } else {
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
        fetchBranches(),
        fetchInventoryCategories(),
        fetchMetalTypes(),
        fetchStoneTypes(),
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
    branches,
    inventoryCategories,
    metalTypes,
    stoneTypes,
    
    // Loading States
    loading,
    error,
    
    // CRUD Operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Fetch Functions
    fetchInventoryItems,
    fetchBranches,
    fetchInventoryCategories,
    fetchMetalTypes,
    fetchStoneTypes,
    
    // Helper
    getId,
  };
}