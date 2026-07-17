import {Router} from "express";
import {login,register,profile} from "../controllers/authController.js";
import {protect} from "../middleware/auth.js";
const router=Router();
router.post("/register",register);
router.post("/login",login);
router.get("/profile",protect,profile);
export default router;
