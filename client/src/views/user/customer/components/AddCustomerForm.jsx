import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import { Country, State, City } from "country-state-city";

const AddCustomerForm = ({
  onClose,
  onSave,
  loading = false,
  customerGroups = [],
}) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_group_id: "",
    phone: "",
    email: "",
    whatsapp_number: "",
    tax_number: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    status: true,
  });

  const [errors, setErrors] = useState({});
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  // Initialize countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map((country) => ({
      value: country.isoCode,
      label: country.name,
      phoneCode: country.phonecode,
    }));

    setCountries(formattedCountries);

    // Set default country (India)
    const india = formattedCountries.find((c) => c.value === "IN");
    if (india) {
      setFormData((prev) => ({ ...prev, country: india.value }));
    } else if (formattedCountries.length > 0) {
      setFormData((prev) => ({
        ...prev,
        country: formattedCountries[0].value,
      }));
    }

    // Set default customer group if available
    // if (customerGroups.length > 0) {
    //   setFormData(prev => ({
    //     ...prev,
    //     customer_group_id: customerGroups[0]._id
    //   }));
    // }
  },[]);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryStates = State.getStatesOfCountry(formData.country);
      const formattedStates = countryStates.map((state) => ({
        value: state.isoCode,
        label: state.name,
      }));

      setStates(formattedStates);
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
      setCities([]);
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const stateCities = City.getCitiesOfState(
        formData.country,
        formData.state
      );
      const formattedCities = stateCities.map((city) => ({
        value: city.name,
        label: city.name,
      }));

      setCities(formattedCities);
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.country, formData.state]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Customer name is required";
    }

    if (!formData.customer_group_id.trim()) {
      newErrors.customer_group_id = "Customer group is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (
      formData.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (
      formData.whatsapp_number.trim() &&
      !/^\d{10}$/.test(formData.whatsapp_number.trim())
    ) {
      newErrors.whatsapp_number = "WhatsApp number must be 10 digits";
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
    const selectedCountry = countries.find((c) => c.value === formData.country);
    const selectedState = states.find((s) => s.value === formData.state);
    const selectedGroup = customerGroups.find(
      (g) => g._id === formData.customer_group_id
    );

    const payload = {
      customer_name: formData.customer_name.trim(),
      customer_group_id: formData.customer_group_id,
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      whatsapp_number: formData.whatsapp_number.trim(),
      tax_number: formData.tax_number.trim(),
      address: formData.address.trim(),
      country: selectedCountry ? selectedCountry.label : formData.country,
      country_code: formData.country,
      state: selectedState ? selectedState.label : formData.state,
      state_code: formData.state,
      city: formData.city.trim(),
      pincode: formData.pincode.trim(),
      status: formData.status,
    };

    console.log("Submitting customer data:", payload);
    onSave(payload);

    // Reset form
    const resetCountry = countries.find((c) => c.value === "IN")?.value || "";
    const resetGroup = customerGroups.length > 0 ? customerGroups[0]._id : "";

    setFormData({
      customer_name: "",
      customer_group_id: resetGroup,
      phone: "",
      email: "",
      whatsapp_number: "",
      tax_number: "",
      address: "",
      country: resetCountry,
      state: "",
      city: "",
      pincode: "",
      status: true,
    });
    setErrors({});
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
    const resetCountry = countries.find((c) => c.value === "IN")?.value || "";
    const resetGroup = customerGroups.length > 0 ? customerGroups[0]._id : "";

    setFormData({
      customer_name: "",
      customer_group_id: resetGroup,
      phone: "",
      email: "",
      whatsapp_number: "",
      tax_number: "",
      address: "",
      country: resetCountry,
      state: "",
      city: "",
      pincode: "",
      status: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Add Customer</h5>
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
                {/* Customer Name */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Customer Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    className={`form-control form-control-lg ${
                      errors.customer_name ? "is-invalid" : ""
                    }`}
                    placeholder="Enter customer name"
                    value={formData.customer_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.customer_name && (
                    <div className="invalid-feedback">
                      {errors.customer_name}
                    </div>
                  )}
                </div>

                {/* Customer Group */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Customer Group <span className="text-danger">*</span>
                  </label>
                  <select
                    name="customer_group_id"
                    className={`form-control form-control-lg ${
                      errors.customer_group_id ? "is-invalid" : ""
                    }`}
                    value={formData.customer_group_id}
                    onChange={handleChange}
                    disabled={loading || customerGroups.length === 0}
                  >
                    <option value="">Select Customer Group</option>
                    {customerGroups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.customer_group}
                      </option>
                    ))}
                  </select>
                  {errors.customer_group_id && (
                    <div className="invalid-feedback">
                      {errors.customer_group_id}
                    </div>
                  )}
                  {customerGroups.length === 0 && (
                    <div className="form-text text-warning">
                      No customer groups available. Please create customer
                      groups first.
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {countries.find((c) => c.value === formData.country)
                        ?.phoneCode || "+91"}
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
                    <div className="invalid-feedback d-block">
                      {errors.phone}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Email Address</label>
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

                {/* WhatsApp Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    WhatsApp Number
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      {countries.find((c) => c.value === formData.country)
                        ?.phoneCode || "+91"}
                    </span>
                    <input
                      type="tel"
                      name="whatsapp_number"
                      className={`form-control form-control-lg ${
                        errors.whatsapp_number ? "is-invalid" : ""
                      }`}
                      placeholder="Enter WhatsApp number"
                      value={formData.whatsapp_number}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>
                  {errors.whatsapp_number && (
                    <div className="invalid-feedback d-block">
                      {errors.whatsapp_number}
                    </div>
                  )}
                  <div className="form-text">
                    Optional - for WhatsApp communication
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
                  <div className="form-text">10-digit PAN (Optional)</div>
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
                    id="customerStatus"
                    checked={formData.status}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <label
                    className="form-check-label fw-medium"
                    htmlFor="customerStatus"
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
                disabled={loading || customerGroups.length === 0}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Save Customer
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

export default AddCustomerForm;
