import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middlewares/auth.js";
import { extractReceipt } from "../controllers/receiptController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
});

const router = Router();

router.use(requireAuth);
router.post("/extract", upload.single("receipt"), extractReceipt);

export default router;
