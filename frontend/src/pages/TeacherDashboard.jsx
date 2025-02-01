
// frontend/src/pages/TeacherDashboard.jsx

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axios";
import Layout from "../components/Layout";

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    gender: "Male",
    assignedClass: "",
    feesPaid: "",
    dob: "",
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axiosInstance.get("/classes");
      setClasses(response.data.data);
    } catch (err) {
      setError("Failed to fetch your classes.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
    setNewStudent({
      name: "",
      email: "",
      gender: "Male",
      assignedClass: "",
      feesPaid: "",
      dob: "",
    });
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/students", newStudent);
      closeModal();
      fetchClasses(); // Refresh class list after adding student
    } catch (err) {
      setError("Failed to add student. Ensure all fields are correct.");
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded">
            {error}
          </div>
        )}

        {/* Classes Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-700">My Classes</h2>
          <div className="flex justify-end">
            <button
              onClick={openModal}
              className="px-4 py-2 mb-4 font-semibold text-white bg-green-600 rounded hover:bg-green-700"
            >
              Add Student
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700">Max Students</th>
                  <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((classItem) => (
                  <tr key={classItem._id} className="hover:bg-gray-100">
                    <td className="px-6 py-4 border-b border-gray-200">{classItem.name}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{classItem.description}</td>
                    <td className="px-6 py-4 border-b border-gray-200">{classItem.maxStudents}</td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <button className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                        Edit
                      </button>
                      <button className="px-3 py-1 ml-2 text-sm text-white bg-red-600 rounded hover:bg-red-700">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Modal for Adding Student */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Add Student</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newStudent.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newStudent.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    name="gender"
                    value={newStudent.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Class</label>
                  <select
                    name="assignedClass"
                    value={newStudent.assignedClass}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fees Paid</label>
                  <input
                    type="number"
                    name="feesPaid"
                    value={newStudent.feesPaid}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={newStudent.dob}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
