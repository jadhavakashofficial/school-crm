School Management System

A full-featured School Management System built using the MERN stack. This project includes separate dashboards for administrators and teachers, with functionality to manage teachers, students, and classes. It also provides financial analytics and class analysis features, including filtering, sorting, and pagination.


Features

Role-Based Dashboards:
  - Admin Dashboard: Manage teachers, students, classes, view financial analytics (with monthly/yearly toggle), and class analysis (gender ratio).
  - Teacher Dashboard: View assigned classes, manage students (add/delete), and see class analysis.
CRUD Operations:
  - Create, read, update, and delete operations for teachers, students, and classes.
  Sorting, Filtering, and Pagination:
  - Integrated for teachers, students, and classes lists (pagination visible only when records exceed 5).
  Analytics and Visualization: 
  - Financial analytics displayed using a Doughnut chart.
  - Class analysis (gender ratio) displayed using a Bar chart.
  Authentication & Authorization: 
  - Role-based access control implemented with JWT.
- Responsive UI:
  - Built with Tailwind CSS for a modern, responsive design.
- Notifications:
  - Toast notifications provided by react-toastify.

Technologies Used

Frontend: React, React Router, Tailwind CSS, Chart.js, react-chartjs-2, react-toastify, react-hook-form

Backend:  Node.js, Express.js, MongoDB, Mongoose

Other: Axios, dotenv


Installation

Prerequisites

- Node.js and npm installed
- MongoDB installed or a cloud MongoDB service (e.g., MongoDB Atlas)
- Git

Backend Setup
 Clone the repository:

   cd school-management/backend


Install dependencies
npm install

PORT=5001
MONGO_URI=your_mongodb_connection_string

Start the backend server 
npm run dev

Usage
Admin Dashboard:
Manage teachers, students, and classes.
Use filtering, sorting, and pagination on each list (pagination appears only if there are more than 5 records).
View Financial Analytics with a period selector (Monthly/Yearly) using a Doughnut chart.
View Class Analysis with a Bar chart showing the gender ratio.
Teacher Dashboard:
View your assigned classes.
Manage students (add and delete).
View class analysis (gender ratio).

