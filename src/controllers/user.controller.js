import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate authentication tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body ?? {};
    const fullName = req.body?.fullName || req.body?.name;
    const username = (req.body?.username || email?.split("@")[0] || "").toLowerCase().trim();

    if (!fullName || !email || !password) {
        throw new ApiError(400, "Full name, email, and password are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existedUser) {
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(existedUser._id);
        const options = {
            httpOnly: true,
            secure: true
        };
        const safeUser = await User.findById(existedUser._id).select("-password -refreshToken");

        return res
            .status(201)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    201,
                    {
                        user: safeUser,
                        accessToken,
                        refreshToken,
                        token: accessToken
                    },
                    "User registered successfully"
                )
            );
    }

    // Handle resume upload if attached
    let resumeLocalPath;
    if (req.files && Array.isArray(req.files.resume) && req.files.resume.length > 0) {
        resumeLocalPath = req.files.resume[0].path;
    } else if (req.file) {
        resumeLocalPath = req.file.path;
    }

    let resumeUrl = "";
    if (resumeLocalPath) {
        const resume = await uploadOnCloudinary(resumeLocalPath);
        if (!resume) {
            throw new ApiError(500, "Failed to upload resume file");
        }
        resumeUrl = resume.url;
    }

    // Create user in database
    const user = await User.create({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        username,
        resume: resumeUrl,
        role: "candidate"
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "User registration failed");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                {
                    user: createdUser,
                    accessToken,
                    refreshToken,
                    token: accessToken
                },
                "User registered successfully"
            )
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body ?? {};

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    if (!password || password.trim() === "") {
        throw new ApiError(400, "Password is required");
    }

    // Find user by username or email
    const user = await User.findOne({
        $or: [
            { username: username ? username.toLowerCase() : undefined },
            { email: email ? email.toLowerCase() : undefined }
        ]
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    // Verify password
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                    token: accessToken
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request - refresh token missing");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or has been invalidated");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken, token: accessToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateUserResume = asyncHandler(async (req, res) => {
    const resumeLocalPath = req.file?.path;

    if (!resumeLocalPath) {
        throw new ApiError(400, "Resume file is missing");
    }

    const resume = await uploadOnCloudinary(resumeLocalPath);

    if (!resume?.url) {
        throw new ApiError(500, "Failed to upload resume file");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                resume: resume.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Resume updated successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserResume
};
