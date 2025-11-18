import { Types } from "mongoose";
import { IPackage } from "./package.interface";
import { Package } from "./package.model";

const createPackageIntoDB = async (data:IPackage)=>{
    const result = await Package.create(data)
    return result
}

const getAllPackagesFromDB = async ()=>{
    const result = await Package.find({status:'active'})
    return result
}

const updatePackageToDB = async (id:Types.ObjectId,payload:Partial<IPackage>)=>{
    const result = await Package.findOneAndUpdate({_id:id},payload,{new:true})
    return result
}

const deletePackageFromDB = async (id:Types.ObjectId)=>{
    const result = await Package.findOneAndUpdate({_id:id},{status:'delete'})
    return result
}

export const PackageService = {
    createPackageIntoDB,
    getAllPackagesFromDB,
    updatePackageToDB,
    deletePackageFromDB
}