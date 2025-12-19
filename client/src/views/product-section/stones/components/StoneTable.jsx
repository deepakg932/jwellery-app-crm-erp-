import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiImage } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import useStones from "@/hooks/useStones";
import AddStoneForm from "./AddStoneForm";
import EditStoneForm from "./EditStoneForm";

const StoneTable = () => {
  const {
    stones,
    stoneTypes,
    stonePurities,
    loading,
    error,
    addStone,
    updateStone,
    deleteStone,
  } = useStones();
  
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStone, setSelectedStone] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });

  // Filter stones by search
  const filteredStones = (stones || []).filter((stone) =>
    (stone?.stone_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (stone?.stone_type || "").toLowerCase().includes(search.toLowerCase()) ||
    (stone?.stone_purity || "").toLowerCase().includes(search.toLowerCase())
  );

  // Format price to Indian Rupees
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Handle add stone
  const handleAdd = async (stoneData, imageFile) => {
    console.log("Adding new stone:", { stoneData, hasImageFile: !!imageFile });

    setActionLoading({ type: "add", id: null });
    try {
      await addStone(stoneData, imageFile);
      setShowAddModal(false);
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update stone
  const handleUpdate = async (stoneData, imageFile) => {
    if (!selectedStone) return;

    setActionLoading({ type: "update", id: selectedStone._id });
    try {
      await updateStone(selectedStone._id, {
        ...stoneData,
        imageFile,
      });
      setShowEditModal(false);
      setSelectedStone(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle delete stone
  const handleDelete = async () => {
    if (!selectedStone) return;

    setActionLoading({ type: "delete", id: selectedStone._id });
    try {
      await deleteStone(selectedStone._id);
      setShowDeleteModal(false);
      setSelectedStone(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (stone) => {
    setSelectedStone(stone);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (stone) => {
    setSelectedStone(stone);
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
            <h5 className="modal-title fw-bold fs-5">Delete Stone</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStone(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedStone?.stone_name}</strong>?
            </p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStone(null);
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

  // Safe image component
  const SafeImage = ({ src, alt, ...props }) => {
    const [hasError, setHasError] = useState(false);

    if (hasError || !src) {
      return (
        <div
          className="bg-light border rounded d-flex justify-content-center align-items-center"
          style={{ width: 45, height: 45 }}
        >
          <FiImage className="text-muted" />
        </div>
      );
    }

    return (
      <img
        src={`https://cvhjrjvd-5000.inc1.devtunnels.ms${src}`}
        alt={alt || "Stone image"}
        {...props}
        onError={() => setHasError(true)}
      />
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Stone Management</h1>
              <p className="text-muted mb-0">
                Manage your stones with table
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
                disabled={loading || actionLoading.type === "add"}
              >
                <FiPlus size={18} />
                Add Stone
              </button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger mb-3" role="alert">
              {error}
            </div>
          )}

          {/* Debug Info */}
          {/* <div className="mb-3 text-muted small">
            <div>Total Stones: {stones.length}</div>
            <div>Stone Types: {stoneTypes.length} options</div>
            <div>Stone Purities: {stonePurities.length} options</div>
          </div> */}

          {/* SEARCH */}
          <div className="row">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <FiSearch className="text-muted" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search stones..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE - ONLY 5 COLUMNS */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Stone Name</th>
                <th>Type</th>
                <th>Purity</th>
                <th>Price</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && stones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="d-flex justify-content-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : filteredStones.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    {search
                      ? "No stones found for your search"
                      : "No stones available"}
                  </td>
                </tr>
              ) : (
                filteredStones.map((stone, index) => (
                  <tr key={stone._id || index}>
                    <td>{index + 1}</td>

                    {/* Stone Image */}
                    <td>
                      <SafeImage
                        src={stone.stone_image}
                        alt={stone.stone_name}
                        width="45"
                        height="45"
                        className="rounded border"
                        style={{ objectFit: "cover", borderRadius: "6px" }}
                      />
                    </td>

                    {/* Stone Name */}
                    <td className="fw-semibold">{stone.stone_name || "N/A"}</td>

                    {/* Stone Type */}
                    <td>
                      <span className="badge bg-info bg-opacity-10 text-info border border-info">
                        {stone.stone_type || "N/A"}
                      </span>
                    </td>

                    {/* Stone Purity */}
                    <td>
                      <span className="badge bg-warning bg-opacity-10 text-warning border border-warning">
                        {stone.stone_purity || "N/A"}
                      </span>
                    </td>

                    {/* Stone Price */}
                    <td className="fw-bold text-primary">
                      {formatPrice(stone.stone_price)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(stone)}
                          disabled={actionLoading.type && actionLoading.id === stone._id}
                        >
                          {actionLoading.type === "update" && actionLoading.id === stone._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Editing...
                            </>
                          ) : (
                            <>
                              <FiEdit2 size={16} />
                              Edit
                            </>
                          )}
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(stone)}
                          disabled={actionLoading.type && actionLoading.id === stone._id}
                        >
                          {actionLoading.type === "delete" && actionLoading.id === stone._id ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1"></span>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <RiDeleteBin6Line size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddStoneForm
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
          stoneTypes={stoneTypes}
          stonePurities={stonePurities}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedStone && (
        <EditStoneForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedStone(null);
          }}
          onSubmit={handleUpdate}
          stone={selectedStone}
          loading={actionLoading.type === "update" && actionLoading.id === selectedStone._id}
          stoneTypes={stoneTypes}
          stonePurities={stonePurities}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedStone && <DeleteConfirmationModal />}
    </div>
  );
};

export default StoneTable;