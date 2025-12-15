// src/pages/Upload.jsx
import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Upload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleUpload = async () => {
    if (!file || !title) return alert("File and title are required");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("image", image);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const res = await fetch(`${API_URL}/api/books/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` }, // ✅ token sent
        body: formData,
      });
      const data = await res.json();
      console.log("Uploaded:", data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <input type="file" onChange={(e) => setImage(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
