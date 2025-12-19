import React, { useState, useRef } from "react";
import { FiUpload, FiX, FiImage } from "react-icons/fi";

const AddStoneForm = ({ onClose, onSave, loading = false, stoneTypes = [], stonePurities = [] }) => {
  // DEBUG: Log what we're receiving
  console.log("AddStoneForm - stoneTypes:", stoneTypes);
  console.log("AddStoneForm - stonePurities:", stonePurities);
  
  // ONLY 5 FIELDS
  const [stoneData, setStoneData] = useState({
    stone_name: "",
    stone_type: "",
    stone_purity: "",
    stone_price: "",
  });
  
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate ONLY 5 FIELDS
    if (!stoneData.stone_name.trim()) {
      alert("Please enter stone name");
      return;
    }
    if (!stoneData.stone_type) {
      alert("Please select stone type");
      return;
    }
    if (!stoneData.stone_purity) {
      alert("Please select stone purity");
      return;
    }
    if (!stoneData.stone_price || parseFloat(stoneData.stone_price) <= 0) {
      alert("Please enter a valid price");
      return;
    }

    const dataToSend = {
      stone_name: stoneData.stone_name.trim(),
      stone_type: stoneData.stone_type,
      stone_purity: stoneData.stone_purity,
      stone_price: parseFloat(stoneData.stone_price),
    };

    console.log("Submitting stone with 5 fields:", dataToSend);
    onSave(dataToSend, image);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStoneData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (file) => {
    if (file) {
      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file");
        return;
      }
      
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) handleImageChange(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageChange(files[0]);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClose = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    onClose();
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add New Stone</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Left Column - Stone Details */}
                <div className="col-md-6">
                  {/* Stone Name - Field 1 */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="stone_name"
                      className="form-control"
                      placeholder="e.g., Blue Sapphire, Diamond"
                      value={stoneData.stone_name}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Stone Type Dropdown - Field 2 */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Type <span className="text-danger">*</span>
                    </label>
                    <select
                      name="stone_type"
                      className="form-select"
                      value={stoneData.stone_type}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Stone Type</option>
                      {stoneTypes && stoneTypes.length > 0 ? (
                        stoneTypes.map((type) => (
                          <option key={type._id} value={type.name}>
                            {type.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No types available
                        </option>
                      )}
                    </select>
                    {stoneTypes && stoneTypes.length === 0 && !loading && (
                      <div className="text-danger small mt-1">
                        No stone types available. Please refresh or add a stone first.
                      </div>
                    )}
                  </div>

                  {/* Stone Purity Dropdown - Field 3 */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Purity <span className="text-danger">*</span>
                    </label>
                    <select
                      name="stone_purity"
                      className="form-select"
                      value={stoneData.stone_purity}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    >
                      <option value="">Select Stone Purity</option>
                      {stonePurities && stonePurities.length > 0 ? (
                        stonePurities.map((purity) => (
                          <option key={purity._id} value={purity.name}>
                            {purity.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No purities available
                        </option>
                      )}
                    </select>
                    {stonePurities && stonePurities.length === 0 && !loading && (
                      <div className="text-danger small mt-1">
                        No stone purities available. Please refresh or add a stone first.
                      </div>
                    )}
                  </div>

                  {/* Stone Price - Field 4 */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Price (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="stone_price"
                      className="form-control"
                      placeholder="e.g., 50000"
                      value={stoneData.stone_price}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Right Column - Image Upload */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Image <span className="text-danger">*</span>
                    </label>
                    
                    {imagePreview ? (
                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-thumbnail rounded"
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                            style={{ transform: 'translate(-50%, -50%)' }}
                            disabled={loading}
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                        <p className="text-muted small mt-2">Click or drag to change image</p>
                      </div>
                    ) : (
                      <div
                        className={`border-2 border-dashed rounded-3 p-5 text-center cursor-pointer ${
                          dragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary-subtle'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileInput}
                          accept="image/*"
                          className="d-none"
                          disabled={loading}
                        />
                        
                        <FiImage className="text-secondary mb-3" size={48} />
                        <p className="mb-1">
                          Drop stone image here or{" "}
                          <span className="text-primary">browse</span>
                        </p>
                        <p className="text-secondary small mb-0">
                          Supports JPG, PNG, WEBP • Max 5MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-top pt-3">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary d-flex align-items-center gap-2"
                disabled={loading || !stoneData.stone_name.trim() || !stoneData.stone_type || 
                         !stoneData.stone_purity || !stoneData.stone_price}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Stone
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStoneForm;