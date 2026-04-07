import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transactionsRouter from "./transactions";
import categoriesRouter from "./categories";
import dashboardRouter from "./dashboard";
import gamificationRouter from "./gamification";
import goalsRouter from "./goals";
import aiRouter from "./ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/transactions", transactionsRouter);
router.use("/categories", categoriesRouter);
router.use("/dashboard", dashboardRouter);
router.use("/gamification", gamificationRouter);
router.use("/goals", goalsRouter);
router.use("/ai", aiRouter);

export default router;
