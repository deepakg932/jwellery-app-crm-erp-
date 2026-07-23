import Supplier from "../Models/models/SuppliersModel.js";

export const createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email, gst_no, address } =req.body;
    console.log(req.body);
    if ( !supplier_name || !contact || !contact_person || !phone || !email || !gst_no || !address) {
      return res.status(400).json({ status: false, message: "All fields are  required" });
    }

    let cehcked = await Supplier.findOne({ supplier_name: supplier_name });
    if (!cehcked) {
      return res.status(400).json({  status: false,  message: "Already use this name , Please try another name",});
    }

    const saved = await Supplier.create({
      supplier_name: supplier_name,
      contact_person: contact_person,
      phone: phone,
      email: email,
      gst_no: gst_no,
      address: address,
    });
    console.log(saved, "saved");
  } catch (err) {
    console.log(err, "err");
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const getSuppliers = async (req, res) => {
  try {
    let fetched = await Supplier.find();
    console.log(fetched, "fetched");
    return res.status(200).json({ status: false, message: "All Suppliers" });
  } catch (e) {
    return res.status(500).json({ status: false, message: "Server error", error: err.message });
  }
};

export const updateSupplier = async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier_name, contact_person, phone, email, gst_no, address } = req.body;
    
    console.log(req.body);
    
 
    if (!supplier_name || !contact_person || !phone || !email || !gst_no || !address) {
      return res.status(400).json({ status: false, message: "All fields are required" });
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
      return res.status(400).json({ status: false, message: "Supplier name already in use. Please try another name" });
    }

    
    const updatedSupplier = await Supplier.findByIdAndUpdate(
      id,
      {
        supplier_name: supplier_name,
        contact_person: contact_person,
        phone: phone,
        email: email,
        gst_no: gst_no,
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
