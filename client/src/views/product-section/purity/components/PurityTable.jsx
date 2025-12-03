import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiImage, FiPercent, FiDroplet } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddPurityModal from "./AddPurityModal";
import EditPurityModal from "./EditPurityModal";

// Mock purities data - updated with metalType field
const initialPurities = [
  { 
    id: 1, 
    name: "24K", 
    stoneName: "Diamond", 
    metalType: "Gold",
    percentage: 99.9,
    image: null,
    description: "Pure gold with 99.9% purity"
  },
  { 
    id: 2, 
    name: "925", 
    stoneName: "Ruby", 
    metalType: "Silver",
    percentage: 92.5,
    image: null,
    description: "Sterling silver with 92.5% purity"
  },
  { 
    id: 3, 
    name: "VVS Diamond", 
    stoneName: "Diamond", 
    metalType: "Platinum",
    percentage: 99.5,
    image: null,
    description: "Very Very Slightly Included diamond"
  },
  { 
    id: 4, 
    name: "18K Gold", 
    stoneName: "Sapphire", 
    metalType: "Gold",
    percentage: 75.0,
    image: null,
    description: "18 karat gold with 75% purity"
  },
  { 
    id: 5, 
    name: "950 Platinum", 
    stoneName: "Emerald", 
    metalType: "Platinum",
    percentage: 95.0,
    image: null,
    description: "Platinum with 95% purity"
  },
  { 
    id: 6, 
    name: "Rose Gold Ring", 
    stoneName: "Pearl", 
    metalType: "Rose Gold",
    percentage: 75.0,
    image: null,
    description: "Rose gold with pearl"
  },
  { 
    id: 7, 
    name: "Titanium Bracelet", 
    stoneName: "Onyx", 
    metalType: "Titanium",
    percentage: 99.0,
    image: null,
    description: "Titanium bracelet with onyx"
  },
  { 
    id: 8, 
    name: "Stainless Steel", 
    stoneName: "Topaz", 
    metalType: "Stainless Steel",
    percentage: 85.0,
    image: null,
    description: "Stainless steel with topaz"
  },
];

const PurityPage = () => {
  const [purities, setPurities] = useState(initialPurities);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPurity, setSelectedPurity] = useState(null);

  // Filter purities based on search
  const filtered = purities.filter((purity) =>
    purity.name.toLowerCase().includes(search.toLowerCase()) ||
    purity.stoneName?.toLowerCase().includes(search.toLowerCase()) ||
    purity.metalType?.toLowerCase().includes(search.toLowerCase()) ||
    purity.percentage.toString().includes(search)
  );

  // Add new purity
  const handleSave = async (purityData) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newPurity = {
      id: Date.now(),
      name: purityData.name,
      stoneName: purityData.stoneName,
      metalType: purityData.metalType,
      percentage: purityData.percentage,
      image: purityData.imageFile ? URL.createObjectURL(purityData.imageFile) : null,
      description: `${purityData.name} - ${purityData.stoneName} with ${purityData.metalType}`
    };

    setPurities([...purities, newPurity]);
    setShowAddModal(false);
    setLoading(false);
  };

  // Edit purity
  const handleEditPurity = (updatedPurity) => {
    const updated = purities.map((purity) => 
      purity.id === selectedPurity.id ? updatedPurity : purity
    );
    setPurities(updated);
    setShowEditModal(false);
    setSelectedPurity(null);
  };

  // Delete purity
  const handleDeletePurity = async () => {
    if (!selectedPurity) return;
    
    setLoading(true);

    const purity = purities.find((p) => p.id === selectedPurity.id);
    if (purity?.image) URL.revokeObjectURL(purity.image);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setPurities(purities.filter((p) => p.id !== selectedPurity.id));
    setShowDeleteModal(false);
    setSelectedPurity(null);
    setLoading(false);
  };

  // Open edit modal
  const handleOpenEdit = (purity) => {
    setSelectedPurity(purity);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (purity) => {
    setSelectedPurity(purity);
    setShowDeleteModal(true);
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Purity</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPurity(null);
              }}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedPurity?.name}</strong>?</p>
            <p className="text-danger">This action cannot be undone.</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedPurity(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeletePurity}
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
              <h1 className="h3 fw-bold mb-2">Purities Management</h1>
              <p className="text-muted mb-0">
                Manage stone purities with percentages and images
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={18} />
                Add Purity
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
                  placeholder="Search by name, stone, metal, or percentage..."
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
                <th>Image</th>
                <th>Purity Name</th>
                <th>Stone Name</th>
                <th>Metal Type</th>
                <th>Percentage</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    No purities found
                  </td>
                </tr>
              ) : (
                filtered.map((purity, index) => (
                  <tr key={purity.id}>
                    <td>{index + 1}</td>

                    {/* IMAGE PREVIEW */}
                    <td>
                      {purity.image ? (
                        <img
                          src={purity.image}
                          alt={purity.name}
                          width="45"
                          height="45"
                          className="rounded border"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="bg-light border rounded d-flex justify-content-center align-items-center"
                          style={{ width: 45, height: 45 }}
                        >
                          <FiImage className="text-muted" />
                        </div>
                      )}
                    </td>

                    <td className="fw-semibold">{purity.name}</td>
                    
                    {/* Stone Name */}
                    <td>
                      <span className="badge bg-info">
                        {purity.stoneName}
                      </span>
                    </td>

                    {/* Metal Type */}
                    <td>
                      <span className="badge bg-warning text-dark">
                        {purity.metalType}
                      </span>
                    </td>

                    {/* Percentage */}
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <FiPercent className="text-success" />
                        <span className="fw-bold">{purity.percentage}%</span>
                        <div className="progress flex-grow-1" style={{ height: '6px', width: '80px' }}>
                          <div 
                            className="progress-bar bg-success" 
                            role="progressbar" 
                            style={{ width: `${purity.percentage}%` }}
                            aria-valuenow={purity.percentage}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                          onClick={() => handleOpenEdit(purity)}
                        >
                          <FiEdit2 size={16} />
                          Edit
                        </button>

                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                          onClick={() => handleOpenDelete(purity)}
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
                  <h6 className="text-muted mb-1">Total Purities</h6>
                  <h3 className="mb-0">{purities.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <FiPercent className="text-primary" size={24} />
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
                  <h6 className="text-muted mb-1">Unique Stones</h6>
                  <h3 className="mb-0">
                    {[...new Set(purities.map(p => p.stoneName))].length}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <FiImage className="text-info" size={24} />
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
                  <h6 className="text-muted mb-1">Metal Types</h6>
                  <h3 className="mb-0">
                    {[...new Set(purities.map(p => p.metalType))].length}
                  </h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle">
                  <FiDroplet className="text-warning" size={24} />
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
                    {purities.length > 0 
                      ? (purities.reduce((acc, p) => acc + p.percentage, 0) / purities.length).toFixed(1)
                      : 0}%
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <FiPercent className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL - Removed stones prop */}
      {showAddModal && (
        <AddPurityModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={loading}
        />
      )}

      {/* EDIT MODAL - Removed stones prop */}
      {showEditModal && selectedPurity && (
        <EditPurityModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedPurity(null);
          }}
          onSubmit={handleEditPurity}
          purity={selectedPurity}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedPurity && (
        <DeleteConfirmationModal />
      )}
    </div>
  );
};

export default PurityPage;