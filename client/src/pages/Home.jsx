import { useEffect, useState } from "react";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
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
  }, []);

  if (loading) return <p className="p-4">Loading books...</p>;
  if (error) return <p className="p-4 text-red-500">{error}</p>;
  if (!books.length) return <p className="p-4">No books available.</p>;

  return (
    <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <div
          key={book._id}
          className="border rounded p-4 flex flex-col justify-between"
        >
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
              href={book.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-3 py-1 rounded text-center"
            >
              Download PDF
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
