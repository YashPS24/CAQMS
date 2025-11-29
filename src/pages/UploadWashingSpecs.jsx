import React, { useState, useCallback, useEffect } from "react";
import {
  Upload,
  FileText,
  Loader,
  AlertTriangle,
  Save,
  CheckCircle,
  XCircle,
  FileUp,
  Trash2,
  Search,
  ChevronDown,
  X,
  Package,
  Palette,
  Eye,
  ArrowRight,
  Shield,
  Sparkles,
  User,
  Activity
} from "lucide-react";
import { read, utils } from "xlsx";
import { cleanWashingSpecData } from "../components/inspection/qc2_washing/WashingSpecDataCleaning";
import WashingSpecsDataPreview from "../components/inspection/qc2_washing/WashingSpecsDataPreview";
import UploadedSpecsView from "../components/inspection/qc2_washing/UploadedSpecsView";
import { API_BASE_URL } from "../../config";
import { useAuth } from "../components/authentication/AuthContext";

const UploadWashingSpecs = () => {
  const { user } = useAuth();
  
  // --- State Management ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [moNo, setMoNo] = useState("");
  const [washingSpecsData, setWashingSpecsData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });
  const [isDragging, setIsDragging] = useState(false);

  // --- Order and Color Selection State ---
  const [orderSuggestions, setOrderSuggestions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);

  // --- Current Step State ---
  const [currentStep, setCurrentStep] = useState(1);

  // --- File Processing Logic ---
  const resetState = () => {
    setWashingSpecsData([]);
    setError("");
    setSaveStatus({ message: "", type: "" });
  };

  const processFile = (file) => {
    if (
      file &&
      (file.type === "application/vnd.ms-excel" ||
        file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx"))
    ) {
      setSelectedFile(file);
      resetState();
      // Extract MO No from filename
      const extractedMo = file.name.replace(/\.[^/.]+$/, "").replace(/-.*$/, "");
      setMoNo(extractedMo.trim());
      
      // Auto-search for order when file is selected
      if (extractedMo.trim()) {
        searchOrders(extractedMo.trim());
      }
      setCurrentStep(2);
    } else {
      setError("Invalid file type. Please upload an Excel file (.xlsx, .xls).");
      setSelectedFile(null);
    }
  };

  // --- Clear Order Search Function ---
  const clearOrderSearch = () => {
    setMoNo("");
    setSelectedOrder(null);
    setOrderSuggestions([]);
    setAvailableColors([]);
    setSelectedColors([]);
    setShowOrderDropdown(false);
    setError("");
    setCurrentStep(2);
  };

  // --- Order Search Functions ---
  const searchOrders = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setOrderSuggestions([]);
      return;
    }

    setIsLoadingOrders(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/washing-specs/search-orders?search=${encodeURIComponent(searchTerm)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setOrderSuggestions(data.orders || []);
        setShowOrderDropdown(true);
      } else {
        setError(data.message || "Failed to search orders");
      }
    } catch (err) {
      console.error("Error searching orders:", err);
      setError("Failed to search orders");
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchOrderColors = async (orderNo) => {
    setIsLoadingColors(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/washing-specs/order-colors/${encodeURIComponent(orderNo)}`
      );
      const data = await response.json();
      
      if (response.ok) {
        setAvailableColors(data.colors || []);
        setSelectedColors([]);
        setCurrentStep(3);
      } else {
        setError(data.message || "Failed to fetch colors");
        setAvailableColors([]);
      }
    } catch (err) {
      console.error("Error fetching colors:", err);
      setError("Failed to fetch colors");
      setAvailableColors([]);
    } finally {
      setIsLoadingColors(false);
    }
  };

  // --- Event Handlers ---
  const handleOrderInputChange = (e) => {
    const value = e.target.value;
    setMoNo(value);
    setSelectedOrder(null);
    setAvailableColors([]);
    setSelectedColors([]);
    
    clearTimeout(window.orderSearchTimeout);
    window.orderSearchTimeout = setTimeout(() => {
      searchOrders(value);
    }, 300);
  };

  const handleOrderSelect = (order) => {
    setMoNo(order.Order_No);
    setSelectedOrder(order);
    setShowOrderDropdown(false);
    setOrderSuggestions([]);
    fetchOrderColors(order.Order_No);
  };

  const handleColorToggle = (color) => {
    setSelectedColors(prev => {
      const isSelected = prev.some(c => c.ColorCode === color.ColorCode);
      if (isSelected) {
        return prev.filter(c => c.ColorCode !== color.ColorCode);
      } else {
        return [...prev, color];
      }
    });
  };

  const handleSelectAllColors = () => {
    if (selectedColors.length === availableColors.length) {
      setSelectedColors([]);
    } else {
      setSelectedColors([...availableColors]);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    processFile(file);
  };

  const handleDragEvents = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    handleDragEvents(e);
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    handleDragEvents(e);
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setMoNo("");
    setSelectedOrder(null);
    setAvailableColors([]);
    setSelectedColors([]);
    resetState();
    setCurrentStep(1);
  };

  const handlePreview = useCallback(async () => {
    if (!selectedFile) {
      setError("Please select an Excel file first.");
      return;
    }
    if (!selectedOrder) {
      setError("Please select a valid order number.");
      return;
    }
    if (selectedColors.length === 0) {
      setError("Please select at least one color.");
      return;
    }

    setIsLoading(true);
    resetState();

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = event.target.result;
          const workbook = read(data, { type: "array" });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json_data = utils.sheet_to_json(worksheet, {
            header: 1,
            defval: null,
            raw: false
          });
          
          let cleanedData = cleanWashingSpecData(json_data);
          
          if (!cleanedData.rows || cleanedData.rows.length === 0) {
            throw new Error("No valid measurement data found in the Excel file.");
          }
          
          setWashingSpecsData([cleanedData]);
          setCurrentStep(4);
        } catch (e) {
          console.error("Parsing Error:", e);
          setError(e.message || "Failed to parse the Excel file. Please check the format.");
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = (err) => {
        console.error("FileReader Error:", err);
        setError("Failed to read the file.");
        setIsLoading(false);
      };

      reader.readAsArrayBuffer(selectedFile);
    } catch (e) {
      console.error("General Error:", e);
      setError(e.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  }, [selectedFile, selectedOrder, selectedColors]);

  const handleSave = async () => {
    if (washingSpecsData.length === 0) {
      setError("No data to save. Please preview a file first.");
      return;
    }

    console.log('=== FRONTEND SAVE REQUEST ===');
    console.log('Selected Order:', selectedOrder);
    console.log('Selected Colors:', selectedColors);
    console.log('Washing Specs Data:', washingSpecsData);
    
    // Validate the data structure
    const dataToSend = { 
      moNo: selectedOrder.Order_No, 
      washingSpecsData,
      selectedColors: selectedColors.map(c => c.ColorCode)
    };
    
    console.log('Data being sent to server:', dataToSend);

    setIsSaving(true);
    setSaveStatus({ message: "", type: "" });
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/washing-specs/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      const result = await response.json();
      console.log('Response data:', result);

      if (!response.ok) {
        throw new Error(result.message || "Failed to save data.");
      }

      setSaveStatus({ message: result.message, type: "success" });
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Save Error:", err);
      console.error("Error details:", {
        message: err.message,
        stack: err.stack
      });
      setSaveStatus({ message: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowOrderDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Step indicator component
  const StepIndicator = ({ step, title, icon: Icon, isActive, isCompleted }) => (
    <div className={`flex items-center ${isActive ? 'text-green-600 dark:text-green-400' : isCompleted ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
      <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
        isActive ? 'border-green-600 bg-green-50 dark:border-green-400 dark:bg-green-900/30' : 
        isCompleted ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30' : 
        'border-gray-300 dark:border-gray-600'
      }`}>
        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
      </div>
      <span className={`ml-3 font-medium ${isActive ? 'text-green-900 dark:text-green-100' : isCompleted ? 'text-blue-900 dark:text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
        {title}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-blue-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 text-gray-800 dark:text-gray-200">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-400/10 dark:bg-green-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-green-700 via-blue-700 to-teal-700 shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>
        
        <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-5">
          {/* ======================= */}
          {/* MOBILE/TABLET LAYOUT (< lg) */}
          {/* ======================= */}
          <div className="lg:hidden space-y-3">
            {/* Top Row: Title + User */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg shadow-lg flex-shrink-0">
                  <Shield size={20} className="text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h1 className="text-sm sm:text-base font-black text-white tracking-tight truncate">
                      B/A Washing Specs Upload
                    </h1>
                  </div>
                  <p className="text-[10px] sm:text-xs text-green-100 font-medium truncate">
                    Before & After Wash Specifications
                  </p>
                </div>
              </div>

              {user && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-2.5 py-1.5 shadow-xl flex-shrink-0">
                  <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md shadow-lg">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-white font-bold text-xs leading-tight">
                      {user.job_title || "Operator"}
                    </p>
                    <p className="text-green-200 text-[10px] font-medium leading-tight">
                      ID: {user.emp_id}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Status Indicator */}
            <div className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border border-green-300/30 rounded-xl px-4 py-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400 shadow-lg"></span>
                </div>
                <Activity size={16} className="text-white" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-sm leading-tight">
                  Upload Washing Specifications
                </p>
                <p className="text-green-200 text-xs font-medium leading-tight">
                  Excel File Processing System
                </p>
              </div>
            </div>
          </div>

          {/* ======================= */}
          {/* DESKTOP LAYOUT (>= lg)  */}
          {/* ======================= */}
          <div className="hidden lg:flex lg:flex-col lg:gap-0">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6 flex-1">
                {/* Logo Area */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-2xl font-black text-white tracking-tight">
                        B/A Washing Specs Upload System
                      </h1>
                    </div>
                    <p className="text-sm text-green-100 font-medium">
                      Before & After Wash Specification Management
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center gap-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-md border border-green-300/30 rounded-xl px-5 py-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400 shadow-lg"></span>
                    </div>
                    <Activity size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">
                      Upload Washing Specifications
                    </p>
                    <p className="text-green-200 text-xs font-medium leading-tight">
                      Excel File Processing System
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              {user && (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5 shadow-xl">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-lg">
                    <User size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm leading-tight">
                      {user.job_title || "Operator"}
                    </p>
                    <p className="text-green-200 text-xs font-medium leading-tight">
                      ID: {user.emp_id}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-6">
        {/* Step Indicator */}
        <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <StepIndicator 
              step={1} 
              title="Upload File" 
              icon={Upload} 
              isActive={currentStep === 1} 
              isCompleted={currentStep > 1} 
            />
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <StepIndicator 
              step={2} 
              title="Select Order" 
              icon={Package} 
              isActive={currentStep === 2} 
              isCompleted={currentStep > 2} 
            />
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <StepIndicator 
              step={3} 
              title="Choose Colors" 
              icon={Palette} 
              isActive={currentStep === 3} 
              isCompleted={currentStep > 3} 
            />
            <ArrowRight className="w-5 h-5 text-gray-400 hidden md:block" />
            <StepIndicator 
              step={4} 
              title="Preview & Save" 
              icon={Eye} 
              isActive={currentStep === 4} 
              isCompleted={false} 
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Steps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: File Upload */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 ${currentStep === 1 ? 'ring-2 ring-green-500 shadow-lg' : ''}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
                    <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Step 1: Upload Excel File
                  </h3>
                </div>

                {!selectedFile ? (
                  <label
                    htmlFor="file-upload"
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragEvents}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                      isDragging
                        ? "border-green-500 bg-green-50 dark:border-green-400 dark:bg-green-900/30"
                        : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                      Drop your Excel file here
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse (.xlsx, .xls)
                    </span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".xlsx, .xls"
                      onChange={handleFileChange}
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="font-medium text-green-900 dark:text-green-100">
                          {selectedFile.name}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveFile}
                      className="p-2 text-green-600 hover:text-red-600 dark:text-green-400 dark:hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Order Selection */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 ${currentStep === 2 ? 'ring-2 ring-blue-500 shadow-lg' : currentStep < 2 ? 'opacity-50' : ''}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg mr-3">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Step 2: Select Order Number
                  </h3>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={moNo}
                    onChange={handleOrderInputChange}
                    onClick={(e) => e.stopPropagation()}
                    placeholder="Enter or search order number..."
                    disabled={currentStep < 2}
                    className="w-full px-4 py-3 pr-20 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors disabled:opacity-50"
                  />
                  
                  {moNo && (
                    <button
                      type="button"
                      onClick={clearOrderSearch}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {isLoadingOrders ? (
                    <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-blue-500" />
                  ) : (
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Order Suggestions */}
                {showOrderDropdown && orderSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {orderSuggestions.map((order) => (
                      <div
                        key={order._id}
                        onClick={() => handleOrderSelect(order)}
                        className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {order.Order_No}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Style: {order.CustStyle || 'N/A'} | Qty: {order.TotalQty || 0}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Order */}
                {selectedOrder && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        Order Selected: {selectedOrder.Order_No}
                      </span>
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                      Style: {selectedOrder.CustStyle || 'N/A'} | Total Qty: {selectedOrder.TotalQty || 0}
                    </div>
                  </div>
                )}
                              </div>
            </div>

            {/* Step 3: Color Selection */}
            <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm transition-all duration-300 ${currentStep === 3 ? 'ring-2 ring-teal-500 shadow-lg' : currentStep < 3 ? 'opacity-50' : ''}`}>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg mr-3">
                    <Palette className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Step 3: Choose Colors
                  </h3>
                </div>

                {isLoadingColors ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader className="w-6 h-6 animate-spin text-teal-500 mr-3" />
                    <span className="text-gray-500 dark:text-gray-400">Loading colors...</span>
                  </div>
                ) : availableColors.length > 0 ? (
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={handleSelectAllColors}
                      className="w-full px-4 py-2 text-sm bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors"
                    >
                      {selectedColors.length === availableColors.length ? 'Deselect All' : 'Select All'} 
                      ({availableColors.length} colors)
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {availableColors.map((color) => (
                        <label
                          key={color.ColorCode}
                          className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={selectedColors.some(c => c.ColorCode === color.ColorCode)}
                            onChange={() => handleColorToggle(color)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <div className="ml-3">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {color.ColorCode}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {color.Color} {color.ChnColor && `(${color.ChnColor})`}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {selectedColors.length > 0 && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="font-medium text-green-900 dark:text-green-100 mb-2">
                          Selected Colors ({selectedColors.length}):
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedColors.map(c => (
                            <span key={c.ColorCode} className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 text-sm rounded">
                              {c.ColorCode}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : selectedOrder ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No colors found for this order
                  </div>
                ) : (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    Select an order to view available colors
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Actions & Status */}
          <div className="space-y-6">
            
            {/* Action Buttons */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h3>
              
              <div className="space-y-3">
                <button
                  onClick={handlePreview}
                  disabled={!selectedFile || !selectedOrder || selectedColors.length === 0 || isLoading || isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-sm disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Eye className="w-5 h-5 mr-2" />
                      Preview Data
                    </>
                  )}
                </button>

                <button
                  onClick={handleSave}
                  disabled={washingSpecsData.length === 0 || !selectedOrder || selectedColors.length === 0 || isLoading || isSaving}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                >
                  {isSaving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save to Database
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status Panel */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">File:</span>
                  <span className={selectedFile ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                    {selectedFile ? "✓ Uploaded" : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order:</span>
                  <span className={selectedOrder ? "text-blue-600 dark:text-blue-400" : "text-gray-400"}>
                    {selectedOrder ? "✓ Selected" : "Not selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Colors:</span>
                  <span className={selectedColors.length > 0 ? "text-teal-600 dark:text-teal-400" : "text-gray-400"}>
                    {selectedColors.length > 0 ? `✓ ${selectedColors.length} selected` : "None selected"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Preview:</span>
                  <span className={washingSpecsData.length > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400"}>
                    {washingSpecsData.length > 0 ? "✓ Ready" : "Not generated"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            {selectedOrder && selectedColors.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">
                  Upload Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="text-green-700 dark:text-green-300">
                    <strong>Order:</strong> {selectedOrder.Order_No}
                  </div>
                  <div className="text-blue-700 dark:text-blue-300">
                    <strong>Colors:</strong> {selectedColors.length}
                  </div>
                  <div className="text-teal-700 dark:text-teal-300">
                    <strong>Objects to create:</strong> {selectedColors.length * 2}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                    (Before & After wash specs for each color)
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mt-6 flex items-center p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg animate-fadeIn">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {saveStatus.message && (
          <div
            className={`mt-6 flex items-center p-4 rounded-lg border animate-fadeIn ${
              saveStatus.type === "success"
                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
            }`}
          >
            {saveStatus.type === "success" ? (
              <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            )}
            <span className="font-medium">{saveStatus.message}</span>
          </div>
        )}

        {/* Preview Section */}
        {washingSpecsData.length > 0 && (
          <div className="mt-8">
            <WashingSpecsDataPreview
              moNo={selectedOrder?.Order_No || moNo}
              allSpecData={washingSpecsData}
              selectedColors={selectedColors}
            />
          </div>
        )}
      </div>

      {/* Global Styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .bg-grid-white {
          background-image: linear-gradient(
              to right,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default UploadWashingSpecs;

