import React, { useState, useEffect } from "react";
import { FiUpload } from "react-icons/fi";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";
import { FiUser, FiCamera } from "react-icons/fi";

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
    aadhar_number: "",
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
  const [imagePreview, setImagePreview] = useState(null);

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
  }, []);

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
        formData.state,
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

    if (!formData.aadhar_number.trim()) {
      newErrors.aadhar_number = "aadhar number is required";
    } else if (!/^\d{12}$/.test(formData.aadhar_number.trim())) {
      newErrors.aadhar_number = "aadhar number must be 12 digits";
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

    // Show only the first error as a toast (optional)
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          image: "Image size should be less than 5MB",
        }));
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload an image file",
        }));
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));

      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const toastId = toast.loading("");

    try {
      // Create FormData for image upload - use a different variable name
      const formDataToSend = new FormData();

      // Append all form fields from the STATE formData (not the FormData object)
      formDataToSend.append("name", formData.customer_name);
      formDataToSend.append("customer_group_id", formData.customer_group_id);
      formDataToSend.append("mobile", formData.phone);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("whatsapp_number", formData.whatsapp_number);
      formDataToSend.append("aadhar_number", formData.aadhar_number);
      formDataToSend.append("tax_number", formData.tax_number);
      formDataToSend.append("address", formData.address);

      // Find country and state names for display
      const selectedCountry = countries.find(
        (c) => c.value === formData.country,
      );
      const selectedState = states.find((s) => s.value === formData.state);

      formDataToSend.append(
        "country",
        selectedCountry ? selectedCountry.label : formData.country,
      );
      formDataToSend.append("country_code", formData.country);
      formDataToSend.append(
        "state",
        selectedState ? selectedState.label : formData.state,
      );
      formDataToSend.append("state_code", formData.state);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("pincode", formData.pincode);
      formDataToSend.append("status", formData.status ? "active" : "inactive");

      // Append image if selected
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      // Debug logs to check the data being sent
      console.log("Form data from state:", {
        name: formData.customer_name,
        customer_group_id: formData.customer_group_id,
        mobile: formData.phone,
        email: formData.email,
        whatsapp_number: formData.whatsapp_number,
        aadhar_number: formData.aadhar_number,
        tax_number: formData.tax_number,
        address: formData.address,
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        status: formData.status ? "active" : "inactive",
        hasImage: formData.image ? "Yes" : "No",
      });

      // Log FormData entries to verify
      console.log("FormData entries being sent:");
      for (let pair of formDataToSend.entries()) {
        if (pair[0] === "image") {
          console.log(
            pair[0] +
              ": [File: " +
              pair[1].name +
              ", size: " +
              pair[1].size +
              " bytes]",
          );
        } else {
          console.log(pair[0] + ": " + pair[1]);
        }
      }

      await onSave(formDataToSend);

      // Success case - update toast and close modal
      toast.update(toastId, {
        render: "Customer saved successfully!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

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
        aadhar_number: "",
        address: "",
        country: resetCountry,
        state: "",
        city: "",
        pincode: "",
        image: null,
        status: true,
      });
      setImagePreview(null);
      setErrors({});

      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);

      toast.update(toastId, {
        render:
          error.response?.data?.message ||
          "Failed to save customer. Please try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });

      if (
        error.response?.data?.message ===
        "Customer with this phone already exists"
      ) {
        setErrors((prev) => ({
          ...prev,
          phone: "This phone number is already registered",
        }));
      }
    }
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
      aadhar_number: "",
      address: "",
      country: resetCountry,
      state: "",
      city: "",
      pincode: "",
      image: null,
      status: true,
    });
    setImagePreview(null);
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
                <div className="col-12 mb-4">
                  <div className="d-flex flex-column align-items-center">
                    <div className="position-relative mb-3">
                      <div
                        className="rounded-circle border border-3 border-primary p-1"
                        style={{ width: "120px", height: "120px" }}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Customer Preview"
                            className="rounded-circle w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="w-100 h-100 rounded-circle bg-light d-flex align-items-center justify-content-center">
                            <FiUser size={48} className="text-muted" />
                          </div>
                        )}
                      </div>
                      <label
                        htmlFor="customerImageUpload"
                        className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 cursor-pointer"
                        style={{ width: "40px", height: "40px" }}
                      >
                        <FiCamera size={20} />
                        <input
                          type="file"
                          id="customerImageUpload"
                          className="d-none"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={loading}
                        />
                      </label>
                    </div>
                    <p className="text-muted small mb-0">
                      Upload customer photo (Max 5MB)
                    </p>
                    {errors.image && (
                      <div className="text-danger small mt-1">
                        {errors.image}
                      </div>
                    )}
                  </div>
                </div>

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

                {/* Aadhar Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Aadhar Number</label>
                  <input
                    type="tel"
                    name="aadhar_number"
                    className={`form-control form-control-lg
                     ${errors.aadhar_number ? "is-invalid" : ""}`}
                    placeholder="e.g., 456335223985"
                    value={formData.aadhar_number}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="form-text">12-digit adhar (Optional)</div>
                  {errors.aadhar_number && (
                    <div className="invalid-feedback">
                      {errors.aadhar_number}
                    </div>
                  )}
                </div>
                {/* Tax Number */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">Tax Number</label>
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
