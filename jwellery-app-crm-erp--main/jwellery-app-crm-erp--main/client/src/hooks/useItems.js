// hooks/useItems.js
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/api/api";
import { toast } from "react-toastify";

const useItems = () => {
  // Main items state
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 10,
  });
  const [loading, setLoading] = useState({
    items: true,
    dropdown: true,
  });
  const [error, setError] = useState(null);

  // Simplified dropdownData state
  const [dropdownData, setDropdownData] = useState({
    categories: [],
    subCategories: [],
    metals: [],
    brands: [],
    hallmarks: [], // Add hallmarks here
    purities: [],
    stoneTypes: [],
    stonePurities: [],
    units: [],
    costTypes: [],
    gstRatesRaw: [],
    wastageTypes: [],
    productCodes: [],
    materialTypes: [],
    priceMakings: [],
  });

  // Enhanced helper function to extract data from response
  const extractData = (response, endpointName = "") => {
    if (!response || !response.data) {
      console.warn(`No data in response for ${endpointName}`);
      return [];
    }

    const responseData = response.data;

    // SPECIAL CASE: Handle responses with "purity" property
    if (responseData.purity && Array.isArray(responseData.purity)) {
      return responseData.purity;
    }

    // Common patterns
    if (Array.isArray(responseData)) {
      return responseData;
    }

    if (responseData.data) {
      if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
      // If data is an object with an array property
      for (const key in responseData.data) {
        if (Array.isArray(responseData.data[key])) {
          return responseData.data[key];
        }
      }
    }

    if (responseData.success && responseData.data) {
      if (Array.isArray(responseData.data)) {
        return responseData.data;
      }
      return [responseData.data];
    }

    // Check for common array properties
    const arrayProperties = [
      "items",
      "products",
      "categories",
      "subcategories",
      "metals",
      "brands",
      "purities",
      "stones",
      "stoneTypes",
      "stonePurities",
      "units",
      "costTypes",
      "gstRates",
      "wastages",
      "hallmarks",
    ];

    for (const prop of arrayProperties) {
      if (responseData[prop] && Array.isArray(responseData[prop])) {
        return responseData[prop];
      }
    }

    console.warn(
      `Could not extract array data for ${endpointName}:`,
      responseData,
    );
    return [];
  };

  // ============ DROPDOWN DATA FETCH ============

  // Fetch all dropdown data
  const fetchDropdownData = useCallback(async () => {
    try {
      console.log("Starting to fetch dropdown data...");
      setLoading((prev) => ({ ...prev, dropdown: true }));
      setError(null);

      // Fetch all dropdown data in parallel - INCLUDING HALLMARKS
      const [
        categoriesRes,
        metalsRes,
        brandsRes,
        puritiesRes,
        stoneTypesRes,
        stonePuritiesRes,
        unitsRes,
        subCategoriesRes,
        wastageTypesRes,
        gstRatesRes,
        costTypesRes,
        materialTypesRes,
        hallmarksRes,
        priceMakingsRes,
      ] = await Promise.allSettled([
        axios.get(API_ENDPOINTS.getCategories()),
        axios.get(API_ENDPOINTS.getMetals()),
        axios.get(API_ENDPOINTS.getBrands()),
        axios.get(API_ENDPOINTS.getPurities()),
        axios.get(API_ENDPOINTS.getAllStoneTypes()),
        axios.get(API_ENDPOINTS.getAllStonePurities()),
        axios.get(API_ENDPOINTS.getUnits()),
        axios.get(API_ENDPOINTS.getSubCategories()),
        axios.get(API_ENDPOINTS.getAllWastages()),
        axios.get(API_ENDPOINTS.getAllGST()),
        axios.get(API_ENDPOINTS.getCostTypes()),
        axios.get(API_ENDPOINTS.getMaterialTypes()),
        axios.get(API_ENDPOINTS.getHallmarks()),
        axios.get(API_ENDPOINTS.getPriceMakings()),
      ]);

      // Helper to handle Promise results
      const getData = (promiseResult, endpointName) => {
        if (promiseResult.status === "fulfilled") {
          return extractData(promiseResult.value, endpointName);
        } else {
          console.error(
            `Error fetching ${endpointName}:`,
            promiseResult.reason,
          );
          return [];
        }
      };

      // Extract data from responses
      const categories = getData(categoriesRes, "Categories");
      const metals = getData(metalsRes, "Metals");
      const brands = getData(brandsRes, "Brands");

      // SPECIAL HANDLING FOR PURITIES (metal purity)
      const puritiesRaw = getData(puritiesRes, "Purities");
      const purities = Array.isArray(puritiesRaw)
        ? puritiesRaw.map((p) => ({
            _id: p._id,
            id: p._id,
            purity_name: p.purity_name || p.name || "",
            name: p.purity_name || p.name || "",
            metal_type: p.metal_type,
            percentage: p.percentage || 0,
            image: p.image,
          }))
        : [];

      // Price Makings
      const priceMakingsRaw = getData(priceMakingsRes, "Price Makings");
      const priceMakings = Array.isArray(priceMakingsRaw)
        ? priceMakingsRaw.map((pm) => ({
            _id: pm._id || pm.id,
            id: pm._id || pm.id,
            name: pm.cost_type || pm.stage_name || pm.name || "",
            cost_type: pm.cost_type_id.cost_type || "",
            stage_name: pm.making_stage_id.stage_name || "",
            sub_stage_name: pm.making_sub_stage_id.sub_stage_name || "",
            cost_amount: pm.cost_amount || 0,
            unit_name: pm.unit_id?.name || "",
          }))
        : [];

      console.log(priceMakingsRaw);

      // Stone Types
      const stoneTypes = getData(stoneTypesRes, "Stone Types");

      // Stone Purities
      const stonePuritiesRaw = getData(stonePuritiesRes, "Stone Purities");
      const stonePurities = Array.isArray(stonePuritiesRaw)
        ? stonePuritiesRaw.map((sp) => ({
            _id: sp._id,
            id: sp._id,
            stone_purity_id: sp._id,
            stone_purity: sp.stone_purity || sp.purity_name || sp.name || "",
            name: sp.stone_purity || sp.purity_name || sp.name || "",
            stone_type: sp.stone_type || sp.stone_type_id,
            percentage: sp.percentage || 0,
            status: sp.status || "active",
          }))
        : [];

      // Material Types
      const materialTypesRaw = getData(materialTypesRes, "Material Types");
      const materialTypes = Array.isArray(materialTypesRaw)
        ? materialTypesRaw.map((mt) => ({
            _id: mt._id,
            id: mt._id,
            material_type: mt.material_type || mt.name || "",
            name: mt.material_type || mt.name || "",
            metal_id: mt.metal_id,
            metal_name: mt.metal_id?.name || "",
          }))
        : [];

      // Hallmarks
      const hallmarksRaw = getData(hallmarksRes, "Hallmarks");
      const hallmarks = Array.isArray(hallmarksRaw)
        ? hallmarksRaw.map((h) => ({
            _id: h._id,
            id: h._id,
            name: h.name || "",
            metal_type: h.metal_type,
            metal_type_name: h.metal_type_name || "",
            purity_id: h.purity_id,
            certification_number: h.certification_number,
            description: h.description || "",
            image: h.image || "",
            status: h.status || "active",
          }))
        : [];

      const units = getData(unitsRes, "Units");
      const subCategories = getData(subCategoriesRes, "Sub Categories");
      const wastageTypes = getData(wastageTypesRes, "Wastage Types");
      const gstRatesRaw = getData(gstRatesRes, "GST Rates");
      const costTypes = getData(costTypesRes, "Cost Types");

      const newDropdownData = {
        categories,
        metals,
        brands,
        purities,
        stoneTypes,
        stonePurities,
        units,
        subCategories,
        costTypes,
        wastageTypes,
        gstRatesRaw,
        productCodes: [],
        materialTypes,
        hallmarks,
        priceMakings,
      };

      console.log("✅ Dropdown data fetched:", {
        hallmarksCount: hallmarks.length,
        hallmarksSample: hallmarks.length > 0 ? hallmarks[0] : "None",
      });

      setDropdownData(newDropdownData);
      toast.success("Dropdown data loaded successfully!", {
        autoClose: 3000,
      });
    } catch (err) {
      console.error("❌ Error in fetchDropdownData:", err);
      const errorMsg =
        err.response?.data?.message || "Failed to fetch dropdown data";
      setError(errorMsg);
      toast.error(errorMsg, {
        autoClose: 4000,
      });
    } finally {
      setLoading((prev) => ({ ...prev, dropdown: false }));
    }
  }, []);

  // ============ ITEMS CRUD OPERATIONS ============

  // Fetch all items with pagination
  const fetchItems = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading((prev) => ({ ...prev, items: true }));
      setError(null);

      const response = await axios.get(
        `${API_ENDPOINTS.getAllItems()}?page=${page}&limit=${limit}`,
      );

      console.log("Fetch items response:", response.data);

      if (response.data && response.data.success) {
        let itemsData = [];
        let paginationData = {
          currentPage: page,
          totalPages: 1,
          totalProducts: 0,
          limit: limit,
        };

        // Extract items from response
        if (response.data.products && Array.isArray(response.data.products)) {
          itemsData = response.data.products;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          itemsData = response.data.data;
        } else {
          itemsData = extractData(response, "Items") || [];
        }

        // Extract pagination info
        if (response.data.pagination) {
          paginationData = {
            currentPage: response.data.pagination.currentPage || page,
            totalPages: response.data.pagination.totalPages || 1,
            totalProducts:
              response.data.pagination.totalProducts || itemsData.length,
            limit: response.data.pagination.limit || limit,
          };
        }

        // Extract product codes
        const productCodes = itemsData.map((item) => ({
          code: item.article_no,
          name: item.product_name,
          id: item._id || item.id,
        }));

        setDropdownData((prev) => ({
          ...prev,
          productCodes: productCodes,
        }));

        setItems(itemsData);
        setPagination(paginationData);

        console.log("📊 Items loaded:", itemsData.length);
        console.log("📊 Pagination data:", paginationData);
      } else {
        throw new Error(response.data?.message || "Failed to fetch items");
      }
    } catch (err) {
      console.error("Error fetching items:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to fetch items";
      setError(errorMsg);
      toast.error(errorMsg, {
        autoClose: 4000,
      });
      setItems([]);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  }, []);

  // Fetch hallmarks by metal type
  const fetchHallmarksByMetal = useCallback(
    async (metalId) => {
      try {
        if (!metalId) {
          console.log("No metal ID provided for hallmark fetch");
          return [];
        }

        console.log(
          `Filtering hallmarks for metal: ${metalId} from existing data`,
        );

        // Filter from existing hallmarks in dropdownData
        const filtered = dropdownData.hallmarks.filter((hallmark) => {
          // Check various possible field names for metal_type
          const hallmarkMetalId =
            hallmark.metal_type?._id ||
            hallmark.metal_type?.id ||
            hallmark.metal_type ||
            hallmark.metal_id;

          return String(hallmarkMetalId) === String(metalId);
        });

        console.log(
          `Found ${filtered.length} hallmarks for metal ${metalId}`,
          filtered,
        );
        return filtered;
      } catch (err) {
        console.error("Error filtering hallmarks by metal:", err);
        return [];
      }
    },
    [dropdownData.hallmarks], // Dependency on hallmarks data
  );

  // Create new item - UPDATED WITH HALLMARK
  const createItem = async (itemData) => {
    // Show loading toast
    const toastId = toast.loading("Creating item...");

    try {
      setLoading((prev) => ({ ...prev, items: true }));

      console.log("Creating item with data:", itemData);

      // Prepare FormData
      const formData = new FormData();

      // Basic information
      formData.append("product_name", itemData.product_name || "");
      formData.append("article_no", itemData.article_no || "");

      // Send IDs
      if (itemData.product_brand) {
        formData.append("product_brand", itemData.product_brand);
      }

      if (itemData.product_category) {
        formData.append("product_category", itemData.product_category);
      }

      if (itemData.product_subcategory) {
        formData.append("product_subcategory", itemData.product_subcategory);
      }

      // Markup
      formData.append(
        "markup_percentage",
        parseFloat(itemData.markup_percentage) || 15,
      );

      // GST information
      formData.append("gst_rate", itemData.gst_rate || "0%");
      formData.append("cgst_rate", itemData.cgst_rate || "0%");
      formData.append("sgst_rate", itemData.sgst_rate || "0%");
      formData.append("igst_rate", itemData.igst_rate || "0%");
      formData.append("utgst_rate", itemData.utgst_rate || "0%");

      // Metals data - INCLUDING HALLMARK
      const metalsPayload = (itemData.metals || []).map((metal) => {
        const metalObj = {
          metal_type: metal.metal_type,
          purity: metal.purity,
          weight: parseFloat(metal.weight) || 0,
          unit: metal.unit || "g",
          rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
        };

        // Add hallmark if selected
        if (metal.hallmark) {
          metalObj.hallmark_id = metal.hallmark;
        }

        return metalObj;
      });
      formData.append("metals", JSON.stringify(metalsPayload));

      // Stones data
      const stonesPayload = (itemData.stones || []).map((stone) => {
        return {
          stone_type: stone.stone_type,
          stone_purity: stone.stone_purity,
          size: parseFloat(stone.size) || 0,
          quantity: parseInt(stone.quantity) || 0,
          weight: parseFloat(stone.weight) || 0,
          price_per_carat: parseFloat(stone.price_per_carat) || 0,
        };
      });
      formData.append("stones", JSON.stringify(stonesPayload));

      // Materials data
      const materialsPayload = (itemData.materials || []).map((material) => {
        return {
          wastage_type: material.wastage_type,
          material_type: material.material_type,
          weight: parseFloat(material.weight) || 0,
          unit: material.unit || "g",
          rate_per_unit: parseFloat(material.rate_per_unit) || 0,
        };
      });
      formData.append("materials", JSON.stringify(materialsPayload));

      // Price making costs
      const priceMakingCostsPayload = (itemData.making_charges || []).map(
        (cost) => {
          return {
            price_making_id: cost.price_making_id || cost.id,
            cost_type: cost.cost_type || "",
            stage_name: cost.stage_name || "",
            sub_stage_name: cost.sub_stage_name || "",
            cost_amount: parseFloat(cost.cost_amount) || 0,
            unit_name: cost.unit_name || "",
          };
        },
      );
      formData.append(
        "price_making_costs",
        JSON.stringify(priceMakingCostsPayload),
      );

      // Images
      if (itemData.image && Array.isArray(itemData.image)) {
        itemData.image.forEach((file) => {
          if (file instanceof File) {
            formData.append("image", file);
          }
        });
      }

      // Log the payload for debugging
      console.log("FormData entries for create:");
      for (let pair of formData.entries()) {
        console.log(pair[0] + ": ", pair[1]);
      }

      // Send request
      const response = await axios.post(API_ENDPOINTS.createItem(), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Create response:", response.data);

      if (response.data && response.data.success) {
        await fetchItems(pagination.currentPage, pagination.limit);

        // Update toast to success
        toast.update(toastId, {
          render: "Item created successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        return response.data.product || response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to create item");
      }
    } catch (err) {
      console.error("Error creating item:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to create item";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  };

  // Update item - UPDATED WITH HALLMARK
  const updateItem = async (id, itemData) => {
    // Show loading toast
    const toastId = toast.loading("Updating item...");

    try {
      setLoading((prev) => ({ ...prev, items: true }));

      const formData = new FormData();

      // Basic information
      formData.append("product_name", itemData.product_name || "");
      formData.append("article_no", itemData.article_no || "");

      // Send IDs
      if (itemData.product_brand) {
        formData.append("product_brand", itemData.product_brand);
      }

      if (itemData.product_category) {
        formData.append("product_category", itemData.product_category);
      }

      if (itemData.product_subcategory) {
        formData.append("product_subcategory", itemData.product_subcategory);
      }

      formData.append(
        "markup_percentage",
        parseFloat(itemData.markup_percentage) || 15,
      );

      // GST information
      const formatGSTValue = (value) => {
        if (!value) return "0%";
        if (typeof value === "string" && value.includes("%")) return value;
        return `${parseFloat(value) || 0}%`;
      };

      formData.append("gst_rate", formatGSTValue(itemData.gst_rate));
      formData.append("cgst_rate", formatGSTValue(itemData.cgst_rate));
      formData.append("sgst_rate", formatGSTValue(itemData.sgst_rate));
      formData.append("igst_rate", formatGSTValue(itemData.igst_rate));
      formData.append("utgst_rate", formatGSTValue(itemData.utgst_rate));

      // Metals data - INCLUDING HALLMARK
      const metalsPayload = (itemData.metals || []).map((metal) => {
        const metalObj = {
          metal_type: metal.metal_type,
          purity: metal.purity,
          weight: parseFloat(metal.weight) || 0,
          unit: metal.unit || "g",
          making_charge_type: metal.making_charge_type || "Fixed",
          making_charge_value: parseFloat(metal.making_charge_value) || 0,
          rate_per_gram: parseFloat(metal.rate_per_gram) || 0,
        };

        // Add hallmark if selected
        if (metal.hallmark) {
          metalObj.hallmark_id = metal.hallmark;
        }

        return metalObj;
      });
      formData.append("metals", JSON.stringify(metalsPayload));

      // Stones data
      const stonesPayload = (itemData.stones || []).map((stone) => {
        return {
          stone_type: stone.stone_type,
          stone_purity: stone.stone_purity,
          size: parseFloat(stone.size) || 0,
          quantity: parseInt(stone.quantity) || 0,
          weight: parseFloat(stone.weight) || 0,
          price_per_carat: parseFloat(stone.price_per_carat) || 0,
        };
      });
      formData.append("stones", JSON.stringify(stonesPayload));

      // Materials data
      const materialsPayload = (itemData.materials || []).map((material) => {
        return {
          wastage_type: material.wastage_type,
          material_type: material.material_type,
          weight: parseFloat(material.weight) || 0,
          unit: material.unit || "g",
          rate_per_unit: parseFloat(material.rate_per_unit) || 0,
        };
      });
      formData.append("materials", JSON.stringify(materialsPayload));

      // FIX: Use making_charges from itemData instead of price_making_costs
      // The modal submits "making_charges" not "price_making_costs"
      const priceMakingCostsPayload = (itemData.making_charges || []).map(
        (cost) => {
          return {
            price_making_id: cost.price_making_id || cost.id,
            cost_type: cost.cost_type || "",
            stage_name: cost.stage_name || "",
            sub_stage_name: cost.sub_stage_name || "",
            cost_amount: parseFloat(cost.cost_amount) || 0,
            unit_name: cost.unit_name || "",
            is_active: cost.is_active !== undefined ? cost.is_active : true,
          };
        },
      );

      // Use the correct field name expected by your API
      formData.append(
        "price_making_costs",
        JSON.stringify(priceMakingCostsPayload),
      );

      // Status if updating
      if (itemData.status) {
        formData.append("status", itemData.status);
      }

      // Handle images correctly
      // 1. Append new images
      if (itemData.image && Array.isArray(itemData.image)) {
        itemData.image.forEach((file, index) => {
          if (file instanceof File) {
            formData.append("image", file);
            console.log(`Appending image ${index + 1}:`, file.name);
          } else {
            console.warn(`Item ${index} is not a File object:`, file);
          }
        });
      } else {
        console.log("No new images to append");
      }

      // 2. Append images to delete
      if (itemData.imagesToDelete && Array.isArray(itemData.imagesToDelete)) {
        formData.append(
          "images_to_delete",
          JSON.stringify(itemData.imagesToDelete),
        );
        console.log("Images to delete:", itemData.imagesToDelete);
      }

      console.log("FormData entries for update:");
      for (let pair of formData.entries()) {
        if (pair[0] === "image") {
          console.log(`${pair[0]}: [File - ${pair[1].name}]`);
        } else {
          console.log(`${pair[0]}:`, pair[1]);
        }
      }

      const response = await axios.put(API_ENDPOINTS.updateItem(id), formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        await fetchItems(pagination.currentPage, pagination.limit);

        // Update toast to success
        toast.update(toastId, {
          render: "Item updated successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        return response.data.product || response.data.data;
      } else {
        throw new Error(response.data?.message || "Failed to update item");
      }
    } catch (err) {
      console.error("Error updating item:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to update item";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    // Show loading toast
    const toastId = toast.loading("Deleting item...");

    try {
      setLoading((prev) => ({ ...prev, items: true }));

      const response = await axios.delete(API_ENDPOINTS.deleteItem(id));

      if (response.data && response.data.success) {
        await fetchItems(pagination.currentPage, pagination.limit);

        // Update toast to success
        toast.update(toastId, {
          render: "Item deleted successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        return response.data;
      } else {
        throw new Error(response.data?.message || "Failed to delete item");
      }
    } catch (err) {
      console.error("Error deleting item:", err);
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to delete item";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  };

  // Product status functions
  const toggleProductStatus = async (productId) => {
    // Show loading toast
    const toastId = toast.loading("Toggling product status...");

    try {
      setLoading((prev) => ({ ...prev, items: true }));
      const response = await axios.put(
        `${API_ENDPOINTS.updateItem(productId)}/toggle-status`,
      );

      if (response.data.success) {
        await fetchItems(pagination.currentPage, pagination.limit);

        // Update toast to success
        toast.update(toastId, {
          render: "Product status toggled successfully!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      return response.data;
    } catch (err) {
      console.error("Error toggling product status:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to toggle product status";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  };

  const updateProductStatus = async (productId, status) => {
    // Show loading toast
    const toastId = toast.loading("Updating product status...");

    try {
      setLoading((prev) => ({ ...prev, items: true }));
      const response = await axios.put(
        `${API_ENDPOINTS.updateItem(productId)}/update-status`,
        { status },
      );

      if (response.data.success) {
        await fetchItems(pagination.currentPage, pagination.limit);

        // Update toast to success
        toast.update(toastId, {
          render: `Product status updated to ${status}!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      return response.data;
    } catch (err) {
      console.error("Error updating product status:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to update product status";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  };

  const bulkUpdateProductStatus = async (productIds, status) => {
    // Show loading toast
    const toastId = toast.loading(`Updating ${productIds.length} products...`);

    try {
      setLoading((prev) => ({ ...prev, items: true }));
      const response = await axios.put(
        `${API_ENDPOINTS.getAllItems()}/bulk-status`,
        { productIds, status },
      );

      if (response.data.success) {
        await fetchItems(pagination.currentPage, pagination.limit);

        // Update toast to success
        toast.update(toastId, {
          render: `${productIds.length} products updated to ${status}!`,
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      }

      return response.data;
    } catch (err) {
      console.error("Error in bulk status update:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        "Failed to bulk update status";
      setError(errorMsg);

      // Update toast to error
      toast.update(toastId, {
        render: errorMsg,
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      throw new Error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, items: false }));
    }
  };

  // ============ GET FORM DATA ============
  const getFormData = () => {
    const formData = {
      // Categories
      categories: dropdownData.categories.map((c) => ({
        _id: c._id || c.id,
        id: c._id || c.id,
        name: c.name || c.category_name || "",
        value: c._id || c.id,
      })),

      // Subcategories map
      subcategories: (() => {
        const subcategoriesMap = {};

        if (!dropdownData.categories || !dropdownData.subCategories) {
          return subcategoriesMap;
        }

        dropdownData.categories.forEach((category) => {
          const categoryId = String(category._id || category.id).trim();
          const subcats = dropdownData.subCategories.filter((subCat) => {
            const catId =
              subCat.category_id || subCat.category || subCat.parent_id;
            return catId && String(catId).trim() === categoryId;
          });

          subcategoriesMap[categoryId] = subcats.map((sub) => ({
            _id: sub._id || sub.id,
            id: sub._id || sub.id,
            name: sub.name || sub.sub_category_name || "",
            value: sub._id || sub.id,
          }));
        });

        return subcategoriesMap;
      })(),

      // Metals
      metals: dropdownData.metals.map((m) => ({
        _id: m._id || m.id,
        id: m._id || m.id,
        name: m.name || m.metal_name || "",
        value: m._id || m.id,
      })),

      // Brands
      brands: dropdownData.brands.map((b) => ({
        _id: b._id || b.id,
        id: b._id || b.id,
        name: b.name || b.brand_name || "",
        value: b._id || b.id,
      })),

      // Hallmarks
      hallmarks: dropdownData.hallmarks.map((h) => ({
        _id: h._id || h.id,
        id: h._id || h.id,
        name: h.name || "",
        metal_type: h.metal_type,
        metal_type_name: h.metal_type_name || "",
        purity_id: h.purity_id,
        description: h.description || "",
        image: h.image || "",
        value: h._id || h.id,
      })),

      // Purities (Metal)
      purities: dropdownData.purities.map((p) => ({
        _id: p._id || p.id,
        id: p._id || p.id,
        purity_name: p.purity_name || p.name || "",
        name: p.purity_name || p.name || "",
        value: p._id || p.id,
      })),

      // Stone Types
      stoneTypes: dropdownData.stoneTypes.map((s) => ({
        _id: s._id || s.id,
        id: s._id || s.id,
        name: s.stone_type || s.stone_name || s.name || "",
        value: s._id || s.id,
      })),

      // Stone Purities
      stonePurities: dropdownData.stonePurities.map((sp) => ({
        _id: sp._id || sp.id,
        id: sp._id || sp.id,
        stone_purity: sp.stone_purity || sp.purity_name || sp.name || "",
        name: sp.stone_purity || sp.purity_name || sp.name || "",
        value: sp._id || sp.id,
      })),

      // Cost Types
      costTypes: dropdownData.costTypes.map((ct) => ({
        id: ct._id || ct.id,
        name: ct.cost_type || ct.cost_name || ct.name || "",
        value: ct._id || ct.id,
        cost_type: ct.cost_type || "",
      })),

      // Units
      units: dropdownData.units.map((u) => ({
        id: u._id || u.id,
        name: u.name || u.unit_name || u.symbol || "",
        value: u._id || u.id,
      })),

      // Material Types
      materialTypes: dropdownData.materialTypes.map((mt) => ({
        id: mt._id || mt.id,
        name: mt.material_type || mt.name || "",
        value: mt._id || mt.id,
        metal_id: mt.metal_id,
        metal_name: mt.metal_name || "",
      })),

      // Wastage Types
      wastageTypes: dropdownData.wastageTypes.map((wt) => ({
        id: wt._id || wt.id,
        name: wt.wastage_type || wt.name || "",
        value: wt._id || wt.id,
        wastage_type: wt.wastage_type || "",
      })),

      // Price Makings (for making charge types)
      priceMakings: dropdownData.priceMakings.map((pm) => ({
        id: pm._id || pm.id,
        name: pm.cost_type || pm.stage_name || pm.name || "",
        value: pm._id || pm.id,
        cost_type: pm.cost_type || "",
        stage_name: pm.stage_name || "",
        sub_stage_name: pm.sub_stage_name || "",
        unit_name: pm.unit_name || "",
        cost_amount: pm.cost_amount || 0,
      })),

      // GST Rates
      gstRates: dropdownData.gstRatesRaw.map((gst) => ({
        id: gst._id || gst.id,
        name: `GST ${gst.gst_total || gst.value}%`,
        value: gst._id || gst.id,
        gst_total: gst.gst_total || gst.value,
        cgst_percentage: gst.cgst_percentage || 0,
        sgst_percentage: gst.sgst_percentage || 0,
        igst_percentage: gst.igst_percentage || 0,
        utgst_percentage: gst.utgst_percentage || 0,
      })),

      productCodes: dropdownData.productCodes,
    };

    return formData;
  };

  // Get GST rate numeric value
  const getGSTRateValue = (value) => {
    if (!value) return 0;

    if (typeof value === "number") return value;

    if (typeof value === "object" && value !== null) {
      if (value.gst_total !== undefined)
        return parseFloat(value.gst_total) || 0;
      if (value.value !== undefined) return parseFloat(value.value) || 0;
      return 0;
    }

    if (typeof value === "string") {
      const match = value.match(/(\d+(\.\d+)?)/);
      return match ? parseFloat(match[1]) : 0;
    }

    return parseFloat(value) || 0;
  };

  // Get subcategories for category
  const getSubcategoriesForCategory = useCallback(
    (categoryId) => {
      if (!categoryId || !dropdownData?.subCategories) {
        return [];
      }

      const categoryIdStr = String(categoryId).trim();

      return dropdownData.subCategories
        .filter((subCat) => {
          if (!subCat) return false;

          const possibleCategoryIds = [
            subCat.category_id,
            subCat.category,
            subCat.parent_id,
            subCat.category?._id,
            subCat.category?.id,
          ];

          return possibleCategoryIds.some((catId) => {
            if (!catId) return false;
            return String(catId).trim() === categoryIdStr;
          });
        })
        .map((sub) => ({
          id: sub._id || sub.id,
          name: sub.sub_category_name || sub.name || "",
        }));
    },
    [dropdownData?.subCategories],
  );

  // Generate product code
  const generateProductCode = () => {
    if (dropdownData.productCodes.length > 0) {
      const codeNumbers = dropdownData.productCodes
        .map((pc) => {
          const code = pc.code || pc.article_no || "";
          const match = code.match(/(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((num) => num > 0);

      if (codeNumbers.length > 0) {
        const maxNumber = Math.max(...codeNumbers);
        const nextNumber = maxNumber + 1;
        return `PROD${nextNumber.toString().padStart(4, "0")}`;
      }
    }
    return "PROD0001";
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      console.log("Initializing useItems hook...");
      try {
        await fetchDropdownData();
        await fetchItems();
      } catch (err) {
        console.error("Error initializing:", err);
        toast.error("Failed to initialize. Please refresh the page.", {
          autoClose: 4000,
        });
      }
    };

    initialize();
  }, [fetchDropdownData, fetchItems]);

  console.log(items);

  return {
    // Items and pagination
    items,
    pagination,
    loading: loading.items || loading.dropdown,
    error,

    // Dropdown data
    ...dropdownData,

    // Helper functions
    getGSTRateValue,
    getSubcategoriesForCategory,
    generateProductCode,
    fetchHallmarksByMetal,

    // CRUD functions
    fetchItems,
    addItem: createItem,
    updateItem,
    deleteItem,
    toggleProductStatus,
    updateProductStatus,
    bulkUpdateProductStatus,
    getFormData,
    refreshItems: fetchItems,
    refreshDropdown: fetchDropdownData,
    clearError: () => setError(null),
  };
};

export default useItems;
