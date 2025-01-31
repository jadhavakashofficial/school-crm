// frontend/src/pages/AdminDashboard.jsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Layout from "../components/Layout";
import Modal from "../components/Modal";
import Table from "../components/Table";
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("teachers"); // 'teachers', 'students', 'classes', 'financial'

  // Data states
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Financial Analytics Data
  const [financialData, setFinancialData] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [currentItem, setCurrentItem] = useState(null); // For Edit

  // Form states
  const [formData, setFormData] = useState({});

  // Error state
  const [error, setError] = useState("");

  // Fetch data based on activeTab
  useEffect(() => {
    if (activeTab === "teachers") {
      fetchTeachers();
    } else if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "classes") {
      fetchClasses();
    } else if (activeTab === "financial") {
      fetchFinancialData();
    }
  }, [activeTab]);

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
      // Map contactNumber from profile to top-level for easy access
      const mappedStudents = response.data.data.map((student) => ({
        ...student,
        contactNumber: student.profile.contactNumber,
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
      const response = await axiosInstance.get("/financial/analytics");
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
    if (type === 'checkbox') {
      val = checked ? 1 : 0; // Convert boolean to number for feesPaid
    }
    setFormData({ ...formData, [name]: val });
  };

  // Handle Add/Edit form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (activeTab === "financial") {
        // Financial operations can be implemented here if needed
        return;
      }

      if (currentItem) {
        // Edit operation
        await axiosInstance.put(`/${activeTab}/${currentItem._id}`, formData);
        fetchDataAfterChange();
      } else {
        // Add operation
        await axiosInstance.post(`/${activeTab}`, formData);
        fetchDataAfterChange();
      }
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed.");
    }
  };

  // Handle Delete
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

  // Fetch data after Add/Edit/Delete
  const fetchDataAfterChange = () => {
    if (activeTab === "teachers") {
      fetchTeachers();
    } else if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "classes") {
      fetchClasses();
    } else if (activeTab === "financial") {
      fetchFinancialData();
    }
  };

  // Utility functions
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const getInitialFormData = (tab, item) => {
    if (tab === "teachers") {
      return item
        ? { name: item.name, email: item.email, salary: item.salary }
        : { name: "", email: "", salary: "" };
    } else if (tab === "students") {
      return item
        ? { name: item.name, email: item.email, gender: item.gender, feesPaid: item.feesPaid, dob: item.dob.substring(0,10), contactNumber: item.contactNumber }
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
        { key: "salary", label: "Salary ($)" },
      ];
    } else if (activeTab === "students") {
      return [
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "contactNumber", label: "Contact Number" },
        { key: "gender", label: "Gender" },
        { key: "feesPaid", label: "Fees Paid ($)" },
        { key: "dob", label: "DOB" },
      ];
    } else if (activeTab === "classes") {
      return [
        { key: "name", label: "Name" },
        { key: "teacherName", label: "Teacher" },
        { key: "maxStudents", label: "Max Students" },
        { key: "fee", label: "Fee ($)" },
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
      feesPaid: student.feesPaid > 0 ? student.feesPaid : 'No',
      dob: new Date(student.dob).toLocaleDateString(),
    }));
  };

  // Prepare data for Financial Analytics
  const getFinancialChartData = () => {
    if (!financialData) return {};

    const barData = {
      labels: ['Salary Paid', 'Fees Collected', 'Profit'],
      datasets: [
        {
          label: 'Amount ($)',
          data: [financialData.salary, financialData.feesCollected, financialData.profit],
          backgroundColor: ['#f87171', '#34d399', '#60a5fa'],
        },
      ],
    };

    const pieData = {
      labels: financialData.genderRatio.map(item => item.gender),
      datasets: [
        {
          data: financialData.genderRatio.map(item => item.count),
          backgroundColor: ['#60a5fa', '#f87171', '#fbbf24'],
        },
      ],
    };

    return { barData, pieData };
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

        {/* Tabs for Teachers, Students, Classes, Financial */}
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
        </div>

        {/* Add Button */}
        {activeTab !== "financial" && (
          <div className="flex justify-end">
            <button
              onClick={() => openModal("add")}
              className="px-4 py-2 mb-4 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
            >
              Add {capitalize(activeTab.slice(0, -1))}
            </button>
          </div>
        )}

        {/* Table Section */}
        {activeTab !== "financial" && (
          <section>
            <Table
              headers={getTableHeaders()}
              data={activeTab === "classes" ? getClassesData() : activeTab === "teachers" ? teachers : getStudentsData()}
              onEdit={(item) => openModal("edit", item)}
              onDelete={(id) => handleDelete(id)}
            />
          </section>
        )}

        {/* Financial Analytics Section */}
        {activeTab === "financial" && (
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-700">Financial Analytics</h2>
            {financialData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salary Paid vs Fees Collection and Profit Bar Chart */}
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-semibold mb-4">Salary Paid vs Fees Collected vs Profit</h3>
                  <Bar data={getFinancialChartData().barData} />
                </div>

                {/* Class Analysis Pie Chart */}
                <div className="bg-white p-4 rounded shadow">
                  <h3 className="text-xl font-semibold mb-4">Class Analysis: Gender Ratio</h3>
                  <Pie data={getFinancialChartData().pieData} />
                </div>
              </div>
            ) : (
              <div>Loading Financial Analytics...</div>
            )}
          </section>
        )}

        {/* Modal for Add/Edit */}
        {activeTab !== "financial" && (
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
                      Salary ($)
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
                      Fees Paid ($)
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
                      Fee ($)
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
