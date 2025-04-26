import Layout from "../components/Layout";
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2
import jsPDF from "jspdf"; // Import jsPDF
import "jspdf-autotable"; // Import jsPDF autoTable for tables (optional)
import "../styles/Dashboard.css"; // Import CSS file

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ fullName: "", email: "", profilePic: "" });
  const [editMode, setEditMode] = useState(false);
  const [updatedUser, setUpdatedUser] = useState({ fullName: "", email: "" });
  const [image, setImage] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    const token = localStorage.getItem("userToken");

    if (!token) {
      navigate("/"); // Redirect to login if not logged in
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ fullName: data.fullName, email: data.email, profilePic: data.profilePic });
        setUpdatedUser({ fullName: data.fullName, email: data.email }); // Set values for editing
      } else {
        navigate("/"); 
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/"); 
    }
  }, [navigate]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleChange = (e) => {
    setUpdatedUser({ ...updatedUser, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("userToken");

    try {
      const response = await fetch("http://localhost:3000/api/users/update", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile updated successfully!",
          confirmButtonColor: "#007bff",
        });
        setUser({ ...user, fullName: updatedUser.fullName, email: updatedUser.email });
        setEditMode(false);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to update profile.",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("userToken");

    if (!image) {
      Swal.fire({
        icon: "warning",
        title: "No Image Selected",
        text: "Please select an image first!",
        confirmButtonColor: "#ffc107",
      });
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", image);

    try {
      const response = await fetch("http://localhost:3000/api/users/upload-profile", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`, // checking the token to verify the user
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Profile picture updated successfully!",
          confirmButtonColor: "#007bff",
        });
        setUser({ ...user, profilePic: data.profilePic });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to upload profile picture.",
          confirmButtonColor: "#dc3545",
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Something went wrong!",
        confirmButtonColor: "#dc3545",
      });
    }
  };

  // Function to generate and download the PDF
  const downloadProfilePDF = () => {
    const doc = new jsPDF();

    // Add profile picture and text
    doc.setFontSize(18);
    doc.text("User Profile", 14, 16);

    // Add profile picture
    const profilePicUrl = user.profilePic
      ? `http://localhost:3000/uploads/${user.profilePic}`
      : "https://via.placeholder.com/100";
    doc.addImage(profilePicUrl, "JPEG", 14, 30, 50, 50);

    // Add profile details (name and email)
    doc.setFontSize(12);
    doc.text(`Full Name: ${user.fullName}`, 14, 90);
    doc.text(`Email: ${user.email}`, 14, 100);

    // Save PDF
    doc.save("user-profile.pdf");
  };

  return (
    <Layout>
      <div className="dashboard-container">
        <h2 className="dashboard-header">User Dashboard</h2>

        {/* Profile Picture Section */}
        <img
          src={user.profilePic ? `http://localhost:3000/uploads/${user.profilePic}` : "https://via.placeholder.com/100"}
          alt="Profile"
          className="profile-picture"
        />
        <form onSubmit={handleImageUpload} className="upload-form">
          <label htmlFor="file-upload" className="file-input-label">
            Choose File
            <input
              id="file-upload"
              type="file"
              className="file-input"
              onChange={(e) => setImage(e.target.files[0])}
              required
            />
          </label>
          <button type="submit" className="upload-btn">Upload</button>
        </form>

        {/* Profile Editing Section */}
        <form className="profile-form">
          <label><strong>Full Name:</strong></label>
          <input
            type="text"
            name="fullName"
            value={updatedUser.fullName}
            onChange={handleChange}
            readOnly={!editMode}
            className="profile-input"
          />

          <label><strong>Email:</strong></label>
          <input
            type="email"
            name="email"
            value={updatedUser.email}
            onChange={handleChange}
            readOnly={!editMode}
            className="profile-input"
          />

          {!editMode ? (
            <button type="button" onClick={() => setEditMode(true)} className="edit-btn">Edit Profile</button>
          ) : (
            <button type="button" onClick={handleUpdate} className="save-btn">Save Changes</button>
          )}
        </form>

        {/* Download Profile as PDF Button */}
        <button onClick={downloadProfilePDF} className="download-btn">
          Download Profile as PDF
        </button>
      </div>
    </Layout>
  );
}

export default Dashboard;
