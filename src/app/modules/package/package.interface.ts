import { Model } from "mongoose";

export type IPackage = {
    name: string,
    price: number;
    perfect_for: string;
    features: string[];
    status: "active" | "delete";
    paymentId: string
    referenceId: string,
    recurring:"monthly"|"yearly"
}

export type PackageModel = Model<IPackage>