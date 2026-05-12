import { Router, type IRouter } from "express";
import healthRouter from "./health";
import clientsRouter from "./clients";
import reportsRouter from "./reports";
import metricsRouter from "./metrics";
import userRouter from "./user";
import billingRouter from "./billing";
import pdfRouter from "./pdf";
import uploadRouter from "./upload";
import uploadLogoRouter from "./upload-logo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(clientsRouter);
router.use(reportsRouter);
router.use(metricsRouter);
router.use(userRouter);
router.use(billingRouter);
router.use(pdfRouter);
router.use(uploadRouter);
router.use(uploadLogoRouter);

export default router;
