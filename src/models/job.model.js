import mongoose, { Schema } from "mongoose";

const jobSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
            maxlength: [100, "Title cannot exceed 100 characters"]
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true
        },
        location: {
            type: String,
            required: [true, "Job location is required"],
            trim: true
        },
        jobType: {
            type: String,
            enum: ["Full-time", "Part-time", "Contract", "Internship", "Remote"],
            default: "Full-time"
        },
        description: {
            type: String,
            required: [true, "Job description is required"]
        },
        requirements: {
            type: [String],
            default: []
        },
        salary: {
            type: String,
            default: "Competitive"
        },
        status: {
            type: String,
            enum: ["active", "closed"],
            default: "active"
        },
        postedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null
        }
    },
    {
        timestamps: true
    }
);

jobSchema.index({ title: "text", company: "text", location: "text" });

export const Job = mongoose.model("Job", jobSchema);
