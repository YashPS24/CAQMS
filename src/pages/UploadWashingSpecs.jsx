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
  ChevronDown
} from "lucide-react";
import { read, utils } from "xlsx";
import { cleanWashingSpecData } from "../components/inspection/qc2_washing/WashingSpecDataCleaning";
import WashingSpecsDataPreview from "../components/inspection/qc2_washing/WashingSpecsDataPreview";
import UploadedSpecsView from "../components/inspection/qc2_washing/UploadedSpecsView";
import { API_BASE_URL } from "../../config";

const UploadWashingSpecs = () => {
  // --- State Management ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [moNo, setMoNo] = useState("");
  const [washingSpecsData, setWashingSpecsData] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ message: "", type: "" });
  const [isDragging, setIsDragging] = useState(false);

  // --- NEW: Order and Color Selection State ---
  const [orderSuggestions, setOrderSuggestions] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [availableColors, setAvailableColors] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingColors, setIsLoadingColors] = useState(false);
  const [showOrderDropdown, setShowOrderDropdown] = useState(false);

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
        file.type ===
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx"))
    ) {
      setSelectedFile(file);
      resetState();
      // Extract MO No from filename (e.g., "GPAR11234-K1.xlsx" -> "GPAR11234")
      const extractedMo = file.name.replace(/\.[^/.]+$/, "");
      setMoNo(extractedMo.trim());
      
      // Auto-search for order when file is selected
      if (extractedMo.trim()) {
        searchOrders(extractedMo.trim());
      }
    } else {
      setError("Invalid file type. Please upload an Excel file (.xlsx, .xls).");
      setSelectedFile(null);
    }
  };

  // --- NEW: Order Search Functions ---
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
        setSelectedColors([]); // Reset selected colors
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

  // --- NEW: Event Handlers for Order/Color Selection ---
  const handleOrderInputChange = (e) => {
    const value = e.target.value;
    setMoNo(value);
    setSelectedOrder(null);
    setAvailableColors([]);
    setSelectedColors([]);
    
    // Debounce search
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

  // --- Existing Event Handlers ---
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
      
      // Process the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json_data = utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
        raw: false
      });
      
      console.log('Raw Excel data:', json_data);
      
      // Try the main cleaning function first
      let cleanedData;
      try {
        cleanedData = cleanWashingSpecData(json_data);
      } catch (error) {
        console.log('Main cleaning failed, trying flexible approach:', error);
        cleanedData = cleanWashingSpecData(json_data);
      }
      
      if (!cleanedData.rows || cleanedData.rows.length === 0) {
        throw new Error("No valid measurement data found in the Excel file.");
      }
      
      setWashingSpecsData([cleanedData]);
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

    if (!selectedOrder) {
      setError("Please select a valid order number.");
      return;
    }

    if (selectedColors.length === 0) {
      setError("Please select at least one color.");
      return;
    }

    setIsSaving(true);
    setSaveStatus({ message: "", type: "" });
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/washing-specs/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          moNo: selectedOrder.Order_No, 
          washingSpecsData,
          selectedColors: selectedColors.map(c => c.ColorCode)
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save data.");
      }

      setSaveStatus({ message: result.message, type: "success" });
      // Optional: Clear data after successful save
      setWashingSpecsData([]);
      setSelectedFile(null);
      setSelectedOrder(null);
      setAvailableColors([]);
      setSelectedColors([]);
      window.location.reload(); // Simple reload to update table
    } catch (err) {
      console.error("Save Error:", err);
      setSaveStatus({ message: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOrderDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="animate-fadeIn mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* --- Upload Section --- */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg transition-all duration-300">
        <div className="flex flex-col gap-6">
          
          {/* --- NEW: Order Selection Section --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Number Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Order Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={moNo}
                  onChange={handleOrderInputChange}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Enter or search order number..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                />
                {isLoadingOrders && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader className="w-5 h-5 animate-spin text-indigo-500" />
                  </div>
                )}
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              
              {/* Order Suggestions Dropdown */}
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
              
              {/* Selected Order Display */}
              {selectedOrder && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Selected: {selectedOrder.Order_No}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-300 mt-1">
                    Style: {selectedOrder.CustStyle || 'N/A'} | Total Qty: {selectedOrder.TotalQty || 0}
                  </div>
                </div>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Colors *
              </label>
              
              {isLoadingColors ? (
                <div className="flex items-center justify-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
                  <Loader className="w-5 h-5 animate-spin text-indigo-500 mr-2" />
                  <span className="text-gray-500 dark:text-gray-400">Loading colors...</span>
                </div>
              ) : availableColors.length > 0 ? (
                <div className="space-y-3">
                  {/* Select All Button */}
                  <button
                    type="button"
                    onClick={handleSelectAllColors}
                    className="w-full px-3 py-2 text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  >
                    {selectedColors.length === availableColors.length ? 'Deselect All' : 'Select All'} 
                    ({availableColors.length} colors)
                  </button>
                  
                  {/* Color List */}
                  <div className="max-h-40 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                    {availableColors.map((color) => (
                      <label
                        key={color.ColorCode}
                        className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedColors.some(c => c.ColorCode === color.ColorCode)}
                          onChange={() => handleColorToggle(color)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <div className="ml-3 flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {color.ColorCode}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {color.Color} {color.ChnColor && `(${color.ChnColor})`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {/* Selected Colors Summary */}
                  {selectedColors.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Selected Colors ({selectedColors.length}):
                      </div>
                      <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                        {selectedColors.map(c => c.ColorCode).join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              ) : selectedOrder ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                  No colors found for this order
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg">
                  Select an order to view available colors
                </div>
              )}
            </div>
          </div>

          {/* Drag & Drop Area */}
          <label
            htmlFor="file-upload"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full px-4 py-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
              isDragging
                ? "border-indigo-600 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-900/30 scale-[1.02]"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/50 rounded-full mb-4 shadow-sm">
              <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 text-center">
              Before and After Wash Measurement Specs
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Drag & drop your Excel file here or click to browse
            </span>
            <input
              id="file-upload"
              name="file-upload"
              type="file"
              className="sr-only"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
          </label>

          {/* Selected File Display */}
          {selectedFile && (
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg animate-fadeIn">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg flex-shrink-0">
                  <FileUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-gray-600/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handlePreview}
              disabled={!selectedFile || !selectedOrder || selectedColors.length === 0 || isLoading || isSaving}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md disabled:bg-indigo-300 dark:disabled:bg-indigo-900/50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" /> Processing...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5 mr-2" /> Preview
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={washingSpecsData.length === 0 || !selectedOrder || selectedColors.length === 0 || isLoading || isSaving}
              className="w-full sm:w-auto flex items-center justify-center px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md disabled:bg-green-300 dark:disabled:bg-green-900/50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" /> Save
                </>
              )}
            </button>
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
      </div>

      {/* --- Preview Section --- */}
      <div className="mt-8 space-y-6">
        {washingSpecsData.length > 0 && (
          <WashingSpecsDataPreview
            moNo={selectedOrder?.Order_No || moNo}
            allSpecData={washingSpecsData}
            selectedColors={selectedColors}
          />
        )}
      </div>

      {/* --- Uploaded Specs Table --- */}
      {/* <div className="max-w-7xl mx-auto">
        <UploadedSpecsView />
      </div> */}
    </div>
  );
};

export default UploadWashingSpecs;
