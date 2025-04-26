import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/forgot-password.css" // Import the CSS file

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Add class to body when component mounts
  useEffect(() => {
    document.body.classList.add("forgot-password-page");

    // Cleanup function to remove the class when component unmounts
    return () => {
      document.body.classList.remove("forgot-password-page");
    };
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setMessage(""); // Reset message

    try {
      const response = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP sent successfully! Check your email.");
        setTimeout(() => navigate("/verify-otp"), 2000); // Redirect to OTP page after 2s
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error sending OTP. Try again.");
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <p>Enter your email, and we’ll send you an OTP to reset your password.</p>

      <form onSubmit={handleForgotPassword}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Send OTP</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default ForgotPassword;