import mongoose from "mongoose";

/**
 * Binary image storage in MongoDB. Fine for the small volume this admin
 * handles; swap for GridFS/object storage if assets ever grow large.
 */
const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, default: "" },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Image = mongoose.model("Image", imageSchema);
