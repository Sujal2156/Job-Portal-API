import { Router } from "express";
import { uploadResume, getMyResume } from "../controllers/resume.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT to all routes in this file

router.route("/upload").post(upload.single("resume"), uploadResume);
router.route("/my-resume").get(getMyResume);

export default router;
