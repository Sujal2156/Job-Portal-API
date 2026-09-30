import mongoose, { Schema } from "mongoose";

const applicationSchema = new Schema(
    {
        job: {
            type: Schema.Types.ObjectId,
            ref: "Job",
            required: [true, "Job reference is required"]
        },
        applicant: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Applicant reference is required"]
        },
        resume: {
            type: String,
            default: ""
        },
        coverNote: {
            type: String,
            trim: true,
            maxlength: [1000, "Cover note cannot exceed 1000 characters"],
            default: ""
        },
        status: {
            type: String,
            enum: ["applied", "under_review", "shortlisted", "rejected", "accepted"],
            default: "applied"
        }
    },
    {
        timestamps: true
    }
);

applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, createdAt: -1 });

export const Application = mongoose.model("Application", applicationSchema);
