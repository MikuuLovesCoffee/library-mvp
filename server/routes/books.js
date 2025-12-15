// server/routes/books.js
import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary.js";
import Book from "../models/Book.js";
import { verifyToken } from "../middleware/auth.js"; // ✅ named import

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload helper
const streamUpload = (fileBuffer, originalName, mimetype, resourceType = "raw") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: originalName.replace(/\.[^/.]+$/, ""), // remove extension
        format: mimetype.split("/")[1], // pdf, jpg, etc.
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(fileBuffer);
  });
};

// Upload route (protected)
router.post(
  "/upload",
  verifyToken, // ✅ only logged-in users can upload
  upload.fields([{ name: "file" }, { name: "image" }]),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      const authorId = req.user._id; // ✅ author is the logged-in user

      // Upload image
      let imageUrl = "";
      if (req.files.image && req.files.image[0]) {
        const imgFile = req.files.image[0];
        const imgResult = await streamUpload(
          imgFile.buffer,
          imgFile.originalname,
          imgFile.mimetype,
          "image"
        );
        imageUrl = imgResult.secure_url;
      }

      // Upload PDF / raw file
      let fileUrl = "";
      if (req.files.file && req.files.file[0]) {
        const pdfFile = req.files.file[0];
        const pdfResult = await streamUpload(
          pdfFile.buffer,
          pdfFile.originalname,
          pdfFile.mimetype,
          "raw"
        );
        fileUrl = pdfResult.secure_url;
      }

      const newBook = new Book({ title, description, fileUrl, imageUrl, author: authorId });
      const savedBook = await newBook.save();
      res.status(201).json(savedBook);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
