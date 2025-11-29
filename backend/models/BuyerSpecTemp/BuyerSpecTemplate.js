import mongoose from "mongoose";

const SpecDetailSchema = new mongoose.Schema(
  {
    orderNo: { type: Number, required: true },
    specName: { type: String, required: true },
    chineseRemark: { type: String },
    seqNo: { type: String, required: true },
    tolMinus: { type: Number, required: true },
    tolPlus: { type: Number, required: true },
    specValueFraction: { type: String, required: true },
    specValueDecimal: { type: Number, required: true }
  },
  { _id: false }
);

// Sub-schema for the data associated with a single size
const SizeDataSchema = new mongoose.Schema(
  {
    size: { type: String, required: true },
    specDetails: [SpecDetailSchema]
  },
  { _id: false }
);

// Main schema for the buyer spec template
const BuyerSpecTemplateSchema = new mongoose.Schema(
  {
    moNo: { type: String, required: true, unique: true },
    buyer: { type: String, required: true },
    stage: { type: String, required: true },
    specData: [SizeDataSchema]
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt

// Create and export the model factory
export default (connection) =>
  connection.model("BuyerSpecTemplate", BuyerSpecTemplateSchema);
