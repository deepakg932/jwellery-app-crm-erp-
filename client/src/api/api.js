// constants/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Path segments for all your APIs
export const PATHS = {
  // Stone-related
  STONE_TYPE: "/api/stonetype",
  STONE_PURITY: "/api/stone-purity-stone",
  STONES: "/api/stone",

  // Category-related
  CATEGORIES: "/api/categories",
  SUB_CATEGORIES: "/api/subcategories",

  // Metal-related
  METALS: "/api/metals",

  // Brand-related
  BRANDS: "/api/brands",

  // Hallmark-related
  HALLMARK: "/api/hallmark",

  // Purity-related (metal purity)
  PURITY: "/api/purity",

  // Unit-related - FIXED: Should be separate from products
  UNITS: "/api/products",

  // Wastage-related
  WASTAGES: "/api/wastage",

  // Making stages-related
  MAKING_STAGES: "/api/making-stages",
  MAKING_SUB_STAGES: "/api/making-sub-stages",

  // Cost master-related
  COSTS: "/api/cost-master",

  // Cost type-related
  COST_TYPES: "/api/cost-master",

  // Price making-related
  PRICE_MAKING: "/api/price-making",

  // GST-related
  GST: "/api/gst",

  // Products-related (items)
  PRODUCTS: "/api/products",

  MATERIAL: "/api/material-types",

  // inventory items category related

  INVENTORY_CATEGORIES: "/api/inventory-categories",

  // inventory sub category

  INVENTORY_SUB_CATEGORIES:"/api/inventory-sub-categories",

  // inventory items related

  INVENTORY_ITEMS: "/api/inventory-item",

  // In branches type
  BRANCH_TYPES: "/api/branches",

  // In branches
  BRANCHES: "/api/branches",

  // In suppliers
  SUPPLIERS: "/api/supplier",

  // Purchase Orders
  PURCHASE_ORDERS: "/api/purchase-orders",

  // Stock IN - GRNS
  GRNS: "/api/stock-grn",


};

// Route names for all your endpoints
export const ROUTES = {
  // Stone routes
  ALL_STONES: "all-stones",
  CREATE_STONE: "create-stone",
  UPDATE_STONE: "updates-stone",
  DELETE_STONE: "deletes-stone",

  // Stone type
  ALL_STONE_TYPES: "stone-types",
  CREATE_STONE_TYPE: "create-stonetype",
  UPDATE_STONE_TYPE: "update-stonetype",
  DELETE_STONE_TYPE: "delete-stonetype",

  // Stone purity routes (from stones API)
  ALL_PURITIES: "getpurity-stonePurity",
  CREATE_PURITY: "create-stonePurity",
  UPDATE_PURITY: "updateStonepurity",
  DELETE_PURITY: "deleteStonepurity",

  // Category routes
  GET_CATEGORIES: "getcategories",
  CREATE_CATEGORY: "category",
  UPDATE_CATEGORY: "update",
  DELETE_CATEGORY: "delete",

  // Subcategory routes
  GET_SUB_CATEGORIES: "getallsubcategories",
  CREATE_SUB_CATEGORIES: "createsubcategories",
  UPDATE_SUB_CATEGORIES: "updatesubcategories",
  DELETE_SUB_CATEGORIES: "deletesubcategories",

  // Metal routes
  ALL_METALS: "allmetals",
  CREATE_METAL: "metal",
  UPDATE_METAL: "metal",
  DELETE_METAL: "metal",

  // Brand routes
  LIST_BRANDS: "list",
  CREATE_BRAND: "create-brand",
  UPDATE_BRAND: "updatebrand",
  DELETE_BRAND: "deletebrand",

  // Hallmark routes
  ALL_HALLMARKS: "all-hallmarks",
  CREATE_HALLMARK: "create-hallmark",
  UPDATE_HALLMARK: "update-hallmark",
  DELETE_HALLMARK: "delete-hallmark",

  // Purity routes (metal purity)
  GET_PURITY: "getpurity",
  CREATE_PURITY_METAL: "create",
  UPDATE_PURITY_METAL: "updatepurity",
  DELETE_PURITY_METAL: "deletepurity",

  // Unit routes - FIXED
  GET_UNITS: "get-units",
  CREATE_UNIT: "create-unit",
  UPDATE_UNIT: "update-unit",
  DELETE_UNIT: "delete-unit",

  // Wastage routes
  ALL_WASTAGES: "all-wastages",
  CREATE_WASTAGE: "create-wastage",
  UPDATE_WASTAGE: "update-wastage",
  DELETE_WASTAGE: "delete-wastage",

  // Making Stage routes
  GET_MAKING_STAGES: "all-making-stages",
  CREATE_MAKING_STAGE: "create-making-stages",
  UPDATE_MAKING_STAGE: "update-making-stages",
  DELETE_MAKING_STAGE: "delete-making-stages",

  // Making Sub-Stage routes
  GET_MAKING_SUB_STAGES: "get-making-sub-stage",
  CREATE_MAKING_SUB_STAGE: "create-making-sub-stage",
  UPDATE_MAKING_SUB_STAGE: "update-making-sub-stage",
  DELETE_MAKING_SUB_STAGE: "delete-making-sub-stage",

  // Cost Master routes
  GET_COSTS: "get-cost-masters",
  CREATE_COST: "create-cost-master",
  UPDATE_COST: "update-cost-master",
  DELETE_COST: "delete-cost-master",

  // Cost type routes - FIXED: Should be separate
  GET_COST_TYPES: "all-cost-types",
  CREATE_COST_TYPE: "create-cost-type",
  UPDATE_COST_TYPE: "update-cost-type",
  DELETE_COST_TYPE: "delete-cost-type",

  // Price Making routes
  GET_PRICE_MAKINGS: "get-price-makings",
  CREATE_PRICE_MAKING: "create-price-making",
  UPDATE_PRICE_MAKING: "update-price-making",
  DELETE_PRICE_MAKING: "delete-price-making",

  // GST routes
  ALL_GST: "all-gst",
  CREATE_GST: "create-gst",
  UPDATE_GST: "update-gst",
  DELETE_GST: "delete-gst",

  // Product routes (items) - UPDATED
  GET_PRODUCTS: "getProducts",
  CREATE_PRODUCT: "createProduct",
  UPDATE_PRODUCT: "updateProduct",
  DELETE_PRODUCT: "delete-product",
  GET_PRODUCT_BY_ID: "get-product", // Add this
  TOGGLE_PRODUCT_STATUS: "toggle-status",
  UPDATE_PRODUCT_STATUS: "update-status",

  // material types

  GET_MATERIAL_TYPES: "get-material-types",
  CREATE_MATERIAL_TYPES: "create-material-type",
  UPDATE_MATERIAL_TYPES: "update-material-type",
  DELETE_MATERIAL_TYPES: "delete-material-type",

  // inventory items category routes

  GET_INVENTORY_CATEGORIES: "get-inventory-categories",
  CREATE_INVENTORY_CATEGORY: "create-inventory-category",
  UPDATE_INVENTORY_CATEGORY: "update-inventory-category",
  DELETE_INVENTORY_CATEGORY: "delete-inventory-category",

  // inventory items sub category routes

  GET_INVENTORY_SUB_CATEGORIES: "get-inventory-sub-categories",
  CREATE_INVENTORY_SUB_CATEGORIES: "create-inventory-sub-category",
  UPDATE_INVENTORY_SUB_CATEGORIES: "update-inventory-sub-category",
  DELETE_INVENTORY_SUB_CATEGORIES: "delete-inventory-sub-category",


  // inventory items routes
  // GET_INVENTORY_ITEMS: "get-inventory-items",
  GET_PAGINATION_INVENTORY_ITEMS: "get-pagination-inventory-items",
  CREATE_INVENTORY_ITEMS: "create-inventory-item",
  UPDATE_INVENTORY_ITEMS: "update-inventory-item",
  DELETE_INVENTORY_ITEMS: "delete-inventory-item",

  // In branch type routes object:
  GET_BRANCH_TYPES: "all-branch-types",
  CREATE_BRANCH_TYPE: "create-branch-type",
  UPDATE_BRANCH_TYPE: "update-branch-type",
  DELETE_BRANCH_TYPE: "delete-branch-type",

  // In branch ROUTES object:
  GET_BRANCHES: "get-branches",
  CREATE_BRANCH: "create-branch",
  UPDATE_BRANCH: "update-branch",
  DELETE_BRANCH: "delete-branch",

  // In suppliers routes object:
  GET_SUPPLIERS: "get-suppliers",
  CREATE_SUPPLIER: "create-supplier",
  UPDATE_SUPPLIER: "update-supplier",
  DELETE_SUPPLIER: "delete-supplier",

  // Purchase Order routes
  GET_PURCHASE_ORDERS: "get-purchase-orders",
  CREATE_PURCHASE_ORDER: "create-purchase-order",
  UPDATE_PURCHASE_ORDER: "update-purchase-order",
  DELETE_PURCHASE_ORDER: "delete-purchase-order",
  GET_PURCHASE_ORDER_BY_ID: "get-purchase-order",

  // Stock IN - GRNS routes
  GET_GRNS: "get-stock-grns",
  CREATE_GRN: "create-stock-grn",
  UPDATE_GRN: "update-stock-grn",
  DELETE_GRN: "delete-stock-grn",
  GET_GRN_BY_ID: "get-grn",
};

// Dynamic endpoint generator
export const endpoint = (basePath, route, id = null) => {
  const url = `${API_BASE_URL}${basePath}/${route}`;
  return id ? `${url}/${id}` : url;
};

// Helper function to normalize API response data
export const normalizeResponseData = (data, fieldName) => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data;
  } else if (Array.isArray(data?.[fieldName])) {
    return data[fieldName];
  } else if (data?.success && Array.isArray(data[fieldName])) {
    return data[fieldName];
  } else if (Array.isArray(data?.data)) {
    return data.data;
  } else if (data?.data && typeof data.data === "object") {
    return [data.data];
  }
  return [];
};

// Helper to create FormData for file uploads
export const createFormData = (data, fileFields = ["images"]) => {
  const formData = new FormData();

  Object.keys(data).forEach((key) => {
    // Skip file fields
    if (
      !fileFields.includes(key) &&
      data[key] !== undefined &&
      data[key] !== null
    ) {
      if (typeof data[key] === "object") {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });

  // Handle file fields
  fileFields.forEach((field) => {
    if (data[field]) {
      if (Array.isArray(data[field])) {
        data[field].forEach((file, index) => {
          if (file instanceof File) {
            formData.append(field, file);
          }
        });
      } else if (data[field] instanceof File) {
        formData.append(field, data[field]);
      }
    }
  });

  return formData;
};

// API Services for all endpoints
export const API_ENDPOINTS = {
  // ========== STONE OPERATIONS ==========
  // Stones
  getAllStones: () => endpoint(PATHS.STONES, ROUTES.ALL_STONES),
  createStone: () => endpoint(PATHS.STONES, ROUTES.CREATE_STONE),
  updateStone: (id) => endpoint(PATHS.STONES, ROUTES.UPDATE_STONE, id),
  deleteStone: (id) => endpoint(PATHS.STONES, ROUTES.DELETE_STONE, id),

  // Stone Types
  getAllStoneTypes: () => endpoint(PATHS.STONE_TYPE, ROUTES.ALL_STONE_TYPES),
  createStoneType: () => endpoint(PATHS.STONE_TYPE, ROUTES.CREATE_STONE_TYPE),
  updateStoneType: (id) =>
    endpoint(PATHS.STONE_TYPE, ROUTES.UPDATE_STONE_TYPE, id),
  deleteStoneType: (id) =>
    endpoint(PATHS.STONE_TYPE, ROUTES.DELETE_STONE_TYPE, id),

  // Stone Purity (from stones API)
  getAllStonePurities: () => endpoint(PATHS.STONE_PURITY, ROUTES.ALL_PURITIES),
  createStonePurity: () => endpoint(PATHS.STONE_PURITY, ROUTES.CREATE_PURITY),
  updateStonePurity: (id) =>
    endpoint(PATHS.STONE_PURITY, ROUTES.UPDATE_PURITY, id),
  deleteStonePurity: (id) =>
    endpoint(PATHS.STONE_PURITY, ROUTES.DELETE_PURITY, id),

  // ========== CATEGORY OPERATIONS ==========
  // Categories
  getCategories: () => endpoint(PATHS.CATEGORIES, ROUTES.GET_CATEGORIES),
  createCategory: () => endpoint(PATHS.CATEGORIES, ROUTES.CREATE_CATEGORY),
  updateCategory: (id) =>
    endpoint(PATHS.CATEGORIES, ROUTES.UPDATE_CATEGORY, id),
  deleteCategory: (id) =>
    endpoint(PATHS.CATEGORIES, ROUTES.DELETE_CATEGORY, id),

  // SubCategories
  getSubCategories: () =>
    endpoint(PATHS.SUB_CATEGORIES, ROUTES.GET_SUB_CATEGORIES),
  createSubCategory: () =>
    endpoint(PATHS.SUB_CATEGORIES, ROUTES.CREATE_SUB_CATEGORIES),
  updateSubCategory: (id) =>
    endpoint(PATHS.SUB_CATEGORIES, ROUTES.UPDATE_SUB_CATEGORIES, id),
  deleteSubCategory: (id) =>
    endpoint(PATHS.SUB_CATEGORIES, ROUTES.DELETE_SUB_CATEGORIES, id),

  // ========== METAL OPERATIONS ==========
  getMetals: () => endpoint(PATHS.METALS, ROUTES.ALL_METALS),
  createMetal: () => endpoint(PATHS.METALS, ROUTES.CREATE_METAL),
  updateMetal: (id) => endpoint(PATHS.METALS, ROUTES.UPDATE_METAL, id),
  deleteMetal: (id) => endpoint(PATHS.METALS, ROUTES.DELETE_METAL, id),

  // ========== BRAND OPERATIONS ==========
  getBrands: () => endpoint(PATHS.BRANDS, ROUTES.LIST_BRANDS),
  createBrand: () => endpoint(PATHS.BRANDS, ROUTES.CREATE_BRAND),
  updateBrand: (id) => endpoint(PATHS.BRANDS, ROUTES.UPDATE_BRAND, id),
  deleteBrand: (id) => endpoint(PATHS.BRANDS, ROUTES.DELETE_BRAND, id),

  // ========== HALLMARK OPERATIONS ==========
  getHallmarks: () => endpoint(PATHS.HALLMARK, ROUTES.ALL_HALLMARKS),
  createHallmark: () => endpoint(PATHS.HALLMARK, ROUTES.CREATE_HALLMARK),
  updateHallmark: (id) => endpoint(PATHS.HALLMARK, ROUTES.UPDATE_HALLMARK, id),
  deleteHallmark: (id) => endpoint(PATHS.HALLMARK, ROUTES.DELETE_HALLMARK, id),

  // ========== METAL PURITY OPERATIONS ==========
  getPurities: () => endpoint(PATHS.PURITY, ROUTES.GET_PURITY),
  createPurity: () => endpoint(PATHS.PURITY, ROUTES.CREATE_PURITY_METAL),
  updatePurity: (id) => endpoint(PATHS.PURITY, ROUTES.UPDATE_PURITY_METAL, id),
  deletePurity: (id) => endpoint(PATHS.PURITY, ROUTES.DELETE_PURITY_METAL, id),

  // ========== UNIT OPERATIONS ===========
  getUnits: () => endpoint(PATHS.UNITS, ROUTES.GET_UNITS),
  createUnit: () => endpoint(PATHS.UNITS, ROUTES.CREATE_UNIT),
  updateUnit: (id) => endpoint(PATHS.UNITS, ROUTES.UPDATE_UNIT, id),
  deleteUnit: (id) => endpoint(PATHS.UNITS, ROUTES.DELETE_UNIT, id),

  // ========== WASTAGE OPERATIONS ==========
  getAllWastages: () => endpoint(PATHS.WASTAGES, ROUTES.ALL_WASTAGES),
  createWastage: () => endpoint(PATHS.WASTAGES, ROUTES.CREATE_WASTAGE),
  updateWastage: (id) => endpoint(PATHS.WASTAGES, ROUTES.UPDATE_WASTAGE, id),
  deleteWastage: (id) => endpoint(PATHS.WASTAGES, ROUTES.DELETE_WASTAGE, id),

  // ========== MAKING STAGE OPERATIONS ==========
  getMakingStages: () =>
    endpoint(PATHS.MAKING_STAGES, ROUTES.GET_MAKING_STAGES),
  createMakingStage: () =>
    endpoint(PATHS.MAKING_STAGES, ROUTES.CREATE_MAKING_STAGE),
  updateMakingStage: (id) =>
    endpoint(PATHS.MAKING_STAGES, ROUTES.UPDATE_MAKING_STAGE, id),
  deleteMakingStage: (id) =>
    endpoint(PATHS.MAKING_STAGES, ROUTES.DELETE_MAKING_STAGE, id),

  // ========== MAKING SUB-STAGE OPERATIONS ==========
  getMakingSubStages: () =>
    endpoint(PATHS.MAKING_SUB_STAGES, ROUTES.GET_MAKING_SUB_STAGES),
  createMakingSubStage: () =>
    endpoint(PATHS.MAKING_SUB_STAGES, ROUTES.CREATE_MAKING_SUB_STAGE),
  updateMakingSubStage: (id) =>
    endpoint(PATHS.MAKING_SUB_STAGES, ROUTES.UPDATE_MAKING_SUB_STAGE, id),
  deleteMakingSubStage: (id) =>
    endpoint(PATHS.MAKING_SUB_STAGES, ROUTES.DELETE_MAKING_SUB_STAGE, id),

  // ========== COST OPERATIONS ==========
  getCosts: () => endpoint(PATHS.COSTS, ROUTES.GET_COSTS),
  createCost: () => endpoint(PATHS.COSTS, ROUTES.CREATE_COST),
  updateCost: (id) => endpoint(PATHS.COSTS, ROUTES.UPDATE_COST, id),
  deleteCost: (id) => endpoint(PATHS.COSTS, ROUTES.DELETE_COST, id),

  // ========== COST TYPE OPERATIONS ==========
  getCostTypes: () => endpoint(PATHS.COST_TYPES, ROUTES.GET_COST_TYPES),
  createCostType: () => endpoint(PATHS.COST_TYPES, ROUTES.CREATE_COST_TYPE),
  updateCostType: (id) =>
    endpoint(PATHS.COST_TYPES, ROUTES.UPDATE_COST_TYPE, id),
  deleteCostType: (id) =>
    endpoint(PATHS.COST_TYPES, ROUTES.DELETE_COST_TYPE, id),

  // ========== PRICE MAKING OPERATIONS ==========
  getPriceMakings: () => endpoint(PATHS.PRICE_MAKING, ROUTES.GET_PRICE_MAKINGS),
  createPriceMaking: () =>
    endpoint(PATHS.PRICE_MAKING, ROUTES.CREATE_PRICE_MAKING),
  updatePriceMaking: (id) =>
    endpoint(PATHS.PRICE_MAKING, ROUTES.UPDATE_PRICE_MAKING, id),
  deletePriceMaking: (id) =>
    endpoint(PATHS.PRICE_MAKING, ROUTES.DELETE_PRICE_MAKING, id),

  // ========== GST OPERATIONS ==========
  getAllGST: () => endpoint(PATHS.GST, ROUTES.ALL_GST),
  createGST: () => endpoint(PATHS.GST, ROUTES.CREATE_GST),
  updateGST: (id) => endpoint(PATHS.GST, ROUTES.UPDATE_GST, id),
  deleteGST: (id) => endpoint(PATHS.GST, ROUTES.DELETE_GST, id),

  // ========== MATERIAL TYPE OPERATIONS ==========

  getMaterialTypes: () => endpoint(PATHS.MATERIAL, ROUTES.GET_MATERIAL_TYPES),
  createMaterialTypes: () =>
    endpoint(PATHS.MATERIAL, ROUTES.CREATE_MATERIAL_TYPES),
  updateMaterialTypes: (id) =>
    endpoint(PATHS.MATERIAL, ROUTES.UPDATE_MATERIAL_TYPES, id),
  deleteMaterialTypes: (id) =>
    endpoint(PATHS.MATERIAL, ROUTES.DELETE_MATERIAL_TYPES, id),

  // ========== INVENTORY CATEGORY OPERATIONS ==========

  getInventoryCategories: () =>
    endpoint(PATHS.INVENTORY_CATEGORIES, ROUTES.GET_INVENTORY_CATEGORIES),
  createInventoryCategory: () =>
    endpoint(PATHS.INVENTORY_CATEGORIES, ROUTES.CREATE_INVENTORY_CATEGORY),
  updateInventoryCategory: (id) =>
    endpoint(PATHS.INVENTORY_CATEGORIES, ROUTES.UPDATE_INVENTORY_CATEGORY, id),
  deleteInventoryCategory: (id) =>
    endpoint(PATHS.INVENTORY_CATEGORIES, ROUTES.DELETE_INVENTORY_CATEGORY, id),

  // ========== INVENTORY CATEGORY OPERATIONS ==========

   getInventorySubCategories: () =>
    endpoint(PATHS.INVENTORY_SUB_CATEGORIES, ROUTES.GET_INVENTORY_SUB_CATEGORIES),
  createInventorySubCategory: () =>
    endpoint(PATHS.INVENTORY_SUB_CATEGORIES, ROUTES.CREATE_INVENTORY_SUB_CATEGORIES),
  updateInventorySubCategory: (id) =>
    endpoint(PATHS.INVENTORY_SUB_CATEGORIES, ROUTES.UPDATE_INVENTORY_SUB_CATEGORIES, id),
  deleteInventorySubCategory: (id) =>
    endpoint(PATHS.INVENTORY_SUB_CATEGORIES, ROUTES.DELETE_INVENTORY_SUB_CATEGORIES, id),

  // ========== INVENTORY ITEMS OPERATIONS ==========

  getInventoryItems: () =>
    endpoint(PATHS.INVENTORY_ITEMS, ROUTES.GET_PAGINATION_INVENTORY_ITEMS),
  createInventoryItem: () =>
    endpoint(PATHS.INVENTORY_ITEMS, ROUTES.CREATE_INVENTORY_ITEMS),
  updateInventoryItem: (id) =>
    endpoint(PATHS.INVENTORY_ITEMS, ROUTES.UPDATE_INVENTORY_ITEMS, id),
  deleteInventoryItem: (id) =>
    endpoint(PATHS.INVENTORY_ITEMS, ROUTES.DELETE_INVENTORY_ITEMS, id),

  // ==============  FOR BRANCH TYPES ==============
  getBranchTypes: () => endpoint(PATHS.BRANCH_TYPES, ROUTES.GET_BRANCH_TYPES),
  createBranchType: () =>
    endpoint(PATHS.BRANCH_TYPES, ROUTES.CREATE_BRANCH_TYPE),
  updateBranchType: (id) =>
    endpoint(PATHS.BRANCH_TYPES, ROUTES.UPDATE_BRANCH_TYPE, id),
  deleteBranchType: (id) =>
    endpoint(PATHS.BRANCH_TYPES, ROUTES.DELETE_BRANCH_TYPE, id),

  // In API_ENDPOINTS object:
  getBranches: () => endpoint(PATHS.BRANCHES, ROUTES.GET_BRANCHES),
  createBranch: () => endpoint(PATHS.BRANCHES, ROUTES.CREATE_BRANCH),
  updateBranch: (id) => endpoint(PATHS.BRANCHES, ROUTES.UPDATE_BRANCH, id),
  deleteBranch: (id) => endpoint(PATHS.BRANCHES, ROUTES.DELETE_BRANCH, id),

  // ========== SUPPLIER OPERATIONS ==========
  getSuppliers: () => endpoint(PATHS.SUPPLIERS, ROUTES.GET_SUPPLIERS),
  createSupplier: () => endpoint(PATHS.SUPPLIERS, ROUTES.CREATE_SUPPLIER),
  updateSupplier: (id) => endpoint(PATHS.SUPPLIERS, ROUTES.UPDATE_SUPPLIER, id),
  deleteSupplier: (id) => endpoint(PATHS.SUPPLIERS, ROUTES.DELETE_SUPPLIER, id),

  // ========== PURCHASE ORDER OPERATIONS ==========
  getPurchaseOrders: () =>
    endpoint(PATHS.PURCHASE_ORDERS, ROUTES.GET_PURCHASE_ORDERS),
  getPurchaseOrderById: (id) =>
    endpoint(PATHS.PURCHASE_ORDERS, ROUTES.GET_PURCHASE_ORDER_BY_ID, id),
  createPurchaseOrder: () =>
    endpoint(PATHS.PURCHASE_ORDERS, ROUTES.CREATE_PURCHASE_ORDER),
  updatePurchaseOrder: (id) =>
    endpoint(PATHS.PURCHASE_ORDERS, ROUTES.UPDATE_PURCHASE_ORDER, id),
  deletePurchaseOrder: (id) =>
    endpoint(PATHS.PURCHASE_ORDERS, ROUTES.DELETE_PURCHASE_ORDER, id),

  // ========== STOCK IN - GRN OPERATIONS ==========
  getGRNs: () => endpoint(PATHS.GRNS, ROUTES.GET_GRNS),
  getGRNById: (id) => endpoint(PATHS.GRNS, ROUTES.GET_GRN_BY_ID, id),
  createGRN: () => endpoint(PATHS.GRNS, ROUTES.CREATE_GRN),
  updateGRN: (id) => endpoint(PATHS.GRNS, ROUTES.UPDATE_GRN, id),
  deleteGRN: (id) => endpoint(PATHS.GRNS, ROUTES.DELETE_GRN, id),

  // ========== PRODUCT OPERATIONS ==========
  // Get all products
  getAllItems: () => endpoint(PATHS.PRODUCTS, ROUTES.GET_PRODUCTS),

  // Get single product by ID
  getItemById: (id) => endpoint(PATHS.PRODUCTS, ROUTES.GET_PRODUCT_BY_ID, id),

  // Create product
  createItem: () => endpoint(PATHS.PRODUCTS, ROUTES.CREATE_PRODUCT),

  // Update product
  updateItem: (id) => endpoint(PATHS.PRODUCTS, ROUTES.UPDATE_PRODUCT, id),

  // Delete product
  deleteItem: (id) => endpoint(PATHS.PRODUCTS, ROUTES.DELETE_PRODUCT, id),

  // Toggle product status (cycle through statuses)
  toggleProductStatus: (id) => endpoint(PATHS.PRODUCTS, `${id}/toggle-status`),

  // Update product to specific status
  updateProductStatus: (id) => endpoint(PATHS.PRODUCTS, `${id}/update-status`),

  // Bulk update product status
  bulkUpdateProductStatus: () => endpoint(PATHS.PRODUCTS, "bulk-status"),
};

// Legacy exports for compatibility with existing code
export const STONES = {
  ALL: API_ENDPOINTS.getAllStones(),
  CREATE: API_ENDPOINTS.createStone(),
  UPDATE: (id) => API_ENDPOINTS.updateStone(id),
  DELETE: (id) => API_ENDPOINTS.deleteStone(id),
};

export const STONE_TYPES = {
  ALL: API_ENDPOINTS.getAllStoneTypes(),
  CREATE: API_ENDPOINTS.createStoneType(),
  UPDATE: (id) => API_ENDPOINTS.updateStoneType(id),
  DELETE: (id) => API_ENDPOINTS.deleteStoneType(id),
};

export const STONE_PURITIES = {
  ALL: API_ENDPOINTS.getAllStonePurities(),
  CREATE: API_ENDPOINTS.createStonePurity(),
  UPDATE: (id) => API_ENDPOINTS.updateStonePurity(id),
  DELETE: (id) => API_ENDPOINTS.deleteStonePurity(id),
};

// Helper function for product endpoints
export const PRODUCTS = {
  ALL: API_ENDPOINTS.getAllItems(),
  CREATE: API_ENDPOINTS.createItem(),
  UPDATE: (id) => API_ENDPOINTS.updateItem(id),
  DELETE: (id) => API_ENDPOINTS.deleteItem(id),
  GET_BY_ID: (id) => API_ENDPOINTS.getItemById(id),
  TOGGLE_STATUS: (id) => API_ENDPOINTS.toggleProductStatus(id),
  UPDATE_STATUS: (id) => API_ENDPOINTS.updateProductStatus(id),
  BULK_UPDATE_STATUS: API_ENDPOINTS.bulkUpdateProductStatus(),
};
