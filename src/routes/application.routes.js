import { Router } from "express";
import {
    applyForJob,
    getMyApplications,
    getApplicationById
} from "../controllers/application.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();
router.use(verifyJWT); // Apply verifyJWT to all routes in this file

router.route("/").post(upload.single("resume"), applyForJob);
router.route("/my-applications").get(getMyApplications);
router.route("/:id").get(getApplicationById);

export default router;
