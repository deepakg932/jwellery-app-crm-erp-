import React, { useState } from "react";
import { FiEdit2, FiSearch, FiPlus, FiImage, FiGrid } from "react-icons/fi";
import { RiDeleteBin6Line } from "react-icons/ri";
import AddBrandModal from "./AddBrandModal";
import EditBrandModal from "./EditBrandModal";

// Mock brands data
const initialBrands = [
  { 
    id: 1, 
    name: "Tiffany & Co.", 
    image: null,
    status: "Active"
  },
  { 
    id: 2, 
    name: "Cartier", 
    image: null,
    status: "Active"
  },
  { 
    id: 3, 
    name: "Rolex", 
    image: null,
    status: "Active"
  },
  { 
    id: 4, 
    name: "Bvlgari", 
    image: null,
    status: "Active"
  },
  { 
    id: 5, 
    name: "Van Cleef & Arpels", 
    image: null,
    status: "Active"
  },
  { 
    id: 6, 
    name: "Chopard", 
    image: null,
    status: "Active"
  },
  { 
    id: 7, 
    name: "Graff", 
    image: null,
    status: "Active"
  },
  { 
    id: 8, 
    name: "Harry Winston", 
    image: null,
    status: "Active"
  },
];

const BrandPage = () => {
  const [brands, setBrands] = useState(initialBrands);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  // Filter brands based on search
  const filtered = brands.filter((brand) =>
    brand.name.toLowerCase().includes(search.toLowerCase())
  );

  // Add new brand
  const handleSave = async (brandData) => {
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const newBrand = {
      id: Date.now(),
      name: brandData.name,
      image: brandData.imageFile ? URL.createObjectURL(brandData.imageFile) : null,
      status: "Active"
    };

    setBrands([...brands, newBrand]);
    setShowAddModal(false);
    setLoading(false);
  };

  // Edit brand
  const handleEditBrand = (updatedBrand) => {
    const updated = brands.map((brand) => 
      brand.id === selectedBrand.id ? updatedBrand : brand
    );
    setBrands(updated);
    setShowEditModal(false);
    setSelectedBrand(null);
  };

  // Delete brand
  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    
    setLoading(true);

    const brand = brands.find((b) => b.id === selectedBrand.id);
    if (brand?.image) URL.revokeObjectURL(brand.image);

    await new Promise((resolve) => setTimeout(resolve, 400));

    setBrands(brands.filter((b) => b.id !== selectedBrand.id));
    setShowDeleteModal(false);
    setSelectedBrand(null);
    setLoading(false);
  };

  // Open edit modal
  const handleOpenEdit = (brand) => {
    setSelectedBrand(brand);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (brand) => {
    setSelectedBrand(brand);
    setShowDeleteModal(true);
  };

  // Toggle status
  const toggleStatus = (id) => {
    setBrands(brands.map(b => 
      b.id === id ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" } : b
    ));
  };

  // Delete Confirmation Modal Component
  const DeleteConfirmationModal = () => (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Brand</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBrand(null);
              }}
            ></button>
          </div>
          
          <div className="modal-body">
            <p>Are you sure you want to delete <strong>{selectedBrand?.name}</strong>?</p>
            <p className="text-danger">This action cannot be undone.</p>
          </div>
          
          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBrand(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteBrand}
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
              <h1 className="h3 fw-bold mb-2">Brand Management</h1>
              <p className="text-muted mb-0">
                Manage jewelry brands with logos and names
              </p>
            </div>

            <div className="col-md-6 d-flex justify-content-end gap-2">
              <button
                className="btn btn-primary d-flex align-items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <FiPlus size={18} />
                Add Brand
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
                  placeholder="Search brands..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BRANDS GRID VIEW */}
      <div className="row">
        {filtered.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <FiImage className="text-muted mb-3" size={48} />
              <h4 className="text-muted">No brands found</h4>
              <p className="text-muted">Try adding a new brand or adjust your search</p>
            </div>
          </div>
        ) : (
          filtered.map((brand) => (
            <div key={brand.id} className="col-md-3 col-sm-6 mb-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body text-center">
                  {/* Brand Logo */}
                  <div className="mb-3">
                    {brand.image ? (
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="img-fluid rounded"
                        style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                      />
                    ) : (
                      <div
                        className="mx-auto d-flex align-items-center justify-content-center rounded border"
                        style={{ width: '120px', height: '120px' }}
                      >
                        <FiImage className="text-muted" size={32} />
                      </div>
                    )}
                  </div>
                  
                  {/* Brand Name */}
                  <h5 className="fw-bold mb-2">{brand.name}</h5>
                  
                  {/* Status */}
                  <div className="mb-3">
                    <button
                      className={`btn btn-sm ${brand.status === "Active" ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggleStatus(brand.id)}
                    >
                      {brand.status}
                    </button>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                      onClick={() => handleOpenEdit(brand)}
                    >
                      <FiEdit2 size={14} />
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                      onClick={() => handleOpenDelete(brand)}
                    >
                      <RiDeleteBin6Line size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ALTERNATIVE TABLE VIEW (Uncomment if you prefer table) */}
      {/*
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>Logo</th>
                <th>Brand Name</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((brand, index) => (
                <tr key={brand.id}>
                  <td>{index + 1}</td>
                  <td>
                    {brand.image ? (
                      <img
                        src={brand.image}
                        alt={brand.name}
                        width="60"
                        height="60"
                        className="rounded border"
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div
                        className="bg-light border rounded d-flex justify-content-center align-items-center"
                        style={{ width: 60, height: 60 }}
                      >
                        <FiImage className="text-muted" />
                      </div>
                    )}
                  </td>
                  <td className="fw-semibold">{brand.name}</td>
                  <td>
                    <button
                      className={`btn btn-sm ${brand.status === "Active" ? 'btn-success' : 'btn-secondary'}`}
                      onClick={() => toggleStatus(brand.id)}
                    >
                      {brand.status}
                    </button>
                  </td>
                  <td>
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                        onClick={() => handleOpenEdit(brand)}
                      >
                        <FiEdit2 size={16} />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                        onClick={() => handleOpenDelete(brand)}
                      >
                        <RiDeleteBin6Line size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      */}

      {/* STATISTICS CARDS */}
      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Total Brands</h6>
                  <h3 className="mb-0">{brands.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle">
                  <FiGrid className="text-primary" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Active Brands</h6>
                  <h3 className="mb-0">
                    {brands.filter(b => b.status === "Active").length}
                  </h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded-circle">
                  <FiGrid className="text-success" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">With Logos</h6>
                  <h3 className="mb-0">
                    {brands.filter(b => b.image !== null).length}
                  </h3>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded-circle">
                  <FiImage className="text-info" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <AddBrandModal
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          loading={loading}
        />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedBrand && (
        <EditBrandModal
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedBrand(null);
          }}
          onSubmit={handleEditBrand}
          brand={selectedBrand}
        />
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && selectedBrand && (
        <DeleteConfirmationModal />
      )}
    </div>
  );
};

export default BrandPage;