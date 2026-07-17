import {Router} from "express";
import {assistant,reviewSummary,compare} from "../controllers/aiController.js";
const router=Router();
router.post("/assistant",assistant);
router.post("/review-summary/:id",reviewSummary);
router.post("/compare",compare);
export default router;
