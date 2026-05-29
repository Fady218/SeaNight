import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import bookingsRouter from "./bookings";
import usersRouter from "./users";
import reviewsRouter from "./reviews";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(bookingsRouter);
router.use(usersRouter);
router.use(reviewsRouter);
router.use(adminRouter);

export default router;
