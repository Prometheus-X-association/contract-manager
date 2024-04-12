import mongoose, { Schema, Types } from "mongoose";
import { connect } from "./connect";
// @ts-ignore
import dotenv from "dotenv";
import BilateralModel from "../src/models/bilateral.model";

dotenv.config();

async function fixTargetInBilateral() {
  await connect();

  const bilaterals: any = await BilateralModel.find();

  for (const bilateral of bilaterals) {
    let updated = false;
    for (const pol of bilateral.policy) {
      for (const perm of pol.permission) {
        if(!perm.target.includes('http'))
          updated = true;
          perm.target = bilateral.serviceOffering;
      }
    }
    if(updated) await bilateral.save();
  }

  await mongoose.disconnect();
}

fixTargetInBilateral().then((r) => console.log("success."));
