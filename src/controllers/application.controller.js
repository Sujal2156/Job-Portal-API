import mongoose, { isValidObjectId } from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const applyForJob = asyncHandler(async (req, res) => {
    const { jobId, coverNote } = req.body;

    if (!jobId || !isValidObjectId(jobId)) {
        throw new ApiError(400, "Valid Job ID is required");
    }

    const job = await Job.findById(jobId);

    if (!job) {
        throw new ApiError(404, "Job listing not found");
    }

    if (job.status !== "active") {
        throw new ApiError(400, "This job listing is no longer accepting applications");
    }

    const existingApplication = await Application.findOne({
        job: jobId,
        applicant: req.user._id
    });

    if (existingApplication) {
        throw new ApiError(400, "You have already applied for this job");
    }

    let resumeUrl = req.user.resume || "";

    if (req.file?.path) {
        const resume = await uploadOnCloudinary(req.file.path);
        if (!resume?.url) {
            throw new ApiError(500, "Failed to upload resume");
        }
        resumeUrl = resume.url;

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: {
                    resume: resumeUrl
                }
            },
            { new: true }
        );
    }

    const application = await Application.create({
        job: jobId,
        applicant: req.user._id,
        resume: resumeUrl,
        coverNote: coverNote || "",
        status: "applied"
    });

    const populatedApplication = await Application.findById(application._id)
        .populate("job", "title company location jobType salary")
        .populate("applicant", "fullName email");

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                populatedApplication,
                "Job application submitted successfully"
            )
        );
});

const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({ applicant: req.user._id })
        .populate("job", "title company location jobType salary status")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                count: applications.length,
                applications
            },
            "Submitted applications retrieved successfully"
        )
    );
});

const getApplicationById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid application ID");
    }

    const application = await Application.findById(id)
        .populate("job", "title company location jobType salary description")
        .populate("applicant", "fullName email");

    if (!application) {
        throw new ApiError(404, "Application not found");
    }

    if (
        application.applicant._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin"
    ) {
        throw new ApiError(403, "Not authorized to view this application");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, application, "Application details retrieved successfully"));
});

export { applyForJob, getMyApplications, getApplicationById };
