import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiUpload, FiImage, FiX } from "react-icons/fi";

const EditStoneForm = ({ 
  show, 
  onHide, 
  onSubmit, 
  stone, 
  loading = false,
  stoneTypes = [], 
  stonePurities = [] 
}) => {
  // DEBUG
  console.log("EditStoneForm - stoneTypes:", stoneTypes);
  console.log("EditStoneForm - stonePurities:", stonePurities);
  console.log("EditStoneForm - stone:", stone);
  
  // ONLY 5 FIELDS
  const [stoneData, setStoneData] = useState({
    stone_name: "",
    stone_type: "",
    stone_purity: "",
    stone_price: "",
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Set initial values
  useEffect(() => {
    if (stone) {
      console.log("Setting stone data:", stone);
      setStoneData({
        stone_name: stone.stone_name || "",
        stone_type: stone.stone_type || "",
        stone_purity: stone.stone_purity || "",
        stone_price: stone.stone_price || "",
      });
      
      // Set image preview if exists
      if (stone.stone_image) {
        setImagePreview(stone.stone_image);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
    }
  }, [stone]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  const handleSubmit = useCallback(async (e) => {
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

    console.log("Updating stone with 5 fields:", dataToSend);
    await onSubmit(dataToSend, imageFile);
  }, [stoneData, imageFile, onSubmit]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setStoneData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleImageChange = useCallback((file) => {
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
      
      // Clean up previous blob URL
      if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  }, [imageFile, imagePreview]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) handleImageChange(file);
  }, [handleImageChange]);

  const removeImage = useCallback(() => {
    if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(stone?.stone_image || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [imageFile, imagePreview, stone]);

  const handleClose = useCallback(() => {
    if (imageFile && imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    onHide();
  }, [imageFile, imagePreview, onHide]);

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Stone</h5>
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
                  {/* Stone Name */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="stone_name"
                      className="form-control"
                      value={stoneData.stone_name}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Stone Type Dropdown */}
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
                  </div>

                  {/* Stone Purity Dropdown */}
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
                  </div>

                  {/* Stone Price */}
                  <div className="mb-3">
                    <label className="form-label fw-medium">
                      Stone Price (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      name="stone_price"
                      className="form-control"
                      value={stoneData.stone_price}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Right Column - Image */}
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-medium">Stone Image</label>
                    
                    {imagePreview ? (
                      <div className="text-center">
                        <div className="position-relative d-inline-block">
                          <img
                            src={imagePreview.startsWith('blob:') ? imagePreview : `https://cvhjrjvd-5000.inc1.devtunnels.ms${imagePreview}`}
                            alt="Preview"
                            className="img-thumbnail rounded border"
                            style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              const parent = e.target.parentElement;
                              const placeholder = document.createElement('div');
                              placeholder.className = 'd-flex align-items-center justify-content-center rounded border mx-auto';
                              placeholder.style.width = '200px';
                              placeholder.style.height = '200px';
                              placeholder.innerHTML = '<FiImage class="text-muted" size={40} />';
                              parent.appendChild(placeholder);
                            }}
                          />
                          {imageFile && (
                            <button
                              type="button"
                              onClick={removeImage}
                              className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle p-1"
                              style={{ transform: 'translate(-50%, -50%)' }}
                              disabled={loading}
                            >
                              <FiX size={12} />
                            </button>
                          )}
                        </div>
                        <p className="small text-muted mt-2 mb-0">
                          {imageFile ? "New image selected" : "Current image"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="d-flex align-items-center justify-content-center rounded border mx-auto"
                          style={{ width: '200px', height: '200px' }}>
                          <FiImage className="text-muted" size={40} />
                        </div>
                        <p className="small text-muted mt-2 mb-0">No image set</p>
                      </div>
                    )}
                    
                    {/* Change Image Section */}
                    <label className="form-label fw-medium d-block mb-2 mt-3">
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </label>
                    <div
                      className="border-2 border-dashed border-muted rounded-3 text-center cursor-pointer hover:border-primary hover:bg-light"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ padding: '15px' }}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInput}
                        accept="image/*"
                        className="d-none"
                        disabled={loading}
                      />
                      
                      <FiImage className="mb-2 text-muted" size={24} />
                      <p className="text-muted small mb-0">
                        Drop new image here or browse
                      </p>
                      <p className="text-muted small">
                        Supports JPG, PNG, WEBP • Max 5MB
                      </p>
                    </div>
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Stone
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

export default EditStoneForm;