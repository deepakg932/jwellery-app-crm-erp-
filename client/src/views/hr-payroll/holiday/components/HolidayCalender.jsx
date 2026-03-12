import React, { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  parseISO,
} from "date-fns";
import { FiList, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import AddHolidayForm from "./AddHolidayForm";
import { useHoliday } from "../../../../hooks/useHoliday";
import EditHolidayForm from "./EditHolidayForm";

const HolidayCalender = () => {
  const {
    holidays: apiHolidays,
    departments,
    designations,
    loading,
    addHoliday,
    updateHoliday,
    deleteHoliday,
    fetchHolidays,
  } = useHoliday();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // February 2026
  const [viewType, setViewType] = useState("month"); // month, week, day, list
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 1));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showHolidayDetail, setShowHolidayDetail] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const [holidays, setHolidays] = useState([]);
  const [prefillDate, setPrefillDate] = useState(null);

  // Process API holidays when they change
  useEffect(() => {
    if (apiHolidays && apiHolidays.length > 0) {
      // Transform API data to match calendar format
      const processedHolidays = apiHolidays.map((holiday) => {
        // Parse the date from API (assuming occasion_date is the date field)
        let holidayDate;
        if (holiday.occasion_date) {
          holidayDate = parseISO(holiday.occasion_date);
        } else if (holiday.date) {
          holidayDate = parseISO(holiday.date);
        } else {
          holidayDate = new Date();
        }

        return {
          date: holidayDate,
          title: holiday.occasion || holiday.holiday_name || "Holiday",
          type: holiday.type || "general", // Default type if not specified
          description: holiday.description || "",
          department: holiday.department_name || "",
          department_id: holiday.department_id || [],
          designation: holiday.designation_name || "",
          designation_id: holiday.designation_id || "",
          employment_type: holiday.employment_type || [],
          _id: holiday._id,
        };
      });

      setHolidays(processedHolidays);
    } else {
      setHolidays([]);
    }
  }, [apiHolidays]);

  // Refresh holidays when component mounts
  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

  const handleAdd = async (holidayData) => {
    setActionLoading({ type: "add", id: null });
    try {
      await addHoliday(holidayData);
      setShowAddModal(false);
      // Refresh holidays after adding
      await fetchHolidays();
    } catch (error) {
      console.error("Add failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Handle update with loading state
  const handleUpdate = async (holidayData) => {
    if (!selectedItem) return;

    setActionLoading({ type: "update", id: selectedItem._id });
    try {
      await updateHoliday(selectedItem._id, holidayData);
      setShowEditModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    setActionLoading({ type: "delete", id: selectedItem._id });
    try {
      await deleteHoliday(selectedItem._id);
      setShowDeleteModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  // Open edit modal
  const handleOpenEdit = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setShowEditModal(true);
  };

  // Open delete modal
  const handleOpenDelete = (item) => {
    if (!item) return;
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleHolidayClick = (holiday, e) => {
    e.stopPropagation(); // Prevent event bubbling to cell click
    setSelectedHoliday(holiday);
    setShowHolidayDetail(true);
  };

  const handleDateCellClick = (day) => {
    // open add form for a specific date
    setSelectedDate(day);
    setPrefillDate(day);
    setShowAddModal(true);
  };

  const handleWeekDateClick = (day) => {
    setCurrentDate(day);
    setSelectedDate(day);
    setViewType("day");
  };

  const handleMonthDateClick = (day) => {
    setCurrentDate(day);
    setSelectedDate(day);
    setViewType("day");
  };

  const closeHolidayDetail = () => {
    setShowHolidayDetail(false);
    setSelectedHoliday(null);
  };

  // Get days for month view
  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: startDate, end: endDate });
  };

  // Get days for week view
  const getWeekDays = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  };

  // Navigation
  const goToPrevious = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(subDays(currentDate, 1));
        break;
      default:
        break;
    }
  };

  const goToNext = () => {
    switch (viewType) {
      case "month":
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, 1));
        break;
      default:
        break;
    }
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Holiday helpers
  const getDayHolidays = (date) => {
    return holidays.filter((h) => isSameDay(h.date, date));
  };

  // Week day headers
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Determine holiday type color
  const getHolidayTypeColor = (type) => {
    const typeLower = (type || "").toLowerCase();
    if (typeLower === "festival" || typeLower === "festivals") {
      return "bg-danger";
    } else if (typeLower === "holiday") {
      return "bg-warning";
    } else if (typeLower === "general") {
      return "bg-info";
    }
    return "bg-primary"; // default
  };

  // Render month view (table style exactly like image)
  const renderMonthView = () => {
    const monthDays = getMonthDays();

    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="month-view">
        <table className="table table-bordered align-middle">
          <thead>
            <tr>
              {weekDays.map((day) => (
                <th key={day} className="text-center py-3 bg-light">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(monthDays.length / 7) }).map(
              (_, weekIdx) => (
                <tr key={weekIdx}>
                  {monthDays
                    .slice(weekIdx * 7, weekIdx * 7 + 7)
                    .map((day, dayIdx) => {
                      const dayHolidays = getDayHolidays(day);
                      const isCurrentMonth = isSameMonth(day, currentDate);
                      const isToday = isSameDay(day, new Date());
                      const isSelected = isSameDay(day, selectedDate);

                      return (
                        <td
                          key={dayIdx}
                          onClick={() => handleDateCellClick(day)}
                          className={`text-center p-2 position-relative calendar-cell ${!isCurrentMonth ? "text-muted bg-light" : ""} 
                        ${isToday ? "bg-primary bg-opacity-10" : ""} 
                        ${isSelected ? "border border-primary border-2" : ""}`}
                          style={{ height: "90px", cursor: "pointer" }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <span
                              onClick={(e) => { e.stopPropagation(); handleMonthDateClick(day); }}
                              className={`fw-bold ${isToday ? "text-primary" : ""}`}
                              style={{ cursor: "pointer" }}
                            >
                              {format(day, "d")}
                            </span>
                          </div>
                          {dayHolidays.length > 0 && (
                            <div className="mt-1">
                              {dayHolidays.map((h, idx) => (
                                <div
                                  key={idx}
                                  onClick={(e) => handleHolidayClick(h, e)}
                                  className={`badge w-100 mb-1 text-truncate calendar-event 
                                ${getHolidayTypeColor(h.type)}`}
                                  title={h.description || h.title}
                                  style={{ cursor: "pointer" }}
                                >
                                  {h.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      );
                    })}
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const DeleteConfirmationModal = () => (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-3">
          <div className="modal-header border-bottom pb-3">
            <h5 className="modal-title fw-bold fs-5">Delete Holiday</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            ></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete holiday{" "}
              <strong className="text-danger">
                {selectedItem?.occasion || selectedItem?.holiday_name || selectedItem?.title}
              </strong>
              ?
            </p>
              <p className="text-muted small">This action cannot be undone.</p>
          </div>

          <div className="modal-footer border-top pt-3">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={actionLoading.type === "delete"}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={actionLoading.type === "delete"}
            >
              {actionLoading.type === "delete" ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Deleting...
                </>
              ) : (
                "Delete Holiday"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Week view with time slots
  const renderWeekView = () => {
    const weekDaysList = getWeekDays();
    const hours = Array.from({ length: 24 }, (_, i) => i);

    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="week-view" style={{ overflowX: "auto" }}>
        <table className="table table-bordered align-top" style={{ minWidth: "1000px", marginBottom: 0 }}>
          <thead>
            <tr>
              <th style={{ width: "80px", fontSize: "0.75rem", backgroundColor: "#f8f9fa" }}>Time</th>
              {weekDaysList.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <th
                    key={idx}
                    onClick={() => handleWeekDateClick(day)}
                    className={`text-center ${isToday ? "bg-primary text-white" : "bg-light"}`}
                    style={{ width: "140px", minWidth: "140px", fontSize: "0.85rem", cursor: "pointer" }}
                  >
                    <div className="fw-bold">{format(day, "EEE")}</div>
                    <div className="small mb-0">{format(day, "M/d")}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* All-day row */}
            <tr>
              <td
                style={{
                  fontSize: "0.75rem",
                  fontWeight: "500",
                  verticalAlign: "top",
                  backgroundColor: "#f8f9fa",
                  color: "#6c757d",
                }}
              >
                all-day
              </td>
              {weekDaysList.map((day, dayIdx) => {
                const dayHolidays = getDayHolidays(day);
                return (
                  <td
                    key={dayIdx}
                    style={{
                      minHeight: "50px",
                      verticalAlign: "top",
                      padding: "4px",
                      backgroundColor: isSameDay(day, new Date()) ? "rgba(13, 110, 253, 0.05)" : "white",
                    }}
                  >
                    <div className="d-flex flex-column gap-1">
                      {dayHolidays.map((h, hIdx) => (
                        <div
                          key={hIdx}
                          onClick={(e) => handleHolidayClick(h, e)}
                          className={`badge text-white text-truncate ${getHolidayTypeColor(h.type)}`}
                          title={h.title}
                          style={{
                            cursor: "pointer",
                            fontSize: "0.7rem",
                            padding: "4px 6px",
                          }}
                        >
                          {h.title}
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Hourly rows */}
            {hours.map((hour) => (
              <tr key={`hour-${hour}`}>
                <td
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: "500",
                    backgroundColor: "#f8f9fa",
                    verticalAlign: "top",
                    color: "#6c757d",
                    paddingTop: "4px",
                    paddingBottom: "4px",
                  }}
                >
                  {format(new Date(2026, 0, 1, hour), "ha")}
                </td>
                {weekDaysList.map((day, dayIdx) => (
                  <td
                    key={`${dayIdx}-${hour}`}
                    onClick={() => handleDateCellClick(day)}
                    style={{
                      minHeight: "40px",
                      verticalAlign: "top",
                      cursor: "pointer",
                      backgroundColor: isSameDay(day, new Date())
                        ? "rgba(13, 110, 253, 0.05)"
                        : "white",
                      transition: "background-color 0.2s",
                      borderRight: "1px solid #dee2e6",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = isSameDay(day, new Date())
                        ? "rgba(13, 110, 253, 0.05)"
                        : "white")
                    }
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };


  // Day view with time slots
  const renderDayView = () => {
    const dayHolidays = getDayHolidays(currentDate);
    const isToday = isSameDay(currentDate, new Date());
    const hours = Array.from({ length: 24 }, (_, i) => i);

    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="day-view">
        <div className="card border-0">
          <div className={`card-header ${isToday ? "bg-primary text-white" : "bg-light"} text-center py-3`}>
            <h5 className="mb-0">{format(currentDate, "EEEE")}</h5>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table table-bordered align-top" style={{ minWidth: "600px", marginBottom: 0 }}>
              <thead>
                <tr>
                  <th style={{ width: "100px", fontSize: "0.75rem", backgroundColor: "#f8f9fa" }}>Time</th>
                  <th style={{ fontSize: "0.85rem" }} className="bg-light">
                    {format(currentDate, "MMMM d, yyyy")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* All-day row */}
                <tr>
                  <td
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      backgroundColor: "#f8f9fa",
                      color: "#6c757d",
                      verticalAlign: "top",
                    }}
                  >
                    all-day
                  </td>
                  <td style={{ minHeight: "50px", verticalAlign: "top", padding: "4px" }}>
                    <div className="d-flex flex-column gap-1">
                      {dayHolidays
                        .filter((h) => !h.startTime) // all-day events
                        .map((h, idx) => (
                          <div
                            key={idx}
                            onClick={(e) => handleHolidayClick(h, e)}
                            className={`badge text-white text-truncate ${getHolidayTypeColor(h.type)}`}
                            title={h.title}
                            style={{
                              cursor: "pointer",
                              fontSize: "0.7rem",
                              padding: "4px 6px",
                              width: "fit-content",
                            }}
                          >
                            {h.title}
                          </div>
                        ))}
                    </div>
                  </td>
                </tr>

                {/* Hourly rows */}
                {hours.map((hour) => (
                  <tr key={`hour-${hour}`}>
                    <td
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: "500",
                        backgroundColor: "#f8f9fa",
                        color: "#6c757d",
                        verticalAlign: "top",
                        paddingTop: "4px",
                        paddingBottom: "4px",
                      }}
                    >
                      {format(new Date(2026, 0, 1, hour), "ha")}
                    </td>
                    <td
                      style={{
                        minHeight: "40px",
                        verticalAlign: "top",
                        backgroundColor: isToday && hour === new Date().getHours() ? "rgba(13, 110, 253, 0.05)" : "white",
                        cursor: "pointer",
                      }}
                      onClick={() => handleDateCellClick(currentDate)}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(13, 110, 253, 0.1)")}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = isToday && hour === new Date().getHours() ? "rgba(13, 110, 253, 0.05)" : "white")
                      }
                    />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };


  // List view
  const renderListView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const monthHolidays = monthDays
      .map((day) => ({ date: day, holidays: getDayHolidays(day) }))
      .filter((item) => item.holidays.length > 0);

    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="list-view">
        <div className="card">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              Holidays in {format(currentDate, "MMMM yyyy")}
            </h5>
          </div>
          <div className="card-body p-0">
            {monthHolidays.length > 0 ? (
              <div className="list-group list-group-flush">
                {monthHolidays.map((item, idx) => (
                  <div key={idx} className="list-group-item">
                    <div className="d-flex align-items-center">
                      <div className="me-4 text-center">
                        <div className="fw-bold fs-5">
                          {format(item.date, "d")}
                        </div>
                        <div className="small text-muted">
                          {format(item.date, "EEE")}
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        {item.holidays.map((h, hidx) => (
                          <div
                            key={hidx}
                            onClick={(e) => handleHolidayClick(h, e)}
                            className="d-flex align-items-center mb-2"
                            style={{ cursor: "pointer" }}
                          >
                            <span
                              className={`badge ${getHolidayTypeColor(h.type)} me-2 p-2`}
                            >
                              {h.type}
                            </span>
                            <span>{h.title}</span>
                            {h.description && (
                              <small className="text-muted ms-2">
                                - {h.description}
                              </small>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted py-5">No holidays</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Holiday Detail Modal
  const renderHolidayDetailModal = () => {
    if (!selectedHoliday) return null;

    return (
      <div
        className="modal show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={closeHolidayDetail}
      >
        <div
          className="modal-dialog modal-dialog-centered"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Holiday Details</h5>
              <button
                type="button"
                className="btn-close"
                onClick={closeHolidayDetail}
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <h6 className="fw-bold"># Holiday</h6>
              </div>

              <table className="table table-bordered">
                <tbody>
                  <tr>
                    <td
                      className="bg-light fw-semibold"
                      style={{ width: "150px" }}
                    >
                      Date
                    </td>
                    <td>{format(selectedHoliday.date, "dd-MM-yyyy")}</td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Occasion</td>
                    <td>{selectedHoliday.title}</td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Department</td>
                    <td>
                      {selectedHoliday.department &&
                      selectedHoliday.department !== ""
                        ? selectedHoliday.department
                        : Array.isArray(selectedHoliday.department_id) &&
                            selectedHoliday.department_id.length > 0
                          ? selectedHoliday.department_id
                              .map((dept) => dept.department_name || dept)
                              .join(", ")
                          : "All Departments"}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Designation</td>
                    <td>
                      {selectedHoliday.designation &&
                      selectedHoliday.designation !== ""
                        ? selectedHoliday.designation
                        : selectedHoliday.designation_id &&
                            selectedHoliday.designation_id.designation_name
                          ? selectedHoliday.designation_id.designation_name
                          : "All Designations"}
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-light fw-semibold">Employment Type</td>
                    <td>
                        
                      {selectedHoliday.employment_type &&
                      selectedHoliday.employment_type.length > 0
                        ? selectedHoliday.employment_type
                        : "All Employment Types"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  onClick={() => {
                    // Open edit using original API object if available
                    const apiObj = apiHolidays.find((h) => h._id === selectedHoliday._id) || selectedHoliday;
                    handleOpenEdit(apiObj);
                    closeHolidayDetail();
                  }}
                  disabled={actionLoading.type === 'update' && actionLoading.id === selectedHoliday?._id}
                >
                  Edit
                </button>

                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    const apiObj = apiHolidays.find((h) => h._id === selectedHoliday._id) || selectedHoliday;
                    handleOpenDelete(apiObj);
                    closeHolidayDetail();
                  }}
                  disabled={actionLoading.type === 'delete' && actionLoading.id === selectedHoliday?._id}
                >
                  Delete
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeHolidayDetail}
                >
                  Close
                </button>
              </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      {/* Header with search, Add Holiday, Mark Default Holidays (like image) */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 ps-0"
                  placeholder="Start typing to search"
                  aria-label="Search"
                />
              </div>
            </div>
            <div className="col-md-8 d-flex justify-content-end gap-2 align-items-center">
              <div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setPrefillDate(null);
                    setShowAddModal(true);
                  }}
                  disabled={loading}
                >
                  Add Holiday
                </button>
              </div>

              <div>
                <Link
                  to="/holidays/table"
                  className="text-decoration-none"
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Table View"
                >
                  <button
                    className="btn btn-outline-primary"
                    title="Table View"
                    disabled={loading}
                  >
                    <FiList size={20} />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Navigation and View Selector */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="h3 fw-bold mb-0">
                {format(currentDate, "MMMM yyyy")}
              </h1>
            </div>
            <div className="col-md-6">
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={goToToday}
                  disabled={loading}
                >
                  Today
                </button>
                <div className="btn-group">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={goToPrevious}
                    disabled={loading}
                  >
                    &lt;
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={goToNext}
                    disabled={loading}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-12">
              <div className="btn-group">
                <button
                  className={`btn ${viewType === "month" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setViewType("month")}
                  disabled={loading}
                >
                  Month
                </button>
                <button
                  className={`btn ${viewType === "week" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setViewType("week")}
                  disabled={loading}
                >
                  Week
                </button>
                <button
                  className={`btn ${viewType === "day" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setViewType("day")}
                  disabled={loading}
                >
                  Day
                </button>
                <button
                  className={`btn ${viewType === "list" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setViewType("list")}
                  disabled={loading}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {viewType === "month" && renderMonthView()}
          {viewType === "week" && renderWeekView()}
          {viewType === "day" && renderDayView()}
          {viewType === "list" && renderListView()}
        </div>
      </div>

      {/* Upcoming Events Summary (like image bottom) */}
      <div className="card border-0 shadow-sm mt-4">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">Upcoming Holidays</h6>
          <div className="d-flex flex-wrap gap-3">
            {holidays.slice(0, 5).map((h, idx) => (
              <div
                key={idx}
                className="d-flex align-items-center"
                onClick={(e) => handleHolidayClick(h, e)}
                style={{ cursor: "pointer" }}
              >
                <span className={`badge ${getHolidayTypeColor(h.type)} me-2`}>
                  ●
                </span>
                <span className="fw-medium">{h.title}</span>
                <span className="text-muted ms-2 small">
                  {format(h.date, "dd MMM")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showAddModal && (
        <AddHolidayForm
          onClose={() => {
            setShowAddModal(false);
            setPrefillDate(null);
          }}
          onSave={handleAdd}
          loading={actionLoading.type === "add"}
          departments={departments}
          designations={designations}
          defaultDate={prefillDate}
        />
      )}
      {showEditModal && selectedItem && (
        <EditHolidayForm
          show={showEditModal}
          onHide={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSubmit={handleUpdate}
          holiday={selectedItem}
          departments={departments}
          designations={designations}
          loading={
            actionLoading.type === "update" &&
            actionLoading.id === selectedItem._id
          }
        />
      )}

      {showDeleteModal && selectedItem && <DeleteConfirmationModal />}
      {/* Holiday Detail Modal */}
      {showHolidayDetail && renderHolidayDetailModal()}

      <style jsx>{`
        .calendar-cell {
          transition: background-color 0.2s;
        }
        .calendar-cell:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        .calendar-event {
          font-size: 0.7rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .calendar-event:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1050;
        }
        @media (max-width: 768px) {
          .month-view td {
            height: 60px !important;
            padding: 0.25rem !important;
            font-size: 0.8rem;
          }
          .calendar-event {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default HolidayCalender;
