import mongoose from "mongoose";
import { IPackage, PackageModel } from "./package.interface";

const packageSchema = new mongoose.Schema<IPackage,PackageModel>({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    features: {
        type: [String],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'delete'],
        default: 'active'
    },
    paymentId: {
        type: String,
        required: true
    },
    referenceId: {
        type: String,
        required: true
    },
    recurring: {
        type: String,
        enum: ['monthly', 'yearly'],
        required: true
    }
},{
    timestamps: true
})

export const Package = mongoose.model<IPackage, PackageModel>("Package", packageSchema);