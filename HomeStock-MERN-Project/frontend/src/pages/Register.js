import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate for redirection
import Swal from "sweetalert2"; // Import SweetAlert2
import { FaUserPlus } from "react-icons/fa"; // Import user icon
import "./../styles/register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        title: "Error!",
        text: "Passwords do not match!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Swal.fire({
          title: "Success!",
          text: "Registration successful! You can now log in.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          navigate("/"); // Redirect to login page
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <FaUserPlus className="register-icon" /> {/* User Icon */}
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} required />
          <button type="submit">Register</button>
        </form>
        <p>Already have an account? <Link to="/">Login here</Link></p>
      </div>
    </div>
  );
}

export default Register;
