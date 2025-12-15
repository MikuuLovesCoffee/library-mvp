import { useEffect, useState } from "react"
import { getBooks } from "./api/api"

function App() {
  const [books, setBooks] = useState([])

  useEffect(() => {
    getBooks().then(setBooks)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Library</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book._id} className="bg-gray-800 p-4 rounded">
            <h2 className="text-xl font-semibold">{book.title}</h2>
            <p className="text-sm text-gray-400">{book.description}</p>


            <a
              href={book.fileUrl}
              className="inline-block mt-3 text-blue-400 underline"
            >
              Download PDF
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
