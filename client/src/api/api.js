const API_URL = "http://localhost:5000"

export async function getBooks() {
  const res = await fetch(`${API_URL}/api/books`)
  return res.json()
}


