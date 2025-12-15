**Project Overview**

 - **Summary:** Library-mvp is a small full‑stack project with a `client/` (frontend) and `server/` (backend) folder. The backend is an Express + MongoDB API that supports user authentication and book uploads (PDFs and cover images) using Cloudinary for file storage.
 - **Purpose:** The README explains project structure, dependencies, data models, routes, key logic, environment variables, and how to run the project and work with the code.

**Quick Start**

- **Prerequisites:** Node.js (v18+ recommended), npm, a MongoDB Atlas connection string (or other MongoDB instance), and Cloudinary account credentials if you want file uploads to work.
- **Environment:** Create a `.env` file in `server/` with the variables listed below.
- **Install & Run (server):**

```bash
cd server
npm install
# start (use nodemon in development if installed globally or via devDependencies)
node index.js
# or with nodemon
npx nodemon index.js
```

**Environment Variables** (put these into `server/.env`)

- `MONGO_URI` - MongoDB Atlas connection string (required)
- `PORT` - optional, defaults to `5000`
- `JWT_SECRET` - secret used to sign JWT tokens (required for auth)
- `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` - required for Cloudinary uploads

**Files & Folders (what's where)**

- `client/` : frontend app (not detailed here). It consumes the API below.
- `server/` : backend API code.
	- `index.js` : main Express server. Loads env, connects to MongoDB, mounts routes and middleware, and starts the HTTP server.
	- `cloudinary.js` : Cloudinary configuration file (exports a configured `cloudinary` instance, reading credentials from env).
	- `models/Book.js` : Mongoose schema for `Book` documents.
	- `models/User.js` : Mongoose schema for `User` documents.
	- `routes/auth.js` : Authentication routes (register & login). Handles password hashing and JWT issuance.
	- `routes/books.js` : Book routes. Implements file/image upload using `multer` + Cloudinary upload stream, stores file URLs in MongoDB.

**Server Dependencies (what's used and why)**

Dependencies listed in `server/package.json` and their purpose:

- `express` : Web framework to create the API and route handlers.
- `mongoose` : ODM (Object Document Mapper) to define schemas and interact with MongoDB in a structured way.
- `cors` : Enables Cross-Origin Resource Sharing so the `client/` app can call the API from a different origin.
- `dotenv` : Loads environment variables from a `.env` file.
- `bcrypt` : Password hashing for secure storage of user passwords.
- `jsonwebtoken` : Creates and verifies JSON Web Tokens used for stateless authentication.
- `multer` : Parses `multipart/form-data`, used for file uploads. In this project it uses `memoryStorage()` so files are handled in memory and then streamed to Cloudinary.
- `cloudinary` : Official Cloudinary SDK used to upload files to Cloudinary (images and raw files like PDFs).
- `nodemon` (devDependency) : Dev tool to auto-restart the server when files change.

Why these choices:

- Express + Mongoose is a common lightweight stack for small APIs and is easy for beginners.
- Cloudinary simplifies file storage and delivery (CDN, transformations, secure URLs).
- `multer` in memory + Cloudinary streaming avoids saving files to disk on the server and keeps the code simple.

**Data Models (Mongoose)**

- `User` (`server/models/User.js`)
	- `username` (String, unique, required)
	- `email` (String, unique, required)
	- `password` (String, required) — stored hashed with `bcrypt`

- `Book` (`server/models/Book.js`)
	- `title` (String, required)
	- `description` (String)
	- `fileUrl` (String) — Cloudinary secure URL for the uploaded PDF/raw file
	- `imageUrl` (String) — Cloudinary secure URL for the cover image
	- `author` (ObjectId ref `User`) — relation to the uploader
	- `ratings` (Array of Number) — sample placeholder for numeric ratings
	- `comments` (Array of objects with `user` and `text`) — sample comment structure
	- timestamps enabled to track `createdAt`/`updatedAt`

Why this model: It's intentionally minimal so beginners can extend it. Relationships use Mongoose refs which let you `populate()` user data when necessary.

**Authentication Flow (what `routes/auth.js` does)**

- `POST /api/auth/register` :
	- Accepts `username`, `email`, `password` in JSON body.
	- Uses `bcrypt.genSalt()` and `bcrypt.hash()` to hash the password.
	- Saves a new `User` document and returns a success response with the saved user id.

- `POST /api/auth/login` :
	- Accepts `email`, `password`.
	- Finds the user by email, compares the supplied password with stored hash using `bcrypt.compare()`.
	- If valid, signs a JWT with `jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })` and returns it along with `userId` and `username`.

Notes on auth security and next steps:

- The code returns a JWT to the client. A production app should send the token in an `HttpOnly` cookie or a secure storage mechanism and implement CSRF protections if using cookies.
- Add route middleware to verify JWT for protected routes (the current code issues tokens but does not show protected endpoints in `books.js`).

**File Uploads & Book Route (what `routes/books.js` does)**

- Uses `multer({ storage: multer.memoryStorage() })` so incoming files are available as in-memory buffers rather than being saved to disk.
- The route `POST /api/books/upload` accepts multipart fields: `file` (PDF/raw) and `image` (cover). The handler reads `title`, `description`, and `authorId` from the request body.
- `streamUpload()` is a helper that pipes the in-memory buffer into Cloudinary's `upload_stream`, and the code sets `resource_type` to `image` or `raw` depending on the upload.
	- For images: Cloudinary treats them as `resource_type: 'image'` and the result contains `secure_url`.
	- For PDFs/raw files: `resource_type: 'raw'` and result contains `secure_url`.
- After both uploads (image and file) succeed, a new `Book` document is created with `fileUrl` and `imageUrl` pointing to Cloudinary-hosted assets.

Why stream to Cloudinary:

- Using streams avoids writing temporary files to disk and is efficient for memory/disk usage in small apps. Cloudinary's `upload_stream` accepts buffers and streams them directly.

**Key Code Walkthroughs (line-level meaning & purpose)**

- `server/index.js`:
	- Loads environment variables (`dotenv.config()`), sets up Express middleware (`cors`, `express.json()`), mounts `auth` and `books` routes under `/api/auth` and `/api/books`, connects to MongoDB via `mongoose.connect(process.env.MONGO_URI)`, and starts the HTTP server.

- `server/cloudinary.js`:
	- Imports `v2` Cloudinary object, calls `cloudinary.config()` with values from env (these keys allow your app to authenticate with Cloudinary's API). Exports the configured client for upload operations.

- `server/routes/books.js`:
	- `multer` config uses `memoryStorage()` so `req.files.*[0].buffer` is available.
	- `streamUpload(buffer, originalName, mimetype, resourceType)` creates a Promise around `cloudinary.uploader.upload_stream` that resolves with the Cloudinary upload response (or rejects on error).
	- The route first uploads the image (if present) with `resourceType='image'` and then the file with `resourceType='raw'` (so PDFs are stored as raw files).
	- The public id given to Cloudinary is the original filename without extension (the code strips extension via regex). `format` is set using the mimetype (e.g. `pdf`).

**API Endpoints (summary)**

- `GET /` — Test route that returns `Library API running`.
- `POST /api/auth/register` — Register a new user (body: JSON `username`, `email`, `password`).
- `POST /api/auth/login` — Login and receive a JWT (body: JSON `email`, `password`).
- `POST /api/books/upload` — Upload a book and optional cover image (multipart/form-data with fields `title`, `description`, `authorId`, `file`, `image`).

Example `curl` for upload (this worked in local tests):

```bash
curl -X POST http://localhost:5000/api/books/upload \
	-F "title=First Book" \
	-F "description=Uploaded via curl" \
	-F "authorId=6651c2a9e8f0b0b7c9a12345" \
	-F "file=@test.pdf" \
	-F "image=@cover.jpg"
```

**Practical notes, caveats & suggestions for beginners**

- Validate inputs: The routes currently assume presence of required fields. Add request validation (e.g., express-validator or manual checks) to provide clearer errors and avoid saving incomplete documents.
- Protect routes: Add middleware to validate JWTs (`Authorization: Bearer <token>`) and register route-specific protection for actions that require an authenticated user.
- Error handling: Centralize error handling middleware in Express to keep routes concise and consistent.
- File sizes & limits: Configure Multer limits (file size, number of files) to avoid memory exhaustion since the app uses memory storage.
- Security: Never commit `.env` or secret keys. Use a secrets manager for production.

**Where to extend next**

- Add `GET` endpoints for listing books, fetching a book by id, updating book metadata, and adding ratings/comments.
- Add user profile endpoints and a protected route that returns the current user's data based on JWT.
- Add pagination, searching, and filtering for books.

**Appendix: Important code snippets explained**

- Password hashing (from `routes/auth.js`):
	- `const salt = await bcrypt.genSalt(10);` — create a random salt (cost factor 10). Higher cost increases security but slows hashing.
	- `const hashedPassword = await bcrypt.hash(password, salt);` — compute the salted hash stored in DB.

- JWT creation (from `routes/auth.js`):
	- `const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });` — creates a signed token that encodes the user's id and can be verified later using the same `JWT_SECRET`.

- Cloudinary upload-stream (from `routes/books.js`):
	- `cloudinary.uploader.upload_stream({ resource_type, public_id, format }, callback)` — creates a writable stream that accepts the file buffer and uploads it; the `resource_type` must be `'raw'` for PDFs and `'image'` for images.

**Dependencies snapshot**

The server uses these package versions (as of this repo snapshot):

 - `bcrypt ^6.0.0`
 - `cloudinary ^2.8.0`
 - `cors ^2.8.5`
 - `dotenv ^17.2.3`
 - `express ^5.2.1`
 - `jsonwebtoken ^9.0.3`
 - `mongoose ^9.0.1`
 - `multer ^2.0.2`
 - `nodemon ^3.1.11` (dev)

**Final checklist before running locally**

1. Create `server/.env` with `MONGO_URI`, `JWT_SECRET`, and Cloudinary keys.
2. From `server/` run `npm install`.
3. Start MongoDB (if using a local instance) or ensure Atlas connection is open.
4. Start the server: `node index.js` or `npx nodemon index.js`.