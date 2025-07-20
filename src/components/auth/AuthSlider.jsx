import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginStart, loginSuccess, loginFailure, registerStart, registerSuccess, registerFailure } from "../../store/slices/authSlice";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "../../utils/config";

const sliderTheme = {
  primary: "#ff9800",
  secondary: "#fff7ed",
  accent: "#ffb74d",
  text: "#3d2c1e",
};

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

const AuthSlider = () => {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [form, setForm] = useState({ 
    email: "", 
    password: "", 
    firstName: "", 
    lastName: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInput = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null); // Clear error when user starts typing
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

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    dispatch(loginStart());

    // Validate inputs
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      dispatch(loginFailure("Please fill in all fields"));
      setLoading(false);
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      dispatch(loginFailure("Please enter a valid email address"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.baseURL + '/auth/signin', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.token) {
        throw new Error("No authentication token received");
      }

      // Fetch user profile
      const userRes = await fetch(config.baseURL + '/auth/me', {
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${data.token}` 
        },
      });
      
      const userData = await userRes.json();
      
      if (!userRes.ok) {
        throw new Error("Failed to fetch user profile");
      }

      dispatch(loginSuccess({ 
        user: userData.data.user, 
        token: data.token 
      }));
      
      toast.success("Login successful!");
      
      if (userData.data.user.isAdmin) {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setError(err.message);
      dispatch(loginFailure(err.message));
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    dispatch(registerStart());

    // Validate inputs
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError("Please fill in all fields");
      dispatch(registerFailure("Please fill in all fields"));
      setLoading(false);
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address");
      dispatch(registerFailure("Please enter a valid email address"));
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(form.password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      dispatch(registerFailure(passwordValidation.message));
      setLoading(false);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      dispatch(registerFailure("Passwords do not match"));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.baseURL + '/users/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: form.email, 
          password: form.password, 
          firstName: form.firstName, 
          lastName: form.lastName 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // If registration includes token (auto-login)
      if (data.token) {
        dispatch(registerSuccess({ 
          user: data.data.user, 
          token: data.token 
        }));
        toast.success("Account created successfully!");
        navigate("/", { replace: true });
      } else {
        // Manual login required
        dispatch(registerSuccess({}));
        toast.success("Account created successfully! Please check your email to verify your account.");
        setMode("login");
        setForm({ email: "", password: "", firstName: "", lastName: "", confirmPassword: "" });
      }
    } catch (err) {
      setError(err.message);
      dispatch(registerFailure(err.message));
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4"
      style={{ fontFamily: "'Segoe UI', 'Roboto', 'Arial', sans-serif" }}
    >
      <Toaster position="top-center" />
      <motion.div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated slider panel */}
        <div className="flex w-[200%]" style={{ transform: mode === "login" ? "translateX(0%)" : "translateX(-50%)", transition: "transform 0.6s cubic-bezier(.77,0,.18,1)" }}>
          {/* Login Panel */}
          <div className="w-full p-8 flex flex-col justify-center items-center bg-white">
            <h2 className="text-3xl font-extrabold text-orange-700 mb-2 flex items-center gap-2">
              <span role="img" aria-label="dog">🐕</span> Welcome Back
            </h2>
            <p className="text-orange-600 mb-6">Sign in to your Dog Backseat Extender account</p>
            <form className="w-full space-y-4" onSubmit={handleLogin} autoComplete="on">
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
                  value={form.email}
                  onChange={handleInput}
                  required
                  autoFocus={mode === "login"}
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg pr-12"
                  value={form.password}
                  onChange={handleInput}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {error && mode === "login" && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors duration-200 shadow-md disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
            <div className="mt-6 text-sm text-orange-700">
              Don't have an account?{' '}
              <button
                className="underline hover:text-orange-900 transition-colors"
                onClick={() => { setMode("register"); setError(null); }}
              >
                Register
              </button>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <button
                className="text-orange-600 hover:text-orange-800 underline"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>
          </div>
          
          {/* Register Panel */}
          <div className="w-full p-8 flex flex-col justify-center items-center bg-orange-50">
            <h2 className="text-3xl font-extrabold text-orange-700 mb-2 flex items-center gap-2">
              <span role="img" aria-label="dog">🐕</span> Create Account
            </h2>
            <p className="text-orange-600 mb-6">Join the Dog Backseat Extender family</p>
            <form className="w-full space-y-4" onSubmit={handleRegister} autoComplete="on">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
                  value={form.firstName}
                  onChange={handleInput}
                  required
                  autoFocus={mode === "register"}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
                  value={form.lastName}
                  onChange={handleInput}
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg"
                value={form.email}
                onChange={handleInput}
                required
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg pr-12"
                  value={form.password}
                  onChange={handleInput}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
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
                  placeholder="Confirm Password"
                  className="w-full px-4 py-3 rounded-lg border border-orange-200 focus:ring-2 focus:ring-orange-400 focus:outline-none text-lg pr-12"
                  value={form.confirmPassword}
                  onChange={handleInput}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <div className="text-red-600 text-sm">Passwords do not match</div>
              )}
              {error && mode === "register" && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg transition-colors duration-200 shadow-md disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
            <div className="mt-6 text-sm text-orange-700">
              Already have an account?{' '}
              <button
                className="underline hover:text-orange-900 transition-colors"
                onClick={() => { setMode("login"); setError(null); }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
        
        {/* Slider indicator */}
        <motion.div
          className="absolute top-4 right-4 flex gap-2"
          initial={false}
          animate={{ x: mode === "login" ? 0 : 40 }}
        >
          <span className={`w-3 h-3 rounded-full ${mode === "login" ? "bg-orange-500" : "bg-orange-200"} transition-colors`}></span>
          <span className={`w-3 h-3 rounded-full ${mode === "register" ? "bg-orange-500" : "bg-orange-200"} transition-colors`}></span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthSlider; 