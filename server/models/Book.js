import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  title: String,
  description: String,
  fileUrl: String,
  imageUrl: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ratings: [Number],
  comments: [{
    user: String,
    text: String
  }]
});

export default mongoose.model("Book", bookSchema);
