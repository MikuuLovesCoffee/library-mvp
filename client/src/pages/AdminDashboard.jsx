import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AdminDashboard() {
  const { user, token } = useAuth(); // include JWT token
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/books`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch books");
          return;
        }

        setBooks(data);
      } catch (err) {
        console.error(err);
        setError("Network error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [user]);

  const handleDelete = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book?")) return;

    try {
      const res = await fetch(`${API_URL}/api/books/${bookId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer " + token },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setBooks(books.filter((b) => b._id !== bookId));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!user || user.role !== "admin") return <p className="p-4">Access denied</p>;
  if (loading) return <p className="p-4">Loading books...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <div key={book._id} className="border p-4 rounded flex flex-col justify-between">
            {book.imageUrl && (
              <img
                src={book.imageUrl}
                alt={book.title}
                className="w-full h-48 object-cover mb-2 rounded"
              />
            )}
            <h2 className="text-xl font-bold mb-1">{book.title}</h2>
            <p className="text-gray-700 mb-2">{book.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Author: {book.author?.username || "Unknown"}
            </p>
            {book.fileUrl && (
              <a
                href={book.fileUrl + "?dl=1"}
                download={book.title + ".pdf"}
                className="bg-blue-600 text-white px-3 py-1 rounded text-center mb-2"
              >
                Download PDF
              </a>
            )}
            <button
              onClick={() => handleDelete(book._id)}
              className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
