import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../config/api";
import {
  Home,
  FileText,
  Clipboard,
  Menu,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  X
} from "lucide-react";

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<{ profile_picture?: string } | null>(null);
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string; name?: string }>(token);
        setUserRole(decoded.role);
        if (decoded.name) {
          setUserName(decoded.name);
        }

        if (decoded.role === 'student') {
          fetchProfile(token);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await api.get(
        '/api/student/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Profile data received:', response.data);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Close sidebar drawer when route changes on mobile
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Admin Sidebar Items
  const adminMenuItems = [
    { text: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/admin/dashboard" },
    { text: "Create Quiz", icon: <Clipboard className="w-5 h-5" />, path: "/admin/create-quiz" },
    { text: "Upload Assignment", icon: <FileText className="w-5 h-5" />, path: "/admin/upload-assignment" },
  ];

  // Student Sidebar Items
  const studentMenuItems = [
    { text: "Dashboard", icon: <Home className="w-5 h-5" />, path: "/student/dashboard" },
    { text: "Test & Quizzes", icon: <Clipboard className="w-5 h-5" />, path: "/student/test-quizzes" },
    { text: "View & Submit Assignments", icon: <FileText className="w-5 h-5" />, path: "/student/assignments" },
  ];

  // Determine which menu to display based on user role
  const menuItems = userRole === "admin" ? adminMenuItems : userRole === "student" ? studentMenuItems : [];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white text-gray-800 overflow-hidden border-r border-gray-200">
      {/* Sidebar Header */}
      <div className={`flex items-center p-4 border-b border-gray-50 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <h2 className="font-bold text-lg truncate text-gray-900">
            {userRole === 'admin' ? 'Admin Panel' : 'Student Portal'}
          </h2>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden md:flex text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      <div className="border-t border-gray-200" />

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto pt-2 bg-white">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <li key={item.text} className="px-2">
                <NavLink
                  to={item.path}
                  className={`
                    flex items-center w-full no-underline
                    ${collapsed ? 'justify-center py-3' : 'px-4 py-2.5'}
                    ${isActive ? 'bg-red-50 border-l-4 border-red-600 text-red-600' : 'border-l-4 border-transparent text-gray-700'}
                    rounded-r hover:bg-gray-50 transition-all duration-200
                  `}
                  title={collapsed ? item.text : ''}
                >
                  <span className={`${isActive ? 'text-red-600' : 'text-gray-600'} ${collapsed ? '' : 'mr-3'}`}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className={`text-[0.95rem] ${isActive ? 'font-semibold text-red-600' : 'text-gray-700'} truncate`}>
                      {item.text}
                    </span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 mt-auto" />

      {/* Logout Button */}
      <div className="p-2 my-2 bg-white">
        <button
          onClick={handleLogout}
          className={`
            flex items-center w-full text-red-600 no-underline
            ${collapsed ? 'justify-center py-3' : 'px-4 py-2.5'}
            hover:bg-red-50 rounded-r transition-all duration-200 cursor-pointer
          `}
          title={collapsed ? "Logout" : ''}
        >
          <LogOut className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
          {!collapsed && <span className="text-[0.95rem] font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex">
      {/* Fixed Top AppBar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 sm:h-16">
          <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              onClick={handleDrawerToggle}
              className="md:hidden mr-2 text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <img 
              src="/logo.png" 
              alt="Sharks Quiz Logo" 
              className="h-32 sm:h-26 w-auto object-contain"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Notification icon */}
            <button 
              className="relative text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* User role badge and avatar */}
            <div className="flex items-center gap-2">
              {userRole && (
                <span
                  className={`
                    hidden sm:block px-3 py-1 rounded-full text-[0.7rem] font-bold uppercase
                    ${userRole === 'admin' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                    shadow-sm
                  `}
                >
                  {userRole}
                </span>
              )}
              <button 
                className="p-1 hover:bg-gray-100 rounded-full transition-colors" 
                title="Account"
                aria-label="User account"
              >
                {userRole === 'student' && profile?.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm
                      ${userRole === 'admin' ? 'bg-red-600' : 'bg-gray-600'}
                    `}
                  >
                    {userRole === 'admin' ? 'A' : userName?.charAt(0) || 'U'}
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer - Overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleDrawerToggle}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-60 z-50 md:hidden transition-transform duration-300 bg-white shadow-xl">
            <div className="relative h-full">
              {/* Close button */}
              <button
                onClick={handleDrawerToggle}
                className="absolute top-4 right-4 text-gray-600 hover:bg-gray-100 p-2 rounded-lg z-10"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </div>
          </div>
        </>
      )}

      {/* Desktop Sidebar - Fixed */}
      <aside
        className={`
          hidden md:block fixed top-0 left-0 h-full pt-14 sm:pt-16 
          transition-all duration-300 ease-in-out bg-white border-r border-gray-200
          ${collapsed ? 'w-[68px]' : 'w-60'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Main content wrapper */}
      <main
        className={`
          flex-1 pt-14 sm:pt-16 transition-all duration-300 ease-in-out
          ${collapsed ? 'md:ml-[68px]' : 'md:ml-60'}
        `}
      >
        {children}
      </main>
    </div>
  );
};

export default Sidebar;