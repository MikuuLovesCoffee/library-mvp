import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const contentTypeEnum = pgEnum("content_type", ["book", "manga", "image", "pdf"]);
export const groupPrivacyEnum = pgEnum("group_privacy", ["open", "public", "private"]);

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  isCreator: boolean("is_creator").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content table (books, manga, images, pdfs)
export const contents = pgTable("contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  contentType: contentTypeEnum("content_type").notNull(),
  coverImageUrl: varchar("cover_image_url"),
  fileUrl: varchar("file_url").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).default("0"),
  isFree: boolean("is_free").default(true),
  tags: text("tags").array(),
  category: varchar("category", { length: 100 }),
  downloadCount: integer("download_count").default(0),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ratings table
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contentId: varchar("content_id").references(() => contents.id).notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments table
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contentId: varchar("content_id").references(() => contents.id).notNull(),
  parentId: varchar("parent_id"),
  text: text("text").notNull(),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Groups table
export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: varchar("cover_image_url"),
  privacy: groupPrivacyEnum("privacy").notNull().default("open"),
  ownerId: varchar("owner_id").references(() => users.id).notNull(),
  memberCount: integer("member_count").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group members table
export const groupMembers = pgTable("group_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupId: varchar("group_id").references(() => groups.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 50 }).default("member"), // owner, admin, member
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Saved content (user library)
export const savedContents = pgTable("saved_contents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  contentId: varchar("content_id").references(() => contents.id).notNull(),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  contents: many(contents),
  comments: many(comments),
  ratings: many(ratings),
  ownedGroups: many(groups),
  groupMemberships: many(groupMembers),
  savedContents: many(savedContents),
}));

export const contentsRelations = relations(contents, ({ one, many }) => ({
  author: one(users, {
    fields: [contents.userId],
    references: [users.id],
  }),
  comments: many(comments),
  ratings: many(ratings),
  savedBy: many(savedContents),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  content: one(contents, {
    fields: [comments.contentId],
    references: [contents.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
  content: one(contents, {
    fields: [ratings.contentId],
    references: [contents.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  owner: one(users, {
    fields: [groups.ownerId],
    references: [users.id],
  }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const savedContentsRelations = relations(savedContents, ({ one }) => ({
  user: one(users, {
    fields: [savedContents.userId],
    references: [users.id],
  }),
  content: one(contents, {
    fields: [savedContents.contentId],
    references: [contents.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentSchema = createInsertSchema(contents).omit({
  id: true,
  downloadCount: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupSchema = createInsertSchema(groups).omit({
  id: true,
  memberCount: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertSavedContentSchema = createInsertSchema(savedContents).omit({
  id: true,
  savedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type SavedContent = typeof savedContents.$inferSelect;
export type InsertSavedContent = z.infer<typeof insertSavedContentSchema>;
