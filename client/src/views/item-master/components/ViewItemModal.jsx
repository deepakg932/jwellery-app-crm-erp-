import React from "react";
import { FiX, FiImage } from "react-icons/fi";

const ViewItemModal = ({ show, onHide, item, formData = {} }) => {
  if (!show || !item) return null;

  // Helper function to get display name from ID
  const getDisplayName = (id, array) => {
    if (!id || !array || !Array.isArray(array)) return "N/A";
    
    // If ID is already a string name, return it
    if (typeof id === 'string' && !id.match(/^[0-9a-fA-F]{24}$/)) {
      return id;
    }
    
    // Find by ID
    const found = array.find(item => 
      (item.id && item.id.toString() === id.toString()) ||
      (item._id && item._id.toString() === id.toString())
    );
    
    return found ? 
      found.name || 
      found.purity_name || 
      found.stone_purity || 
      found.material_type || 
      found.metal_name || 
      found.stone_type || 
      found.wastage_type || 
      "N/A" : 
      "N/A";
  };

  // Helper to get hallmark name
  const getHallmarkName = (hallmarkData) => {
    if (!hallmarkData) return "N/A";
    
    // If it's an object with name property
    if (typeof hallmarkData === 'object') {
      return hallmarkData.name || "N/A";
    }
    
    // If it's a string ID
    if (typeof hallmarkData === 'string') {
      return getDisplayName(hallmarkData, formData.hallmarks || []);
    }
    
    return "N/A";
  };

  // Get category and subcategory names
  const getCategoryName = (id) => {
    return getDisplayName(id, formData.categories || []);
  };

  const getSubcategoryName = (categoryId, subcategoryId) => {
    if (!subcategoryId) return "N/A";
    
    if (typeof subcategoryId === 'string' && !subcategoryId.match(/^[0-9a-fA-F]{24}$/)) {
      return subcategoryId;
    }
    
    const subcategories = formData.subcategories?.[categoryId] || [];
    return getDisplayName(subcategoryId, subcategories);
  };

  const getBrandName = (id) => {
    return getDisplayName(id, formData.brands || []);
  };

  const getMetalName = (id) => {
    return getDisplayName(id, formData.metals || []);
  };

  const getPurityName = (id) => {
    return getDisplayName(id, formData.purities || []);
  };

  const getUnitName = (id) => {
    return getDisplayName(id, formData.units || []);
  };

  const getStoneName = (id) => {
    return getDisplayName(id, formData.stoneTypes || []);
  };

  const getStonePurityName = (id) => {
    return getDisplayName(id, formData.stonePurities || []);
  };

  const getMaterialName = (id) => {
    return getDisplayName(id, formData.materialTypes || []);
  };

  const getWastageName = (id) => {
    return getDisplayName(id, formData.wastageTypes || []);
  };

  // Calculate totals for display
  const calculateMetalSubtotal = (metal) => {
    const weight = parseFloat(metal.weight) || 0;
    const rate = parseFloat(metal.rate_per_gram) || 0;
    return weight * rate;
  };

  const calculateStoneSubtotal = (stone) => {
    const quantity = parseFloat(stone.quantity) || 0;
    const weight = parseFloat(stone.weight) || 0;
    const price = parseFloat(stone.price_per_carat) || 0;
    return quantity * weight * price;
  };

  const calculateMaterialCost = (material) => {
    const weight = parseFloat(material.weight) || 0;
    const rate = parseFloat(material.rate_per_unit) || 0;
    return weight * rate;
  };

  // Display price making costs if they exist
  const hasPriceMakingCosts = item.price_making_costs && item.price_making_costs.length > 0;
  const totalPriceMakingCosts = hasPriceMakingCosts 
    ? item.price_making_costs.reduce((sum, cost) => sum + (cost.cost_amount || 0), 0)
    : 0;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">
              {item.product_name} - {item.product_code}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onHide}
            ></button>
          </div>

          <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
            {/* Status Badge */}
            <div className="mb-4">
              <span className={`badge bg-${item.status === 'active' ? 'success' : 'secondary'} fs-6`}>
                {item.status || 'Active'}
              </span>
            </div>

            {/* Images */}
            {item.images && item.images.length > 0 ? (
              <div className="row mb-4">
                {item.images.map((img, index) => (
                  <div className="col-md-4 mb-3" key={index}>
                    <div className="border rounded-3" style={{ height: '150px' }}>
                      <img
                        src={img}
                        alt={`Product ${index + 1}`}
                        className="img-fluid h-100 w-100 rounded"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center mb-4 py-4 border rounded bg-light">
                <FiImage className="text-muted mb-2" size={32} />
                <p className="text-muted mb-0">No images available</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="row mb-4">
              <div className="col-md-6">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Basic Information</h6>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Product Name:</div>
                  <div className="col-7">{item.product_name || "N/A"}</div>
                </div>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Product Code:</div>
                  <div className="col-7">
                    <span className="badge bg-light text-dark border">{item.product_code || "N/A"}</span>
                  </div>
                </div>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Brand:</div>
                  <div className="col-7">{item.product_brand || getBrandName(item.product_brand_id?._id) || "N/A"}</div>
                </div>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Markup:</div>
                  <div className="col-7">{item.markup_percentage || 0}%</div>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold mb-3 border-bottom pb-2">Category Information</h6>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Category:</div>
                  <div className="col-7">{item.product_category || getCategoryName(item.product_category_id?._id) || "N/A"}</div>
                </div>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Subcategory:</div>
                  <div className="col-7">
                    {item.product_subcategory || getSubcategoryName(item.product_category_id?._id, item.product_subcategory_id?._id) || "N/A"}
                  </div>
                </div>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Created:</div>
                  <div className="col-7">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() + " " + new Date(item.createdAt).toLocaleTimeString() : "N/A"}
                  </div>
                </div>
                
                <div className="row mb-2">
                  <div className="col-5 fw-medium text-muted">Updated:</div>
                  <div className="col-7">
                    {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() + " " + new Date(item.updatedAt).toLocaleTimeString() : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* GST Details */}
            <div className="card mb-4 border">
              <div className="card-header bg-light">
                <h6 className="mb-0 fw-bold">GST Details</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Total GST</label>
                    <div className="form-control-plaintext border rounded p-2 bg-light">
                      {item.gst_rate || "0%"}
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">CGST Rate</label>
                    <div className="form-control-plaintext border rounded p-2 bg-light">
                      {item.cgst_rate || "0%"}
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">SGST Rate</label>
                    <div className="form-control-plaintext border rounded p-2 bg-light">
                      {item.sgst_rate || "0%"}
                    </div>
                  </div>

                  <div className="col-md-3 mb-3">
                    <label className="form-label">IGST Rate</label>
                    <div className="form-control-plaintext border rounded p-2 bg-light">
                      {item.igst_rate || "0%"}
                    </div>
                  </div>
                  
                  <div className="col-md-3 mb-3">
                    <label className="form-label">UTGST Rate</label>
                    <div className="form-control-plaintext border rounded p-2 bg-light">
                      {item.utgst_rate || "0%"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Metals Table - UPDATED WITH HALLMARK */}
            {item.metals && item.metals.length > 0 && (
              <div className="card mb-4 border">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">Metal Details ({item.metals.length})</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Metal Type</th>
                          <th>Purity</th>
                          <th>Hallmark</th>
                          <th>Weight</th>
                          <th>Unit</th>
                          <th>Rate/Gram</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.metals.map((metal, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{metal.metal_type || getMetalName(metal.metal_id?._id) || "N/A"}</td>
                            <td>{metal.purity || getPurityName(metal.purity_id?._id) || "N/A"}</td>
                            <td>
                              {getHallmarkName(metal.hallmark || metal.hallmark_id)}
                              {metal.hallmark_id && metal.hallmark_id?.certification_number && (
                                <small className="text-muted d-block mt-1">
                                  Cert: {metal.hallmark_id.certification_number}
                                </small>
                              )}
                            </td>
                            <td>{metal.weight || 0}</td>
                            <td>{getUnitName(metal.unit) || metal.unit || "N/A"}</td>
                            <td className="text-end">₹{metal.rate_per_gram?.toFixed(2) || "0.00"}</td>
                            <td className="text-end fw-bold">
                              ₹{calculateMetalSubtotal(metal).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer text-end fw-bold">
                    Total Metals Cost: ₹{item.total_metals_cost?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            )}

            {/* Price Making Costs Table - ADDED */}
            {hasPriceMakingCosts && (
              <div className="card mb-4 border">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">Price Making Costs ({item.price_making_costs.length})</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Stage</th>
                          <th>Sub Stage</th>
                          <th>Cost Type</th>
                          <th>Unit</th>
                          <th>Cost Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.price_making_costs.map((cost, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{cost.stage_name || "N/A"}</td>
                            <td>{cost.sub_stage_name || "N/A"}</td>
                            <td>{cost.cost_type || "N/A"}</td>
                            <td>{cost.unit_name || "N/A"}</td>
                            <td className="text-end fw-bold">₹{cost.cost_amount?.toFixed(2) || "0.00"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer text-end fw-bold">
                    Total Making Charges: ₹{totalPriceMakingCosts.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Stones Table */}
            {item.stones && item.stones.length > 0 && (
              <div className="card mb-4 border">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">Stone Details ({item.stones.length})</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Stone Type</th>
                          <th>Stone Purity</th>
                          <th>Size (mm)</th>
                          <th>Quantity</th>
                          <th>Weight (Ct)</th>
                          <th>Price/Ct</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.stones.map((stone, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{stone.stone_type || getStoneName(stone.stone_id) || "N/A"}</td>
                            <td>{stone.stone_purity || getStonePurityName(stone.stone_purity_id) || "N/A"}</td>
                            <td>{stone.size || 0}</td>
                            <td>{stone.quantity || 0}</td>
                            <td>{stone.weight || 0}</td>
                            <td className="text-end">₹{stone.price_per_carat?.toFixed(2) || "0.00"}</td>
                            <td className="text-end fw-bold">
                              ₹{calculateStoneSubtotal(stone).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer text-end fw-bold">
                    Total Stones Cost: ₹{item.total_stones_cost?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            )}

            {/* Materials & Wastage Table */}
            {item.materials && item.materials.length > 0 && (
              <div className="card mb-4 border">
                <div className="card-header bg-light">
                  <h6 className="mb-0 fw-bold">Materials & Wastage ({item.materials.length})</h6>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-bordered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Wastage Type</th>
                          <th>Material Type</th>
                          <th>Weight</th>
                          <th>Unit</th>
                          <th>Rate/Unit</th>
                          <th>Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.materials.map((material, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{material.wastage_type || getWastageName(material.wastage_id?._id) || "N/A"}</td>
                            <td>{material.material_type || getMaterialName(material.material_id?._id) || "N/A"}</td>
                            <td>{material.weight || 0}</td>
                            <td>{material.unit || "N/A"}</td>
                            <td className="text-end">₹{material.rate_per_unit?.toFixed(2) || "0.00"}</td>
                            <td className="text-end fw-bold">
                              ₹{calculateMaterialCost(material).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="card-footer text-end fw-bold">
                    Total Materials & Wastage Cost: ₹{item.total_materials_cost?.toFixed(2) || "0.00"}
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary - UPDATED WITH PRICE MAKING COSTS */}
            <div className="card mb-4 border">
              <div className="card-header bg-light">
                <h6 className="mb-0 fw-bold">Price Summary with GST</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <table className="table table-borderless">
                      <tbody>
                        {item.total_metals_cost > 0 && (
                          <tr>
                            <td className="fw-bold">Total Metals Cost:</td>
                            <td className="text-end">₹{item.total_metals_cost?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}
                        
                        {totalPriceMakingCosts > 0 && (
                          <>
                            <tr className="border-top">
                              <td colSpan="2" className="fw-bold pt-3">
                                Making Charges:
                              </td>
                            </tr>
                            {item.price_making_costs.map((cost, index) => (
                              <tr key={index}>
                                <td className="ps-3">• {cost.cost_type || "Charge"}</td>
                                <td className="text-end">₹{cost.cost_amount?.toFixed(2) || "0.00"}</td>
                              </tr>
                            ))}
                            <tr className="border-top">
                              <td className="fw-bold">Total Making Charges:</td>
                              <td className="text-end fw-bold">₹{totalPriceMakingCosts.toFixed(2)}</td>
                            </tr>
                          </>
                        )}
                        
                        {item.total_stones_cost > 0 && (
                          <tr>
                            <td className="fw-bold">Total Stones Cost:</td>
                            <td className="text-end">₹{item.total_stones_cost?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}
                        
                        {item.total_materials_cost > 0 && (
                          <tr>
                            <td className="fw-bold">Total Materials & Wastage Cost:</td>
                            <td className="text-end">₹{item.total_materials_cost?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}

                        {/* Base Total (before making charges) */}
                        <tr className="border-top">
                          <td className="fw-bold">Base Total (Before Making Charge):</td>
                          <td className="text-end">
                            ₹{(
                              (item.total_metals_cost || 0) + 
                              (item.total_stones_cost || 0) + 
                              (item.total_materials_cost || 0)
                            ).toFixed(2)}
                          </td>
                        </tr>

                        <tr className="border-top">
                          <td className="fw-bold">Grand Total (Before Markup):</td>
                          <td className="text-end fw-bold">₹{item.grand_total?.toFixed(2) || "0.00"}</td>
                        </tr>
                        
                        <tr>
                          <td className="fw-bold">Markup ({item.markup_percentage || 0}%):</td>
                          <td className="text-end">
                            ₹{((item.grand_total || 0) * ((item.markup_percentage || 0) / 100)).toFixed(2)}
                          </td>
                        </tr>
                        
                        <tr className="border-top">
                          <td className="fw-bold fs-5">Selling Price (Before Tax):</td>
                          <td className="text-end fs-5 fw-bold">
                            ₹{item.selling_price_before_tax?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="col-md-6">
                    <table className="table table-borderless">
                      <tbody>
                        {item.cgst_amount > 0 && (
                          <tr>
                            <td className="fw-bold">CGST ({item.cgst_rate}%):</td>
                            <td className="text-end">₹{item.cgst_amount?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}
                        
                        {item.sgst_amount > 0 && (
                          <tr>
                            <td className="fw-bold">SGST ({item.sgst_rate}%):</td>
                            <td className="text-end">₹{item.sgst_amount?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}
                        
                        {item.igst_amount > 0 && (
                          <tr>
                            <td className="fw-bold">IGST ({item.igst_rate}%):</td>
                            <td className="text-end">₹{item.igst_amount?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}
                        
                        {item.utgst_amount > 0 && (
                          <tr>
                            <td className="fw-bold">UTGST ({item.utgst_rate}%):</td>
                            <td className="text-end">₹{item.utgst_amount?.toFixed(2) || "0.00"}</td>
                          </tr>
                        )}

                        <tr className="border-top">
                          <td className="fw-bold">Total GST ({item.gst_rate}):</td>
                          <td className="text-end">₹{item.gst_amount?.toFixed(2) || "0.00"}</td>
                        </tr>

                        <tr className="border-top">
                          <td className="fw-bold fs-5 text-success">Final Selling Price (With GST):</td>
                          <td className="text-end fs-5 fw-bold text-success">
                            ₹{item.selling_price_with_gst?.toFixed(2) || "0.00"}
                          </td>
                        </tr>
                        
                        {/* Additional calculated fields if they exist */}
                        {item.base_total && (
                          <tr>
                            <td className="fw-bold">Base Total:</td>
                            <td className="text-end">₹{item.base_total.toFixed(2)}</td>
                          </tr>
                        )}
                        
                        {item.total_price_making_costs && (
                          <tr>
                            <td className="fw-bold">Price Making Costs Total:</td>
                            <td className="text-end">₹{item.total_price_making_costs.toFixed(2)}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onHide}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewItemModal;