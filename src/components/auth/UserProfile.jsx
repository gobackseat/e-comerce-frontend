import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { config } from "../../utils/config";
import { logout } from "../../store/slices/authSlice";

const UserProfile = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    password: "" // For verification
  });

  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!profileForm.firstName || !profileForm.lastName) {
      setError("First name and last name are required");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.baseURL + '/auth/update-profile', {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileForm.firstName,
          lastName: profileForm.lastName,
          password: profileForm.password
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      // Update local state with new user data
      // You might want to dispatch an action to update the Redux state
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(config.baseURL + '/auth/change-password', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        // Handle token invalidation (401/403)
        if (res.status === 401 || res.status === 403) {
          toast.error("Your session has expired or your password was changed. Please log in again.");
          dispatch(logout());
          navigate("/login");
          return;
        }
        throw new Error(data.message || "Failed to change password");
      }

      toast.success("Password changed successfully! Please log in again.");
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleLogoutAll = async () => {
    try {
      await fetch(config.baseURL + '/auth/logout-all', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });
      
      dispatch(logout());
      navigate("/login");
      toast.success("Logged out from all devices");
    } catch (err) {
      toast.error("Failed to logout from all devices");
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-8">
      <Toaster position="top-center" />
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-orange-500 text-white p-6">
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-orange-100">Manage your account and preferences</p>
          </div>

          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50 p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "profile" 
                      ? "bg-orange-500 text-white" 
                      : "text-gray-700 hover:bg-orange-100"
                  }`}
                >
                  👤 Profile
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "password" 
                      ? "bg-orange-500 text-white" 
                      : "text-gray-700 hover:bg-orange-100"
                  }`}
                >
                  🔒 Password
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === "security" 
                      ? "bg-orange-500 text-white" 
                      : "text-gray-700 hover:bg-orange-100"
                  }`}
                >
                  🛡️ Security
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6">
              {activeTab === "profile" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm({...profileForm, firstName: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm({...profileForm, lastName: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password (for verification)
                      </label>
                      <input
                        type="password"
                        value={profileForm.password}
                        onChange={(e) => setProfileForm({...profileForm, password: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        placeholder="Enter your current password"
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
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
                    >
                      {loading ? "Updating..." : "Update Profile"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type={showOldPassword ? "text" : "password"}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                      >
                        {showOldPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordForm.newPassword && <PasswordStrengthIndicator password={passwordForm.newPassword} />}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-8 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                      </button>
                    </div>
                    {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
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
                      className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60"
                    >
                      {loading ? "Changing..." : "Change Password"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "security" && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Account Status</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Email Verified:</span>
                          <span className={user.isEmailVerified ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                            {user.isEmailVerified ? "✅ Verified" : "❌ Not Verified"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Account Active:</span>
                          <span className={user.isActive ? "text-green-600" : "text-red-600"}>
                            {user.isActive ? "✅ Yes" : "❌ No"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Login:</span>
                          <span>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Session Management</h3>
                      <div className="space-y-3">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🚪 Logout Current Session
                        </button>
                        <button
                          onClick={handleLogoutAll}
                          className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          🚪 Logout All Devices
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile; 