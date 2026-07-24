import Supplier from "../Models/models/SuppliersModel.js";

export const createSupplier = async (req, res) => {
  try {
    const { supplier_name, company_name, contact_person, contact_person_number, phone, email, gst_no, gst_number, address, city, state, country, pincode, payment_terms, payment_type } = req.body;
    console.log(req.body);
    if (!supplier_name || !contact_person || !phone || !email || !address) {
      return res.status(400).json({ status: false, message: "Required fields missing" });
    }

    let checked = await Supplier.findOne({ supplier_name: supplier_name });
    if (checked) {
      return res.status(400).json({ status: false, message: "Supplier name already exists" });
    }

    const saved = await Supplier.create({
      supplier_name,
      company_name,
      contact_person,
      contact_person_number,
      phone,
      email,
      gst_no,
      gst_number,
      address,
      city,
      state,
      country,
      pincode,
      payment_terms: payment_terms || "Net 30 days",
      payment_type: payment_type || "bank_transfer",
      status: true
    });
    console.log(saved, "saved");
    return res.status(200).json({ status: true, message: "Supplier created successfully", data: saved });
  } catch (err) {
    console.log(err, "err");
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    let fetched = await Supplier.find();
    console.log(fetched, "fetched");
    return res.status(200).json({ status: true, message: "All Suppliers", data: fetched, fetched: fetched });
  } catch (e) {
    return res.status(500).json({ status: false, message: "Server error", error: e.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, company_name, contact_person, contact_person_number, phone, email, gst_no, gst_number, address, city, state, country, pincode, payment_terms, payment_type } = req.body;
    
    console.log(req.body);
    
    if (!supplier_name || !contact_person || !phone || !email || !address) {
      return res.status(400).json({ status: false, message: "Required fields are missing" });
    }

    const existingSupplier = await Supplier.findById(id);
    if (!existingSupplier) {
      return res.status(404).json({ status: false, message: "Supplier not found" });
    }

    const nameExists = await Supplier.findOne({ 
      supplier_name: supplier_name,
      _id: { $ne: id } 
    });
    
    if (nameExists) {
      return res.status(400).json({ status: false, message: "Supplier name already in use" });
    }

    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      {
        supplier_name,
        company_name,
        contact_person,
        contact_person_number,
        phone,
        email,
        gst_no,
        gst_number,
        address,
        city,
        state,
        country,
        pincode,
        payment_terms: payment_terms || "Net 30 days",
        payment_type: payment_type || "bank_transfer",
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true } 
    );

    console.log(updatedSupplier, "updated");
    
    return res.status(200).json({ status: true, message: "Supplier updated successfully", data: updatedSupplier });

  } catch (err) {
    console.log(err, "err");
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};



export const deleteSupplier = async(req,res)=>{
    try{
        let  {id} = req.params;
        let   deleted  = await Supplier.findById({id:id})
        if(!deleted){
            return res.status(404).json({status:false,message:"Supplier Person is not found"})
        }

        let finall = await Supplier.findByIdAndDelete({id:id})
        console.log(finall)
        return res.status(400).json({status:false,message:"Supplier deleted successfully"})


    }catch(err){
        console.log(err)
         return res.status(500).json({ status: false, message: "Server error", error: err.message });
        
    }

}
