import { caProdConnection } from "../MongoDB/dbConnectionController.js";
import { ObjectId } from 'mongodb';

export const searchOrders = async (req, res) => {
  const { search } = req.query;

  if (!search || search.length < 2) {
    return res.json({ orders: [] });
  }

  try {
    const collection = caProdConnection.db.collection("dt_orders");
    
    const query = {
      Order_No: { $regex: new RegExp(search, "i") }
    };

    const orders = await collection
      .find(query)
      .limit(10) // Limit suggestions
      .project({
        Order_No: 1,
        CustStyle: 1,
        TotalQty: 1,
        Style: 1
      })
      .sort({ Order_No: 1 })
      .toArray();

    res.json({ orders });
  } catch (error) {
    console.error("Error searching orders:", error);
    res.status(500).json({ error: "Failed to search orders" });
  }
};

// NEW: Get Colors for Selected Order
export const getOrderColors = async (req, res) => {
  const { orderNo } = req.params;

  if (!orderNo) {
    return res.status(400).json({ message: "Order number is required" });
  }

  try {
    const collection = caProdConnection.db.collection("dt_orders");
    
    const order = await collection.findOne(
      { Order_No: orderNo },
      { 
        projection: { 
          OrderColors: 1,
          Order_No: 1 
        } 
      }
    );

    if (!order) {
      return res.status(404).json({ 
        message: `Order '${orderNo}' not found` 
      });
    }

    // Extract unique colors
    const colors = [];
    const seenColors = new Set();

    if (order.OrderColors && Array.isArray(order.OrderColors)) {
      order.OrderColors.forEach(colorObj => {
        const colorKey = `${colorObj.ColorCode}-${colorObj.Color}`;
        if (!seenColors.has(colorKey) && colorObj.ColorCode) {
          seenColors.add(colorKey);
          colors.push({
            ColorCode: colorObj.ColorCode,
            Color: colorObj.Color || '',
            ChnColor: colorObj.ChnColor || '',
            ColorKey: colorObj.ColorKey
          });
        }
      });
    }

    res.json({ 
      orderNo: order.Order_No,
      colors: colors.sort((a, b) => a.ColorCode.localeCompare(b.ColorCode))
    });
  } catch (error) {
    console.error("Error fetching order colors:", error);
    res.status(500).json({ error: "Failed to fetch order colors" });
  }
};

export const saveWashingSpecs = async (req, res) => {
  const { moNo, washingSpecsData, selectedColors } = req.body;

  console.log('Save request received:', {
    moNo,
    selectedColors,
    dataLength: washingSpecsData?.length,
    firstRowSample: washingSpecsData?.[0]?.rows?.[0]
  });

  if (!moNo || !washingSpecsData || washingSpecsData.length === 0) {
    return res.status(400).json({ message: "Missing MO Number or specs data." });
  }

  if (!selectedColors || selectedColors.length === 0) {
    return res.status(400).json({ message: "Please select at least one color." });
  }

  try {
    const collection = caProdConnection.db.collection("dt_orders");
    const orderDocument = await collection.findOne({ Order_No: moNo });

    if (!orderDocument) {
      return res.status(404).json({
        message: `Order with MO No '${moNo}' not found in dt_orders.`
      });
    }

    // Process the washing specs data
    const specData = washingSpecsData[0]; // Single sheet format
    
    console.log('Processing spec data:', {
      rowsCount: specData.rows?.length,
      sizesCount: specData.sizeColumns?.length,
      sizes: specData.sizeColumns
    });

    // Get existing specs or initialize empty arrays
    const existingBeforeWashSpecs = orderDocument.beforeWashSpecs || [];
    const existingAfterWashSpecs = orderDocument.afterWashSpecs || [];
    
    // Create new specs for ALL selected colors
    const newBeforeWashSpecs = [];
    const newAfterWashSpecs = [];
    
    selectedColors.forEach(colorCode => {
      // Get color information from order
      const colorInfo = orderDocument.OrderColors?.find(oc => oc.ColorCode === colorCode);
      
      if (!colorInfo) {
        console.warn(`Color ${colorCode} not found in order colors`);
        return; // Skip this color if not found
      }

      console.log(`Processing color: ${colorCode}`);

      // Process Before Wash Specs for this color
      const beforeWashColorSpecs = [];
      const afterWashColorSpecs = [];
      
      specData.rows.forEach((row, rowIndex) => {
        // Create size specifications object for this measurement point
        const beforeWashSizeSpecs = {};
        const afterWashSizeSpecs = {};
        
        let hasBeforeWashData = false;
        let hasAfterWashData = false;
        
        // Process each size - ONLY the sizes from Excel
        specData.sizeColumns.forEach(size => {
          const sizeSpec = row.specs[size];
          
          // Before wash size spec
          if (sizeSpec && sizeSpec.beforeWash && 
              sizeSpec.beforeWash.raw !== null && 
              sizeSpec.beforeWash.raw !== undefined &&
              sizeSpec.beforeWash.raw !== '') {
            beforeWashSizeSpecs[size] = {
              fraction: sizeSpec.beforeWash.raw,
              decimal: sizeSpec.beforeWash.decimal
            };
            hasBeforeWashData = true;
          }
          
          // After wash size spec
          if (sizeSpec && sizeSpec.afterWash && 
              sizeSpec.afterWash.raw !== null && 
              sizeSpec.afterWash.raw !== undefined &&
              sizeSpec.afterWash.raw !== '') {
            afterWashSizeSpecs[size] = {
              fraction: sizeSpec.afterWash.raw,
              decimal: sizeSpec.afterWash.decimal
            };
            hasAfterWashData = true;
          }
        });

        // Create measurement point object for before wash
        if (hasBeforeWashData) {
          beforeWashColorSpecs.push({
            no: rowIndex + 1,
            seq_no: row.序号,
            MeasurementPointEngName: row.英文描述 || '',
            MeasurementPointChiName: row.中文描述 || '',
            TolMinus: {
              fraction: row.Tol_Minus?.raw || '',
              decimal: row.Tol_Minus?.decimal || 0
            },
            TolPlus: {
              fraction: row.Tol_Plus?.raw || '',
              decimal: row.Tol_Plus?.decimal || 0
            },
            sizeSpecs: beforeWashSizeSpecs // Object with size as key
          });
        }

        // Create measurement point object for after wash
        if (hasAfterWashData) {
          afterWashColorSpecs.push({
            no: rowIndex + 1,
            seq_no: row.序号,
            MeasurementPointEngName: row.英文描述 || '',
            MeasurementPointChiName: row.中文描述 || '',
            TolMinus: {
              fraction: row.Tol_Minus?.raw || '',
              decimal: row.Tol_Minus?.decimal || 0
            },
            TolPlus: {
              fraction: row.Tol_Plus?.raw || '',
              decimal: row.Tol_Plus?.decimal || 0
            },
            sizeSpecs: afterWashSizeSpecs // Object with size as key
          });
        }
      });

      console.log(`Color ${colorCode} - Before wash specs: ${beforeWashColorSpecs.length}, After wash specs: ${afterWashColorSpecs.length}`);

      // Create color object for before wash specs - SIMPLIFIED STRUCTURE
      if (beforeWashColorSpecs.length > 0) {
        newBeforeWashSpecs.push({
          _id: new ObjectId(), // Generate new ObjectId
          colorCode: colorCode,
          Color: colorInfo.Color,
          ChnColor: colorInfo.ChnColor,
          ColorKey: colorInfo.ColorKey,
          Shrinkage: specData.shrinkageInfo,
          uploadedAt: new Date(),
          specs: beforeWashColorSpecs
        });
      }

      // Create color object for after wash specs - SIMPLIFIED STRUCTURE
      if (afterWashColorSpecs.length > 0) {
        newAfterWashSpecs.push({
          _id: new ObjectId(), // Generate new ObjectId
          colorCode: colorCode,
          Color: colorInfo.Color,
          ChnColor: colorInfo.ChnColor,
          ColorKey: colorInfo.ColorKey,
          Shrinkage: specData.shrinkageInfo, 
          uploadedAt: new Date(),
          specs: afterWashColorSpecs
        });
      }
    });

    console.log('Final specs created:', {
      beforeWashSpecs: newBeforeWashSpecs.length,
      afterWashSpecs: newAfterWashSpecs.length
    });

    // Merge with existing specs (remove existing entries for the same colors, then add new ones)
    const updatedBeforeWashSpecs = [
      ...existingBeforeWashSpecs.filter(spec => !selectedColors.includes(spec.colorCode)),
      ...newBeforeWashSpecs
    ];

    const updatedAfterWashSpecs = [
      ...existingAfterWashSpecs.filter(spec => !selectedColors.includes(spec.colorCode)),
      ...newAfterWashSpecs
    ];

    // Update database - REMOVED WashingSpecsMetadata
    const updateData = {
      beforeWashSpecs: updatedBeforeWashSpecs,
      afterWashSpecs: updatedAfterWashSpecs
    };

    const updateResult = await collection.updateOne(
      { _id: orderDocument._id },
      { $set: updateData }
    );

    if (updateResult.modifiedCount === 0 && updateResult.matchedCount > 0) {
      return res.status(200).json({ 
        message: "Washing specs data is already up to date." 
      });
    }

    // Calculate totals for response
    const totalBeforeWashMeasurements = newBeforeWashSpecs.reduce((total, colorSpec) => {
      return total + colorSpec.specs.length;
    }, 0);

    const totalAfterWashMeasurements = newAfterWashSpecs.reduce((total, colorSpec) => {
      return total + colorSpec.specs.length;
    }, 0);

    res.status(200).json({
      message: `Successfully updated washing specs for MO No '${moNo}' with ${selectedColors.length} color(s).`,
      details: {
        updatedColors: selectedColors,
        beforeWashMeasurements: totalBeforeWashMeasurements,
        afterWashMeasurements: totalAfterWashMeasurements,
        totalSizes: specData.sizeColumns?.length || 0,
        availableSizes: specData.sizeColumns,
        structure: {
          beforeWashColors: updatedBeforeWashSpecs.length,
          afterWashColors: updatedAfterWashSpecs.length
        }
      }
    });

  } catch (error) {
    console.error("Error saving washing specs:", error);
    res.status(500).json({
      message: "An internal server error occurred while saving the data."
    });
  }
};

// Updated function to get uploaded specs
export const getUploadedSpecsOrders = async (req, res) => {
  const { page = 1, limit = 10, moNo } = req.query;
  const skip = (page - 1) * limit;

  try {
    const collection = caProdConnection.db.collection("dt_orders");
    
    // Filter: Only orders that have beforeWashSpecs OR afterWashSpecs populated
    const query = {
      $or: [
        { beforeWashSpecs: { $exists: true, $not: { $size: 0 } } },
        { afterWashSpecs: { $exists: true, $not: { $size: 0 } } }
      ]
    };

    if (moNo) {
      query.Order_No = { $regex: new RegExp(moNo, "i") };
    }

    const totalRecords = await collection.countDocuments(query);
    const orders = await collection
      .find(query)
      .sort({ "WashingSpecsMetadata.lastUpdated": -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .project({
        Order_No: 1,
        CustStyle: 1,
        TotalQty: 1,
        OrderColors: 1,
        beforeWashSpecs: 1,
        afterWashSpecs: 1,
        WashingSpecsMetadata: 1
      })
      .toArray();

    const tableData = orders.map((order) => {
      const beforeWashSpecs = order.beforeWashSpecs || [];
      const afterWashSpecs = order.afterWashSpecs || [];
      
      // Get unique colors from both before and after wash specs
      const beforeWashColors = beforeWashSpecs.map(spec => spec.colorCode);
      const afterWashColors = afterWashSpecs.map(spec => spec.colorCode);
      const allUploadedColors = [...new Set([...beforeWashColors, ...afterWashColors])];
      
      // Calculate total measurements
      const totalBeforeWashMeasurements = beforeWashSpecs.reduce((total, colorSpec) => {
        return total + (colorSpec.specs?.length || 0);
      }, 0);

      const totalAfterWashMeasurements = afterWashSpecs.reduce((total, colorSpec) => {
        return total + (colorSpec.specs?.length || 0);
      }, 0);
      
      return {
        _id: order._id,
        moNo: order.Order_No,
        custStyle: order.CustStyle || "N/A",
        totalQty: order.TotalQty || 0,
        uploadedColors: allUploadedColors.length,
        colorsList: allUploadedColors.join(", "),
        beforeWashColors: beforeWashColors.length,
        afterWashColors: afterWashColors.length,
        beforeWashMeasurements: totalBeforeWashMeasurements,
        afterWashMeasurements: totalAfterWashMeasurements,
        totalMeasurements: totalBeforeWashMeasurements + totalAfterWashMeasurements,
        lastUpdated: order.WashingSpecsMetadata?.lastUpdated || null
      };
    });

    res.json({
      data: tableData,
      pagination: {
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });

  } catch (error) {
    console.error("Error fetching uploaded specs orders:", error);
    res.status(500).json({ error: "Failed to fetch data." });
  }
};



