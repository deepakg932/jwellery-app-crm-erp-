import Suppliers from "../Models/models/SuppliersModel.js";

export const createSupplier = async (req, res) => {
  try {
    const {
      supplier_name,
      supplier_code,
      contact_person,
      tax_number,
      phone,
      payment_terms,
      payment_type,
      email,
      address,
      country,
      state,
      city,
      pincode,
      gst_number,
    } = req.body;

    console.log(req.body, "Request body received");

    if (!supplier_name || !email || !phone || !address) {
      return res.status(400).json({ status: false, emessage: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({status: false,message: "Please provide a valid email address",});
    }

    const existingSupplier = await Suppliers.findOne({ supplier_name });
    if (existingSupplier) {
      return res.status(409).json({status: false,message:"Supplier with this name already exists. Please use a different name.",});
    }

    const existingCode = await Suppliers.findOne({ supplier_code });
    console.log(existingCode, "exiting");
    if (existingCode) {
      return res.status(409).json({ status: false, message: "Supplier code already exists" });}
    const existingEmail = await Suppliers.findOne({ email });
    console.log(existingEmail, "existingEmail");
    if (existingEmail) {
      return res.status(409).json({status: false,message: "Email already registered to another supplier.",});
    }

    const newSupplier = await Suppliers.create({
      supplier_name,
      supplier_code,
      contact_person,
      email,
      phone,
      address,
      payment_type,
      tax_number,
      payment_terms,
      country,
      state,
      city,
      pincode,
      gst_number,
    });

    console.log(newSupplier, "Supplier created successfully","kkkkkkkkkk");
 

    return res.status(200).json({status: true,message: "Supplier created successfully",data: newSupplier,});
  } catch (err) {
    console.error(err, "Error in createSupplier");
    return res.status(500).json({ status: false, message: "Server error", error: err.message }) }
};

export const getSuppliers = async (req, res) => {
  try {
    let fetched = await Suppliers.find();
    console.log(fetched, "fetched");
    return res.status(200).json({ status: true, message: "All Suppliers", fetched });
  } catch (e) {
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};


export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier_name,
      city,
      country,
      pincode,
      gst_number,
      tax_number,
      supplier_code,
      contact_person,
      email,
      phone,
      address,
      payment_type,
      payment_terms,
      is_active,
    } = req.body;

    console.log(req.body);

    
    if (!supplier_name || !supplier_code || !email || !phone || !address) {
      return res.status(400).json({ status: false, message: "Required fields are missing" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: false, message: "Invalid email format" });
    }

  
    const existingSupplier = await Suppliers.findById(id);
    if (!existingSupplier) {
      return res.status(404).json({ status: false, message: "Supplier not found" });
    }

   
    const nameExists = await Suppliers.findOne({
      supplier_name: supplier_name,
      _id: { $ne: id },
    });
    if (nameExists) {
      return res.status(400).json({ status: false, message: "Supplier name already in use. Please try another name",});
    }


    const codeExists = await Suppliers.findOne({
      supplier_code: supplier_code,
      _id: { $ne: id },
    });
    if (codeExists) {
      return res.status(400).json({  status: false,message: "Supplier code already in use. Please try another code",});
    }
  const emailExists = await Suppliers.findOne({
      email: email,
      _id: { $ne: id },
    });
    if (emailExists) {
      return res.status(400).json({  status: false, message: "Email already registered to another supplier",});
    }

    const updatedSupplier = await Suppliers.findByIdAndUpdate(
      id,
      {
        supplier_name,
        supplier_code,
        contact_person,
        email,
        phone,
        address,
        tax_number,
        payment_terms,
        payment_type,
        gst_number,
        pincode,
        tax_number,
        city,
        country,

        is_active,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    console.log(updatedSupplier, "updated");

    return res.status(200).json({status: true,message: "Supplier updated successfully",data: updatedSupplier,});
  } catch (err) {
    console.log(err, "err");
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "id");
    let deleted = await Suppliers.findById(id);
    console.log(deleted,"deleted")
    if (!deleted) {
      return res.status(404).json({ status: false, message: "Supplier Person is not found" });
    }
    let finall = await Suppliers.findByIdAndDelete(id);
    console.log(finall);
    return res.status(200).json({ status: true, message: "Supplier deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};
