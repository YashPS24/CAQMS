import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../../../config";
import { ArrowUpDown, Save, X } from "lucide-react";

const BuyerSpecPreview = ({
  isOpen,
  onClose,
  selectedSpecs,
  orderData,
  selectedBuyer,
  selectedStage,
  onSaveSuccess
}) => {
  const [specOrder, setSpecOrder] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Enhanced debug logging
  useEffect(() => {
    if (isOpen) {
      console.log("=== BuyerSpecPreview Debug Info ===");
      console.log("orderData:", orderData);
      console.log("orderData.sizes:", orderData?.sizes);
      console.log("selectedSpecs:", selectedSpecs);
      console.log("selectedSpecs length:", selectedSpecs.length);
      
      if (selectedSpecs.length > 0) {
        console.log("First spec:", selectedSpecs[0]);
        console.log("First spec sizeSpecs:", selectedSpecs[0].sizeSpecs);
        console.log("First spec sizeSpecs keys:", selectedSpecs[0].sizeSpecs ? Object.keys(selectedSpecs[0].sizeSpecs) : "No sizeSpecs");
      }
      
      // Test getSizes function
      const testSizes = getSizes();
      console.log("getSizes() result:", testSizes);
      console.log("getSizes() length:", testSizes.length);
    }
  }, [isOpen, orderData, selectedSpecs]);

  // Extract sizes from the first spec if orderData.sizes is not available
  const getSizes = () => {
    console.log("getSizes called");
    console.log("orderData?.sizes:", orderData?.sizes);
    console.log("orderData?.sizes length:", orderData?.sizes?.length);
    
    if (orderData?.sizes && orderData.sizes.length > 0) {
      console.log("Using orderData.sizes:", orderData.sizes);
      return orderData.sizes;
    }
    
    console.log("selectedSpecs.length:", selectedSpecs.length);
    console.log("selectedSpecs[0]?.sizeSpecs:", selectedSpecs[0]?.sizeSpecs);
    
    // Fallback: extract sizes from the first spec's sizeSpecs
    if (selectedSpecs.length > 0 && selectedSpecs[0].sizeSpecs) {
      const sizes = Object.keys(selectedSpecs[0].sizeSpecs);
      console.log("Extracted sizes from spec:", sizes);
      return sizes;
    }
    
    console.log("No sizes found, returning empty array");
    return [];
  };

  const sizes = getSizes();
  console.log("Final sizes array:", sizes);

  const decimalToFractionString = (decimal) => {
    if (decimal === null || decimal === undefined || isNaN(decimal)) return "-";

    const sign = decimal < 0 ? "-" : "";
    const absDecimal = Math.abs(decimal);
    const whole = Math.floor(absDecimal);
    const fractionValue = absDecimal - whole;

    if (fractionValue === 0) return `${sign}${whole || 0}`;

    const tolerance = 0.01;
    const fractions = [
      { v: 0.0625, f: "1/16" },
      { v: 0.125, f: "1/8" },
      { v: 0.1875, f: "3/16" },
      { v: 0.25, f: "1/4" },
      { v: 0.3125, f: "5/16" },
      { v: 0.375, f: "3/8" },
      { v: 0.4375, f: "7/16" },
      { v: 0.5, f: "1/2" },
      { v: 0.5625, f: "9/16" },
      { v: 0.625, f: "5/8" },
      { v: 0.6875, f: "11/16" },
      { v: 0.75, f: "3/4" },
      { v: 0.8125, f: "13/16" },
      { v: 0.875, f: "7/8" },
      { v: 0.9375, f: "15/16" }
    ];

    const closest = fractions.find(
      (fr) => Math.abs(fractionValue - fr.v) < tolerance
    );

    const fractionPart = closest ? closest.f : fractionValue.toFixed(3);
    return `${sign}${whole > 0 ? whole + " " : ""}${fractionPart}`;
  };

  useEffect(() => {
    if (isOpen && selectedSpecs.length > 0) {
      const initialOrder = selectedSpecs
        .map((spec, index) => ({ seq: spec.seq, order: index + 1 }))
        .sort((a, b) => a.seq - b.seq);
      setSpecOrder(initialOrder);
      console.log("Initial spec order:", initialOrder);
    }
  }, [isOpen, selectedSpecs]);

  const handleOrderChange = (seq, newOrder) => {
    setSpecOrder((current) =>
      current.map((item) =>
        item.seq === seq
          ? { ...item, order: parseInt(newOrder, 10) || 0 }
          : item
      )
    );
  };

  const applyOrder = () => {
    setSpecOrder((current) => [...current].sort((a, b) => a.order - b.order));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const specData = sizes.map((size) => {
        const specDetails = specOrder.map((orderedSpec) => {
          const spec = selectedSpecs.find((s) => s.seq === orderedSpec.seq);
          const specValueDecimal = spec.sizeSpecs?.[size]?.decimal || 0;

          return {
            orderNo: orderedSpec.order,
            specName: spec.measurementPoint,
            chineseRemark: spec.chineseRemark,
            seqNo: spec.seq,
            tolMinus: spec.tolMinus,
            tolPlus: spec.tolPlus,
            specValueFraction: decimalToFractionString(specValueDecimal),
            specValueDecimal: specValueDecimal
          };
        });

        return { size, specDetails };
      });

      const buyerToSave = selectedBuyer ? selectedBuyer.value : orderData.buyer;

      const payload = {
        moNo: orderData.moNo,
        buyer: buyerToSave,
        stage: selectedStage.value,
        specData: specData
      };

      console.log("Payload being sent:", payload);

      const apiEndpoint =
        selectedStage.value === "M2"
          ? `${API_BASE_URL}/api/buyer-spec-templates-m2`
          : `${API_BASE_URL}/api/buyer-spec-templates`;

      const response = await axios.post(apiEndpoint, payload, {
        withCredentials: true
      });

      console.log("Response:", response.data);

      // Show success message with SweetAlert2
      await Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Spec template (${selectedStage.label}) saved successfully!`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#10B981',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: true,
        allowOutsideClick: false
      });

      // Close the modal and notify parent component
      onClose();
      
      // Call parent callback to clear/refresh the page
      if (onSaveSuccess) {
        onSaveSuccess();
      }

    } catch (error) {
      console.error("Error saving spec template:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.details || 
                          error.message || 
                          'Unknown error occurred';
      
      // Show error message with SweetAlert2
      await Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: `Failed to save: ${errorMessage}`,
        confirmButtonText: 'OK',
        confirmButtonColor: '#EF4444',
        allowOutsideClick: false
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const sortedSpecs = specOrder
    .map((orderedItem) => selectedSpecs.find((s) => s.seq === orderedItem.seq))
    .filter(Boolean);

  console.log("Rendering table with sizes:", sizes);
  console.log("Sorted specs:", sortedSpecs);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-screen-2xl my-8 flex flex-col h-[90vh]">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Preview & Order Specs - {selectedStage?.label}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-auto flex-grow">
          {/* Debug info */}
          <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> Sizes: {JSON.stringify(sizes)} | 
            Specs count: {selectedSpecs.length} | 
            Sorted specs: {sortedSpecs.length}
          </div>

          <table className="w-full table-auto text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300 sticky top-0">
              <tr>
                <th scope="col" className="p-3 w-28">
                  <div className="flex items-center">
                    Order
                    <button
                      onClick={applyOrder}
                      className="ml-2 text-indigo-500 hover:text-indigo-700"
                    >
                      <ArrowUpDown size={16} />
                    </button>
                  </div>
                </th>
                <th scope="col" className="p-3 min-w-[200px]">
                  Spec Name
                </th>
                <th scope="col" className="p-3 min-w-[200px]">
                  Chinese Remark
                </th>
                <th scope="col" className="p-3 text-center">
                  Seq
                </th>
                <th scope="col" className="p-3 text-center">
                  Tol -
                </th>
                <th scope="col" className="p-3 text-center">
                  Tol +
                </th>
                {sizes.map((size) => (
                  <th key={size} scope="col" className="p-3 text-center">
                    {size}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedSpecs.map((spec) => (
                <tr
                  key={spec.seq}
                  className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/50"
                >
                  <td className="p-2 text-center">
                    <input
                      type="number"
                      value={
                        specOrder.find((s) => s.seq === spec.seq)?.order || ""
                      }
                      onChange={(e) =>
                        handleOrderChange(spec.seq, e.target.value)
                      }
                      className="w-20 text-center bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </td>
                  <td className="p-3 font-medium text-gray-900 dark:text-white">
                    {spec.measurementPoint}
                  </td>
                  <td className="p-3">{spec.chineseRemark}</td>
                  <td className="p-3 text-center">{spec.seq}</td>
                  <td className="p-3 text-center text-red-600 dark:text-red-400 font-semibold">
                    {decimalToFractionString(spec.tolMinus)}
                  </td>
                  <td className="p-3 text-center text-green-600 dark:text-green-400 font-semibold">
                    {decimalToFractionString(spec.tolPlus)}
                  </td>
                  {sizes.map((size) => {
                    const sizeSpec = spec.sizeSpecs?.[size];
                    console.log(`Rendering: Spec ${spec.seq}, Size ${size}:`, sizeSpec);
                    
                    return (
                      <td
                        key={size}
                        className="p-3 text-center font-mono font-medium text-gray-800 dark:text-gray-200"
                      >
                        {sizeSpec && sizeSpec.decimal !== undefined
                          ? decimalToFractionString(sizeSpec.decimal)
                          : "-"
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex justify-end items-center gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyerSpecPreview;
