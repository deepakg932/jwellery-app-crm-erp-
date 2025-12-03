import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiTag, FiPercent, FiStar } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddHallmarkModal from "./AddHallMark";
import EditHallmarkModal from "./EditHallmarkModal";

// Mock data for dropdowns
const purities = [
  { id: 1, name: "24K Gold", percentage: 99.9 },
  { id: 2, name: "22K Gold", percentage: 91.6 },
  { id: 3, name: "18K Gold", percentage: 75.0 },
  { id: 4, name: "14K Gold", percentage: 58.3 },
  { id: 5, name: "925 Silver", percentage: 92.5 },
  { id: 6, name: "999 Silver", percentage: 99.9 },
  { id: 7, name: "950 Platinum", percentage: 95.0 },
  { id: 8, name: "900 Platinum", percentage: 90.0 },
  { id: 9, name: "850 Platinum", percentage: 85.0 },
];

const marks = [
  { id: 1, name: "BIS Hallmark", code: "BIS", country: "India" },
  { id: 2, name: "Karat Stamp", code: "KT", country: "International" },
  { id: 3, name: "Sterling Mark", code: "STER", country: "International" },
  { id: 4, name: "Platinum Mark", code: "PT", country: "International" },
  { id: 5, name: "Palladium Mark", code: "PD", country: "International" },
  { id: 6, name: "Assay Office", code: "AO", country: "UK" },
  { id: 7, name: "Swiss Mark", code: "SWISS", country: "Switzerland" },
  { id: 8, name: "Italian Mark", code: "IT", country: "Italy" },
];

const metalTypes = [
  { id: 1, name: "Gold" },
  { id: 2, name: "Silver" },
  { id: 3, name: "Platinum" },
  { id: 4, name: "Palladium" },
  { id: 5, name: "White Gold" },
  { id: 6, name: "Rose Gold" },
  { id: 7, name: "Yellow Gold" },
  { id: 8, name: "Sterling Silver" },
];

// Mock hallmarks data
const initialHallmarks = [
  { 
    id: 1, 
    name: "BIS 916", 
    purityId: 1, 
    purityName: "24K Gold", 
    markId: 1,
    markName: "BIS Hallmark",
    percentage: 91.6,
    metalTypeId: 1,
    metalTypeName: "Gold",
    description: "Indian BIS hallmark for 22K gold",
    status: "Active"
  },
  { 
    id: 2, 
    name: "925 Stamp", 
    purityId: 5, 
    purityName: "925 Silver", 
    markId: 3,
    markName: "Sterling Mark",
    percentage: 92.5,
    metalTypeId: 8,
    metalTypeName: "Sterling Silver",
    description: "International sterling silver mark",
    status: "Active"
  },
  { 
    id: 3, 
    name: "750 Mark", 
    purityId: 3, 
    purityName: "18K Gold", 
    markId: 2,
    markName: "Karat Stamp",
    percentage: 75.0,
    metalTypeId: 1,
    metalTypeName: "Gold",
    description: "18 karat gold hallmark",
    status: "Active"
  },
  { 
    id: 4, 
    name: "950 PT", 
    purityId: 7, 
    purityName: "950 Platinum", 
    markId: 4,
    markName: "Platinum Mark",
    percentage: 95.0,
    metalTypeId: 3,
    metalTypeName: "Platinum",
    description: "Platinum purity mark",
    status: "Active"
  },
  { 
    id: 5, 
    name: "585 Stamp", 
    purityId: 4, 
    purityName: "14K Gold", 
    markId: 2,
    markName: "Karat Stamp",
    percentage: 58.5,
    metalTypeId: 1,
    metalTypeName: "Gold",
    description: "14 karat gold hallmark",
    status: "Active"
  },
];

const HallmarkPage = () => {
  const [hallmarks, setHallmarks] = useState(initialHallmarks);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHallmark, setSelectedHallmark] = useState(null);

  // Filter hallmarks based on search
  const filtered = hallmarks.filter((hallmark) =>
    hallmark.name.toLowerCase().includes(search.toLowerCase()) ||
    hallmark.purityName?.toLowerCase().includes(search.toLowerCase()) ||
    hallmark.markName?.toLowerCase().includes(search.toLowerCase()) ||
    hallmark.metalTypeName?.toLowerCase().includes(search.toLowerCase())
  );

  // Add new hallmark
  const handleSave = async (hallmarkData) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newHallmark = {
      id: Date.now(),
      name: hallmarkData.name,
      purityId: parseInt(hallmarkData.purityId),
      purityName: hallmarkData.purityName,
      markId: parseInt(hallmarkData.markId),
      markName: hallmarkData.markName,
      percentage: hallmarkData.percentage,
      metalTypeId: parseInt(hallmarkData.metalTypeId),
      metalTypeName: hallmarkData.metalTypeName,
      description: hallmarkData.description || "",
      status: "Active"
    };

    setHallmarks([...hallmarks, newHallmark]);
    setShowAddModal(false);
    setLoading(false);
  };

  // Edit hallmark
  const handleEditHallmark = (updatedHallmark) => {
    const updated = hallmarks.map((hallmark) => 
      hallmark.id === selectedHallmark.id ? updatedHallmark : hallmark
    );
    setHallmarks(updated);
    setShowEditModal(false);
    setSelectedHallmark(null);
  };

  // Delete hallmark
  const handleDeleteHallmark = async () => {
    if (!selectedHallmark) return;
    
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setHallmarks(hallmarks.filter((h) => h.id !== selectedHallmark.id));
    setShowDeleteModal(false);
    setSelectedHallmark(null);
    setLoading(false);
  };

  // Open edit modal
  const handleOpenEdit = (hallmark) => {
    setSelectedHallmark(hallmark);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (hallmark) => {
    setSelectedHallmark(hallmark);
    setShowDeleteModal(true);
  };

  // Toggle status
  const toggleStatus = (id) => {
    setHallmarks(hallmarks.map(h => 
      h.id === id ? { ...h, status: h.status === "Active" ? "Inactive" : "Active" } : h
    ));
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Hallmark</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedHallmark(null);
              }}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedHallmark?.name}</strong>?</p>
            <p className="text-danger">This action cannot be undone.</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedHallmark(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteHallmark}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">Hallmark Management</h1>
              <p className="text-muted mb-0">
                Manage jewelry hallmarks with purity, marks, and metal types
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={18} />
                Add Hallmark
              </button>
            </div>
          </div>

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
                  placeholder="Search hallmarks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Hallmark Code</th>
                <th>Purity</th>
                <th>Mark</th>
                <th>Percentage</th>
                <th>Metal Type</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No hallmarks found
                  </td>
                </tr>
              ) : (
                filtered.map((hallmark, index) => (
                  <tr key={hallmark.id}>
                    <td>{index + 1}</td>

                    {/* Hallmark Code */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <FiTag className="text-primary" />
                        <span className="fw-bold">{hallmark.name}</span>
                      </div>
                      {hallmark.description && (
                        <small className="text-muted d-block">
                          {hallmark.description.substring(0, 50)}...
                        </small>
                      )}
                    </td>

                    {/* Purity */}
                    <td>
                      <span className="badge bg-warning text-dark">
                        {hallmark.purityName}
                      </span>
                    </td>

                    {/* Mark */}
                    <td>
                      <span className="badge bg-info">
                        {hallmark.markName}
                      </span>
                    </td>

                    {/* Percentage */}
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiPercent className="text-success" />
                        <span className="fw-bold">{hallmark.percentage}%</span>
                      </div>
                    </td>

                    {/* Metal Type */}
                    <td>
                      <span className="badge bg-secondary">
                        {hallmark.metalTypeName}
                      </span>
                    </td>

                    {/* Status */}
                    <td>
                      <button
                        className={`btn btn-sm ${hallmark.status === "Active" ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => toggleStatus(hallmark.id)}
                      >
                        {hallmark.status}
                      </button>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(hallmark)}
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(hallmark)}
                        >
                          <RiDeleteBin6Line size={16} />
                          Delete
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

      {/* STATISTICS CARDS */}
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Hallmarks</h6>
                  <h3 className="mb-0">{hallmarks.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <FiTag className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Active Hallmarks</h6>
                  <h3 className="mb-0">
                    {hallmarks.filter(h => h.status === "Active").length}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <FiStar className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Unique Metals</h6>
                  <h3 className="mb-0">
                    {[...new Set(hallmarks.map(h => h.metalTypeName))].length}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <FiStar className="text-info" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Avg. Purity</h6>
                  <h3 className="mb-0">
                    {hallmarks.length > 0 
                      ? (hallmarks.reduce((acc, h) => acc + h.percentage, 0) / hallmarks.length).toFixed(1)
                      : 0}%
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <FiPercent className="text-warning" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddHallmarkModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={loading}
          purities={purities}
          marks={marks}
          metalTypes={metalTypes}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedHallmark && (
        <EditHallmarkModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedHallmark(null);
          }}
          onSubmit={handleEditHallmark}
          hallmark={selectedHallmark}
          purities={purities}
          marks={marks}
          metalTypes={metalTypes}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedHallmark && (
        <DeleteConfirmationModal />
      )}
    </div>
  );
};

export default HallmarkPage;