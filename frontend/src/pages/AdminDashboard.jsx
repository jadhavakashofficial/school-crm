// frontend/src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Table from "../components/Table";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import "chart.js/auto";

const AdminDashboard = () => {
  // Active tab: "teachers", "students", "classes", "financial", "analysis"
  const [activeTab, setActiveTab] = useState("teachers");
  // State for period selection in Financial Analytics ("monthly" or "yearly")
  const [financialPeriod, setFinancialPeriod] = useState("monthly");

  // Data states
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [financialData, setFinancialData] = useState(null);

  // Modal and Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentItem, setCurrentItem] = useState(null); // For Edit
  const [formData, setFormData] = useState({});

  // Error state
  const [error, setError] = useState("");

  // Fetch data when activeTab or financialPeriod changes
  useEffect(() => {
    if (activeTab === "teachers") {
      fetchTeachers();
    } else if (activeTab === "students" || activeTab === "analysis") {
      fetchStudents();
    } else if (activeTab === "classes") {
      fetchClasses();
    } else if (activeTab === "financial") {
      fetchFinancialData();
    }
  }, [activeTab, financialPeriod]);

  // Fetch functions
  const fetchTeachers = async () => {
    try {
      const response = await axiosInstance.get("/teachers");
      setTeachers(response.data.data);
    } catch (err) {
      setError("Failed to fetch teachers.");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axiosInstance.get("/students");
      // Map contactNumber (adjust mapping as needed)
      const mappedStudents = response.data.data.map((student) => ({
        ...student,
        contactNumber: student.contactNumber,
      }));
      setStudents(mappedStudents);
    } catch (err) {
      setError("Failed to fetch students.");
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("/classes");
      setClasses(response.data.data);
    } catch (err) {
      setError("Failed to fetch classes.");
    }
  };

  const fetchFinancialData = async () => {
    try {
      // Pass the financial period as a query parameter
      const response = await axiosInstance.get(`/financial/analytics?period=${financialPeriod}`);
      setFinancialData(response.data.data);
    } catch (err) {
      setError("Failed to load financial analytics.");
    }
  };

  // Open Modal for Add/Edit
  const openModal = (type, item = null) => {
    setError("");
    setCurrentItem(item);
    if (type === "add") {
      setModalTitle(`Add New ${capitalize(activeTab.slice(0, -1))}`);
      setFormData(getInitialFormData(activeTab, null));
    } else if (type === "edit") {
      setModalTitle(`Edit ${capitalize(activeTab.slice(0, -1))}`);
      setFormData(getInitialFormData(activeTab, item));
    }
    setIsModalOpen(true);
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentItem(null);
    setFormData({});
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = value;
    if (type === "checkbox") {
      val = checked ? 1 : 0;
    }
    setFormData({ ...formData, [name]: val });
  };

  // Handle Add/Edit form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (activeTab === "financial" || activeTab === "analysis") {
        // Financial/analysis operations handled separately if needed
        return;
      }
      if (currentItem) {
        // Edit operation
        await axiosInstance.put(`/${activeTab}/${currentItem._id}`, formData);
      } else {
        // Add operation
        await axiosInstance.post(`/${activeTab}`, formData);
      }
      fetchDataAfterChange();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  // Handle Delete operation
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axiosInstance.delete(`/${activeTab}/${id}`);
        fetchDataAfterChange();
      } catch (err) {
        setError(err.response?.data?.message || "Delete failed.");
      }
    }
  };

  // Refresh data after operations
  const fetchDataAfterChange = () => {
    if (activeTab === "teachers") {
      fetchTeachers();
    } else if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "classes") {
      fetchClasses();
    } else if (activeTab === "financial") {
      fetchFinancialData();
    } else if (activeTab === "analysis") {
      fetchStudents();
    }
  };

  // Utility: Capitalize first letter
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // Helper to format DOB for students.
  // Converts a date string from "dd/mm/yyyy" or ISO format to "YYYY-MM-DD"
  const formatDOB = (dobString) => {
    if (!dobString) return "";
    if (dobString.includes("/")) {
      const parts = dobString.split("/");
      if (parts.length !== 3) return "";
      const [day, month, year] = parts;
      const paddedDay = day.padStart(2, "0");
      const paddedMonth = month.padStart(2, "0");
      return `${year}-${paddedMonth}-${paddedDay}`;
    } else {
      const dateObj = new Date(dobString);
      if (isNaN(dateObj.getTime())) return "";
      return dateObj.toISOString().split("T")[0];
    }
  };

  // getInitialFormData formats initial form values based on tab
  const getInitialFormData = (tab, item) => {
    if (tab === "teachers") {
      return item
        ? { name: item.name, email: item.email, salary: item.salary }
        : { name: "", email: "", salary: "" };
    } else if (tab === "students") {
      return item
        ? {
            name: item.name,
            email: item.email,
            gender: item.gender,
            feesPaid: item.feesPaid,
            // Format DOB using formatDOB helper
            dob: item.dob ? formatDOB(item.dob) : "",
            contactNumber: item.contactNumber,
          }
        : { name: "", email: "", gender: "", feesPaid: 0, dob: "", contactNumber: "" };
    } else if (tab === "classes") {
      return item
        ? { name: item.name, description: item.description, teacherId: item.teacher._id, maxStudents: item.maxStudents, fee: item.fee }
        : { name: "", description: "", teacherId: "", maxStudents: "", fee: "" };
    }
  };

  // Define table headers based on activeTab
  const getTableHeaders = () => {
    if (activeTab === "teachers") {
      return [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "salary", label: "Salary (₹)" },
      ];
    } else if (activeTab === "students") {
      return [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "contactNumber", label: "Contact Number" },
        { key: "gender", label: "Gender" },
        { key: "feesPaid", label: "Fees Paid (₹)" },
        { key: "dob", label: "DOB" },
      ];
    } else if (activeTab === "classes") {
      return [
        { key: "name", label: "Name" },
        { key: "teacherName", label: "Teacher" },
        { key: "maxStudents", label: "Max Students" },
        { key: "fee", label: "Fee (₹)" },
      ];
    }
    return [];
  };

  // Prepare data for Classes table (to display teacher name)
  const getClassesData = () => {
    return classes.map((cls) => ({
      ...cls,
      teacherName: cls.teacher.name,
    }));
  };

  // Prepare data for Students table (format feesPaid and dob)
  const getStudentsData = () => {
    return students.map((student) => ({
      ...student,
      feesPaid: student.feesPaid > 0 ? student.feesPaid : "No",
      dob: new Date(student.dob).toLocaleDateString(),
    }));
  };

  // Prepare data for Financial Analytics using Doughnut chart
  const getFinancialDoughnutData = () => {
    if (!financialData) return {};
    return {
      labels: ["Salary Paid", "Fees Collected", "Profit"],
      datasets: [
        {
          data: [financialData.salary, financialData.feesCollected, financialData.profit],
          backgroundColor: ["#f87171", "#34d399", "#60a5fa"],
        },
      ],
    };
  };

  // Helper function to calculate maximum allowed DOB (for minimum age of 6)
  const getMaxDOB = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 6);
    return today.toISOString().split("T")[0];
  };

  // Helper function for Class Analysis (using students data)
  const getGenderRatioData = () => {
    const maleCount = students.filter((s) => s.gender === "Male").length;
    const femaleCount = students.filter((s) => s.gender === "Female").length;
    return {
      labels: ["Male", "Female"],
      datasets: [
        {
          label: "Number of Students",
          data: [maleCount, femaleCount],
          backgroundColor: ["#3490dc", "#e3342f"],
        },
      ],
    };
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "teachers"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("teachers")}
          >
            Teachers
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "students"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("students")}
          >
            Students
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "classes"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("classes")}
          >
            Classes
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "financial"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("financial")}
          >
            Financial Analytics
          </button>
          <button
            className={`px-4 py-2 font-semibold ${
              activeTab === "analysis"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("analysis")}
          >
            Class Analysis
          </button>
        </div>

        {/* Add Button (not shown for Financial or Analysis tabs) */}
        {activeTab !== "financial" && activeTab !== "analysis" && (
          <div className="flex justify-end">
            <button
              onClick={() => openModal("add")}
              className="px-4 py-2 mb-4 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
            >
              Add {capitalize(activeTab.slice(0, -1))}
            </button>
          </div>
        )}

        {/* Content Section */}
        {activeTab === "teachers" && (
          <section>
            <Table
              headers={getTableHeaders()}
              data={teachers}
              onEdit={(item) => openModal("edit", item)}
              onDelete={(id) => handleDelete(id)}
            />
          </section>
        )}

        {activeTab === "students" && (
          <section>
            <Table
              headers={getTableHeaders()}
              data={getStudentsData()}
              onEdit={(item) => openModal("edit", item)}
              onDelete={(id) => handleDelete(id)}
            />
          </section>
        )}

        {activeTab === "classes" && (
          <section>
            <Table
              headers={getTableHeaders()}
              data={getClassesData()}
              onEdit={(item) => openModal("edit", item)}
              // Teachers should not see a delete button for classes.
              onDelete={null}
            />
          </section>
        )}

{activeTab === "financial" && (
  <section className="space-y-6">
    <h2 className="text-2xl font-semibold text-gray-700">Financial Analytics</h2>
    <div className="flex items-center space-x-4">
      <label className="font-medium text-gray-700">Period:</label>
      <select
        value={financialPeriod}
        onChange={(e) => setFinancialPeriod(e.target.value)}
        className="px-3 py-2 border rounded"
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>
    </div>
    {financialData ? (
      <div
        className="bg-white p-9 rounded shadow flex justify-center items-center mx-auto"
        style={{ width: "500px", height: "500px" }}
      >
        <h3 className="sr-only">Financial Summary</h3>
        <Doughnut
          data={getFinancialDoughnutData()}
          options={{ maintainAspectRatio: false }}
          height={300}
          width={300}
        />
      </div>
    ) : (
      <div>Loading Financial Analytics...</div>
    )}
  </section>
)}



        {activeTab === "analysis" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Class Analysis: Gender Ratio</h2>
            {students.length > 0 ? (
              <div className="bg-white p-4 rounded shadow">
                <Bar data={getGenderRatioData()} />
              </div>
            ) : (
              <div>Loading Class Analysis...</div>
            )}
          </section>
        )}

        {/* Modal for Add/Edit (shown for Teachers, Students, and Classes) */}
        {(activeTab !== "financial" && activeTab !== "analysis") && (
          <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === "teachers" && (
                <>
                  <div>
                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.email || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="salary" className="block mb-1 text-sm font-medium text-gray-700">
                      Salary (₹)
                    </label>
                    <input
                      type="number"
                      id="salary"
                      name="salary"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.salary || ""}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>
                </>
              )}

              {activeTab === "students" && (
                <>
                  <div>
                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.email || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="feesPaid" className="block mb-1 text-sm font-medium text-gray-700">
                      Fees Paid (₹)
                    </label>
                    <input
                      type="number"
                      id="feesPaid"
                      name="feesPaid"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.feesPaid || 0}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="dob" className="block mb-1 text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dob"
                      name="dob"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.dob || ""}
                      onChange={handleChange}
                      required
                      max={getMaxDOB()}  // Enforce that the student is at least 6 years old
                    />
                  </div>
                  <div>
                    <label htmlFor="contactNumber" className="block mb-1 text-sm font-medium text-gray-700">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      id="contactNumber"
                      name="contactNumber"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.contactNumber || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </>
              )}

              {activeTab === "classes" && (
                <>
                  <div>
                    <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.name || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.description || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="teacherId" className="block mb-1 text-sm font-medium text-gray-700">
                      Teacher
                    </label>
                    <select
                      id="teacherId"
                      name="teacherId"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.teacherId || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="maxStudents" className="block mb-1 text-sm font-medium text-gray-700">
                      Max Students
                    </label>
                    <input
                      type="number"
                      id="maxStudents"
                      name="maxStudents"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.maxStudents || ""}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label htmlFor="fee" className="block mb-1 text-sm font-medium text-gray-700">
                      Fee (₹)
                    </label>
                    <input
                      type="number"
                      id="fee"
                      name="fee"
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
                      value={formData.fee || ""}
                      onChange={handleChange}
                      required
                      min="0"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="p-3 text-red-700 bg-red-100 border border-red-400 rounded">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 font-semibold text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  {currentItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
