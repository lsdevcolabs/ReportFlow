import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import reportsRouter from "./reports";
import metricsRouter from "./metrics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientsRouter);
router.use(reportsRouter);
router.use(metricsRouter);

export default router;
