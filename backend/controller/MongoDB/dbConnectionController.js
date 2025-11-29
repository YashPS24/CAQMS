import mongoose from "mongoose";

//Schemas
import createUserModel from "../../models/User/User.js";
import createRoleManagmentModel from "../../models/Role/RoleManagment.js";
import createDTOrdersSchema from "../../models/DT_Orders/dt_orders.js";
import createBuyerSpecTemplateModel from "../../models/BuyerSpecTemp/BuyerSpecTemplate.js";
import createBuyerSpecTemplateM2Model from "../../models/BuyerSpecTemp/BuyerSpecTemplateM2.js";
import createANFMeasurementReportModel from "../../models/ANFMeasurement/ANFMeasurementReport.js";
import createANFMeasurementReportPackingModel from "../../models/ANFMeasurement/ANFMeasurementReportPacking.js";
import createSizeCompletionStatusModel from "../../models/ANFMeasurement/SizeCompletionStatus.js";
import createSizeCompletionStatusPackingModel from "../../models/ANFMeasurement/ANFMeasurementReportPacking.js";


// MongoDB Connections
export const caProdConnection = mongoose.createConnection(
  "mongodb://admin:Yai%40Ym2024@192.167.1.10:29000/ca_prod?authSource=admin"
);

export const caEcoConnection = mongoose.createConnection(
  "mongodb://admin:Yai%40Ym2024@192.167.1.10:29000/ca_eco_board?authSource=admin"
);

// Connection status
caProdConnection.on("connected", () =>
  console.log("✅ Connected to ca_prod database in 192.167.1.10:29000...")
);

caProdConnection.on("error", (err) => console.error("❌ unexpected error:", err));

caEcoConnection.on("connected", () =>
  console.log("✅ Connected to ca_eco_board database in 192.167.1.10:29000...")
);

caEcoConnection.on("error", (err) => console.error("❌ unexpected error:", err));

// Collections
export const UserMain = createUserModel(caEcoConnection);
export const RoleManagment = createRoleManagmentModel(caProdConnection);
export const DtOrder = createDTOrdersSchema(caProdConnection);
export const BuyerSpecTemplate = createBuyerSpecTemplateModel(caProdConnection);
export const BuyerSpecTemplateM2 =
  createBuyerSpecTemplateM2Model(caProdConnection);
  export const ANFMeasurementReport =
  createANFMeasurementReportModel(caProdConnection);
export const ANFMeasurementReportPacking =
  createANFMeasurementReportPackingModel(caProdConnection);
  export const SizeCompletionStatus =
  createSizeCompletionStatusModel(caProdConnection);
  export const SizeCompletionStatusPacking =
  createSizeCompletionStatusPackingModel(caProdConnection);

// Disconnect DB connection
export async function disconnectMongoDB() {
    try {
        await caProdConnection.close();
        await caEcoConnection.close();
        console.log('MongoDB connections closed.');
    } catch (error) {
        console.error('Error disconnecting MongoDB:', error);
        throw error;
    }
}
