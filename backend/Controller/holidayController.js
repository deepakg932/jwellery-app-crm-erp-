import Holiday from "../models/holiday.js";

export const addHolidays = async (req, res) => {
  try {
    const {
      holidays,
      departments,
      designations,
      employment_types,
      description,
    } = req.body;

    if (!Array.isArray(holidays) || holidays.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Holidays array is required",
      });
    }

    for (const h of holidays) {
      if (!h.occasion || !h.occasion_date) {
        return res.status(400).json({
          success: false,
          message: "Occasion and date are required for each holiday",
        });
      }
    }

   
    const departmentIds = Array.isArray(departments)
      ? departments.map((d) => d.value)
      : [];

    const designationIds = Array.isArray(designations)
      ? designations.map((d) => d.value)
      : [];

    const employmentTypes = Array.isArray(employment_types)
      ? employment_types.map((e) => ({
          value: e.value,
          
        }))
      : [];
    const docs = holidays.map((h) => ({
      occasion: h.occasion.trim(),
      occasion_date: new Date(h.occasion_date),

      department_id: departmentIds,
      designation_id: designationIds,
      employment_types: employmentTypes, // now objects
      description: description || "",
    }));

    // Insert many
    const createdDocs = await Holiday.insertMany(docs);

    // Populate
    const ids = createdDocs.map((d) => d._id);

    const populated = await Holiday.find({ _id: { $in: ids } })
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .sort({ occasion_date: 1 });

    return res.status(201).json({
      success: true,
      message: `${populated.length} holiday(s) added successfully`,
      data: populated,
    });
  } catch (error) {
    console.error("Add holidays error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to add holidays",
    });
  }
};

// export const getHolidayCalendarEvents = async (req, res) => {
//   try {
//     const holidays = await Holiday.find().sort({ start_date: 1 });

//     // FullCalendar compatible format
//     const events = holidays.map((h) => ({
//       id: h._id,
//       title: h.title,
//       start: h.start_date,
//       end: h.end_date,
//       allDay: true,

//       // optional fields for UI
//       description: h.description || "",
//       holiday_type: h.holiday_type,

//       // color coding
//       backgroundColor:
//         h.holiday_type === "public"
//           ? "#dc3545" // red
//           : h.holiday_type === "company"
//           ? "#0d6efd" // blue
//           : "#198754", // green

//       borderColor:
//         h.holiday_type === "public"
//           ? "#dc3545"
//           : h.holiday_type === "company"
//           ? "#0d6efd"
//           : "#198754",
//     }));

//     return res.json({
//       success: true,
//       data: events,
//     });
//   } catch (error) {
//     console.error("Holiday fetch error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch holidays",
//     });
//   }
// };

export const getAllHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .sort({ occasion_date: 1 });

    return res.status(200).json({
      success: true,
      count: holidays.length,
      data: holidays,
    });
  } catch (error) {
    console.error("Get holidays error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch holidays",
    });
  }
};

export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const gst = await Holiday.findByIdAndDelete(id);
    if (!gst) {
      return res
        .status(404)
        .json({ success: false, message: "Holiday not found" });
    }

    return res.json({
      success: true,
      message: "Hoilday  deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCalendarHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find()
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name")
      .sort({ occasion_date: 1 });

    const events = holidays.map((h) => {
      // 🔥 ensure department is always array
      let departments = [];

      if (Array.isArray(h.department_id)) {
        departments = h.department_id.map((d) => d.department_name);
      } else if (h.department_id) {
        departments = [h.department_id.department_name];
      }

      return {
        id: h._id,
        title: h.occasion,
        start: h.occasion_date,
        end: h.occasion_date,
        allDay: true,

        description: h.description,
        departments: departments,
        designation: h.designation_id?.designation_name || "",

        backgroundColor: "#dc3545",
        borderColor: "#dc3545",
      };
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error("Calendar holidays error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch calendar holidays",
    });
  }
};

export const updateHoliday = async (req, res) => {
  try {
    const holidayId = req.params.id;

    const {
      occasion,
      occasion_date,
      departments,
      designations,
      employment_types,
      description,
    } = req.body;

    // Find holiday
    const holiday = await Holiday.findById(holidayId);

    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    // 🔥 Basic fields
    if (occasion) {
      holiday.occasion = occasion.trim();
    }

    if (occasion_date) {
      holiday.occasion_date = new Date(occasion_date);
    }

    // 🔥 Map departments [{value,label}] → [ids]
    if (departments) {
      holiday.department_id = Array.isArray(departments)
        ? departments.map((d) => d.value)
        : [];
    }

    // 🔥 Map designations [{value,label}] → [ids]
    if (designations) {
      holiday.designation_id = Array.isArray(designations)
        ? designations.map((d) => d.value)
        : [];
    }

    // 🔥 Map employment_types [{value,label}] → [strings]
    if (employment_types) {
      holiday.employment_types = Array.isArray(employment_types)
        ? employment_types.map((e) => e.value)
        : [];
    }

    if (description !== undefined) {
      holiday.description = description;
    }

    // Save
    const updated = await holiday.save();

    // Populate for response
    const populated = await Holiday.findById(updated._id)
      .populate("department_id", "department_name")
      .populate("designation_id", "designation_name");

    return res.json({
      success: true,
      message: "Holiday updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("Update holiday error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update holiday",
    });
  }
};
