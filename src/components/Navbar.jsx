import axios from "axios";
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./authentication/AuthContext";
import { useTheme } from "./context/ThemeContext";
import { API_BASE_URL } from "../../config";
import LanguageSwitcher from "../components/layout/LangSwitch";

import {
  Layers,
  Settings,
  BarChart3,
  Scissors,
  CheckSquare,
  Shield,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  Menu,
  X,
  TerminalSquare,
  UserPlus,
  Bot,
  Bell,
  Search,
  Home
} from "lucide-react";

export default function Navbar({ onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  // State management
  const [roleManagement, setRoleManagement] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [accessMap, setAccessMap] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Refs
  const profileMenuRef = useRef(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);

  // Enhanced navigation structure with better categorization
  const navStructure = useMemo(
    () => [
      // {
      //   id: "production",
      //   title: "Production",
      //   icon: <Layers size={18} />,
      //   color: "blue",
      //   items: [
      //     {
      //       path: "/bundle-registration",
      //       pageId: "bundle-registration",
      //       title: t("home.bundle_registration"),
      //       description: "Register new bundles"
      //     },
      //     { 
      //       path: "/washing", 
      //       pageId: "washing", 
      //       title: t("home.washing"),
      //       description: "Washing operations"
      //     },
      //     { 
      //       path: "/opa", 
      //       pageId: "opa", 
      //       title: t("home.opa"),
      //       description: "OPA processes"
      //     },
      //     { 
      //       path: "/ironing", 
      //       pageId: "ironing", 
      //       title: t("home.ironing"),
      //       description: "Ironing operations"
      //     },
      //     {
      //       path: "/qc2-inspection",
      //       pageId: "qc2-inspection",
      //       title: t("home.qc2_inspection"),
      //       description: "Quality control inspection"
      //     },
      //     {
      //       path: "/qc2-repair-tracking",
      //       pageId: "qc2-inspection",
      //       title: "Defect Tracking",
      //       description: "Track and manage defects"
      //     },
      //     { 
      //       path: "/packing", 
      //       pageId: "packing", 
      //       title: t("home.packing"),
      //       description: "Packing operations"
      //     },
      //     {
      //       path: "/b-grade-defect",
      //       pageId: "qc2-inspection",
      //       title: "B-Grade Defects",
      //       description: "Manage B-grade defects"
      //     },
      //     {
      //       path: "/b-grade-stcok",
      //       pageId: "qc2-inspection",
      //       title: "B-Grade Stock",
      //       description: "B-grade inventory"
      //     }
      //   ]
      // },
      {
        id: "fabric-cutting",
        title: "F & C",
        icon: <Scissors size={18} />,
        color: "green",
        items: [
          { 
            path: "/Fabric", 
            roles: ["Fabric"], 
            title: t("home.fabric"),
            description: "Fabric management"
          },
          { 
            path: "/cutting", 
            roles: ["Cutting"], 
            title: t("home.cutting"),
            description: "Cutting operations"
          },
          { 
            path: "/scc", 
            roles: ["SCC"], 
            title: t("SCC"),
            description: "SCC processes"
          },
          {
            path: "/upload-beforewash-specs",
            roles: ["Washing Clerk"],
            title: t("home.upload_beforewash_specs"),
            description: "Upload specifications"
          }
        ]
      },
      {
        id: "sewing-qc",
        title: "Sewing",
        icon: <CheckSquare size={18} />,
        color: "purple",
        items: [
          { 
            path: "/roving", 
            roles: ["QC Roving"], 
            title: "QC Inline Roving",
            description: "Inline quality roving"
          },
          {
            path: "/details",
            roles: ["QC1 Inspection"],
            title: t("home.qc1_inspection"),
            description: "QC1 inspection process"
          },
          { 
            path: "/inline-emp", 
            roles: ["Printing"], 
            title: "Print QR",
            description: "Print QR codes"
          }
        ]
      },
      {
        id: "qa-inspection",
        title: "QA",
        icon: <Shield size={18} />,
        color: "red",
        items: [
          { 
            path: "/audit", 
            roles: ["QA Audit"], 
            title: "Audit",
            description: "Quality audits"
          },
          {
            path: "/qc-accuracy",
            roles: ["QA"],
            title: "QC Accuracy",
            description: "QC accuracy tracking"
          },
          {
            path: "/qa-yorksys",
            roles: ["QA Clerk"],
            title: "Upload Orders",
            description: "Upload order data"
          },
          {
            path: "/final-inspection",
            roles: ["QA"],
            title: "Final Inspection",
            description: "Final quality inspection"
          }
        ]
      },
      {
        id: "analytics",
        title: "Analytics",
        icon: <BarChart3 size={18} />,
        color: "orange",
        items: [
          {
            path: "/download-data",
            roles: ["Download Data"],
            title: t("home.download_data"),
            description: "Download reports"
          },
          {
            path: "/live-dashboard",
            roles: ["Live Dashboard"],
            title: t("home.live_dashboard"),
            description: "Real-time dashboard"
          },
          { 
            path: "/powerbi", 
            roles: ["Power BI"], 
            title: "Power BI",
            description: "Business intelligence"
          },
          { 
            path: "/qa-pivot", 
            roles: ["QA Pivot"], 
            title: "QA Evaluation",
            description: "QA performance analysis"
          },
          { 
            path: "/qc1-sunrise", 
            roles: ["QC1 Sunrise"], 
            title: "QC1 Sunrise",
            description: "QC1 sunrise reports"
          }
        ]
      },
      {
        id: "admin-panel",
        title: "Admin",
        icon: <TerminalSquare size={18} />,
        color: "indigo",
        items: [
          {
            path: "/ieadmin",
            roles: ["IE", "System Administration"],
            title: t("home.ieadmin"),
            description: "IE administration"
          },
          {
            path: "/sysadmin",
            roles: ["System Administration"],
            title: t("home.systemadmin"),
            description: "System administration"
          },
          { 
            path: "/CAQMS", 
            roles: ["CAQMS"], 
            title: t("home.caqms"),
            description: "CAQMS management"
          },
          {
            path: "/role-management",
            roles: ["Admin", "Super Admin"],
            title: "Role Management",
            description: "Manage user roles"
          },
          {
            path: "/user-list",
            roles: ["Admin", "Super Admin"],
            title: "User Management",
            description: "Manage users"
          }
        ]
      },
      {
        id: "settings",
        title: "Settings",
        icon: <Settings size={18} />,
        color: "gray",
        roles: ["Admin", "Super Admin"],
        items: [
          {
            path: "/super-admin-assign",
            title: "Super Admin Assign",
            requiredEmpIds: ["YM6702", "YM7903"],
            icon: <UserPlus size={16} />,
            description: "Assign super admin privileges"
          }
        ]
      }
    ],
    [t]
  );

  // Color mapping for sections
  const colorClasses = {
    blue: "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-700 dark:text-blue-300",
    green: "hover:bg-green-50 dark:hover:bg-green-900/20 text-green-700 dark:text-green-300",
    purple: "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300",
    red: "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300",
    orange: "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-orange-700 dark:text-orange-300",
    indigo: "hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300",
    gray: "hover:bg-gray-50 dark:hover:bg-gray-900/20 text-gray-700 dark:text-gray-300"
  };

  // All your existing logic functions remain the same
  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [roleManagementRes, userRolesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/role-management`),
        axios.get(`${API_BASE_URL}/api/user-roles/${user.emp_id}`)
      ]);

      setRoleManagement(roleManagementRes.data);
      setUserRoles(userRolesRes.data.roles);

      const pageIdsToCheck = [
        ...new Set(
          navStructure
            .flatMap((s) => s.items)
            .filter((item) => item.pageId)
            .map((item) => item.pageId)
        )
      ];

      const accessPromises = pageIdsToCheck.map((pageId) =>
        axios.get(
          `${API_BASE_URL}/api/ie/role-management/access-check?emp_id=${user.emp_id}&page=${pageId}`
        )
      );

      const results = await Promise.all(accessPromises);
      const newAccessMap = {};
      results.forEach((res, index) => {
        newAccessMap[pageIdsToCheck[index]] = res.data.hasAccess;
      });
      setAccessMap(newAccessMap);
    } catch (error) {
      console.error("Error fetching Navbar permissions:", error);
    }
  }, [user, navStructure]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const hasAccess = useCallback(
    (item) => {
      if (!user) return false;
      if (item.requiredEmpIds) {
        return item.requiredEmpIds.includes(user.emp_id);
      }
      const isSuperAdmin = userRoles.includes("Super Admin");
      const isAdmin = userRoles.includes("Admin");
      if (isSuperAdmin || isAdmin) return true;
      if (item.pageId) return accessMap[item.pageId] === true;
      if (item.roles && roleManagement && user.job_title) {
        return roleManagement.some(
          (role) =>
            item.roles.includes(role.role) &&
            role.jobTitles.includes(user.job_title)
        );
      }
      return false;
    },
    [user, userRoles, roleManagement, accessMap]
  );

  const accessibleNav = useMemo(() => {
    if (!userRoles || !user) return [];
    return navStructure
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasAccess(item))
      }))
      .filter((section) => hasAccess(section) || section.items.length > 0);
  }, [navStructure, hasAccess, userRoles, user]);

  // Search functionality
  const filteredNavItems = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    const results = [];
    
    accessibleNav.forEach(section => {
      section.items.forEach(item => {
        if (item.title.toLowerCase().includes(query) || 
            (item.description && item.description.toLowerCase().includes(query))) {
          results.push({
            ...item,
            sectionTitle: section.title,
            sectionColor: section.color
          });
        }
      });
    });
    
    return results;
  }, [searchQuery, accessibleNav]);

  const handleSignOut = () => {
    clearUser();
    onLogout();
    navigate("/", { replace: true });
  };

  const toggleDropdown = (sectionId) =>
    setIsMenuOpen((prev) => (prev === sectionId ? null : sectionId));

  const closeAllDropdowns = () => {
    setIsMenuOpen(null);
    setIsProfileOpen(false);
    setIsSearchOpen(false);
  };

  const handleMobileSectionClick = (sectionId) =>
    setMobileExpandedSection((prev) => (prev === sectionId ? null : sectionId));

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (navRef.current && !navRef.current.contains(event.target))
        setIsMenuOpen(null);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setIsSearchOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Main Navigation Bar */}
      <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-slate-700/50 fixed top-0 left-0 right-0 z-50 transition-all duration-300">
        <div className="max-w-screen-7xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left Side - Logo and Navigation */}
            <div className="flex items-center flex-1 min-w-0">
              {/* Logo */}
              <Link
                to="/home"
                className="flex items-center flex-shrink-0 rounded-xl px-3 py-2 mr-6 transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-500 hover:shadow-lg group"
              >
                <img 
                  src="assets/Home/CAQMS.png" 
                  alt="CAQMS Logo" 
                  className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <span className="ml-2 font-bold text-lg text-slate-800 dark:text-white hidden lg:block">
                  CAQMS
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center" ref={navRef}>
                <div className="flex items-center space-x-1">
                  {accessibleNav.map((section) => (
                    <div key={section.id} className="relative">
                      <button
                        onClick={() => toggleDropdown(section.id)}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          colorClasses[section.color] || colorClasses.gray
                        } ${isMenuOpen === section.id ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
                      >
                        {React.cloneElement(section.icon, {
                          className: "mr-2"
                        })}
                        {section.title}
                        <ChevronDown
                          className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                            isMenuOpen === section.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {/* Enhanced Dropdown Menu */}
                      {isMenuOpen === section.id && (
                        <div className="absolute left-0 mt-2 w-72 origin-top-left rounded-xl shadow-xl bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-slate-700/50 focus:outline-none py-2 border border-gray-200/50 dark:border-slate-700/50">
                          <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-700">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {section.title}
                            </h3>
                          </div>
                          <div className="py-1">
                            {section.items.map((item) => (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeAllDropdowns}
                                className="block px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-150 group"
                              >
                                <div className="font-medium group-hover:text-slate-900 dark:group-hover:text-white">
                                  {item.title}
                                </div>
                                {item.description && (
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {item.description}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Search, Actions, Profile */}
            <div className="flex items-center space-x-3">
              
              {/* Search */}
              <div className="relative hidden md:block" ref={searchRef}>
                {/* <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button> */}
                
                {/* {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-xl shadow-xl bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-slate-700/50 focus:outline-none py-3 border border-gray-200/50 dark:border-slate-700/50">
                    <div className="px-3 mb-3">
                      <input
                        type="text"
                        placeholder="Search navigation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        autoFocus
                      />
                    </div>
                    
                    {searchQuery && (
                      <div className="max-h-64 overflow-y-auto">
                        {filteredNavItems.length > 0 ? (
                          filteredNavItems.map((item, index) => (
                            <Link
                              key={`${item.path}-${index}`}
                              to={item.path}
                              onClick={closeAllDropdowns}
                              className="block px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                              <div className="font-medium text-slate-900 dark:text-white">
                                {item.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {item.sectionTitle} • {item.description}
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            No results found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )} */}
              </div>

              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {/* AI Bot Button */}
              {/* <button
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Open AI Chat"
              >
                <Bot className="w-5 h-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-900" />
              </button> */}

              {/* Notifications */}
              {/* <button className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
              </button> */}

              {/* User Profile */}
              {user && (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <img
                      src={user.face_photo || "/default-avatar.png"}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700"
                    />
                    <div className="hidden lg:block text-left">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {user.name}
                      </div>
                      {/* <div className="text-xs text-slate-500 dark:text-slate-400">
                        {user.job_title}
                      </div> */}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 transition-transform ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Enhanced Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl shadow-xl bg-white dark:bg-slate-800 ring-1 ring-black/5 dark:ring-slate-700/50 focus:outline-none py-2 border border-gray-200/50 dark:border-slate-700/50">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                      
                      <Link
                        to="/home"
                        onClick={closeAllDropdowns}
                        className="flex items-center w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <Home className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      <Link
                        to="/profile"
                        onClick={closeAllDropdowns}
                        className="flex items-center w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Profile Settings
                      </Link>
                      
                      <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        <div
          className={`relative w-full max-w-sm ml-auto h-full bg-white dark:bg-slate-900 flex flex-col transition-transform duration-300 transform ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center space-x-3">
              <img 
                src="assets/Home/CAQMS.png" 
                alt="CAQMS Logo" 
                className="w-8 h-8 object-contain"
              />
              <h2 className="font-bold text-lg text-slate-800 dark:text-white">
                Navigation
              </h2>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search navigation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          {/* Mobile Navigation Content */}
          <div className="flex-1 overflow-y-auto">
            {searchQuery ? (
              // Search Results
              <div className="p-2">
                {filteredNavItems.length > 0 ? (
                  filteredNavItems.map((item, index) => (
                    <Link
                      key={`mobile-search-${item.path}-${index}`}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.sectionTitle}
                      </div>
                    </Link>
                                    ))
                ) : (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                    No results found
                  </div>
                )}
              </div>
            ) : (
              // Regular Navigation
              <div className="p-2">
                {accessibleNav.map((section) => (
                  <div key={`mobile-${section.id}`} className="mb-2">
                    <button
                      onClick={() => handleMobileSectionClick(section.id)}
                      className={`flex items-center justify-between w-full p-3 text-left font-medium rounded-lg transition-all duration-200 ${
                        colorClasses[section.color] || colorClasses.gray
                      } ${mobileExpandedSection === section.id ? 'bg-gray-100 dark:bg-slate-800' : ''}`}
                    >
                      <span className="flex items-center">
                        {React.cloneElement(section.icon, { className: "mr-3" })}
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 transition-transform duration-200 ${
                          mobileExpandedSection === section.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Mobile Section Items */}
                    {mobileExpandedSection === section.id && (
                      <div className="mt-2 ml-4 space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={`mobile-item-${item.path}`}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex flex-col p-3 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border-l-2 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500"
                          >
                            <span className="font-medium">{item.title}</span>
                            {item.description && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {item.description}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Menu Footer */}
          {user && (
            <div className="border-t border-gray-200 dark:border-slate-700 p-4 bg-gray-50 dark:bg-slate-800">
              <div className="flex items-center space-x-3 mb-3">
                <img
                  src={user.face_photo || "/default-avatar.png"}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-slate-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user.job_title}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16" />
    </>
  );
}

