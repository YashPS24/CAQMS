import React from "react";
import { Layers, Ruler } from "lucide-react";

const WashingSpecsDataPreview = ({ moNo, allSpecData, selectedColors = [] }) => {
  if (!allSpecData || allSpecData.length === 0) {
    return null;
  }

  const specData = allSpecData[0]; // Single sheet format

  // Get all unique sizes from the data
  const allSizes = specData.sizeColumns || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
      {/* --- Header Section --- */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Ruler className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                Before & After Washing Specs Preview
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                MO No:{" "}
                <span className="text-indigo-600 dark:text-indigo-400">
                  {moNo}
                </span>
              </p>
            </div>
          </div>

          {/* Selected Colors Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm">
            <Layers className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
              {selectedColors.length} Colors Selected
            </span>
          </div>
        </div>

        {/* Selected Colors List */}
        {selectedColors.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Selected Colors:
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedColors.map((color) => (
                <span
                  key={color.ColorCode}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 text-xs rounded-md border border-blue-200 dark:border-blue-700"
                >
                  {color.ColorCode} - {color.Color}
                  {color.ChnColor && ` (${color.ChnColor})`}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shrinkage Information */}
      {specData.shrinkageInfo && (
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
            Shrinkage Information:
          </div>
          <div className="text-sm text-orange-700 dark:text-orange-300">
            <span className="font-medium">Raw:</span> {specData.shrinkageInfo.raw}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
            Length: {specData.shrinkageInfo.length}% | Width: {specData.shrinkageInfo.width}%
          </div>
        </div>
      )}

      {/* --- Main Preview Table --- */}
      <div className="p-6">
        <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-700/80">
              {/* Header Row 1: Main Headers */}
              <tr>
                <th rowSpan="2" className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 min-w-[200px]">
                  Measurement Point (ENG)
                </th>
                <th rowSpan="2" className="px-4 py-3 text-left text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 min-w-[150px]">
                  Measurement Point (CHI)
                </th>
                <th rowSpan="2" className="px-2 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 w-16">
                  TOL (-)
                </th>
                <th rowSpan="2" className="px-2 py-3 text-center text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 w-16">
                  TOL (+)
                </th>
                {allSizes.map((size) => (
                  <th
                    key={size}
                    colSpan="2"
                    className="px-4 py-2 text-center text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 border-b border-gray-200 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/30"
                  >
                    {size}
                  </th>
                ))}
              </tr>
              {/* Header Row 2: Before/After Labels */}
              <tr>
                {allSizes.map((size) => (
                  <React.Fragment key={`${size}-headers`}>
                    <th className="px-2 py-2 text-center text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 bg-green-50 dark:bg-green-900/20">
                      AFTER WASH
                    </th>
                    <th className="px-2 py-2 text-center text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider border-r border-gray-200 dark:border-gray-600 bg-blue-50 dark:bg-blue-900/20">
                      BEFORE WASH
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {specData.rows && specData.rows.map((row, index) => (
                <tr
                  key={index}
                  className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-colors group"
                >
                  {/* Measurement Point English */}
                  <td className="px-4 py-3 text-xs font-medium text-gray-800 dark:text-gray-200 border-r border-gray-200 dark:border-gray-700 sticky left-0 bg-white dark:bg-gray-800 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 z-10">
                    {row.英文描述}
                  </td>
                  
                  {/* Measurement Point Chinese */}
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                    {row.中文描述}
                  </td>
                  
                  {/* Tolerance Minus */}
                  <td className="px-2 py-3 text-center text-xs font-bold text-red-600 dark:text-red-400 border-r border-gray-200 dark:border-gray-700 bg-red-50/30 dark:bg-red-900/10">
                    {row.Tol_Minus?.raw || ''}
                  </td>
                  
                  {/* Tolerance Plus */}
                  <td className="px-2 py-3 text-center text-xs font-bold text-green-600 dark:text-green-400 border-r border-gray-200 dark:border-gray-700 bg-green-50/30 dark:bg-green-900/10">
                    {row.Tol_Plus?.raw || ''}
                  </td>
                  
                  {/* Size Measurements */}
                  {allSizes.map((size) => {
                    const sizeSpec = row.specs && row.specs[size];
                    return (
                      <React.Fragment key={`${size}-${index}`}>
                        {/* After Wash */}
                        <td className="px-2 py-3 text-center text-xs font-medium text-green-700 dark:text-green-300 border-r border-gray-200 dark:border-gray-700 bg-green-50/50 dark:bg-green-900/20">
                          {sizeSpec?.afterWash?.raw || ''}
                        </td>
                        {/* Before Wash */}
                        <td className="px-2 py-3 text-center text-xs font-medium text-blue-700 dark:text-blue-300 border-r border-gray-200 dark:border-gray-700 bg-blue-50/50 dark:bg-blue-900/20">
                          {sizeSpec?.beforeWash?.raw || ''}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Data Structure Summary --- */}
      <div className="p-6 bg-slate-700 text-white">
        <h3 className="text-lg font-semibold text-blue-200 mb-2">
          Final Data Structure Preview
        </h3>
        <div className="text-sm text-blue-300 mb-4">
          The Excel measurements will be applied to all selected colors:
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-slate-800 p-3 rounded">
            <div className="text-slate-400">Total Measurements:</div>
            <div className="text-white font-semibold">{specData.rows?.length || 0}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <div className="text-slate-400">Total Sizes:</div>
            <div className="text-white font-semibold">{allSizes.length}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <div className="text-slate-400">Selected Colors:</div>
            <div className="text-white font-semibold">{selectedColors.length}</div>
          </div>
          <div className="bg-slate-800 p-3 rounded">
            <div className="text-slate-400">Total Objects:</div>
            <div className="text-white font-semibold">{selectedColors.length * 2}</div>
          </div>
        </div>

        {/* Color Breakdown */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Before Wash Specs:</h4>
            <div className="space-y-1">
              {selectedColors.map(color => (
                <div key={`before-${color.ColorCode}`} className="text-blue-400 text-sm">
                  → {color.ColorCode} ({color.Color}): {specData.rows?.length || 0} measurements
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-green-300 mb-2">After Wash Specs:</h4>
            <div className="space-y-1">
              {selectedColors.map(color => (
                <div key={`after-${color.ColorCode}`} className="text-green-400 text-sm">
                  → {color.ColorCode} ({color.Color}): {specData.rows?.length || 0} measurements
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Size List */}
        <div className="mt-4">
          <h4 className="font-semibold text-slate-300 mb-2">Available Sizes:</h4>
          <div className="flex flex-wrap gap-2">
            {allSizes.map(size => (
              <span key={size} className="px-2 py-1 bg-slate-600 text-slate-200 rounded text-sm">
                {size}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WashingSpecsDataPreview;
