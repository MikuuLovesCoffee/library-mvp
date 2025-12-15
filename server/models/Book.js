import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  fileUrl: String,
  imageUrl: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ratings: [Number],
  comments: [{ user: String, text: String }]
}, { timestamps: true });

export default mongoose.model("Book", bookSchema);
