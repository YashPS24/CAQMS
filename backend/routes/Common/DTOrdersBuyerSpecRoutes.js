import express from 'express';
import {
  getFilterOptions,
  getBuyerSpecOrderDetails,
  saveBuyerSpecTemplate,
  getBuyerSpecMoNos,
  getBuyerSpecData,
  updateBuyerSpecTemplate,
} from '../../controller/Common/DTOrdersBuyerSpecController.js';

const router = express.Router();

router.get('/api/filter-options', getFilterOptions);
router.get('/api/buyer-spec-order-details/:mono', getBuyerSpecOrderDetails);
router.post('/api/buyer-spec-templates', saveBuyerSpecTemplate);
router.get('/api/buyer-spec-templates/mo-options', getBuyerSpecMoNos);
router.get('/api/edit-specs-data/:moNo', getBuyerSpecData);
router.put('/api/buyer-spec-templates/:moNo', updateBuyerSpecTemplate);

export default router;