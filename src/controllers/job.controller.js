import mongoose, { isValidObjectId } from "mongoose";
import { Job } from "../models/job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getAllJobs = asyncHandler(async (req, res) => {
    const { search, jobType, page = 1, limit = 5 } = req.query;

    const query = { status: "active" };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { company: { $regex: search, $options: "i" } },
            { location: { $regex: search, $options: "i" } }
        ];
    }

    if (jobType) {
        query.jobType = jobType;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, jobs] = await Promise.all([
        Job.countDocuments(query),
        Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum)
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                jobs,
                total,
                page: pageNum,
                totalPages: Math.ceil(total / limitNum),
                count: jobs.length
            },
            "Jobs retrieved successfully"
        )
    );
});

const getJobById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        throw new ApiError(400, "Invalid job ID");
    }

    const job = await Job.findById(id);

    if (!job) {
        throw new ApiError(404, "Job not found with the provided ID");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, job, "Job details retrieved successfully"));
});

const createJob = asyncHandler(async (req, res) => {
    const { title, company, location, jobType, description, requirements, salary } = req.body;

    if (!title || !company || !location || !description) {
        throw new ApiError(400, "Title, company, location, and description are required");
    }

    const job = await Job.create({
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        jobType: jobType || "Full-time",
        description,
        requirements: Array.isArray(requirements)
            ? requirements
            : typeof requirements === "string"
            ? requirements.split(",").map((r) => r.trim())
            : [],
        salary: salary || "Competitive",
        postedBy: req.user?._id || null
    });

    return res
        .status(201)
        .json(new ApiResponse(201, job, "Job listing created successfully"));
});

export { getAllJobs, getJobById, createJob };
