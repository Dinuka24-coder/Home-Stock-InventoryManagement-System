import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/verify-otp.css"

function VerifyOTP() {
  const [email, setEmail] = useState(""); // User's email
  const [otp, setOtp] = useState(""); // OTP input
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("OTP verified successfully!");
        setTimeout(() => navigate("/reset-password", { state: { email } }), 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      setMessage("Error verifying OTP. Try again.");
    }
  };

  return (
    <div className="verify-otp-container">
      <h2>Verify OTP</h2>
      <p>Enter the OTP sent to your email.</p>

      <form onSubmit={handleVerifyOTP}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />
        <button type="submit">Verify OTP</button>
      </form>

      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default VerifyOTP;
