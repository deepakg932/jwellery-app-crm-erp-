import Suppliers from "../Models/models/SuppliersModel.js"

export const createSupplier = async (req, res) => {
  try {
    const { supplier_name, phone, email, address } = req.body;
    
    console.log(req.body, "Request body received");

    
    if (!supplier_name || !phone || !email ||!address) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ status: false, message: "Please provide a valid email address" });
    }

    const existingSupplier = await Suppliers.findOne({ supplier_name });
    if (existingSupplier) {
      return res.status(409).json({ status: false,  message: "Supplier with this name already exists. Please use a different name.",
      });
    }

    
    const existingEmail = await Suppliers.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ status: false,  message: "Email already registered to another supplier.",});
    }

    
    const newSupplier = await Suppliers.create({
      supplier_name,
      // contact_person,
      phone,
      email,
      // gst_no,
      address,
    });
    
    console.log(newSupplier, "Supplier created successfully");

    return res.status(201).json({ status: true, message: "Supplier created successfully", data: newSupplier });

  } catch (err) {
    console.error(err, "Error in createSupplier");
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    let fetched = await Suppliers.find();
    console.log(fetched, "fetched");
    return res.status(200).json({ status: false, message: "All Suppliers" ,fetched});
  } catch (e) {
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, phone, email,  address } = req.body;
    
    console.log(req.body);
    
 
    if (!supplier_name || !phone || !email || !address) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }


    const existingSupplier = await Suppliers.findById(id);
    if (!existingSupplier) {
      return res.status(404).json({ status: false, message: "Supplier not found" });
    }

    const nameExists = await Suppliers.findOne({ 
      supplier_name: supplier_name,
      _id: { $ne: id } 
    });
    
    if (nameExists) {
      return res.status(400).json({ status: false, message: "Supplier name already in use. Please try another name" });
    }

    
    const updatedSupplier = await Suppliers.findByIdAndUpdate(
      id,
      {
        supplier_name: supplier_name,
        // contact_person: contact_person,
        phone: phone,
        email: email,
        // gst_no: gst_no,
        address: address,
        updatedAt: Date.now() 
      },
      { new: true, runValidators: true } 
    );

    console.log(updatedSupplier, "updated");
    
    return res.status(200).json({status: true,   message: "Supplier updated successfully", data: updatedSupplier
    });

  } catch (err) {
    console.log(err, "err");
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};



export const deleteSupplier = async(req,res)=>{
    try{
         const { id } = req.params;
        console.log(id,"id")
        let   deleted  = await Suppliers.findById(id)
        if(!deleted){
            return res.status(404).json({status:false,message:"Supplier Person is not found"})
        }
        let finall = await Suppliers.findByIdAndDelete(id)
        console.log(finall)
        return res.status(200).json({status:true,message:"Supplier deleted successfully"})
    }catch(err){
        console.log(err)
         return res.status(500).json({ status: false, message: "Server error", error: err.message });
        
    }

}
