// InventoryMovementsTable.jsx
import React, { useState, useEffect } from "react";
import {
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiCalendar,
  FiPackage,
  FiArrowRight,
  FiArrowLeft,
  FiTrendingUp,
  FiTrendingDown,
  FiArchive,
  FiTruck,
  FiShoppingBag,
  FiSettings,
} from "react-icons/fi";
import useInventoryMovements from "@/hooks/useInventoryMovements";

const InventoryMovementsTable = () => {
  const { movements, loading, error, fetchMovements } = useInventoryMovements();
  
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    movementType: "",
    itemId: "",
    fromLocation: "",
    toLocation: ""
  });

  // Filter movements
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
      movement.item?.sku_code?.toLowerCase().includes(search.toLowerCase()) ||
      movement.reference_number?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilters = 
      (!filters.dateFrom || new Date(movement.date) >= new Date(filters.dateFrom)) &&
      (!filters.dateTo || new Date(movement.date) <= new Date(filters.dateTo)) &&
      (!filters.movementType || movement.movement_type === filters.movementType) &&
      (!filters.itemId || movement.item_id === filters.itemId) &&
      (!filters.fromLocation || movement.from_location_id === filters.fromLocation) &&
      (!filters.toLocation || movement.to_location_id === filters.toLocation);
    
    return matchesSearch && matchesFilters;
  });

  // Format movement type badge
  const getMovementTypeBadge = (type) => {
    const types = {
      'stock_in': { color: 'success', icon: <FiTrendingUp />, label: 'Stock In' },
      'stock_out': { color: 'danger', icon: <FiTrendingDown />, label: 'Stock Out' },
      'transfer': { color: 'primary', icon: <FiArrowRight />, label: 'Transfer' },
      'adjustment': { color: 'warning', icon: <FiSettings />, label: 'Adjustment' },
      'production': { color: 'info', icon: <FiPackage />, label: 'Production' },
      'consumption': { color: 'secondary', icon: <FiArchive />, label: 'Consumption' }
    };
    
    const config = types[type] || { color: 'secondary', icon: null, label: type };
    
    return (
      <span className={`badge bg-${config.color} d-flex align-items-center gap-1`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Get reference document link
  const getReferenceLink = (movement) => {
    if (!movement.reference_type) return movement.reference_number || 'N/A';
    
    const references = {
      'GRN': `/grn/${movement.reference_id}`,
      'SALES': `/sales/${movement.reference_id}`,
      'TRANSFER': `/transfers/${movement.reference_id}`,
      'PRODUCTION': `/production/${movement.reference_id}`
    };
    
    const link = references[movement.reference_type];
    if (link) {
      return (
        <a href={link} className="text-decoration-none">
          <span className="badge bg-light text-dark">
            {movement.reference_type}: {movement.reference_number}
          </span>
        </a>
      );
    }
    
    return (
      <span className="badge bg-light text-dark">
        {movement.reference_type}: {movement.reference_number}
      </span>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* HEADER */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center mb-4">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-2">
                <FiTruck className="me-2" />
                Inventory Movements
              </h1>
              <p className="text-muted mb-0">
                Complete audit trail of all stock changes and transfers
              </p>
            </div>
            <div className="col-md-6 d-flex justify-content-end">
              <button className="btn btn-outline-secondary d-flex align-items-center gap-2">
                <FiRefreshCw />
                Refresh
              </button>
            </div>
          </div>

          {/* FILTERS */}
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FiSearch />
                </span>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Search items, SKU, or reference..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="col-md-8">
              <div className="row g-2">
                <div className="col">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder="From Date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  />
                </div>
                <div className="col">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    placeholder="To Date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  />
                </div>
                <div className="col">
                  <select 
                    className="form-select form-select-sm"
                    value={filters.movementType}
                    onChange={(e) => setFilters({...filters, movementType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="stock_in">Stock In</option>
                    <option value="stock_out">Stock Out</option>
                    <option value="transfer">Transfer</option>
                    <option value="adjustment">Adjustment</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card border-0 shadow-sm">
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>#</th>
                <th>
                  <FiPackage className="me-1" />
                  Item
                </th>
                <th>Movement Type</th>
                <th>
                  <FiArrowLeft className="me-1" />
                  From Location
                </th>
                <th>
                  <FiArrowRight className="me-1" />
                  To Location
                </th>
                <th>Qty / Weight</th>
                <th>Reference</th>
                <th>
                  <FiCalendar className="me-1" />
                  Date
                </th>
              </tr>
            </thead>
            
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredMovements.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No movements found
                  </td>
                </tr>
              ) : (
                filteredMovements.map((movement, index) => (
                  <tr key={movement._id}>
                    <td>{index + 1}</td>
                    
                    {/* ITEM */}
                    <td>
                      <div className="fw-medium">
                        {movement.item?.name || movement.item?.item_name || 'Unknown'}
                      </div>
                      <div className="text-muted small">
                        SKU: {movement.item?.sku_code || 'N/A'} | 
                        Track by: {movement.item?.track_by || 'quantity'}
                      </div>
                    </td>
                    
                    {/* MOVEMENT TYPE */}
                    <td>
                      {getMovementTypeBadge(movement.movement_type)}
                    </td>
                    
                    {/* FROM LOCATION */}
                    <td>
                      {movement.from_location ? (
                        <div>
                          <span className="fw-medium">
                            {movement.from_location.name || movement.from_location.branch_name}
                          </span>
                          <div className="text-muted small">
                            {movement.from_location.type || 'Location'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    
                    {/* TO LOCATION */}
                    <td>
                      {movement.to_location ? (
                        <div>
                          <span className="fw-medium">
                            {movement.to_location.name || movement.to_location.branch_name}
                          </span>
                          <div className="text-muted small">
                            {movement.to_location.type || 'Location'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    
                    {/* QTY / WEIGHT */}
                    <td>
                      {movement.item?.track_by === 'weight' ? (
                        <div>
                          <span className="fw-bold text-warning">
                            {movement.weight?.toFixed(3)} g
                          </span>
                          {movement.cost_per_unit && (
                            <div className="text-muted small">
                              ₹{movement.cost_per_unit}/g
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="fw-bold text-primary">
                            {movement.quantity?.toLocaleString()}
                          </span>
                          {movement.cost_per_unit && (
                            <div className="text-muted small">
                              ₹{movement.cost_per_unit}/unit
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    
                    {/* REFERENCE */}
                    <td>
                      {getReferenceLink(movement)}
                      {movement.remarks && (
                        <div className="text-muted small mt-1">
                          {movement.remarks}
                        </div>
                      )}
                    </td>
                    
                    {/* DATE */}
                    <td>
                      <span className="badge bg-light text-dark">
                        <FiCalendar className="me-1" size={12} />
                        {new Date(movement.date).toLocaleDateString()}
                      </span>
                      <div className="text-muted small">
                        {new Date(movement.date).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryMovementsTable;