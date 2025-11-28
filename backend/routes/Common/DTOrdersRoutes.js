import express from "express";
import {
  searchOrders,
  getOrderColors,
  saveWashingSpecs,
  getUploadedSpecsOrders,
} from "../../controller/Common/DTOrdersController.js";

const router = express.Router();
router.get('/api/washing-specs/search-orders', searchOrders);
router.get('/api/washing-specs/order-colors/:orderNo', getOrderColors);

router.post("/api/washing-specs/save", saveWashingSpecs);

router.get("/api/washing-specs/uploaded-list", getUploadedSpecsOrders);


export default router;
