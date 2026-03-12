import Designation from "../models/designation.js";

export const createDesignation = async (req, res) => {
    try {
        const { designation_name} = req.body;
        console.log(designation_name,"designation name")
        const newDesignation = new Designation({ designation_name});
        console.log(newDesignation,"new designation")
         let savedDesignation = await newDesignation.save();
        console.log(savedDesignation,"saved designation")
        return res.status(201).json(savedDesignation);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getDesignations = async (req, res) => {
    try {
        const designations = await Designation.find();
        console.log(designations,"designations")
        return res.status(200).json(designations);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const getDesignationById = async (req, res) => {
    try {
        const designation = await Designation.findById(req.params.id);
        console.log(designation,"designation by id")
        if (!designation) {
            return res.status(404).json({ message: "Designation not found" });
        }
        return res.status(200).json(designation);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const updateDesignation = async (req, res) => {
    try {
        const {designation_name} = req.body;
        console.log(designation_name,"updated designation name")
        const updatedDesignation = await Designation.findByIdAndUpdate(
            req.params.id,
            { designation_name},
            { new: true },
        );
        if (!updatedDesignation) {
            return res.status(404).json({ message: "Designation not found" });
        }
        return res.status(200).json(updatedDesignation);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteDesignation = async (req, res) => {
    try {
        const deletedDesignation = await Designation.findByIdAndDelete(req.params.id);
        if (!deletedDesignation) {
            return res.status(404).json({ message: "Designation not found" });
        }
        return res.status(200).json({ message: "Designation deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
        }
    };
    