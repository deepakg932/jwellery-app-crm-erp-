import department from "../models/department.js"

export const createDepartment = async (req, res) => {
  try {
    const { department_name} = req.body;

    console.log(department_name,"department name")
    const newDepartment = new department({ department_name});

    console.log(newDepartment,"new department")
   let savedDepartment = await newDepartment.save();


   console.log(savedDepartment,"saved department")
    return res.status(201).json(savedDepartment);
  } catch (error) {
   return res.status(500).json({ message: error.message });
  }
};


export const getDepartments = async (req, res) => {
  try {
    const departments = await department.find();
    console.log(departments,"departments")

    return res.status(200).json(departments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



export const getDepartmentById = async (req, res) => {
  try {
    const department = await department.findById(req.params.id);
    console.log(department,"department by id")

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    return res.status(200).json(department);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


export const updateDepartment = async (req, res) => {
  try {
    const {department_name} = req.body;
    console.log(department_name,"updated department name")
    const updatedDepartment = await department.findByIdAndUpdate(
      req.params.id,
      { department_name},
        { new: true },
    );
    if (!updatedDepartment) {
      return res.status(404).json({ message: "Department not found" });
    }
    return res.status(200).json(updatedDepartment);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};




export const deleteDepartment = async (req, res) => {
  try {
    const deletedDepartment = await department.findByIdAndDelete(req.params.id);
    console.log(deletedDepartment,"deleted department")
    if (!deletedDepartment) {
        return res.status(404).json({ message: "Department not found" });
    }
    return res.status(200).json({ message: "Department deleted successfully" });
} catch (error) {    return res.status(500).json({ message: error.message });
}
};