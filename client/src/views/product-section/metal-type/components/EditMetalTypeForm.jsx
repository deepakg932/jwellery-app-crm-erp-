import { useState, useEffect, useRef } from "react";
import { Modal, Form, Button, Image, Alert } from "react-bootstrap";
import { FiUpload, FiImage } from "react-icons/fi";

const EditMetalTypeModal = ({ show, onHide, onSubmit, metalType }) => {
  const [metalTypeName, setMetalTypeName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (metalType) {
      setMetalTypeName(metalType.name);
      setImagePreview(metalType.image);
    }
  }, [metalType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!metalTypeName.trim()) {
      setError("Please enter a metal type name");
      return;
    }

    const updatedMetalType = {
      ...metalType,
      name: metalTypeName,
      image: imageFile ? URL.createObjectURL(imageFile) : imagePreview,
    };
    
    onSubmit(updatedMetalType);
  };

  const handleImageChange = (file) => {
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please upload an image file");
        return;
      }
      
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
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

  const handleClose = () => {
    // Clean up object URL if we created one
    if (imageFile && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setError("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h5 fw-bold">Edit Metal Type</Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="pt-0">
        {error && (
          <Alert variant="danger" className="py-2">
            {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          {/* Metal Type Name */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium">
              Metal Type Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={metalTypeName}
              onChange={(e) => {
                setMetalTypeName(e.target.value);
                setError("");
              }}
              required
            />
          </Form.Group>

          {/* Image Upload */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-medium d-block mb-2">
              Metal Type Image
            </Form.Label>
            
            {/* Current Image Preview */}
            {imagePreview ? (
              <div className="mb-3">
                <Image
                  src={imagePreview}
                  rounded
                  className="border"
                  style={{ width: "80px", height: "80px", objectFit: "cover" }}
                />
                <p className="small text-muted mt-1 mb-0">Current image</p>
              </div>
            ) : (
              <div className="mb-3 d-flex align-items-center gap-2">
                <div
                  className="d-flex align-items-center justify-content-center rounded border"
                  style={{ width: "80px", height: "80px" }}
                >
                  <FiImage className="text-muted" size={24} />
                </div>
                <p className="small text-muted mb-0">No image set</p>
              </div>
            )}
            
            {/* Change Image Section */}
            <Form.Label className="fw-medium d-block mb-2">
              Change Image
            </Form.Label>
            <div
              className={`border-2 border-dashed rounded-3 p-4 text-center cursor-pointer ${
                dragActive 
                  ? "border-primary bg-primary bg-opacity-10" 
                  : "border-muted hover:border-primary hover:bg-light"
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
              />
              
              <FiImage className="mb-2 text-muted" size={24} />
              <p className="text-muted small mb-0">
                Drop new image here or browse
              </p>
              <p className="text-muted small">
                Supports JPG, PNG, WEBP • Max 5MB
              </p>
            </div>
          </Form.Group>

          {/* Action Buttons */}
          <div className="d-flex justify-content-end gap-2 pt-3 border-top">
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <FiUpload className="me-2" size={16} />
              Update Metal Type
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditMetalTypeModal;