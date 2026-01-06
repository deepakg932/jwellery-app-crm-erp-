import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import { Country, State, City } from "country-state-city";

const EditSupplierForm = ({ 
  onClose, 
  onSave, 
  supplier, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    supplier_name: "",
    supplier_code: "",
    contact_person: "",
    payment_terms: "Net 30 days",
    payment_type: "bank_transfer",
    tax_number: "",
    gst_number: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    phone: "",
    email: "",
    address: "",
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Initialize countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map(country => ({
      value: country.isoCode,
      label: country.name,
      phoneCode: country.phonecode
    }));
    
    setCountries(formattedCountries);
  }, []);

  // Load supplier data when component mounts or supplier changes
  useEffect(() => {
    if (supplier) {
      const countryCode = supplier.country_code || "";
      const stateCode = supplier.state_code || "";
      
      setFormData({
        supplier_name: supplier.supplier_name || "",
        supplier_code: supplier.supplier_code || "",
        contact_person: supplier.contact_person || "",
        payment_terms: supplier.payment_terms || "Net 30 days",
        payment_type: supplier.payment_type || "bank_transfer",
        tax_number: supplier.tax_number || "",
        gst_number: supplier.gst_number || "",
        country: countryCode,
        state: stateCode,
        city: supplier.city || "",
        pincode: supplier.pincode || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        status: supplier.status !== false,
      });

      // Load states for the supplier's country
      if (countryCode) {
        const countryStates = State.getStatesOfCountry(countryCode);
        const formattedStates = countryStates.map(state => ({
          value: state.isoCode,
          label: state.name
        }));
        setStates(formattedStates);
      }

      // Load cities for the supplier's state
      if (countryCode && stateCode) {
        const stateCities = City.getCitiesOfState(countryCode, stateCode);
        const formattedCities = stateCities.map(city => ({
          value: city.name,
          label: city.name
        }));
        setCities(formattedCities);
      }

      setErrors({});
    }
  }, [supplier]);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      const formattedStates = countryStates.map(state => ({
        value: state.isoCode,
        label: state.name
      }));
      
      setStates(formattedStates);
      // Only reset state if it's not the same as the current one
      if (formData.state && !formattedStates.find(s => s.value === formData.state)) {
        setFormData(prev => ({ ...prev, state: "", city: "" }));
      }
      setCities([]);
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const stateCities = City.getCitiesOfState(formData.country, formData.state);
      const formattedCities = stateCities.map(city => ({
        value: city.name,
        label: city.name
      }));
      
      setCities(formattedCities);
      // Only reset city if it's not in the new city list
      if (formData.city && !formattedCities.find(c => c.value === formData.city)) {
        setFormData(prev => ({ ...prev, city: "" }));
      }
    }
  }, [formData.country, formData.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplier_name.trim()) {
      newErrors.supplier_name = "Supplier name is required";
    }

    if (!formData.supplier_code.trim()) {
      newErrors.supplier_code = "Supplier code is required";
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = "Contact person is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Get country and state names from their codes
    const selectedCountry = countries.find(c => c.value === formData.country);
    const selectedState = states.find(s => s.value === formData.state);
    
    const payload = {
      id: supplier?.id, // Include the supplier ID for updating
      supplier_name: formData.supplier_name.trim(),
      supplier_code: formData.supplier_code.trim(),
      contact_person: formData.contact_person.trim(),
      payment_terms: formData.payment_terms,
      payment_type: formData.payment_type,
      tax_number: formData.tax_number.trim(),
      gst_number: formData.gst_number.trim(),
      country: selectedCountry ? selectedCountry.label : formData.country,
      country_code: formData.country,
      state: selectedState ? selectedState.label : formData.state,
      state_code: formData.state,
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      status: formData.status,
    };

    console.log("Updating supplier data:", payload);
    onSave(payload);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Edit Supplier</h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={loading}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row">
                {/* Supplier Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplier_name"
                    className={`form-control form-control-lg ${
                      errors.supplier_name ? "is-invalid" : ""
                    }`}
                    placeholder="Enter supplier name"
                    value={formData.supplier_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.supplier_name && (
                    <div className="invalid-feedback">
                      {errors.supplier_name}
                    </div>
                  )}
                </div>

                {/* Supplier Code */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Supplier Code <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="supplier_code"
                    className={`form-control form-control-lg ${
                      errors.supplier_code ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., SUP0001"
                    value={formData.supplier_code}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.supplier_code && (
                    <div className="invalid-feedback">
                      {errors.supplier_code}
                    </div>
                  )}
                  <div className="form-text">
                    Unique code for the supplier
                  </div>
                </div>

                {/* Contact Person */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Contact Person <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="contact_person"
                    className={`form-control form-control-lg ${
                      errors.contact_person ? "is-invalid" : ""
                    }`}
                    placeholder="Enter contact person name"
                    value={formData.contact_person}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.contact_person && (
                    <div className="invalid-feedback">
                      {errors.contact_person}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`form-control form-control-lg ${
                      errors.email ? "is-invalid" : ""
                    }`}
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.email && (
                    <div className="invalid-feedback">{errors.email}</div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {countries.find(c => c.value === formData.country)?.phoneCode || "+91"}
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      className={`form-control form-control-lg ${
                        errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.phone && (
                    <div className="invalid-feedback d-block">{errors.phone}</div>
                  )}
                </div>

                {/* Payment Terms */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Payment Terms
                  </label>
                  <select
                    name="payment_terms"
                    className="form-control form-control-lg"
                    value={formData.payment_terms}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="Net 30 days">Net 30 days</option>
                    <option value="Net 45 days">Net 45 days</option>
                    <option value="Net 60 days">Net 60 days</option>
                    <option value="COD">COD</option>
                    <option value="Advance">Advance</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                {/* Payment Type */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Payment Type
                  </label>
                  <select
                    name="payment_type"
                    className="form-control form-control-lg"
                    value={formData.payment_type}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>

                {/* GST Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gst_number"
                    className="form-control form-control-lg"
                    placeholder="e.g., 23ABCDE1234F1Z5"
                    value={formData.gst_number}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="form-text">
                    15-digit GSTIN (Optional)
                  </div>
                </div>

                {/* Tax Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Tax Number (PAN)
                  </label>
                  <input
                    type="text"
                    name="tax_number"
                    className="form-control form-control-lg"
                    placeholder="e.g., ABCDE1234F"
                    value={formData.tax_number}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="form-text">
                    10-digit PAN (Optional)
                  </div>
                </div>

                {/* Address */}
                <div className="col-12 mb-3">
                  <label className="form-label fw-medium">
                    Address <span className="text-danger">*</span>
                  </label>
                  <textarea
                    name="address"
                    className={`form-control form-control-lg ${
                      errors.address ? "is-invalid" : ""
                    }`}
                    placeholder="Enter complete address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    rows="2"
                  />
                  {errors.address && (
                    <div className="invalid-feedback">{errors.address}</div>
                  )}
                </div>

                {/* Country */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Country <span className="text-danger">*</span>
                  </label>
                  <select
                    name="country"
                    className={`form-control form-control-lg ${
                      errors.country ? "is-invalid" : ""
                    }`}
                    value={formData.country}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <div className="invalid-feedback">{errors.country}</div>
                  )}
                </div>

                {/* State */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    State <span className="text-danger">*</span>
                  </label>
                  <select
                    name="state"
                    className={`form-control form-control-lg ${
                      errors.state ? "is-invalid" : ""
                    }`}
                    value={formData.state}
                    onChange={handleChange}
                    disabled={loading || !formData.country}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <div className="invalid-feedback">{errors.state}</div>
                  )}
                </div>

                {/* City */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    City <span className="text-danger">*</span>
                  </label>
                  {cities.length > 0 ? (
                    <select
                      name="city"
                      className={`form-control form-control-lg ${
                        errors.city ? "is-invalid" : ""
                      }`}
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading || !formData.state}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      name="city"
                      className={`form-control form-control-lg ${
                        errors.city ? "is-invalid" : ""
                      }`}
                      placeholder="Enter city name"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  )}
                  {errors.city && (
                    <div className="invalid-feedback">{errors.city}</div>
                  )}
                </div>

                {/* Pincode */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Pincode <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    className={`form-control form-control-lg ${
                      errors.pincode ? "is-invalid" : ""
                    }`}
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength="6"
                  />
                  {errors.pincode && (
                    <div className="invalid-feedback">{errors.pincode}</div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    name="status"
                    id="supplierStatus"
                    checked={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label fw-medium"
                    htmlFor="supplierStatus"
                  >
                    Status (Active/Inactive)
                  </label>
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
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Supplier
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

export default EditSupplierForm;