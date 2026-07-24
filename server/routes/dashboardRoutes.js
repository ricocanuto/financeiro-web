import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import {
  getBalances,
  getCashFlow,
  getExpensesByCategory,
  getMonthResult,
} from "../controllers/dashboardController.js";

const router = Router();

router.use(requireAuth);
router.get("/balances", getBalances);
router.get("/cashflow", getCashFlow);
router.get("/expenses-by-category", getExpensesByCategory);
router.get("/month-result", getMonthResult);

export default router;
