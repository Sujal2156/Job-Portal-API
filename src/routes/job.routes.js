import { Router } from "express";
import {
    getAllJobs,
    getJobById,
    createJob
} from "../controllers/job.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllJobs).post(verifyJWT, createJob);
router.route("/:id").get(getJobById);

export default router;
