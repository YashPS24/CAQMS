import React, { useEffect, useState, useMemo, useRef } from "react";
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
  ClipboardList
} from "lucide-react";

// --- Theme Hook for Dark Mode ---
const useTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("home-theme") || "light"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === "dark" ? "light" : "dark");
    root.classList.add(theme);
    localStorage.setItem("home-theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  return { theme, toggleTheme };
};

function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const sectionRefs = useRef({});

  const allSections = useMemo(
    () => [
      /* ... sections array  ... */
      
      {
        id: "fabric-cutting",
        title: "Fabric & Cutting",
        icon: <Scissors className="w-5 h-5 mr-2" />,
        bgColor: "bg-teal-50 dark:bg-teal-900/20",
        items: [
          
          {
            path: "",
            roles: ["Cutting"],
            image: "assets/Home/cutting.webp",
            title: t("home.cutting"),
            description: "Cut Panel Inspection",
            version: '0.1',
          },
          {
            path: "",
            roles: ["Cutting"],
            image: "assets/Home/cutting-inline.png",
            title: t("home.cutting-inline"),
            description: "Cutting Inline Inspection",
             version: '0.1',
          },
          {
            path: "",
            roles: ["SCC"],
            image: "assets/Home/SCCLogo.jpg",
            title: t("SCC"),
            description: "Spreading & Cutting",
             version: '0.1',
          },
          {
            path: "",
            roles: ["QC Washing"],
            image: "assets/Home/qcWashing.png",
            title: t("home.qcWashing"),
            description: "Washing Report",
             version: '0.1',
          },{
            path: "",
            roles: ["QC Washing"],
            image: "assets/Home/after_ironing.png",
            title: t("home.afterIroning"),
            description: "After Ironing Report",
             version: '0',
          },
           {
            path: "",
            roles: ["QC Washing", "QA"],
            image: "assets/Home/measurement.png",
            title: t("home.Measurement"),
            description: "All Style measurements",
             version: '0.1',
          },
          {
            path: "",
            roles: ["Washing Clerk"],
            image: "assets/Home/uploadspecs.png",
            title: t("home.upload_beforewash_specs"),
            description: "Upload Beforewash Specs",
             version: '0.1',
          },
          {
            path: "",
            roles: ["Washing Clerk", "QA Clerk"],
            image: "assets/Home/select-specs.png",
            title: t("home.select_dt_specs"),
            description: "Select After Wash DT Specs",
             version: '0.1',
          },
          {
            path: "",
            roles: ["ANF QA"],
            image: "assets/Home/anf-washing.png",
            title: t("home.anf_washing"),
            description: "QC After Wash Measurements",
             version: '0.1',
          },
          {
            path: "",
            roles: ["ANF QA"],
            image: "assets/Home/anf-washing-ver2.png",
            title: t("home.anf_washing_version2"),
            description: "QC AW Measurements - Version 2",
             version: '0.1',
          },
          {
            path: "",
            roles: ["Supplier QC"],
            image: "assets/Home/supplier-issues.png",
            title: t("home.supplier-issues"),
            description: "Supplier Issues Sub-Con Fty",
             version: '0.1',
          }
        ]
      },
      {
        id: "sewing-qc",
        title: "Sewing QC Inspection",
        icon: <CheckSquare className="w-5 h-5 mr-2" />,
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        items: [
          {
            path: "",
            roles: ["QC Roving"],
            image: "assets/Home/qcinline.png",
            title: "QC Inline Roving",
            description: "QC Inline Roving Point",
             version: '0.1',
          },
          {
            path: "",
            roles: ["QC1 Inspection"],
            image: "assets/Home/qcc.png",
            title: t("home.qc1_inspection"),
            description: "QC1 Inspection Point",
             version: '0.1',
          },
          {
            path: "",
            roles: ["QC1 Sub Con"],
            image: "assets/Home/sub-con-qc1.png",
            title: t("home.qc1_subcon_inspection"),
            description: "QC1 Sub Con Inspection",
             version: '0.1',
          },
          {
            path: "",
            roles: ["Printing"],
            image: "assets/Home/qc2.png",
            title: "Print QR",
            description: "Sewing Worker QR Code",
             version: '0.1',
          }
        ]
      },
      
      {
        id: "qa-inspection",
        title: "QA Inspection",
        icon: <Shield className="w-5 h-5 mr-2" />,
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        items: [
         
          {
            path: "",
            roles: ["Washing Clerk"],
            image: "assets/Home/qc2-workers-upload.png",
            title: t("home.qc2_upload_data"),
            description: "QC2 Upload Data",
             version: '0.1',
          },
          {
            path: "",
            roles: ["Washing Clerk"],
            image: "assets/Home/qc2WashingUpload.png",
            title: t("home.qc2_washing_data"),
            description: "QC2 Washing Data",
             version: '0.1',
          },
          {
            path: "",
            roles: ["QA"],
            image: "assets/Home/qc-accuracy.png",
            title: "QA Random Inspection",
            description: "QA Random Checks",
             version: '0.1',
          },
          {
            path: "",
            roles: ["QA"],
            image: "assets/Home/qcOutput.png",
            title: "QC Output",
            description: "QC Output | Sunrise & Old Barcode System",
             version: '0.1',
          },
          
          {
            path: "",
            roles: ["QA Clerk"],
            image: "assets/Home/PackingList.png",
            title: "Upload Packing List",
            description: "Packing List from Shipping Dept",
             version: '0',
          },
          {
            path: "",
            roles: ["QA"],
            image: "assets/Home/qafinal.png",
            title: "Final Inspection",
            description: "QA Final Inspection",
             version: '0',
          }
        ]
      },
      
      {
        id: "admin-panel",
        title: "Admin Panel",
        icon: <Settings className="w-5 h-5 mr-2" />,
        bgColor: "bg-gray-100 dark:bg-gray-800/20",
        items: [
          {
            path: "",
            roles: ["IE", "System Administration"],
            image: "assets/Home/ie.png",
            title: t("home.ieadmin"),
            description: "IE System Admin",
             version: '0',
          },
          {
            path: "",
            roles: ["System Administration"],
            image: "assets/Home/sysadmin.jpg",
            title: t("home.systemadmin"),
            description: "Modify Defects",
             version: '0.1',
          },
          {
            path: "",
            roles: ["YQMS"],
            image: "assets/Home/yqms.png",
            title: t("home.yqms"),
            description: "Project Management",
             version: '0',
          }
        ]
      },
      {
        id: "analytics",
        title: "Analytics",
        icon: <BarChart3 className="w-5 h-5 mr-2" />,
        bgColor: "bg-red-50 dark:bg-red-900/20",
        items: [
          {
            path: "",
            roles: ["Download Data"],
            image: "assets/Home/download.jpg",
            title: t("home.download_data"),
            description: "Download Raw Data",
             version: '0',
          },
          {
            path: "",
            roles: ["Live Dashboard"],
            image: "assets/Home/dash.png",
            title: t("home.live_dashboard"),
            description: "QC2 Live Dashboard",
             version: '0.1',
          },
          {
            path: "",
            roles: ["Power BI"],
            image: "assets/Home/powerbi.png",
            title: "Power BI",
            description: "View Power BI Reports",
             version: '0.1',
          },
          {
            path: "",
            roles: ["QA Pivot"],
            image: "assets/Home/qalogo.png",
            title: "QA Evaluation",
            description: "Upload & View Data",
             version: '0',
          },
          {
            path: "",
            roles: ["QC1 Sunrise"],
            image: "assets/Home/sunrise.png",
            title: "QC1 Sunrise",
            description: "Upload Excel Data",
             version: '0.1',
          }
        ]
      },
      {
        id: "ai-section",
        title: "AI-Servicers",
        icon: <ClipboardList className="w-5 h-5 mr-2" />,
        bgColor: "bg-rose-50 dark:bg-rose-900/20",
        items: [
          {
            path: "",
            roles: ["AI"],
            image: "assets/Home/translator.png",
            title: "AI Translator",
            description: "Upload and translate",
             version: '0',
          }
        ]
      }
    ],
    [t]
  );

  // Dynamic filtering logic remains the same
  const accessibleSections = useMemo(() => {
    return allSections;
  }, [allSections]);

  const handleNavigation = (item) => {
    navigate(item.path);
  };

  const handleTabClick = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto">
              {accessibleSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => handleTabClick(section.id)}
                  className="flex-shrink-0 flex items-center px-3 py-2 text-sm font-semibold rounded-md text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
                >
                  {section.icon}
                  <span>{section.title}</span>
                </button>
              ))}
            </nav>
            {/* <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button> */}
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-12">
          {accessibleSections.length > 0 ? (
            accessibleSections.map((section) => (
              <section
                key={section.id}
                ref={(el) => (sectionRefs.current[section.id] = el)}
                className={`p-6 rounded-2xl ${section.bgColor} transition-colors`}
              >
                <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center">
                  {section.icon}
                  {section.title}
                </h2>
                <div
                  className="grid gap-4"
                  style={{
                    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))"
                  }}
                >
                  {section.items.map((item, itemIndex) => {
                    const getVersionStyle = () => {
                      if (item.version === '0') {
                        return 'border-2 border-red-500';
                      } else if (item.version === '0.1') {
                        return 'border-2 border-green-500';
                      }
                      return '';
                    };

                    return (
                      <div
                        key={itemIndex}
                        onClick={() => handleNavigation(item)}
                        className={`group relative flex flex-col items-center justify-center p-4 rounded-xl shadow-md transition-all duration-300 bg-white dark:bg-slate-800 cursor-pointer hover:shadow-xl hover:-translate-y-1 ${getVersionStyle()}`}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-16 h-16 object-contain mb-3"
                        />
                        <h3 className="text-sm font-bold text-center text-slate-700 dark:text-slate-100">
                          {item.title}
                        </h3>
                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-1">
                          {item.description}
                        </p>
                        {/* {item.version === '0' && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            Coming Soon
                          </span>
                        )}
                        {item.version === '0.1' && (
                          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        )} */}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                No Accessible Modules
              </h2>
              <p className="mt-2 text-slate-500">
                Please contact your administrator if you believe you should have
                access.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
