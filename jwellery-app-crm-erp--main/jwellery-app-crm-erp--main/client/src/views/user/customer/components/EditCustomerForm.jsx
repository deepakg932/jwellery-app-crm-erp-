import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { toast } from "react-toastify";
import { FiUpload, FiUser, FiCamera } from "react-icons/fi";

const EditCustomerForm = ({
  onClose,
  onSave,
  customer,
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
    aadhar_number: "",
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

  // Initialize countries on component mount - use names as values
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    const formattedCountries = allCountries.map((country) => ({
      value: country.name,
      label: country.name,
      isoCode: country.isoCode,
      phoneCode: country.phonecode,
    }));
    setCountries(formattedCountries);
  }, []);

  // Load customer data when component mounts or customer changes
  useEffect(() => {
    if (customer) {
      console.log("Customer data received in EditCustomerForm:", customer);

      // Find customer group ID
      let groupId = "";
      if (customer.customer_group_id) {
        if (
          typeof customer.customer_group_id === "object" &&
          customer.customer_group_id._id
        ) {
          groupId = customer.customer_group_id._id;
        } else if (typeof customer.customer_group_id === "string") {
          groupId = customer.customer_group_id;
        }
      }

      const customerName = customer.name || customer.customer_name || "";
      const customerPhone = customer.mobile || customer.phone || "";

      setFormData({
      customer_name: customerName,
      customer_group_id: groupId,
      phone: customerPhone,
      email: customer.email || "",
      whatsapp_number: customer.whatsapp_number || "",
      tax_number: customer.tax_number || "",
      aadhar_number: customer.aadhar_number || "",
      address: customer.address || "",
      country: customer.country || "India",
      state: customer.state || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      image: null, // Don't set the file here, just the preview
      status: customer.status === true || customer.status === "active",
    });

     if (customer.image_url) {
      setImagePreview(customer.image_url);
    }
      // Load states for the customer's country
      if (customer.country) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === customer.country,
        );

        if (countryObj) {
          const countryStates = State.getStatesOfCountry(countryObj.isoCode);
          const formattedStates = countryStates.map((state) => ({
            value: state.name,
            label: state.name,
          }));
          setStates(formattedStates);
        }
      }

      // Load cities for the customer's state
      if (customer.country && customer.state) {
        const countryObj = Country.getAllCountries().find(
          (c) => c.name === customer.country,
        );

        if (countryObj) {
          const stateObj = State.getStatesOfCountry(countryObj.isoCode).find(
            (s) => s.name === customer.state,
          );

          if (stateObj) {
            const stateCities = City.getCitiesOfState(
              countryObj.isoCode,
              stateObj.isoCode,
            );
            const formattedCities = stateCities.map((city) => ({
              value: city.name,
              label: city.name,
            }));
            setCities(formattedCities);
          }
        }
      }

      setErrors({});
    }
  }, [customer]);

  // Update states when country changes
  useEffect(() => {
    if (formData.country) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === formData.country,
      );

      if (countryObj) {
        const countryStates = State.getStatesOfCountry(countryObj.isoCode);
        const formattedStates = countryStates.map((state) => ({
          value: state.name,
          label: state.name,
        }));

        setStates(formattedStates);
        // Only reset state if it's not the same as the current one
        if (
          formData.state &&
          !formattedStates.find((s) => s.value === formData.state)
        ) {
          setFormData((prev) => ({ ...prev, state: "", city: "" }));
        }
        setCities([]);
      }
    }
  }, [formData.country]);

  // Update cities when state changes
  useEffect(() => {
    if (formData.country && formData.state) {
      const countryObj = Country.getAllCountries().find(
        (c) => c.name === formData.country,
      );

      if (countryObj) {
        const stateObj = State.getStatesOfCountry(countryObj.isoCode).find(
          (s) => s.name === formData.state,
        );

        if (stateObj) {
          const stateCities = City.getCitiesOfState(
            countryObj.isoCode,
            stateObj.isoCode,
          );
          const formattedCities = stateCities.map((city) => ({
            value: city.name,
            label: city.name,
          }));

          setCities(formattedCities);
          // Only reset city if it's not in the new city list
          if (
            formData.city &&
            !formattedCities.find((c) => c.value === formData.city)
          ) {
            setFormData((prev) => ({ ...prev, city: "" }));
          }
        }
      }
    }
  }, [formData.country, formData.state]);

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
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

  const validateForm = () => {
    const newErrors = {};

    const s = (val) => (val === undefined || val === null ? "" : String(val));

    const customerName = s(formData.customer_name).trim();
    const customerGroup = s(formData.customer_group_id).trim();
    const phone = s(formData.phone).trim();
    const email = s(formData.email).trim();
    const whatsapp = s(formData.whatsapp_number).trim();
    const aadhar = s(formData.aadhar_number).trim();
    const address = s(formData.address).trim();
    const country = s(formData.country).trim();
    const state = s(formData.state).trim();
    const city = s(formData.city).trim();
    const pincode = s(formData.pincode).trim();

    if (!customerName) {
      newErrors.customer_name = "Customer name is required";
    }

    if (!customerGroup) {
      newErrors.customer_group_id = "Customer group is required";
    }

    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (whatsapp && !/^\d{10}$/.test(whatsapp)) {
      newErrors.whatsapp_number = "WhatsApp number must be 10 digits";
    }

    if (!aadhar) {
      newErrors.aadhar_number = "Aadhar number is required";
    } else if (!/^\d{12}$/.test(aadhar)) {
      newErrors.aadhar_number = "Aadhar number must be 12 digits";
    }

    if (!address) {
      newErrors.address = "Address is required";
    }

    if (!country) {
      newErrors.country = "Country is required";
    }

    if (!state) {
      newErrors.state = "State is required";
    }

    if (!city) {
      newErrors.city = "City is required";
    }

    if (!pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
    }

    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const toastId = toast.loading("Updating customer...");

  try {
    // Create FormData for image upload
    const formDataToSend = new FormData();
    
    // Append all form fields
    formDataToSend.append('name', formData.customer_name.trim());
    formDataToSend.append('customer_group_id', formData.customer_group_id);
    formDataToSend.append('mobile', formData.phone.trim());
    formDataToSend.append('email', formData.email.trim());
    formDataToSend.append('whatsapp_number', formData.whatsapp_number.trim());
    formDataToSend.append('aadhar_number', formData.aadhar_number.trim());
    formDataToSend.append('tax_number', formData.tax_number.trim());
    formDataToSend.append('address', formData.address.trim());
    
    // Find country and state names for display
    const selectedCountry = countries.find((c) => c.value === formData.country);
    const selectedState = states.find((s) => s.value === formData.state);
    
    formDataToSend.append('country', selectedCountry ? selectedCountry.label : formData.country);
    formDataToSend.append('country_code', formData.country);
    formDataToSend.append('state', selectedState ? selectedState.label : formData.state);
    formDataToSend.append('state_code', formData.state);
    formDataToSend.append('city', formData.city.trim());
    formDataToSend.append('pincode', formData.pincode.trim());
    formDataToSend.append('status', formData.status ? 'active' : 'inactive');
    
    // Append image if selected
    if (formData.image) {
      formDataToSend.append('image', formData.image);
    }

    // Debug logs to check the data being sent
    console.log("Form data from state:", {
      id: customer?._id,
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
      status: formData.status ? 'active' : 'inactive',
      hasImage: formData.image ? 'Yes' : 'No'
    });

    // Log FormData entries to verify
    console.log("FormData entries being sent:");
    for (let pair of formDataToSend.entries()) {
      if (pair[0] === 'image') {
        console.log(pair[0] + ': [File: ' + pair[1].name + ', size: ' + pair[1].size + ' bytes]');
      } else {
        console.log(pair[0] + ': ' + pair[1]);
      }
    }

    await onSave(customer?._id, formDataToSend);

    toast.update(toastId, {
      render: "Customer updated successfully!",
      type: "success",
      isLoading: false,
      autoClose: 3000,
    });

    setErrors({});
    onClose();
  } catch (error) {
    console.error("Error updating customer:", error);
    toast.dismiss(toastId);

    if (error.response?.data?.message === "Customer with this phone already exists") {
      toast.error(
        "This phone number is already registered. Please use a different phone number.",
        { autoClose: 5000 }
      );
      setErrors((prev) => ({
        ...prev,
        phone: "This phone number is already registered",
      }));
    } else {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update customer. Please try again.";
      toast.error(errorMessage, { autoClose: 4000 });
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
    if (!loading) onClose();
  };

  // Get country phone code
  const getPhoneCode = () => {
    const countryObj = Country.getAllCountries().find(
      (c) => c.name === formData.country,
    );
    return countryObj ? `+${countryObj.phonecode}` : "+91";
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
            <h5 className="modal-title fw-bold fs-5">Edit Customer</h5>
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
                        ) : formData.image_url ? (
                          <img
                            src={formData.image_url}
                            alt={formData.customer_name}
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
                </div>

                {/* Phone */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-medium">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">{getPhoneCode()}</span>
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
                    <span className="input-group-text">{getPhoneCode()}</span>
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
                    className={`form-control form-control-lg ${
                      errors.aadhar_number ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., 456335223985"
                    value={formData.aadhar_number}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  {errors.aadhar_number && (
                    <div className="invalid-feedback d-block">
                      {errors.aadhar_number}
                    </div>
                  )}
                  <div className="form-text">12-digit aadhar (Required)</div>
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
                    Updating...
                  </>
                ) : (
                  <>
                    <FiUpload size={16} />
                    Update Customer
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

export default EditCustomerForm;
