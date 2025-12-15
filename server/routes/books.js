import express from "express";
import multer from "multer";
import cloudinary from "../cloudinary.js";
import Book from "../models/Book.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload book (file + image)
router.post("/upload", upload.fields([{ name: "file" }, { name: "image" }]), async (req, res) => {
  try {
    const { title, description, authorId } = req.body;

    // Upload image
    let imageUrl = "";
    if (req.files.image) {
      const result = await cloudinary.uploader.upload_stream({ resource_type: "image" }, (err, res2) => {
        if (err) throw err;
        imageUrl = res2.secure_url;
      }).end(req.files.image[0].buffer);
    }

    // Upload book file
    let fileUrl = "";
    if (req.files.file) {
      const result = await cloudinary.uploader.upload_stream({ resource_type: "raw" }, (err, res2) => {
        if (err) throw err;
        fileUrl = res2.secure_url;
      }).end(req.files.file[0].buffer);
    }

    const newBook = new Book({ title, description, fileUrl, imageUrl, author: authorId });
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all books
router.get("/", async (req, res) => {
  const books = await Book.find().populate("author", "username");
  res.json(books);
});

export default router;
