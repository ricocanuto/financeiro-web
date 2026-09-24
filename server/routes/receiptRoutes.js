import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { extractReceipt } from "../controllers/receiptController.js";

const router = Router();

router.use(requireAuth);
router.post("/extract", extractReceipt);

export default router;
