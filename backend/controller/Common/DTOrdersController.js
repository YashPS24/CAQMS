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
    dataLength: washingSpecsData?.length
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

    const specData = washingSpecsData[0];
    
    console.log('Processing spec data:', {
      rowsCount: specData.rows?.length,
      sizesCount: specData.sizeColumns?.length,
      sizes: specData.sizeColumns
    });

    // Get existing specs or initialize empty arrays
    const existingBeforeWashSpecs = orderDocument.beforeWashSpecs || [];
    const existingAfterWashSpecs = orderDocument.afterWashSpecs || [];
    
    // Find existing 'ALL' after wash spec to get previously applied colors
    const existingAfterWashAllSpec = existingAfterWashSpecs.find(spec => spec.colorCode === 'ALL');
    const previouslyAppliedColors = existingAfterWashAllSpec ? (existingAfterWashAllSpec.appliedColors || []) : [];
    
    console.log('Previously applied colors:', previouslyAppliedColors);
    console.log('Currently selected colors:', selectedColors);
    
    // Merge previous and current colors (remove duplicates)
    const allAppliedColors = [...new Set([...previouslyAppliedColors, ...selectedColors])];
    
    console.log('All applied colors (merged):', allAppliedColors);

    // Create new specs
    const newBeforeWashSpecs = [];
    let newAfterWashSpec = null;
    
    // Process After Wash Specs ONCE (same for all colors)
    const afterWashColorSpecs = [];
    
    specData.rows.forEach((row, rowIndex) => {
      const afterWashSizeSpecs = {};
      let hasAfterWashData = false;
      
      // Process each size for after wash
      specData.sizeColumns.forEach(size => {
        const sizeSpec = row.specs[size];
        
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
          sizeSpecs: afterWashSizeSpecs
        });
      }
    });

    // Create SINGLE after wash spec object for ALL colors with merged applied colors
    if (afterWashColorSpecs.length > 0) {
      newAfterWashSpec = {
        _id: existingAfterWashAllSpec ? existingAfterWashAllSpec._id : new ObjectId(), // Keep existing ID if updating
        colorCode: 'ALL',
        Color: 'ALL',
        ChnColor: 'ALL',
        ColorKey: 'ALL',
        appliedColors: allAppliedColors, // Use merged colors list
        Shrinkage: specData.shrinkageInfo,
        uploadedAt: new Date(),
        lastUpdatedColors: selectedColors, // Track which colors were updated in this upload
        specs: afterWashColorSpecs
      };
      console.log('✅ After wash spec object created/updated for ALL colors');
      console.log('Applied colors:', allAppliedColors);
    }

    // Process Before Wash Specs for EACH selected color
    selectedColors.forEach(colorCode => {
      const colorInfo = orderDocument.OrderColors?.find(oc => oc.ColorCode === colorCode);
      
      if (!colorInfo) {
        console.warn(`Color ${colorCode} not found in order colors`);
        return;
      }

      console.log(`Processing before wash specs for color: ${colorCode}`);
      
      const beforeWashColorSpecs = [];
      
      specData.rows.forEach((row, rowIndex) => {
        const beforeWashSizeSpecs = {};
        let hasBeforeWashData = false;
        
        specData.sizeColumns.forEach(size => {
          const sizeSpec = row.specs[size];
          
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
        });

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
            sizeSpecs: beforeWashSizeSpecs
          });
        }
      });

      if (beforeWashColorSpecs.length > 0) {
        newBeforeWashSpecs.push({
          _id: new ObjectId(),
          colorCode: colorCode,
          Color: colorInfo.Color,
          ChnColor: colorInfo.ChnColor,
          ColorKey: colorInfo.ColorKey,
          Shrinkage: specData.shrinkageInfo,
          uploadedAt: new Date(),
          specs: beforeWashColorSpecs
        });
      }
    });

    console.log('Final specs created:', {
      beforeWashSpecs: newBeforeWashSpecs.length,
      afterWashSpec: newAfterWashSpec ? 1 : 0,
      totalAppliedColors: allAppliedColors.length
    });

    // Merge with existing specs
    const updatedBeforeWashSpecs = [
      ...existingBeforeWashSpecs.filter(spec => !selectedColors.includes(spec.colorCode)),
      ...newBeforeWashSpecs
    ];

    // For after wash specs, remove existing 'ALL' entry and add new one with merged colors
    const updatedAfterWashSpecs = [
      ...existingAfterWashSpecs.filter(spec => spec.colorCode !== 'ALL'),
      ...(newAfterWashSpec ? [newAfterWashSpec] : [])
    ];

    // Update database
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

    const totalAfterWashMeasurements = newAfterWashSpec ? newAfterWashSpec.specs.length : 0;

    res.status(200).json({
      message: `Successfully updated washing specs for MO No '${moNo}' with ${selectedColors.length} color(s).`,
      details: {
        updatedColors: selectedColors,
        allAppliedColors: allAppliedColors, // Show all colors that have specs
        beforeWashMeasurements: totalBeforeWashMeasurements,
        afterWashMeasurements: totalAfterWashMeasurements,
        totalSizes: specData.sizeColumns?.length || 0,
        availableSizes: specData.sizeColumns,
        structure: {
          beforeWashColors: updatedBeforeWashSpecs.length,
          afterWashSpecs: updatedAfterWashSpecs.length,
          afterWashNote: `After wash specs are shared across ${allAppliedColors.length} colors: ${allAppliedColors.join(', ')}`
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



