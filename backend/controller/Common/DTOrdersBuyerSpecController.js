import {
  BuyerSpecTemplate,
  caProdConnection,
  UserMain,
  caEcoConnection,
} from "../MongoDB/dbConnectionController.js";

// New endpoint to save a buyer-specific measurement spec template
export const saveBuyerSpecTemplate = async (req, res) => {
  try {
    console.log("Received request body:", JSON.stringify(req.body, null, 2)); // Debug log
    
    const { moNo, buyer, stage, specData } = req.body;

    // Basic validation
    if (!moNo || !buyer || !stage || !specData || !Array.isArray(specData)) {
      console.error("Validation failed:", { moNo, buyer, stage, specDataType: typeof specData, specDataLength: specData?.length });
      return res
        .status(400)
        .json({ error: "Missing or invalid data provided. moNo, buyer, stage, and specData are required." });
    }

    console.log("Validation passed, attempting to save/update template");

    // Use findOneAndUpdate with upsert to either create a new template or update an existing one for the same MO No.
    const result = await BuyerSpecTemplate.findOneAndUpdate(
      { moNo: moNo }, // find a document with this filter
      { moNo, buyer, stage, specData, updatedAt: new Date() }, // include stage in the update
      { new: true, upsert: true, runValidators: true } // options
    );

    console.log("Template saved successfully:", result._id);

    res.status(201).json({
      message: "Buyer spec template saved successfully.",
      data: result
    });
  } catch (error) {
    console.error("Error saving buyer spec template:", error);
    console.error("Error stack:", error.stack);
    
    // Check if it's a validation error
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: "Validation failed",
        details: validationErrors.join(', '),
        validationErrors: error.errors
      });
    }
    
    // Check if it's a MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Duplicate entry",
        details: "A template with this MO number already exists"
      });
    }
    
    res.status(500).json({
      error: "Failed to save buyer spec template.",
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Endpoint to get all MO Nos from the buyer spec templates for the edit dropdown
export const getBuyerSpecMoNos = async (req, res) => {
  try {
    const monos = await BuyerSpecTemplate.find({}, { moNo: 1, stage: 1, _id: 0 }).sort({
      moNo: 1
    });
    
    // Return both moNo and stage, or just moNo if you prefer
    res.json(monos.map((m) => ({ moNo: m.moNo, stage: m.stage })));
    // OR just return moNo: res.json(monos.map((m) => m.moNo));
  } catch (error) {
    console.error("Error fetching MO options for templates:", error);
    res.status(500).json({ error: "Failed to fetch MO options" });
  }
};

// Endpoint to fetch data for both tables on the Edit page
export const getBuyerSpecData = async (req, res) => {
  const { moNo } = req.params;
  
  if (!moNo) {
    return res.status(400).json({ error: "MO Number is required." });
  }

  try {
    // 1. Fetch from BuyerSpecTemplate collection (now includes stage)
    const templateData = await BuyerSpecTemplate.findOne({ moNo: moNo }).lean();

    // 2. Fetch AfterWashSpecs from dt_orders collection
    const orderData = await caProdConnection.db
      .collection("dt_orders")
      .findOne(
        { Order_No: moNo },
        { projection: { AfterWashSpecs: 1, _id: 0 } }
      );

    // Check if AfterWashSpecs exist and are valid
    const patternData =
      orderData &&
      Array.isArray(orderData.AfterWashSpecs) &&
      orderData.AfterWashSpecs.length > 0
        ? orderData
        : null;

    if (!templateData && !patternData) {
      return res.status(404).json({
        error: `No spec data found for MO No: ${moNo} in any source.`
      });
    }

    res.json({ templateData, patternData });
  } catch (error) {
    console.error(`Error fetching edit spec data for MO ${moNo}:`, error);
    res
      .status(500)
      .json({ error: "Failed to fetch data.", details: error.message });
  }
};

// Endpoint to UPDATE an existing buyer spec template
export const updateBuyerSpecTemplate = async (req, res) => {
  const { moNo } = req.params;
  const { stage, specData } = req.body; // Add stage to destructuring

  if (!specData) {
    return res.status(400).json({ error: "specData is required for update." });
  }

  try {
    // Build update object conditionally
    const updateData = { specData };
    if (stage) {
      updateData.stage = stage;
    }

    const updatedTemplate = await BuyerSpecTemplate.findOneAndUpdate(
      { moNo: moNo },
      { $set: updateData },
      { new: true, runValidators: true } // new: true returns the modified document
    );

    if (!updatedTemplate) {
      return res
        .status(404)
        .json({ error: "Template not found for the given MO No." });
    }

    res.status(200).json({
      message: "Spec template updated successfully.",
      data: updatedTemplate
    });
  } catch (error) {
    console.error("Error updating spec template:", error);
    res.status(500).json({
      error: "Failed to update spec template.",
      details: error.message
    });
  }
};

export const getFilterOptions = async (req, res) => {
    try {
        const { factory, mono, custStyle, buyer, mode, country, origin, stage } =
          req.query;
        const orderFilter = {};
        if (factory) orderFilter.Factory = factory;
        if (mono) orderFilter.Order_No = mono;
        if (custStyle) orderFilter.CustStyle = custStyle;
        if (buyer) orderFilter.ShortName = buyer;
        if (mode) orderFilter.Mode = mode;
        if (country) orderFilter.Country = country;
        if (origin) orderFilter.Origin = origin;
    
        const factories = await caProdConnection.db
          .collection("dt_orders")
          .distinct("Factory", orderFilter);
        const monos = await caProdConnection.db
          .collection("dt_orders")
          .distinct("Order_No", orderFilter);
        const custStyles = await caProdConnection.db
          .collection("dt_orders")
          .distinct("CustStyle", orderFilter);
        const buyers = await caProdConnection.db
          .collection("dt_orders")
          .distinct("ShortName", orderFilter);
        const modes = await caProdConnection.db
          .collection("dt_orders")
          .distinct("Mode", orderFilter);
        const countries = await caProdConnection.db
          .collection("dt_orders")
          .distinct("Country", orderFilter);
        const origins = await caProdConnection.db
          .collection("dt_orders")
          .distinct("Origin", orderFilter);
 
        let measurementFilter = {};
        if (mono) {
          const order = await caProdConnection.db
            .collection("dt_orders")
            .findOne({ Order_No: mono }, { projection: { _id: 1 } });
          if (order) {
            measurementFilter.style_id = order._id.toString();
          }
        } else {
          const filteredOrders = await caProdConnection.db
            .collection("dt_orders")
            .find(orderFilter, { projection: { _id: 1 } })
            .toArray();
          const orderIds = filteredOrders.map((order) => order._id.toString());
          measurementFilter.style_id = { $in: orderIds };
        }
        if (stage) {
          measurementFilter.stage = stage;
        }
    
        const stages = await caProdConnection.db
          .collection("measurement_data")
          .distinct("stage", measurementFilter);
    
        const empIds = await UserMain.distinct("emp_id", {
          working_status: "Working",
          emp_id: { $ne: null }
        });
    
        const dateRange = await caEcoConnection.db
          .collection("measurement_data")
          .aggregate([
            {
              $group: {
                _id: null,
                minDate: { $min: "$created_at" },
                maxDate: { $max: "$created_at" }
              }
            }
          ])
          .toArray();
        const minDate = dateRange.length > 0 ? dateRange[0].minDate : null;
        const maxDate = dateRange.length > 0 ? dateRange[0].maxDate : null;
    
        res.json({
          factories,
          monos,
          custStyles,
          buyers,
          modes,
          countries,
          origins,
          stages, 
          empIds,
          minDate,
          maxDate
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
        res.status(500).json({ error: "Failed to fetch filter options" });
      }
};

export const getBuyerSpecOrderDetails = async (req, res) => {
  try {
    const collection = caProdConnection.db.collection("dt_orders");
    const order = await collection.findOne({ Order_No: req.params.mono });
    if (!order) return res.status(404).json({ error: "Order not found" });

    const colorSizeMap = {};
    const sizes = new Set();

    order.OrderColors.forEach((colorObj) => {
      const color = colorObj.Color.trim();
      colorSizeMap[color] = {};
      colorObj.OrderQty.forEach((sizeEntry) => {
        const sizeName = Object.keys(sizeEntry)[0].split(";")[0].trim();
        const quantity = sizeEntry[sizeName];
        if (quantity > 0) {
          colorSizeMap[color][sizeName] = quantity;
          sizes.add(sizeName);
        }
      });
    });

    // Get buyer specs from afterWashSpecs - NO MAPPING, USE AS-IS
    let buyerSpec = [];
    let specSizes = [];
    
    if (order.afterWashSpecs && order.afterWashSpecs.length > 0) {
      // Find the "ALL" color spec or use the first available spec
      const specData = order.afterWashSpecs.find(spec => spec.colorCode === "ALL") || order.afterWashSpecs[0];
      
      console.log("Found spec data:", specData); // Debug log
      
      if (specData && specData.specs) {
        // Get sizes from the first spec's sizeSpecs
        if (specData.specs[0] && specData.specs[0].sizeSpecs) {
          specSizes = Object.keys(specData.specs[0].sizeSpecs);
          console.log("Spec sizes found:", specSizes); // Debug log
        }

        buyerSpec = specData.specs.map((spec) => {
          console.log("Processing spec:", spec.seq_no, "sizeSpecs:", spec.sizeSpecs); // Debug log
          
          // Convert tolerance values to their fractional parts
          const tolMinusMagnitude =
            Math.abs(spec.TolMinus.decimal) >= 1
              ? Math.abs(spec.TolMinus.decimal) -
                Math.floor(Math.abs(spec.TolMinus.decimal))
              : Math.abs(spec.TolMinus.decimal);
          const tolPlusMagnitude =
            Math.abs(spec.TolPlus.decimal) >= 1
              ? Math.abs(spec.TolPlus.decimal) -
                Math.floor(Math.abs(spec.TolPlus.decimal))
              : Math.abs(spec.TolPlus.decimal);

          const result = {
            seq: spec.seq_no,
            measurementPoint: spec.MeasurementPointEngName,
            chineseRemark: spec.MeasurementPointChiName || "",
            tolMinus: tolMinusMagnitude === 0 ? 0 : -tolMinusMagnitude,
            tolPlus: tolPlusMagnitude,
            sizeSpecs: spec.sizeSpecs || {} // Use sizeSpecs directly from afterWashSpecs
          };
          
          console.log("Final spec result:", result); // Debug log
          return result;
        });
      }
    }

    console.log("Final buyerSpec array:", buyerSpec); // Debug log
    console.log("Final specSizes array:", specSizes); // Debug log

    res.json({
      moNo: order.Order_No,
      custStyle: order.CustStyle || "N/A",
      buyer: order.ShortName || "N/A",
      mode: order.Mode || "N/A",
      country: order.Country || "N/A",
      origin: order.Origin || "N/A",
      orderQty: order.TotalQty,
      colors: Object.keys(colorSizeMap),
      sizes: specSizes.length > 0 ? specSizes : Array.from(sizes), // Use spec sizes if available, fallback to order sizes
      colorSizeMap,
      buyerSpec
    });
  } catch (error) {
    console.error("Error fetching buyer spec order details:", error);
    res.status(500).json({ error: "Failed to fetch buyer spec order details" });
  }
};