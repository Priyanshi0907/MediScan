import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Sparkles, Clock, BookOpen, Heart, Settings as SettingsIcon,
  User as UserIcon, LogOut, ShieldPlus, ChevronDown, Bell, Stethoscope,
  Check, Trash2, ExternalLink
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const primaryNav = [
  { to: "/dashboard", label: "Analyze Symptoms", Icon: Sparkles, end: true },
  { to: "/dashboard/history", label: "My History", Icon: Clock },
  { to: "/dashboard/library", label: "Disease Library", Icon: BookOpen },
  { to: "/dashboard/insights", label: "Health Insights", Icon: Heart },
];

const secondaryNav = [
  { to: "/dashboard/settings", label: "Settings", Icon: SettingsIcon },
  { to: "/dashboard/profile", label: "My Profile", Icon: UserIcon },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Real-time notification system
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("mediscan_notifications");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      {
        id: "1",
        title: "Welcome to MEDiScan",
        message: "Your AI symptom analysis engine is ready for use.",
        time: "Just now",
        read: false,
        type: "info",
      },
      {
        id: "2",
        title: "Disease Knowledge Base Updated",
        message: "Over 54 comprehensive medical conditions and care guidelines are available in your library.",
        time: "10m ago",
        read: false,
        type: "update",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("mediscan_notifications", JSON.stringify(notifications));
  }, [notifications]);

  // Real-time event listener for live notifications across pages
  useEffect(() => {
    const handleNewNotif = (event) => {
      if (event.detail) {
        setNotifications((prev) => [event.detail, ...prev]);
      }
    };
    window.addEventListener("mediscan_new_notification", handleNewNotif);
    return () => window.removeEventListener("mediscan_new_notification", handleNewNotif);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const deleteNotification = (id, e) => {
    if (e) e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const initials = (user?.name || "Priyanshi")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const onLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="h-screen w-screen bg-sand-100 flex overflow-hidden">
      {/* ── STATIC FIXED SIDEBAR (ENDS IN ONE PAGE) ── */}
      <aside className="hidden lg:flex flex-col w-64 h-screen shrink-0 bg-[#0c1e14] text-white border-r border-white/5 justify-between select-none overflow-hidden">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="px-6 pt-6 pb-4 flex items-start gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0 mt-0.5">
              <ShieldPlus size={22} strokeWidth={2.2} />
            </div>
            <div className="leading-tight">
              <p className="font-display font-extrabold text-lg text-white tracking-tight">MEDiScan</p>
              <p className="text-[11px] text-white/55 mt-0.5 leading-snug">
                Disease Analysis &amp; Personal Health Insights
              </p>
            </div>
          </div>

          {/* Primary Nav List */}
          <nav className="px-4 mt-1 space-y-1 overflow-y-auto">
            {primaryNav.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1e4d2b] text-white shadow-xs font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2.2} />
                {label}
              </NavLink>
            ))}

            {/* Divider */}
            <div className="pt-2 pb-1 px-2">
              <div className="h-px bg-white/10 w-full" />
            </div>

            {/* Secondary Nav (Settings, My Profile) */}
            {secondaryNav.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1e4d2b] text-white shadow-xs font-semibold"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2.2} />
                {label}
              </NavLink>
            ))}

            {/* Divider */}
            <div className="pt-2 pb-1 px-2">
              <div className="h-px bg-white/10 w-full" />
            </div>

            {/* Log Out */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-red-500/15 hover:text-red-300 transition-colors text-left"
            >
              <LogOut size={17} strokeWidth={2.2} />
              Log Out
            </button>
          </nav>
        </div>

        {/* Stethoscope Bottom Card */}
        <div className="m-4 rounded-2xl bg-white/[0.06] border border-white/10 p-3.5 text-center shrink-0">
          <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-white/10 flex items-center justify-center text-white">
            <Stethoscope size={20} />
          </div>
          <p className="font-semibold text-xs text-white">Early Detection</p>
          <p className="text-white/50 text-[11px]">Better Outcomes</p>
        </div>
      </aside>

      {/* ── MAIN SCROLLABLE CONTENT AREA ── */}
      <div className="flex-1 h-screen flex flex-col min-w-0 overflow-hidden">
        {/* TOPBAR */}
        <header className="h-18 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-lg bg-brand-light flex items-center justify-center text-brand lg:hidden">
              <ShieldPlus size={18} />
            </span>
            <div>
              <h1 className="font-display font-extrabold text-base sm:text-lg text-[#111827] flex items-center gap-2">
                MEDiScan Portal
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">AI-powered medical text analysis and personal health insights</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-Time Notification Bell Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors"
                title="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-gray-200/90 shadow-xl py-3 z-50 overflow-hidden animate-in fade-in-50">
                  <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-[#111827]">Notifications</p>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#edf5f0] text-[#1e4d2b] font-bold text-[10.5px]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[#1e4d2b] hover:underline font-semibold"
                        >
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          title="Clear all"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No notifications right now
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer group ${
                            !n.read ? "bg-[#edf5f0]/40" : ""
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-[#edf5f0] text-[#1e4d2b] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                            ✚
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-bold text-[#111827] truncate">{n.title}</p>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] text-gray-400">{n.time}</span>
                                <button
                                  onClick={(e) => deleteNotification(n.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-500 text-gray-300 transition-opacity"
                                  title="Delete"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                            <p className="text-[11.5px] text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2.5 pl-1 py-1 pr-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-[#edf5f0] text-[#1e4d2b] flex items-center justify-center font-bold text-xs border border-[#d2e8db]">
                  {initials}
                </span>
                <span className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-[#111827] leading-tight">{user?.name || "Priyanshi"}</p>
                  <p className="text-[10.5px] text-gray-500 leading-tight">{user?.email || "Member"}</p>
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg py-1.5 text-sm z-50">
                  <NavLink
                    to="/dashboard/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-medium"
                  >
                    <UserIcon size={14} /> My Profile
                  </NavLink>
                  <NavLink
                    to="/dashboard/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 text-xs font-medium"
                  >
                    <SettingsIcon size={14} /> Settings
                  </NavLink>
                  <div className="h-px bg-gray-100 my-1" />
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-xs font-medium"
                  >
                    <LogOut size={14} /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        <nav className="lg:hidden flex overflow-x-auto gap-2 px-4 py-2.5 bg-[#0c1e14] text-white border-b border-white/10 scrollbar-thin shrink-0">
          {[...primaryNav, ...secondaryNav].map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? "bg-[#1e4d2b] text-white font-semibold" : "text-white/70 hover:bg-white/10"
                }`
              }
            >
              <Icon size={13} /> {label}
            </NavLink>
          ))}
        </nav>

        {/* MAIN SCROLLABLE VIEWPORT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


