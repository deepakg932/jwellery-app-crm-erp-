import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryItems() {
  const [items, setItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [metalPurities, setMetalPurities] = useState([]);
  const [stonePurities, setStonePurities] = useState([]);
  const [hallmarks, setHallmarks] = useState([]);
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

  // === FETCH METAL PURITIES ===
  const fetchMetalPurities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getPurities());
      
      let metalPurityData = [];
      
      if (res.data?.success && Array.isArray(res.data.purity)) {
        metalPurityData = res.data.purity;
      } else if (Array.isArray(res.data)) {
        metalPurityData = res.data;
      }
      
      // Group by metal type
      const groupedByMetal = {};
      metalPurityData.forEach(purity => {
        const metalType = purity.metal_type || "other";
        if (!groupedByMetal[metalType]) {
          groupedByMetal[metalType] = [];
        }
        groupedByMetal[metalType].push({
          _id: getId(purity),
          purity_name: purity.purity_name || purity.name || "",
          metal_type: metalType,
          percentage: purity.percentage || 0,
          ...purity
        });
      });
      
      setMetalPurities(metalPurityData);
      return metalPurityData;
    } catch (err) {
      console.error("Fetch metal purities error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH STONE PURITIES (Clarity) ===
  const fetchStonePurities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getAllStonePurities());
      
      let stonePurityData = [];
      
      if (res.data?.success && Array.isArray(res.data.purity)) {
        stonePurityData = res.data.purity;
      } else if (Array.isArray(res.data)) {
        stonePurityData = res.data;
      }
      
      // Group by stone type
      const groupedByStone = {};
      stonePurityData.forEach(purity => {
        const stoneType = purity.stone_type || "diamond";
        if (!groupedByStone[stoneType]) {
          groupedByStone[stoneType] = [];
        }
        groupedByStone[stoneType].push({
          _id: getId(purity),
          stone_purity: purity.stone_purity || purity.name || "",
          stone_type: stoneType,
          percentage: purity.percentage || 0,
          clarity: purity.stone_purity || "", // Using stone_purity as clarity
          ...purity
        });
      });
      
      setStonePurities(stonePurityData);
      return stonePurityData;
    } catch (err) {
      console.error("Fetch stone purities error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH HALLMARKS ===
  const fetchHallmarks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getHallmarks());
      
      let hallmarkData = [];
      
      if (res.data?.success && Array.isArray(res.data.hallmarks)) {
        hallmarkData = res.data.hallmarks;
      } else if (Array.isArray(res.data)) {
        hallmarkData = res.data;
      }
      
      // Group by metal type
      const groupedByMetal = {};
      hallmarkData.forEach(hallmark => {
        const metalType = hallmark.metal_type_name || "gold";
        if (!groupedByMetal[metalType]) {
          groupedByMetal[metalType] = [];
        }
        groupedByMetal[metalType].push({
          _id: getId(hallmark),
          name: hallmark.name || "",
          metal_type: hallmark.metal_type,
          metal_type_name: metalType,
          ...hallmark
        });
      });
      
      setHallmarks(hallmarkData);
      return hallmarkData;
    } catch (err) {
      console.error("Fetch hallmarks error:", err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH INVENTORY CATEGORIES ===
  const fetchInventoryCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventoryCategories());
      
      let categoriesData = [];
      
      if (res.data?.success && Array.isArray(res.data.data)) {
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
      
      if (res.data?.success && Array.isArray(res.data.data)) {
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
          clarity: stone.clarity || "", // Using stone_purity as clarity
          carat_weight: stone.carat_weight || 0,
          quantity: stone.quantity || 0,
          certificate_type: stone.certificate_type || ""
        })) : [],
        
        // Jewelry Type Details
        jewelry_type: item.jewelry_type || "Ring",
        size: item.size || "",
        gender: item.gender || "women",
        occasion: item.occasion || "wedding",
        
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
        location_details: item.location_details || "",
        
        // Status
        status: item.status || "active",
        images: Array.isArray(item.images) ? item.images : [],
        tags: item.tags || "",
        
        createdAt: item.created_at || item.createdAt || "",
        updatedAt: item.updated_at || item.updatedAt || "",
        ...item
      }));
      
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
      
      // Prepare payload matching backend structure
      const payload = {
        item_name: itemData.item_name,
        item_code: itemData.item_code,
        inventory_category_id: itemData.inventory_category_id,
        branch_id: itemData.branch_id,
        item_type: "jewelry",
        
        // Metals array
        metals: itemData.metals.map(metal => ({
          metal_type: metal.metal_type,
          purity: metal.purity,
          weight: parseFloat(metal.weight) || 0,
          color: metal.color,
          hallmark: metal.hallmark || ""
        })),
        
        // Stones array
        stones: itemData.stones.map(stone => ({
          stone_type: stone.stone_type,
          shape: stone.shape,
          color: stone.color,
          clarity: stone.clarity, // Using stone_purity as clarity
          carat_weight: parseFloat(stone.carat_weight) || 0,
          quantity: parseInt(stone.quantity) || 1,
          certificate_type: stone.certificate_type || ""
        })),
        
        // Jewelry Details
        jewelry_type: itemData.jewelry_type,
        size: itemData.size,
        gender: itemData.gender,
        occasion: itemData.occasion,
        
        // Rates
        gold_rate: parseFloat(itemData.gold_rate) || 0,
        stone_rate: parseFloat(itemData.stone_rate) || 0,
        
        // Making charges
        making_charges: parseFloat(itemData.making_charges) || 0,
        making_type: itemData.making_type || "percentage",
        wastage_percentage: parseFloat(itemData.wastage_percentage) || 5,
        profit_margin: parseFloat(itemData.profit_margin) || 25,
        
        // Stock
        current_stock: parseInt(itemData.current_stock) || 1,
        minimum_stock: parseInt(itemData.minimum_stock) || 1,
        location_type: itemData.location_type || "showcase",
        location_details: itemData.location_details || "",
        
        // Tax
        gst_percentage: parseFloat(itemData.gst_percentage) || 3,
        
        // Description
        description: itemData.description || "",
        
        // Status
        status: itemData.status || "active",
        
        // Arrays
        images: itemData.images || [],
        tags: itemData.tags || ""
      };
      
      const res = await axios.post(API_ENDPOINTS.createInventoryItem(), payload);
      
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
          jewelry_type: item.jewelry_type || "Ring",
          size: item.size || "",
          gender: item.gender || "women",
          occasion: item.occasion || "wedding",
          
          // Metals
          metals: Array.isArray(item.metals) ? item.metals : [],
          
          // Stones
          stones: Array.isArray(item.stones) ? item.stones : [],
          
          // Rates and Costs
          gold_rate: item.gold_rate || 0,
          stone_rate: item.stone_rate || 0,
          metal_weight: item.metal_weight || 0,
          total_carat: item.total_carat || 0,
          
          // Branch/Location
          branch_id: item.branch_id || "",
          branch_name: item.branch_id?.name || "",
          current_stock: item.current_stock || 0,
          minimum_stock: item.minimum_stock || 0,
          location_type: item.location_type || "showcase",
          location_details: item.location_details || "",
          
          // Status
          status: item.status || "active",
          
          images: Array.isArray(item.images) ? item.images : [],
          tags: item.tags || "",
          
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
      
      // Prepare payload matching backend structure
      const payload = {
        item_name: itemData.item_name,
        item_code: itemData.item_code,
        inventory_category_id: itemData.inventory_category_id,
        branch_id: itemData.branch_id,
        item_type: "jewelry",
        
        // Metals array
        metals: itemData.metals.map(metal => ({
          metal_type: metal.metal_type,
          purity: metal.purity,
          weight: parseFloat(metal.weight) || 0,
          color: metal.color,
          hallmark: metal.hallmark || ""
        })),
        
        // Stones array
        stones: itemData.stones.map(stone => ({
          stone_type: stone.stone_type,
          shape: stone.shape,
          color: stone.color,
          clarity: stone.clarity,
          carat_weight: parseFloat(stone.carat_weight) || 0,
          quantity: parseInt(stone.quantity) || 1,
          certificate_type: stone.certificate_type || ""
        })),
        
        // Jewelry Details
        jewelry_type: itemData.jewelry_type,
        size: itemData.size,
        gender: itemData.gender,
        occasion: itemData.occasion,
        
        // Rates
        gold_rate: parseFloat(itemData.gold_rate) || 0,
        stone_rate: parseFloat(itemData.stone_rate) || 0,
        
        // Making charges
        making_charges: parseFloat(itemData.making_charges) || 0,
        making_type: itemData.making_type || "percentage",
        wastage_percentage: parseFloat(itemData.wastage_percentage) || 5,
        profit_margin: parseFloat(itemData.profit_margin) || 25,
        
        // Stock
        current_stock: parseInt(itemData.current_stock) || 1,
        minimum_stock: parseInt(itemData.minimum_stock) || 1,
        location_type: itemData.location_type || "showcase",
        location_details: itemData.location_details || "",
        
        // Tax
        gst_percentage: parseFloat(itemData.gst_percentage) || 3,
        
        // Description
        description: itemData.description || "",
        
        // Status
        status: itemData.status || "active",
        
        // Arrays
        images: itemData.images || [],
        tags: itemData.tags || ""
      };
      
      const res = await axios.put(API_ENDPOINTS.updateInventoryItem(id), payload);
      
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
          
          // Jewelry Details
          jewelry_type: item.jewelry_type || "Ring",
          size: item.size || "",
          gender: item.gender || "women",
          occasion: item.occasion || "wedding",
          
          // Metals
          metals: Array.isArray(item.metals) ? item.metals : [],
          
          // Stones
          stones: Array.isArray(item.stones) ? item.stones : [],
          
          // Rates and Costs
          gold_rate: item.gold_rate || 0,
          stone_rate: item.stone_rate || 0,
          metal_weight: item.metal_weight || 0,
          total_carat: item.total_carat || 0,
          
          // Branch/Location
          branch_id: item.branch_id || "",
          branch_name: item.branch_id?.name || "",
          current_stock: item.current_stock || 0,
          minimum_stock: item.minimum_stock || 0,
          location_type: item.location_type || "showcase",
          location_details: item.location_details || "",
          
          // Status
          status: item.status || "active",
          
          images: Array.isArray(item.images) ? item.images : [],
          tags: item.tags || "",
          
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
        fetchMetalPurities(),
        fetchStonePurities(),
        fetchHallmarks(),
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
    metalPurities,
    stonePurities,
    hallmarks,
    
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
    fetchMetalPurities,
    fetchStonePurities,
    fetchHallmarks,
  };
}