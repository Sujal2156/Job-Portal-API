import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadResume = asyncHandler(async (req, res) => {
    const resumeLocalPath = req.file?.path;

    if (!resumeLocalPath) {
        throw new ApiError(400, "Resume file is missing");
    }

    const resume = await uploadOnCloudinary(resumeLocalPath);

    if (!resume?.url) {
        throw new ApiError(500, "Failed to upload resume file");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                resume: resume.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { resume: user.resume },
                "Resume uploaded successfully"
            )
        );
});

const getMyResume = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user?.resume) {
        throw new ApiError(404, "Resume not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { resume: user.resume }, "Resume retrieved successfully"));
});

export { uploadResume, getMyResume };
