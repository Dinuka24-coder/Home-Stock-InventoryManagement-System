import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/reset-password.css"; // Import the CSS file

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ""; // Retrieve email from previous step

  // Add class to body when component mounts
  useEffect(() => {
    document.body.classList.add("reset-password-page");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("reset-password-page");
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/"), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error resetting password. Try again.");
    }
  };

  return (
    <div className="reset-password-container">
      <h2>Reset Password</h2>
      <p>Enter your new password below.</p>

      <form onSubmit={handleResetPassword}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ResetPassword;