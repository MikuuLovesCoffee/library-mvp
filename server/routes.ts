import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    next();
  }, express.static(uploadsDir));

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUserWithStats(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch("/api/users/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { bio } = req.body;
      const user = await storage.updateUserProfile(userId, { bio });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Content routes
  app.get("/api/contents", async (req: any, res) => {
    try {
      const { search, contentType, priceType, category, sortBy, related } = req.query;
      
      const contents = await storage.getContents({
        search: search as string,
        contentType: contentType as string,
        priceType: priceType as string,
        category: category as string,
        sortBy: sortBy as string,
      });
      
      res.json(contents);
    } catch (error) {
      console.error("Error fetching contents:", error);
      res.status(500).json({ message: "Failed to fetch contents" });
    }
  });

  app.get("/api/contents/:id", async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const content = await storage.getContentWithDetails(req.params.id, userId);
      
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }

      // Increment view count
      await storage.incrementViewCount(req.params.id);
      
      res.json(content);
    } catch (error) {
      console.error("Error fetching content:", error);
      res.status(500).json({ message: "Failed to fetch content" });
    }
  });

  app.post(
    "/api/contents",
    isAuthenticated,
    upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "content", maxCount: 1 },
    ]),
    async (req: any, res) => {
      try {
        const userId = req.user.claims.sub;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        if (!files.content || files.content.length === 0) {
          return res.status(400).json({ message: "Content file is required" });
        }

        const contentFile = files.content[0];
        const coverFile = files.cover?.[0];

        const { title, description, contentType, category, tags, isFree, price } = req.body;

        const content = await storage.createContent({
          userId,
          title,
          description: description || null,
          contentType,
          category: category || null,
          tags: tags ? tags.split(",").map((t: string) => t.trim()) : null,
          isFree: isFree === "true",
          price: isFree === "true" ? "0" : price || "0",
          fileUrl: `/uploads/${contentFile.filename}`,
          coverImageUrl: coverFile ? `/uploads/${coverFile.filename}` : null,
        });

        res.status(201).json(content);
      } catch (error) {
        console.error("Error creating content:", error);
        res.status(500).json({ message: "Failed to create content" });
      }
    }
  );

  app.post("/api/contents/:id/rate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = req.params.id;
      const { rating } = req.body;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }

      await storage.createOrUpdateRating({
        userId,
        contentId,
        rating,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error rating content:", error);
      res.status(500).json({ message: "Failed to rate content" });
    }
  });

  app.post("/api/contents/:id/comments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = req.params.id;
      const { text, parentId } = req.body;

      if (!text || text.trim() === "") {
        return res.status(400).json({ message: "Comment text is required" });
      }

      const comment = await storage.createComment({
        userId,
        contentId,
        parentId: parentId || null,
        text,
      });

      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.post("/api/comments/:id/vote", isAuthenticated, async (req: any, res) => {
    try {
      const { type } = req.body;

      if (type !== "up" && type !== "down") {
        return res.status(400).json({ message: "Vote type must be 'up' or 'down'" });
      }

      await storage.updateCommentVotes(req.params.id, type);
      res.json({ success: true });
    } catch (error) {
      console.error("Error voting on comment:", error);
      res.status(500).json({ message: "Failed to vote on comment" });
    }
  });

  app.post("/api/contents/:id/save", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const contentId = req.params.id;

      const isSaved = await storage.isContentSaved(userId, contentId);
      
      if (isSaved) {
        await storage.unsaveContent(userId, contentId);
        res.json({ saved: false });
      } else {
        await storage.saveContent({ userId, contentId });
        res.json({ saved: true });
      }
    } catch (error) {
      console.error("Error saving content:", error);
      res.status(500).json({ message: "Failed to save content" });
    }
  });

  app.post("/api/contents/:id/download", isAuthenticated, async (req: any, res) => {
    try {
      await storage.incrementDownloadCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking download:", error);
      res.status(500).json({ message: "Failed to track download" });
    }
  });

  // Group routes
  app.get("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { search } = req.query;

      const groups = await storage.getGroups({
        search: search as string,
        userId,
      });

      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const group = await storage.getGroupWithDetails(req.params.id, userId);

      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description, privacy } = req.body;

      if (!name || name.trim() === "") {
        return res.status(400).json({ message: "Group name is required" });
      }

      const group = await storage.createGroup({
        name,
        description: description || null,
        privacy: privacy || "open",
        ownerId: userId,
      });

      res.status(201).json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.post("/api/groups/:id/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;

      const isMember = await storage.isGroupMember(groupId, userId);
      if (isMember) {
        return res.status(400).json({ message: "Already a member" });
      }

      await storage.addGroupMember({
        groupId,
        userId,
        role: "member",
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error joining group:", error);
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.post("/api/groups/:id/leave", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupId = req.params.id;

      const group = await storage.getGroup(groupId);
      if (group?.ownerId === userId) {
        return res.status(400).json({ message: "Owner cannot leave the group" });
      }

      await storage.removeGroupMember(groupId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ message: "Failed to leave group" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
