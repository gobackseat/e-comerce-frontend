import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { config } from "../../utils/config";

const MAX_ATTEMPTS = 5;
const LOCK_DURATION = 10 * 60 * 1000; // 10 minutes

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');
  
  const [form, setForm] = useState({
    email: email || "",
    code: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
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

  React.useEffect(() => {
    if (token) {
      setLoading(true);
      fetch(config.baseURL + '/users/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setSuccess(true);
            localStorage.setItem('emailVerified', 'true');
            toast.success('Email verified successfully!');
            setTimeout(() => navigate('/profile'), 2000);
          } else {
            setError(data.error || 'Verification link invalid or expired. Please enter the OTP sent to your email.');
          }
        })
        .catch((err) => {
          setError('Verification failed. Please try manual OTP entry.');
        })
        .finally(() => setLoading(false));
    }
  }, [token, navigate]);

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
    if (!form.email || !form.code) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.baseURL + '/auth/verify-email', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: form.email,
          code: form.code 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setAttempts(a => a + 1);
        if (attempts + 1 >= MAX_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCK_DURATION);
          setError("Too many incorrect attempts. Please try again in 10 minutes.");
        } else {
          setError(data.message || "Incorrect code. Attempts left: " + (MAX_ATTEMPTS - attempts - 1));
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
      localStorage.setItem('emailVerified', 'true');
      toast.success("Email verified successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch(config.baseURL + '/auth/resend-verification', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to resend verification code");
      }

      setResendCooldown(60); // 60 seconds cooldown
      toast.success("Verification code sent successfully!");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

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
            <span role="img" aria-label="email">📧</span> Verify Email
          </h2>
          <p className="text-orange-600">
            Enter the verification code sent to your email address.
          </p>
        </div>

        {loading && token ? (
          <div className="text-center space-y-4">
            <div className="text-orange-600 text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold text-gray-800">Verifying Email...</h3>
            <p className="text-gray-600">
              Please wait while we verify your email address.
            </p>
          </div>
        ) : success ? (
          <div className="text-center space-y-4">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800">Email Verified Successfully</h3>
            <p className="text-gray-600">
              Your email address has been verified. You can now access all features of your account.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleInput}
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
                required
                autoFocus={!email}
              />
            </div>
            
            <div>
              <input
                type="text"
                name="code"
                placeholder="Verification Code (6 digits)"
                value={form.code}
                onChange={handleInput}
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg text-center text-2xl tracking-widest"
                required
                maxLength={6}
                pattern="[0-9]{6}"
                autoFocus={!!email}
              />
            </div>
            
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
              {loading ? "Verifying..." : "Verify Email"}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending || !form.email || resendCooldown > 0}
                className="text-orange-600 hover:text-orange-800 underline disabled:opacity-50"
              >
                {resending ? "Sending..." : "Resend Code"}
                {resendCooldown > 0 && ` (${resendCooldown}s)`}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-orange-600 hover:text-orange-800 underline"
          >
            Back to Login
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailVerification; 