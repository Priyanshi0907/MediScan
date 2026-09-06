import React, { useState } from "react";
import { User, Mail, Shield, Bell, LogOut, CheckCircle, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("personal");
  const [name, setName] = useState(user?.name || "Priyanshi");
  const [gender, setGender] = useState("Female");
  const [age, setAge] = useState("24");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [emergencyContact, setEmergencyContact] = useState("+1 (555) 019-2834");

  const [shareAnonymousData, setShareAnonymousData] = useState(true);
  const [saveLocalHistory, setSaveLocalHistory] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [healthReminders, setHealthReminders] = useState(true);

  const [savedMessage, setSavedMessage] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMessage("Profile preferences saved successfully.");
    setTimeout(() => setSavedMessage(""), 3500);
  };

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#111827] font-display">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your personal information, privacy preferences, and notifications</p>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 p-3.5 bg-[#edf5f0] border border-[#cbe2d4] text-[#1e4d2b] rounded-xl text-sm font-medium">
          <CheckCircle size={18} />
          {savedMessage}
        </div>
      )}

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-[#edf5f0] border border-[#d2e8db] flex items-center justify-center text-[#1e4d2b] font-extrabold text-2xl shadow-xs">
            {(user?.name || "Priyanshi")[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">{user?.name || "Priyanshi"}</h2>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 justify-center sm:justify-start mt-0.5">
              <Mail size={14} className="text-gray-400" /> {user?.email || "email@example.com"}
            </p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#edf5f0] text-[#1e4d2b] border border-[#cbe2d4]">
              Active Member
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 bg-red-50/50 hover:bg-red-100/60 font-semibold text-sm transition-colors shadow-xs"
        >
          <LogOut size={16} /> Log Out
        </button>
      </div>

      {/* Account Settings Layout */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-base font-bold text-[#111827]">Account</h3>
          <p className="text-xs text-gray-500 mt-0.5">Configure your account details and security settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200/70 bg-gray-50/70 px-6 gap-6">
          <button
            onClick={() => setActiveTab("personal")}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "personal"
                ? "border-[#1e4d2b] text-[#1e4d2b]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <User size={16} /> Personal Information
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "privacy"
                ? "border-[#1e4d2b] text-[#1e4d2b]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Shield size={16} /> Privacy
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`py-3.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "notifications"
                ? "border-[#1e4d2b] text-[#1e4d2b]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            <Bell size={16} /> Notifications
          </button>
        </div>

        {/* Tab Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {activeTab === "personal" && (
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b] focus:ring-1 focus:ring-[#1e4d2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || "email@example.com"}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                  >
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                  >
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Emergency Contact Number</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#1e4d2b]"
                />
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Save Medical Analysis History</p>
                  <p className="text-xs text-gray-500 mt-0.5">Allow MEDiScan to store your symptom analyses in your private timeline.</p>
                </div>
                <input
                  type="checkbox"
                  checked={saveLocalHistory}
                  onChange={(e) => setSaveLocalHistory(e.target.checked)}
                  className="w-5 h-5 accent-[#1e4d2b] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Anonymized Research & Model Improvement</p>
                  <p className="text-xs text-gray-500 mt-0.5">Help improve NLP symptom extraction accuracy by sharing de-identified phrases.</p>
                </div>
                <input
                  type="checkbox"
                  checked={shareAnonymousData}
                  onChange={(e) => setShareAnonymousData(e.target.checked)}
                  className="w-5 h-5 accent-[#1e4d2b] rounded"
                />
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Email Health Reports & Summaries</p>
                  <p className="text-xs text-gray-500 mt-0.5">Receive structured PDF summaries of your analyses directly to your email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="w-5 h-5 accent-[#1e4d2b] rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200/80 hover:bg-gray-50/50">
                <div>
                  <p className="text-sm font-semibold text-[#111827]">Follow-up & Check-in Reminders</p>
                  <p className="text-xs text-gray-500 mt-0.5">Get gentle 48-hour follow-up reminders after symptom assessments.</p>
                </div>
                <input
                  type="checkbox"
                  checked={healthReminders}
                  onChange={(e) => setHealthReminders(e.target.checked)}
                  className="w-5 h-5 accent-[#1e4d2b] rounded"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1e4d2b] text-white rounded-xl text-sm font-semibold hover:bg-[#163b21] transition-colors shadow-xs"
            >
              <Save size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
