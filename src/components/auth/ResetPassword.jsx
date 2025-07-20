import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { config } from "../../utils/config";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 10 * 60 * 1000; // 10 minutes

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  React.useEffect(() => {
    if (lockedUntil && Date.now() > lockedUntil) {
      setLockedUntil(null);
      setAttempts(0);
    }
  }, [lockedUntil]);
  
  const navigate = useNavigate();

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ password }) => {
    const getStrength = (password) => {
      if (!password) return { score: 0, label: "", color: "gray" };
      
      let score = 0;
      if (password.length >= 8) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[a-z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      
      const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
      const colors = ["red", "orange", "yellow", "lightgreen", "green"];
      
      return {
        score: Math.min(score, 4),
        label: labels[score],
        color: colors[score]
      };
    };

    const strength = getStrength(password);
    const width = ((strength.score + 1) / 5) * 100;

    return (
      <div className="mt-2">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Password Strength:</span>
          <span className={`font-medium text-${strength.color}-600`}>{strength.label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 bg-${strength.color}-500`}
            style={{ width: `${width}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Validate password strength
  const validatePassword = (password) => {
    if (!password) return { valid: false, message: "Password is required" };
    if (password.length < 8) return { valid: false, message: "Password must be at least 8 characters long" };
    if (!/[A-Z]/.test(password)) return { valid: false, message: "Password must contain at least one uppercase letter" };
    if (!/[a-z]/.test(password)) return { valid: false, message: "Password must contain at least one lowercase letter" };
    if (!/\d/.test(password)) return { valid: false, message: "Password must contain at least one number" };
    return { valid: true };
  };

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (lockedUntil && Date.now() < lockedUntil) {
      setError("Too many incorrect attempts. Please try again later.");
      setLoading(false);
      return;
    }

    // Validate inputs
    if (!form.password || !form.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!otp) {
      setError("Please enter the OTP sent to your email.");
      setLoading(false);
      return;
    }

    if (!token) {
      setError("Invalid reset link");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.baseURL + '/auth/reset-password', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token,
          otp,
          newPassword: form.password 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setAttempts(a => a + 1);
        if (attempts + 1 >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCK_DURATION);
          setError("Too many incorrect attempts. Please try again in 10 minutes.");
        } else {
          setError(data.message || "Incorrect OTP. Attempts left: " + (MAX_ATTEMPTS - attempts - 1));
        }
      } else {
        setSuccess(true);
        toast.success("Password reset successfully!");
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(60);
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(config.baseURL + '/auth/resend-reset-otp', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend OTP");
      }
      toast.success("OTP sent to your email!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
        <motion.div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Request New Reset Link
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4">
      <Toaster position="top-center" />
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-orange-700 mb-2 flex items-center justify-center gap-2">
            <span role="img" aria-label="lock">🔒</span> Reset Password
          </h2>
          <p className="text-orange-600">
            Enter your new password below.
          </p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="New Password"
                value={form.password}
                onChange={handleInput}
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg pr-12"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            
            {form.password && <PasswordStrengthIndicator password={form.password} />}
            
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={form.confirmPassword}
                onChange={handleInput}
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <div className="text-red-600 text-sm">Passwords do not match</div>
            )}
            
            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors duration-200 shadow-md disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800">Password Reset Successfully</h3>
            <p className="text-gray-600">
              Your password has been updated. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword; 