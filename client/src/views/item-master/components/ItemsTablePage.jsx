import React, { useState, useEffect } from "react";
import {
  FiEdit2,
  FiSearch,
  FiPlus,
  FiImage,
  FiEye,
  FiRefreshCw,
} from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import useItems from "@/hooks/useItems";
import AddItemModal from "./AddItemForm";
import EditItemModal from "./EditItemForm";
import ViewItemModal from "./ViewItemModal";

export default function ItemsTablePage() {
  const {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    toggleProductStatus,
    getPuritiesByMetal,
    getMaterialTypesByMetal,
    updateProductStatus,
    getStonePuritiesByStoneType,
    bulkUpdateProductStatus,
    refreshItems,
    clearError,
    getFormData,
    getGSTRateValue,
    getCategoryIdFromName,
    getSubcategoriesForCategory,
    generateProductCode,
    fetchHallmarksByMetal,
  } = useItems();

  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("active");

  // Status options for quick edit
  const statusOptions = [
    { value: "active", label: "Active", variant: "success" },
    { value: "inactive", label: "Inactive", variant: "secondary" },
    { value: "draft", label: "Draft", variant: "warning" },
    { value: "out_of_stock", label: "Out of Stock", variant: "danger" },
    { value: "discontinued", label: "Discontinued", variant: "dark" },
  ];

  // Fetch items on component mount
  useEffect(() => {
    const loadItems = async () => {
      try {
        await fetchItems();
      } catch (err) {
        console.error("Failed to fetch items:", err);
      }
    };

    loadItems();
  }, [fetchItems]);

  // Safe filtering
  const filteredItems = React.useMemo(() => {
    const itemsArray = Array.isArray(items) ? items : [];
    return itemsArray.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        (item?.product_name || "").toLowerCase().includes(searchLower) ||
        (item?.product_code || "").toLowerCase().includes(searchLower) ||
        (item?.product_category || "").toLowerCase().includes(searchLower) ||
        (item?.product_subcategory || "").toLowerCase().includes(searchLower)
      );
    });
  }, [items, search]);

  // Handle product selection
  const handleProductSelect = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredItems.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredItems.map((item) => item._id));
    }
  };

  // Handle quick status update
  const handleStatusUpdate = async (itemId, newStatus) => {
    setActionLoading({ type: "status", id: itemId });
    setEditingStatusId(null);

    try {
      await updateProductStatus(itemId, newStatus);
      await refreshItems();
    } catch (error) {
      console.log(error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (selectedIds, status) => {
    if (!selectedIds || selectedIds.length === 0) {
      alert("Please select at least one product");
      return;
    }

    setActionLoading({ type: "bulk-status", id: null });

    try {
      const response = await bulkUpdateProductStatus(selectedIds, status);

      alert(
        response.message ||
          `${
            response.modifiedCount || selectedIds.length
          } products updated to ${status}`
      );

      setSelectedProducts([]);
      await refreshItems();
    } catch (error) {
      alert(
        `Failed to update status: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Get status display info
  const getStatusDisplay = (item) => {
    if (item.status) {
      const statusMap = {
        active: {
          text: "Active",
          variant: "success",
          description: "Item is available for sale",
        },
        inactive: {
          text: "Inactive",
          variant: "secondary",
          description: "Item is not available for sale",
        },
        draft: {
          text: "Draft",
          variant: "warning",
          description: "Item is not yet complete",
        },
        out_of_stock: {
          text: "Out of Stock",
          variant: "danger",
          description: "Item is currently out of stock",
        },
        discontinued: {
          text: "Discontinued",
          variant: "dark",
          description: "Item is no longer produced",
        },
      };

      return statusMap[item.status] || statusMap.active;
    }

    if (item.is_active === false) {
      return { text: "Inactive", variant: "secondary" };
    }

    if (item.selling_price_with_gst === 0 || !item.selling_price_with_gst) {
      return { text: "Draft", variant: "warning" };
    }

    const requiredFields = [
      "product_name",
      "product_category",
      "product_code",
      "gst_rate",
    ];
    const isComplete = requiredFields.every((field) => item[field]);

    if (!isComplete) {
      return { text: "Incomplete", variant: "danger" };
    }

    if (item.selling_price_with_gst > 0 && item.grand_total > 0) {
      return { text: "Active", variant: "success" };
    }

    return { text: "Pending", variant: "info" };
  };

  // Bulk Actions Component
  const BulkActions = () => {
    if (selectedProducts.length === 0) return null;

    return (
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <strong>{selectedProducts.length}</strong> product(s) selected
            </div>
            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm"
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={actionLoading.type === "bulk-status"}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Set to {option.label}
                  </option>
                ))}
              </select>
              <button
                className="btn btn-sm btn-primary"
                onClick={() =>
                  handleBulkStatusUpdate(selectedProducts, bulkStatus)
                }
                disabled={actionLoading.type === "bulk-status"}
              >
                {actionLoading.type === "bulk-status" ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  "Apply Status"
                )}
              </button>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSelectedProducts([])}
                disabled={actionLoading.type === "bulk-status"}
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle add
  const handleAdd = async (itemData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addItem(itemData);
      setShowAddModal(false);
      await refreshItems();
    } catch (error) {
      console.error("Failed to add item:", error);
      alert(`Failed to add item: ${error.message}`);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update
  const handleUpdate = async (itemData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateItem(selectedItem._id, itemData);
      setShowEditModal(false);
      setSelectedItem(null);
      await refreshItems();
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Failed to update item:", error);
      alert(`Failed to update item: ${error.message}`);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteItem(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
      await refreshItems();
    } catch (error) {
      alert(`Failed to delete item: ${error.message}`);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await refreshItems();
    } catch (error) {
      alert(`Failed to refresh items: ${error.message}`);
    }
  };

  // Open view modal
  const handleOpenView = (item) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  // Delete Confirmation Modal
  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Item</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedItem?.product_name}</strong>?
            </p>
            <p className="text-danger small">This action cannot be undone.</p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Get form data from hook
  const formData = getFormData
    ? getFormData()
    : {
        categories: [],
        metals: [],
        brands: [],
        purities: [],
        units: [],
        stoneTypes: [],
        stonePurities: [],
        makingCharges: [],
        gstRates: [],
        wastageTypes: [],
        hallmarks: [],
        subcategories: {},
        productCodes: [],
      };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-3">
                <h1 className="h3 fw-bold mb-0">Inventory Items</h1>
                <button
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  onClick={handleRefresh}
                  disabled={loading || actionLoading.type}
                  title="Refresh items"
                >
                  <FiRefreshCw size={14} />
                </button>
              </div>
              <p className="text-muted mb-0 mt-1">
                Manage your inventory items - Add, edit, view, and delete items
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              {selectedProducts.length > 0 && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedProducts([])}
                >
                  Clear Selection ({selectedProducts.length})
                </button>
              )}
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type}
              >
                <FiPlus size={18} />
                Add New Item
              </button>
            </div>
          </div>

          {/* SEARCH AND STATS */}
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by product name, code, category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading || actionLoading.type}
                />
              </div>
            </div>
            <div className="col-md-8 d-flex justify-content-end align-items-center">
              <div className="text-muted me-3">
                Showing {filteredItems.length} of {items.length} items
              </div>
              {filteredItems.length > 0 && (
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={
                      selectedProducts.length === filteredItems.length &&
                      filteredItems.length > 0
                    }
                    onChange={handleSelectAll}
                    disabled={
                      loading ||
                      actionLoading.type ||
                      filteredItems.length === 0
                    }
                  />
                  <label className="form-check-label small">Select All</label>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS */}
      <BulkActions />

      {/* ERROR ALERT */}
      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show mb-4"
          role="alert"
        >
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Error!</strong> {error}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={clearError}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle table-hover">
            <thead>
              <tr>
                <th width="50">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={
                        selectedProducts.length === filteredItems.length &&
                        filteredItems.length > 0
                      }
                      onChange={handleSelectAll}
                      disabled={
                        loading ||
                        actionLoading.type ||
                        filteredItems.length === 0
                      }
                    />
                  </div>
                </th>
                <th>#</th>
                <th>ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Subcategory</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="d-flex flex-column align-items-center justify-content-center">
                      <div
                        className="spinner-border text-primary mb-3"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted">Loading items...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                      <FiImage size={48} className="text-muted mb-3" />
                      <h5 className="mb-2">
                        {search
                          ? "No items found for your search"
                          : "No items available"}
                      </h5>
                      {!search && (
                        <button
                          className="btn btn-primary mt-2"
                          onClick={() => setShowAddModal(true)}
                        >
                          <FiPlus size={16} className="me-2" />
                          Add Your First Item
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => {
                  const status = getStatusDisplay(item);
                  const isSelected = selectedProducts.includes(item._id);
                  const isEditingStatus = editingStatusId === item._id;

                  return (
                    <tr
                      key={item._id}
                      className={`hover-shadow ${
                        isSelected ? "table-active" : ""
                      }`}
                    >
                      {/* SELECT CHECKBOX */}
                      <td>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleProductSelect(item._id)}
                            disabled={actionLoading.type === "bulk-status"}
                          />
                        </div>
                      </td>

                      {/* SERIAL NUMBER */}
                      <td className="text-muted">{index + 1}</td>

                      {/* ID & PRODUCT CODE */}
                      <td>
                        <div className="d-flex flex-column">
                          <span className="fw-medium">
                            {item.product_code || "N/A"}
                          </span>
                          {item._id && (
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.7rem" }}
                            >
                              ID: {item._id.substring(0, 8)}...
                            </small>
                          )}
                        </div>
                      </td>

                      {/* PRODUCT NAME */}
                      <td>
                        <div>
                          <strong className="d-block mb-1">
                            {item.product_name || "Unnamed Item"}
                          </strong>
                          {item.product_brand && (
                            <div className="text-muted small">
                              Brand: {item.product_brand}
                            </div>
                          )}
                          {item.selling_price_with_gst > 0 && (
                            <div className="text-muted small">
                              Price: ₹
                              {item.selling_price_with_gst?.toLocaleString() ||
                                "0"}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* CATEGORY */}
                      <td>
                        <div>
                          <span className="d-block fw-medium">
                            {item.product_category || "No Category"}
                          </span>
                          {item.gst_rate && (
                            <div className="text-muted small">
                              GST: {item.gst_rate}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* SUBCATEGORY */}
                      <td>
                        <div>
                          {item.product_subcategory ? (
                            <span className="d-block">
                              {item.product_subcategory}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td>
                        {isEditingStatus ? (
                          <div className="d-flex align-items-center gap-2">
                            <select
                              className="form-select form-select-sm"
                              defaultValue={item.status || "active"}
                              disabled={
                                actionLoading.type === "status" &&
                                actionLoading.id === item._id
                              }
                              autoFocus
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusUpdate(item._id, e.target.value);
                                }
                              }}
                            >
                              {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => setEditingStatusId(null)}
                              disabled={
                                actionLoading.type === "status" &&
                                actionLoading.id === item._id
                              }
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className={`badge bg-${status.variant} cursor-pointer`}
                              onClick={() => setEditingStatusId(item._id)}
                              style={{ cursor: "pointer", minWidth: "100px" }}
                              title={status.description || ""}
                            >
                              {status.text}
                              {actionLoading.type === "status" &&
                                actionLoading.id === item._id && (
                                  <span
                                    className="ms-2 spinner-border spinner-border-sm"
                                    style={{ verticalAlign: "middle" }}
                                  ></span>
                                )}
                            </span>
                          </div>
                        )}
                        {item.createdAt && !isEditingStatus && (
                          <div className="text-muted small mt-1">
                            Created:{" "}
                            {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td>
                        <div className="d-flex justify-content-end gap-2">
                          {/* VIEW BUTTON */}
                          <button
                            className="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                            onClick={() => handleOpenView(item)}
                            title="View Details"
                            disabled={actionLoading.type}
                          >
                            <FiEye size={14} />
                          </button>

                          {/* EDIT BUTTON */}
                          <button
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                            onClick={() => handleOpenEdit(item)}
                            disabled={actionLoading.type}
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </button>

                          {/* DELETE BUTTON */}
                          <button
                            className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                            onClick={() => handleOpenDelete(item)}
                            disabled={actionLoading.type}
                          >
                            <RiDeleteBin6Line size={14} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
          formData={formData}
          getSubcategoriesForCategory={getSubcategoriesForCategory}
          generateProductCode={generateProductCode}
          getGSTRateValue={getGSTRateValue}
          getPuritiesByMetal={getPuritiesByMetal}
          getStonePuritiesByStoneType={getStonePuritiesByStoneType}
          getMaterialTypesByMetal={getMaterialTypesByMetal}
          fetchHallmarksByMetal={fetchHallmarksByMetal}
          dropdownLoading={loading}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedItem && (
        <EditItemModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          item={selectedItem}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
          formData={formData}
          getSubcategoriesForCategory={getSubcategoriesForCategory}
          getCategoryIdFromName={getCategoryIdFromName}
          getGSTRateValue={getGSTRateValue}
          fetchHallmarksByMetal={fetchHallmarksByMetal}
        />
      )}

      {/* VIEW MODAL */}
      {showViewModal && selectedItem && (
        <ViewItemModal
          show={showViewModal}
          onHide={() => {
            setShowViewModal(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          formData={formData}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
    </div>
  );
}