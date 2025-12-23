import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryItems() {
  const [items, setItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [products, setProducts] = useState([]);
  const [metals, setMetals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  // Fetch metals
  const fetchMetals = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getMetals());
      
      let metalsData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        metalsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        metalsData = res.data;
      } else if (res.data && Array.isArray(res.data.metals)) {
        metalsData = res.data.metals;
      }
      
      const mappedMetals = metalsData.map((metal) => ({
        id: getId(metal._id || metal),
        name: metal.name || "",
        ...metal
      }));
      
      setMetals(mappedMetals);
      return mappedMetals;
    } catch (err) {
      console.error("Fetch metals error:", err);
      setError("Failed to load metals");
      return [];
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
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      }
      
      const mappedCategories = categoriesData.map((cat) => ({
        id: getId(cat),
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

  // Fetch units for dropdown
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
        id: getId(unit._id || unit),
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

  // Fetch products (optional link)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getAllItems());
      
      let productsData = [];
      
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        productsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        productsData = res.data;
      } else if (res.data && Array.isArray(res.data.products)) {
        productsData = res.data.products;
      }
      
      const mappedProducts = productsData.map((product) => ({
        id: getId(product._id || product),
        name: product.name || product.product_name || "",
        ...product
      }));
      
      setProducts(mappedProducts);
      return mappedProducts;
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to load products");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory items
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
        product_id: item.product_id?._id || "",
        product_name: item.product_id?.product_name || item.product_id?.name || "",
        track_by: item.track_by || "weight",
        weight: item.weight || null,
        quantity: item.quantity || null,
        // Handle unit_id as object or string
        unit_id: item.unit_id?._id || item.unit_id || "",
        unit_name: item.unit_id?.name || item.unit?.name || "",
        metals: item.metals || [],
        stones: item.stones || [],
        materials: item.materials || [],
        status: item.status || true,
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

  // Add inventory item
  const addInventoryItem = async (itemData) => {
    try {
      setLoading(true);
      
      const payload = {
        item_name: itemData.item_name,
        inventory_category_id: itemData.inventory_category_id,
        product_id: itemData.product_id || null,
        track_by: itemData.track_by,
        weight: itemData.track_by === "quantity" ? null : parseFloat(itemData.weight) || null,
        quantity: itemData.track_by === "weight" ? null : parseInt(itemData.quantity) || null,
        // Send unit_id as just the ID string
        unit_id: itemData.unit_id,
        status: itemData.status
      };
      
      console.log("Sending payload:", payload);
      
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
          product_id: item.product_id?._id || "",
          product_name: item.product_id?.product_name || "",
          track_by: item.track_by || "weight",
          weight: item.weight || null,
          quantity: item.quantity || null,
          unit_id: item.unit_id?._id || item.unit_id || "",
          unit_name: item.unit_id?.name || "",
          metals: item.metals || [],
          stones: item.stones || [],
          materials: item.materials || [],
          status: item.status || true,
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

  // Update inventory item
  const updateInventoryItem = async (id, data) => {
    try {
      setLoading(true);
      
      const payload = {
        item_name: data.item_name,
        inventory_category_id: data.inventory_category_id,
        product_id: data.product_id || null,
        track_by: data.track_by,
        weight: data.track_by === "quantity" ? null : parseFloat(data.weight) || null,
        quantity: data.track_by === "weight" ? null : parseInt(data.quantity) || null,
        // Send unit_id as just the ID string
        unit_id: data.unit_id,
        status: data.status
      };
      
      const res = await axios.put(API_ENDPOINTS.updateInventoryItem(id), payload);
      console.log("Update inventory item response:", res.data);
      
      let updatedData = {};
      if (res.data && res.data.success && res.data.data) {
        const item = res.data.data;
        updatedData = {
          _id: getId(item) || id,
          item_name: item.item_name || "",
          sku_code: item.sku_code || "",
          inventory_category_id: item.inventory_category_id?._id || "",
          inventory_category_name: item.inventory_category_id?.name || "",
          product_id: item.product_id?._id || "",
          product_name: item.product_id?.product_name || "",
          track_by: item.track_by || "weight",
          weight: item.weight || null,
          quantity: item.quantity || null,
          unit_id: item.unit_id?._id || item.unit_id || "",
          unit_name: item.unit_id?.name || "",
          metals: item.metals || [],
          stones: item.stones || [],
          materials: item.materials || [],
          status: item.status || true,
        };
      } else {
        updatedData = {
          _id: id,
          ...data
        };
      }
      
      setItems(prev => 
        prev.map((item) => (item._id === id ? updatedData : item))
      );
      
      await fetchInventoryItems();
      
      return updatedData;
    } catch (err) {
      console.error("Update inventory item error:", err);
      setError("Failed to update inventory item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete inventory item
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

  // Fetch all data on initial load
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchInventoryCategories(),
        fetchUnits(),
        fetchProducts(),
        fetchMetals(),
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
    items,
    inventoryCategories,
    units,
    products,
    metals,
    loading,
    error,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    fetchInventoryItems,
    fetchInventoryCategories,
    fetchUnits,
    fetchProducts,
    fetchMetals,
    getId,
  };
}