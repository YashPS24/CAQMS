import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Layers,
  Settings,
  BarChart3,
  Scissors,
  CheckSquare,
  Shield,
  Sun,
  Moon,
  ClipboardList,
  Search,
  Grid3X3,
  List,
  Filter
} from "lucide-react";
import useTheme from "../pages/useTheme";
import { useAuth } from "../components/authentication/AuthContext";

function Home() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const sectionRefs = useRef({});
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [activeSection, setActiveSection] = useState(null);

  // Add access control state
  const [errorMessage, setErrorMessage] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [roleManagement, setRoleManagement] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [accessMap, setAccessMap] = useState({});

  const allSections = useMemo(
    () => [
      /* ... sections array  ... */
      
      {
        id: "fabric-cutting",
        title: "Fabric & Cutting",
        icon: <Scissors className="w-5 h-5 mr-2" />,
        bgColor: "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20",
        borderColor: "border-teal-200 dark:border-teal-700",
        items: [
          
          // {
          //   path: "",
          //   roles: ["Cutting"],
          //   image: "assets/Home/cutting.webp",
          //   title: t("home.cutting"),
          //   description: "Cut Panel Inspection",
          //   version: '0',
          // },
          // {
          //   path: "",
          //   roles: ["SCC"],
          //   image: "assets/Home/SCCLogo.jpg",
          //   title: t("SCC"),
          //   description: "Spreading & Cutting",
          //    version: '0',
          // },
          // {
          //   path: "",
          //   roles: ["QC Washing"],
          //   image: "assets/Home/qcWashing.png",
          //   title: t("home.qcWashing"),
          //   description: "Washing Report",
          //    version: '0',
          // },
          // {
          //   path: "",
          //   roles: ["QC Washing"],
          //   image: "assets/Home/after_ironing.png",
          //   title: t("home.afterIroning"),
          //   description: "After Ironing Report",
          //    version: '0',
          // },
          //  {
          //   path: "",
          //   roles: ["QC Washing", "QA"],
          //   image: "assets/Home/measurement.png",
          //   title: t("home.Measurement"),
          //   description: "All Style measurements",
          //    version: '0',
          // },
          {
            path: "/upload-beforewash-specs",
            roles: ["Washing Clerk","QA Clerk"],
            image: "assets/Home/uploadspecs.png",
            title: t("home.upload_beforewash_specs"),
            description: "Upload Beforewash Specs",
             version: '0.1',
          },
          {
            path: "/select-dt-specs",
            roles: ["Washing Clerk","QA Clerk"],
            image: "assets/Home/select-specs.png",
            title: t("home.select_dt_specs"),
            description: "Select After Wash DT Specs",
             version: '0.1',
          },
          {
            path: "/anf-washing",
            roles: ["ANF QA"],
            image: "assets/Home/anf-washing.png",
            title: t("home.anf_washing"),
            description: "QC After Wash Measurements",
             version: '0.1',
          },
          // {
          //   path: "",
          //   roles: ["ANF QA"],
          //   image: "assets/Home/anf-washing-ver2.png",
          //   title: t("home.anf_washing_version2"),
          //   description: "QC AW Measurements - Version 2",
          //    version: '0',
          // },
          // {
          //   path: "",
          //   roles: ["Supplier QC"],
          //   image: "assets/Home/supplier-issues.png",
          //   title: t("home.supplier-issues"),
          //   description: "Supplier Issues Sub-Con Fty",
          //    version: '0',
          // }
        ]
      },
      // {
      //   id: "sewing-qc",
      //   title: "Sewing QC Inspection",
      //   icon: <CheckSquare className="w-5 h-5 mr-2" />,
      //    bgColor: "bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-800/20",
      //    borderColor: "border-purple-200 dark:border-purple-700",
      //   items: [
      //     {
      //       path: "",
      //       roles: ["QC Roving"],
      //       image: "assets/Home/qcinline.png",
      //       title: "QC Inline Roving",
      //       description: "QC Inline Roving Point",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QC1 Inspection"],
      //       image: "assets/Home/qcc.png",
      //       title: t("home.qc1_inspection"),
      //       description: "QC1 Inspection Point",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QC1 Sub Con"],
      //       image: "assets/Home/sub-con-qc1.png",
      //       title: t("home.qc1_subcon_inspection"),
      //       description: "QC1 Sub Con Inspection",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["Printing"],
      //       image: "assets/Home/qc2.png",
      //       title: "Print QR",
      //       description: "Sewing Worker QR Code",
      //        version: '0',
      //     }
      //   ]
      // },
      
      // {
      //   id: "qa-inspection",
      //   title: "QA Inspection",
      //   icon: <Shield className="w-5 h-5 mr-2" />,
      //   bgColor: "bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-900/20 dark:to-amber-800/20",
      //   borderColor: "border-orange-200 dark:border-orange-700",
      //   items: [
         
      //     {
      //       path: "",
      //       roles: ["Washing Clerk"],
      //       image: "assets/Home/qc2-workers-upload.png",
      //       title: t("home.qc2_upload_data"),
      //       description: "QC2 Upload Data",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["Washing Clerk"],
      //       image: "assets/Home/qc2WashingUpload.png",
      //       title: t("home.qc2_washing_data"),
      //       description: "QC2 Washing Data",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QA"],
      //       image: "assets/Home/qc-accuracy.png",
      //       title: "QA Random Inspection",
      //       description: "QA Random Checks",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QA"],
      //       image: "assets/Home/qcOutput.png",
      //       title: "QC Output",
      //       description: "QC Output | Sunrise & Old Barcode System",
      //        version: '0',
      //     },
          
      //     {
      //       path: "",
      //       roles: ["QA Clerk"],
      //       image: "assets/Home/PackingList.png",
      //       title: "Upload Packing List",
      //       description: "Packing List from Shipping Dept",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QA"],
      //       image: "assets/Home/qafinal.png",
      //       title: "Final Inspection",
      //       description: "QA Final Inspection",
      //        version: '0',
      //     }
      //   ]
      // },
      
      // {
      //   id: "admin-panel",
      //   title: "Admin Panel",
      //   icon: <Settings className="w-5 h-5 mr-2" />,
      //   bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-800/20",
      //   borderColor: "border-blue-200 dark:border-blue-700",
      //   items: [
      //     {
      //       path: "",
      //       roles: ["IE", "System Administration"],
      //       image: "assets/Home/ie.png",
      //       title: t("home.ieadmin"),
      //       description: "IE System Admin",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["System Administration"],
      //       image: "assets/Home/sysadmin.jpg",
      //       title: t("home.systemadmin"),
      //       description: "Modify Defects",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["YQMS"],
      //       image: "assets/Home/yqms.png",
      //       title: t("home.yqms"),
      //       description: "Project Management",
      //        version: '0',
      //     }
      //   ]
      // },
      // {
      //   id: "analytics",
      //   title: "Analytics",
      //   icon: <BarChart3 className="w-5 h-5 mr-2" />,
      //   bgColor: "bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-800/20",
      //   borderColor: "border-rose-200 dark:border-rose-700",
      //   items: [
      //     {
      //       path: "",
      //       roles: ["Download Data"],
      //       image: "assets/Home/download.jpg",
      //       title: t("home.download_data"),
      //       description: "Download Raw Data",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["Live Dashboard"],
      //       image: "assets/Home/dash.png",
      //       title: t("home.live_dashboard"),
      //       description: "QC2 Live Dashboard",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["Power BI"],
      //       image: "assets/Home/powerbi.png",
      //       title: "Power BI",
      //       description: "View Power BI Reports",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QA Pivot"],
      //       image: "assets/Home/qalogo.png",
      //       title: "QA Evaluation",
      //       description: "Upload & View Data",
      //        version: '0',
      //     },
      //     {
      //       path: "",
      //       roles: ["QC1 Sunrise"],
      //       image: "assets/Home/sunrise.png",
      //       title: "QC1 Sunrise",
      //       description: "Upload Excel Data",
      //        version: '0',
      //     }
      //   ]
      // },
    ],
    [t]
  );
// STEP 1: Initial check for user authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // STEP 2: Fetch legacy and user-specific roles once user is available
  useEffect(() => {
    if (user) {
      const fetchBaseRoles = async () => {
        setPageLoading(true);
        setErrorMessage(""); // Clear previous errors
        try {
          const [roleManagementRes, userRolesRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/role-management`),
            axios.get(`${API_BASE_URL}/api/user-roles/${user.emp_id}`)
          ]);

          setRoleManagement(roleManagementRes.data);
          setUserRoles(userRolesRes.data.roles);
        } catch (error) {
          console.error("Error fetching base roles:", error);
          setErrorMessage("Error loading base page permissions.");
          setPageLoading(false); // Stop loading on error
        }
        // Do not set pageLoading to false here, let the next step do it
      };

      fetchBaseRoles();
    }
  }, [user]);

  // STEP 3: Fetch IE-specific access rights only AFTER legacy roles are loaded
  useEffect(() => {
    // This effect runs only when `roleManagement` is successfully populated
    if (roleManagement) {
      const checkAllIEAccess = async () => {
        try {
          const pageIdsToCheck = [
            ...new Set(
              allSections
                .flatMap((s) => s.items)
                .filter((item) => item.pageId)
                .map((item) => item.pageId)
            )
          ];

          if (pageIdsToCheck.length > 0) {
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
          }
        } catch (error) {
          console.error("Error fetching IE access rights:", error);
          setErrorMessage("Error loading IE page permissions.");
        } finally {
          // This is the final step, now we can stop the main loading indicator
          setPageLoading(false);
        }
      };

      checkAllIEAccess();
    }
  }, [roleManagement, user, allSections]); // Dependency on roleManagement is key

  // Hybrid access function
  const hasAccess = useCallback(
    (item) => {
      if (!user) return false;

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

  // Dynamic filtering logic with access control
  const accessibleSections = useMemo(() => {
    if (pageLoading || !userRoles) return [];

    return allSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => hasAccess(item))
      }))
      .filter((section) => section.items.length > 0);
  }, [allSections, hasAccess, pageLoading, userRoles]);

  // Filter sections and items based on search
  const filteredSections = useMemo(() => {
    if (!searchTerm) return accessibleSections;
    
    return accessibleSections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })).filter(section => section.items.length > 0);
  }, [accessibleSections, searchTerm]);

  const handleNavigation = (item) => {
    if (item.version === '0') {
      // Show coming soon message
      alert('This feature is coming soon!');
      return;
    }
    
    if (hasAccess(item)) {
      navigate(item.path);
    } else {
      setErrorMessage("Unauthorized Access");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleTabClick = (sectionId) => {
    setActiveSection(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest"
    });
  };

  const getVersionBadge = (version) => {
    if (version === '0') {
      return (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
          Soon
        </span>
      );
    } else if (version === '0.1') {
      return (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
          Live
        </span>
      );
    }
    return null;
  };

  const getItemStyle = (version) => {
    const baseStyle = "group relative flex flex-col items-center justify-center p-6 rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-slate-800 cursor-pointer hover:shadow-2xl hover:-translate-y-2 border-2";
    
    if (version === '0') {
      return `${baseStyle} border-red-200 dark:border-red-800 opacity-75 hover:opacity-100`;
    } else if (version === '0.1') {
      return `${baseStyle} border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-600`;
    }
    return `${baseStyle} border-gray-200 dark:border-gray-700`;
  };

  // Show loading while checking access
  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-xl text-gray-600 dark:text-gray-300">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 text-slate-800 dark:text-slate-200">
      {/* Navigation Tabs */}
      <nav className="fixed top-16 left-0 right-0 z-10 bg-white/5 dark:bg-slate-900/5 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-3 scrollbar-hide">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleTabClick(section.id)}
                className={`flex-shrink-0 flex items-center px-4 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeSection === section.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {section.icon}
                <span className="hidden sm:inline">{section.title}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-500 text-white text-center py-2 mb-6 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Sections */}
          <div className="space-y-6">
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <section
                  key={section.id}
                  ref={(el) => (sectionRefs.current[section.id] = el)}
                  className={`p-8 rounded-3xl ${section.bgColor} border-2 ${section.borderColor} transition-all duration-300 hover:shadow-xl`}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white flex items-center">
                      {section.icon}
                      {section.title}
                    </h2>
                    <span className="text-sm text-slate-600 dark:text-slate-400 bg-white/50 dark:bg-slate-800/50 px-3 py-1 rounded-full">
                      {section.items.length} modules
                    </span>
                  </div>

                  <div
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-6'
                        : 'grid-cols-1'
                    }`}
                  >
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={`${section.id}-${itemIndex}`} // Fixed: Use unique key
                        onClick={() => handleNavigation(item)}
                        className={getItemStyle(item.version)}
                      >
                        {getVersionBadge(item.version)}
                        
                        <div className="w-12 h-12 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-16 h-16 hidden items-center justify-center text-slate-400">
                            <Layers className="w-8 h-8" />
                          </div>
                        </div>

                        <h3 className="text-base font-bold text-center text-slate-700 dark:text-slate-100 mb-2">
                          {item.title}
                        </h3>

                        <p className="text-sm text-center text-slate-500 dark:text-slate-400 leading-relaxed">
                          {item.description}
                        </p>

                        {item.version === '0.1' && (
                          <div className="mt-4 w-full h-1 bg-green-200 dark:bg-green-800 rounded-full">
                            <div className="h-full bg-green-500 rounded-full w-full"></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                  {searchTerm ? 'No modules found' : 'No Accessible Modules'}
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  {searchTerm 
                    ? `No modules match "${searchTerm}". Try a different search term.`
                    : 'Please contact your administrator if you believe you should have access.'
                  }
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
