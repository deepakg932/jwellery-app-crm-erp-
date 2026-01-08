import { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";

export default function useInventoryItems() {
  const [items, setItems] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to get ID
  const getId = (item) => item._id || item.id;

  // === FETCH SUPPLIERS ===
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getSuppliers());
      
      let suppliersData = [];
      
      // Handle different response structures
      if (res.data?.fetched && Array.isArray(res.data.fetched)) {
        suppliersData = res.data.fetched;
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      } else if (Array.isArray(res.data)) {
        suppliersData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        suppliersData = res.data.data;
      }
      
      const mappedSuppliers = suppliersData
        .filter(supplier => supplier.status !== false)
        .map((supplier) => ({
          _id: getId(supplier),
          id: getId(supplier),
          name: supplier.supplier_name || supplier.name || "",
          supplier_name: supplier.supplier_name || "",
          supplier_code: supplier.supplier_code || "",
          contact_person: supplier.contact_person || "",
          phone: supplier.phone || "",
          email: supplier.email || "",
          address: supplier.address || "",
          city: supplier.city || "",
          state: supplier.state || "",
          status: supplier.status || true,
          ...supplier
        }));
      
      setSuppliers(mappedSuppliers);
      return mappedSuppliers;
    } catch (err) {
      console.error("Fetch suppliers error:", err);
      setError("Failed to load suppliers");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // === FETCH SUB-CATEGORIES ===
  const fetchSubCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_ENDPOINTS.getInventorySubCategories());
      
      let subCategoriesData = [];
      
      // Handle different response structures
      if (res.data?.success && res.data?.data?.data && Array.isArray(res.data.data.data)) {
        // Structure: { success: true, data: { data: [...] } }
        subCategoriesData = res.data.data.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        subCategoriesData = res.data.data;
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        subCategoriesData = res.data.data;
      } else if (Array.isArray(res.data)) {
        subCategoriesData = res.data;
      }
      
      const mappedSubCategories = subCategoriesData.map((subCat) => ({
        _id: getId(subCat),
        id: getId(subCat),
        name: subCat.name || "",
        category_id: subCat.category?._id || subCat.category || "",
        category_name: subCat.category?.name || "",
        description: subCat.description || "",
        status: subCat.status || true,
        ...subCat
      }));
      
      setSubCategories(mappedSubCategories);
      return mappedSubCategories;
    } catch (err) {
      console.error("Fetch sub-categories error:", err);
      setError("Failed to load sub-categories");
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
      } else if (res.data?.success && res.data?.data?.data && Array.isArray(res.data.data.data)) {
        categoriesData = res.data.data.data;
      } else if (Array.isArray(res.data)) {
        categoriesData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        categoriesData = res.data.data;
      }
      
      const mappedCategories = categoriesData.map((cat) => ({
        _id: getId(cat),
        id: getId(cat),
        name: cat.name || "",
        description: cat.description || "",
        status: cat.status || "active",
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
      
      if (res.data?.success && res.data?.data?.data && Array.isArray(res.data.data.data)) {
        // Structure: { success: true, data: { data: [...] } }
        itemsData = res.data.data.data;
      } else if (res.data?.success && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
      } else if (Array.isArray(res.data)) {
        itemsData = res.data;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        itemsData = res.data.data;
      }
      
      const mappedItems = itemsData.map((item) => {
        // Extract nested data from response
        const categoryId = item.category?._id || item.category || "";
        const categoryName = item.category?.name || "";
        const subCategoryId = item.sub_category?.id || item.sub_category || "";
        const subCategoryName = item.sub_category?.name || "";
        const supplierId = item.supplier?._id || item.supplier || "";
        const supplierName = item.supplier?.supplier_name || "";
        const supplierPhone = item.supplier?.phone || "";
        const supplierEmail = item.supplier?.email || "";
        const supplierAddress = item.supplier?.address || "";
        
        const newItem = {
          _id: getId(item),
          id: getId(item),
          item_code: item.item_code || "",
          name: item.name || "",
          purity: item.purity || "",
          category: categoryId,
          category_name: categoryName,
          sub_category: subCategoryId,
          sub_category_name: subCategoryName,
          description: item.description || "",
          discount: item.discount || 0,
          tax: item.tax || 0,
          purchase_price: item.purchase_price || 0,
          profit_margin: item.profit_margin || 0,
          supplier: supplierId,
          supplier_name: supplierName,
          supplier_phone: supplierPhone,
          supplier_email: supplierEmail,
          supplier_address: supplierAddress,
          images: Array.isArray(item.images) ? item.images : [],
          status: item.status || "active",
          selling_price: item.selling_price || 0,
          discount_amount: item.discount_amount || 0,
          tax_amount: item.tax_amount || 0,
          final_price: item.final_price || 0,
          createdAt: item.createdAt || "",
          updatedAt: item.updatedAt || "",
          ...item
        };
        
        return newItem;
      });
      
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
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append("name", itemData.name);
      formData.append("purity", itemData.purity);
      formData.append("category", itemData.category);
      if (itemData.sub_category) {
        formData.append("sub_category", itemData.sub_category);
      }
      formData.append("description", itemData.description || "");
      formData.append("discount", parseFloat(itemData.discount) || 0);
      formData.append("tax", parseFloat(itemData.tax) || 0);
      formData.append("purchase_price", parseFloat(itemData.purchase_price) || 0);
      formData.append("profit_margin", parseFloat(itemData.profit_margin) || 25);
      if (itemData.supplier) {
        formData.append("supplier", itemData.supplier);
      }
      
      // Add image file if exists
      if (itemData.image && itemData.image.length > 0) {
        formData.append("image", itemData.image[0]); // Only first image as per your backend
      }
      
      const res = await axios.post(API_ENDPOINTS.createInventoryItem(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      let newItem = {};
      
      if (res.data && res.data.success && res.data.data) {
        const item = res.data.data;
        
        // Extract nested data
        const categoryId = item.category?._id || item.category || "";
        const categoryName = item.category?.name || "";
        const subCategoryId = item.sub_category?.id || item.sub_category || "";
        const subCategoryName = item.sub_category?.name || "";
        const supplierId = item.supplier?._id || item.supplier || "";
        const supplierName = item.supplier?.supplier_name || "";
        
        newItem = {
          _id: getId(item),
          id: getId(item),
          item_code: item.item_code || "",
          name: item.name || "",
          purity: item.purity || "",
          category: categoryId,
          category_name: categoryName,
          sub_category: subCategoryId,
          sub_category_name: subCategoryName,
          description: item.description || "",
          discount: item.discount || 0,
          tax: item.tax || 0,
          purchase_price: item.purchase_price || 0,
          profit_margin: item.profit_margin || 0,
          supplier: supplierId,
          supplier_name: supplierName,
          images: Array.isArray(item.images) ? item.images : [],
          status: item.status || "active",
          selling_price: item.selling_price || 0,
          discount_amount: item.discount_amount || 0,
          tax_amount: item.tax_amount || 0,
          final_price: item.final_price || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      } else {
        throw new Error("Failed to create item");
      }
      
      setItems(prev => [...prev, newItem]);
      await fetchInventoryItems();
      
      return newItem;
    } catch (err) {
      console.error("Add inventory item error:", err);
      setError(err.response?.data?.message || "Failed to add inventory item");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // === UPDATE INVENTORY ITEM ===
  const updateInventoryItem = async (id, itemData) => {
    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all form fields
      formData.append("name", itemData.name);
      formData.append("purity", itemData.purity);
      formData.append("category", itemData.category);
      if (itemData.sub_category) {
        formData.append("sub_category", itemData.sub_category);
      }
      formData.append("description", itemData.description || "");
      formData.append("discount", parseFloat(itemData.discount) || 0);
      formData.append("tax", parseFloat(itemData.tax) || 0);
      formData.append("purchase_price", parseFloat(itemData.purchase_price) || 0);
      formData.append("profit_margin", parseFloat(itemData.profit_margin) || 25);
      if (itemData.supplier) {
        formData.append("supplier", itemData.supplier);
      }
      formData.append("status", itemData.status || "active");
      
      // Add image file if exists (and it's a File object)
      if (itemData.image && itemData.image.length > 0) {
        const image = itemData.image[0];
        if (image instanceof File) {
          formData.append("image", image);
        }
      }
      
      const res = await axios.put(API_ENDPOINTS.updateInventoryItem(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      let updatedItem = {};
      if (res.data && res.data.success && res.data.data) {
        const item = res.data.data;
        
        // Extract nested data
        const categoryId = item.category?._id || item.category || "";
        const categoryName = item.category?.name || "";
        const subCategoryId = item.sub_category?.id || item.sub_category || "";
        const subCategoryName = item.sub_category?.name || "";
        const supplierId = item.supplier?._id || item.supplier || "";
        const supplierName = item.supplier?.supplier_name || "";
        
        updatedItem = {
          _id: getId(item) || id,
          id: getId(item) || id,
          item_code: item.item_code || "",
          name: item.name || "",
          purity: item.purity || "",
          category: categoryId,
          category_name: categoryName,
          sub_category: subCategoryId,
          sub_category_name: subCategoryName,
          description: item.description || "",
          discount: item.discount || 0,
          tax: item.tax || 0,
          purchase_price: item.purchase_price || 0,
          profit_margin: item.profit_margin || 0,
          supplier: supplierId,
          supplier_name: supplierName,
          images: Array.isArray(item.images) ? item.images : [],
          status: item.status || "active",
          selling_price: item.selling_price || 0,
          discount_amount: item.discount_amount || 0,
          tax_amount: item.tax_amount || 0,
          final_price: item.final_price || 0,
          updatedAt: item.updatedAt || new Date().toISOString(),
          createdAt: item.createdAt || "",
        };
      } else {
        throw new Error("Failed to update item");
      }
      
      setItems(prev => 
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
      
      await fetchInventoryItems();
      
      return updatedItem;
    } catch (err) {
      console.error("Update inventory item error:", err);
      setError(err.response?.data?.message || "Failed to update inventory item");
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
        fetchSuppliers(),
        fetchInventoryCategories(),
        fetchSubCategories(),
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
    subCategories,
    suppliers,
    
    // Loading States
    loading,
    error,
    
    // CRUD Operations
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    // Fetch Functions
    fetchInventoryItems,
    fetchSuppliers,
    fetchInventoryCategories,
    fetchSubCategories,
  };
}