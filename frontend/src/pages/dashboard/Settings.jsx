import React, { useState } from "react";
import {
  User, KeyRound, Bell, Moon, Sun, Trash2, AlertOctagon,
  CheckCircle, Loader2, ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/client";

export default function Settings() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ text: "", isError: false });

  // Preferences state
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");

  // Privacy action state
  const [clearHistoryLoading, setClearHistoryLoading] = useState(false);
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", isError: true });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: "New password must be at least 6 characters.", isError: true });
      return;
    }

    setPasswordLoading(true);
    setPasswordMsg({ text: "", isError: false });
    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword }, token);
      setPasswordMsg({ text: "Password changed successfully.", isError: false });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({ text: err.message || "Failed to change password.", isError: true });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all your analysis history?")) return;
    setClearHistoryLoading(true);
    try {
      await api.deleteAllHistory(token);
      setActionMsg("All analysis history has been deleted.");
      setTimeout(() => setActionMsg(""), 3500);
    } catch (err) {
      alert("Failed to delete history: " + err.message);
    } finally {
      setClearHistoryLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("CAUTION: This will permanently delete your MEDiScan account and all associated data. This action cannot be undone.")) return;
    setDeleteAccountLoading(true);
    try {
      await api.deleteAccount(token);
      logout();
      navigate("/signup");
    } catch (err) {
      alert("Failed to delete account: " + err.message);
      setDeleteAccountLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#111827] font-display">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account credentials, preferences, and privacy controls</p>
      </div>

      {actionMsg && (
        <div className="flex items-center gap-2 p-3.5 bg-[#edf5f0] border border-[#cbe2d4] text-[#1e4d2b] rounded-xl text-sm font-medium">
          <CheckCircle size={18} />
          {actionMsg}
        </div>
      )}

      {/* ── 1. ACCOUNT ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Account</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Quick Link */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 hover:bg-gray-50/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#edf5f0] text-[#1e4d2b] flex items-center justify-center font-bold text-sm">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111827]">{user?.name || "Priyanshi"}</p>
                <p className="text-xs text-gray-500">{user?.email || "email@example.com"}</p>
              </div>
            </div>
            <Link
              to="/dashboard/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1e4d2b] hover:underline"
            >
              Edit Profile <ArrowRight size={14} />
            </Link>
          </div>

          {/* Change Password Form */}
          <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-bold text-[#111827]">
              <KeyRound size={16} className="text-[#1e4d2b]" /> Change Password
            </div>

            {passwordMsg.text && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  passwordMsg.isError
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4]"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-5 py-2 bg-[#1e4d2b] text-white rounded-xl text-xs font-semibold hover:bg-[#163b21] transition-colors disabled:opacity-50 inline-flex items-center gap-2"
              >
                {passwordLoading && <Loader2 size={14} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── 2. PREFERENCES ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Preferences</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Bell size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">System Notifications</p>
                <p className="text-xs text-gray-500">Receive analysis completion alerts and health reminders</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-5 h-5 accent-[#1e4d2b] rounded cursor-pointer"
            />
          </div>

          <div className="h-px bg-gray-100" />

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center">
                {theme === "light" ? <Sun size={17} /> : <Moon size={17} />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#111827]">Appearance Theme</p>
                <p className="text-xs text-gray-500">Choose your interface display preference</p>
              </div>
            </div>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#1e4d2b]"
            >
              <option value="light">Light Clean Mode</option>
              <option value="dark">Dark Mode (Coming Soon)</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 3. PRIVACY ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider">Privacy &amp; Data</h2>
        </div>

        <div className="p-6 space-y-5">
          {/* Delete Analysis History */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/70">
            <div>
              <p className="text-sm font-semibold text-[#111827] flex items-center gap-1.5">
                <Trash2 size={16} className="text-gray-500" /> Delete Analysis History
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                Permanently clear all your saved symptom entries, predictions, and reports.
              </p>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={clearHistoryLoading}
              className="px-4 py-2 border border-gray-300 hover:border-red-300 hover:text-red-600 text-gray-700 rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
            >
              {clearHistoryLoading ? "Clearing..." : "Clear All History"}
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-200 bg-red-50/30">
            <div>
              <p className="text-sm font-bold text-red-700 flex items-center gap-1.5">
                <AlertOctagon size={16} /> Delete Account
              </p>
              <p className="text-xs text-red-600/80 mt-0.5">
                Irreversibly delete your MEDiScan account, profile, and all medical records.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              disabled={deleteAccountLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 disabled:opacity-50"
            >
              {deleteAccountLoading ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
