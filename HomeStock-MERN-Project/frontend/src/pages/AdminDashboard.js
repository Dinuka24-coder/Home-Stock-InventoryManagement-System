import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("userToken");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/users/all-users", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          const formattedUsers = data.map(user => ({
            ...user,
            lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never logged in'
          }));
          setUsers(formattedUsers);
        } else {
          setError(data.message);
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const handleDeleteUser = async (userId) => {
    const token = localStorage.getItem("userToken");

    Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(`http://localhost:3000/api/users/delete-user/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          const data = await response.json();
          if (response.ok) {
            Swal.fire("Deleted!", "User has been removed.", "success");
            setUsers(users.filter((user) => user._id !== userId));
          } else {
            Swal.fire("Error!", data.message, "error");
          }
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error!", "Something went wrong!", "error");
        }
      }
    });
  };

  const downloadPDF = () => {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm"
    });

    // Add logo or header image (replace with your actual image path)
    // const imgData = '/path/to/your/logo.png';
    // doc.addImage(imgData, 'PNG', 15, 10, 30, 15);

    // Report title
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.text("User Management Report", 148, 20, { align: "center" });

    // Report subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont("helvetica", "normal");
    doc.text("HomeStock Management System", 148, 28, { align: "center" });

    // Report date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 148, 35, { align: "center" });

    // Add table using autoTable
    doc.autoTable({
      startY: 45,
      head: [
        [
          { content: 'Full Name', styles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
          { content: 'Email', styles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
          { content: 'Role', styles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } },
          { content: 'Last Login', styles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' } }
        ]
      ],
      body: users.map(user => [
        user.fullName,
        user.email,
        user.isAdmin ? "Admin" : "User",
        user.lastLogin
      ]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      },
      columnStyles: {
        0: { cellWidth: 40, halign: 'left' },  // Full Name
        1: { cellWidth: 60, halign: 'left' },  // Email
        2: { cellWidth: 20, halign: 'center' }, // Role
        3: { cellWidth: 40, halign: 'left' }   // Last Login
      },
      margin: { left: 10, right: 10 }
    });

    // Footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(
        `Page ${i} of ${pageCount}`,
        148,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }

    // Save the PDF with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    doc.save(`HomeStock_User_Report_${timestamp}.pdf`);
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        {error && <p className="error-message">{error}</p>}
        {loading ? (
          <p className="loading-text">Loading users...</p>
        ) : (
          <>
            <div className="report-controls">
              <button className="download-btn" onClick={downloadPDF}>
                <i className="fas fa-file-pdf"></i> Generate PDF Report
              </button>
              <span className="user-count">{users.length} users found</span>
            </div>
            <div className="table-container">
              <table className="admin-dashboard-table">
                <thead>
                  <tr>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td className={user.isAdmin ? "role-admin" : "role-user"}>
                        {user.isAdmin ? "Admin" : "User"}
                      </td>
                      <td>{user.lastLogin}</td>
                      <td>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="delete-btn"
                        >
                          <i className="fas fa-trash-alt"></i> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default AdminDashboard;