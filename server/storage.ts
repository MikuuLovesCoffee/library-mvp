import {
  users,
  contents,
  comments,
  ratings,
  groups,
  groupMembers,
  savedContents,
  type User,
  type UpsertUser,
  type Content,
  type InsertContent,
  type Comment,
  type InsertComment,
  type Rating,
  type InsertRating,
  type Group,
  type InsertGroup,
  type GroupMember,
  type InsertGroupMember,
  type SavedContent,
  type InsertSavedContent,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined>;
  getUserWithStats(id: string): Promise<any>;

  // Content operations
  createContent(content: InsertContent): Promise<Content>;
  getContent(id: string): Promise<Content | undefined>;
  getContentWithDetails(id: string, userId?: string): Promise<any>;
  getContents(filters?: {
    search?: string;
    contentType?: string;
    priceType?: string;
    category?: string;
    sortBy?: string;
    userId?: string;
  }): Promise<any[]>;
  updateContent(id: string, data: Partial<Content>): Promise<Content | undefined>;
  deleteContent(id: string): Promise<void>;
  incrementViewCount(id: string): Promise<void>;
  incrementDownloadCount(id: string): Promise<void>;

  // Rating operations
  createOrUpdateRating(rating: InsertRating): Promise<Rating>;
  getAverageRating(contentId: string): Promise<{ average: number; count: number }>;
  getUserRating(userId: string, contentId: string): Promise<Rating | undefined>;

  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getComments(contentId: string): Promise<any[]>;
  updateCommentVotes(id: string, type: 'up' | 'down'): Promise<void>;

  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroup(id: string): Promise<Group | undefined>;
  getGroupWithDetails(id: string, userId?: string): Promise<any>;
  getGroups(filters?: { search?: string; userId?: string }): Promise<any[]>;
  updateGroup(id: string, data: Partial<Group>): Promise<Group | undefined>;
  deleteGroup(id: string): Promise<void>;

  // Group member operations
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<void>;
  isGroupMember(groupId: string, userId: string): Promise<boolean>;
  getGroupMembers(groupId: string): Promise<any[]>;

  // Saved content operations
  saveContent(data: InsertSavedContent): Promise<SavedContent>;
  unsaveContent(userId: string, contentId: string): Promise<void>;
  getSavedContents(userId: string): Promise<Content[]>;
  isContentSaved(userId: string, contentId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUserWithStats(id: string): Promise<any> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const uploadedContents = await db
      .select()
      .from(contents)
      .where(eq(contents.userId, id))
      .orderBy(desc(contents.createdAt));

    const saved = await this.getSavedContents(id);

    const totalDownloads = uploadedContents.reduce(
      (sum, c) => sum + (c.downloadCount || 0),
      0
    );

    const allRatings = await Promise.all(
      uploadedContents.map((c) => this.getAverageRating(c.id))
    );
    const avgRating =
      allRatings.length > 0
        ? allRatings.reduce((sum, r) => sum + r.average, 0) / allRatings.length
        : 0;

    return {
      ...user,
      uploadedContents,
      savedContents: saved,
      stats: {
        totalUploads: uploadedContents.length,
        averageRating: avgRating,
        totalDownloads,
      },
    };
  }

  // Content operations
  async createContent(content: InsertContent): Promise<Content> {
    const [newContent] = await db.insert(contents).values(content).returning();
    return newContent;
  }

  async getContent(id: string): Promise<Content | undefined> {
    const [content] = await db.select().from(contents).where(eq(contents.id, id));
    return content;
  }

  async getContentWithDetails(id: string, userId?: string): Promise<any> {
    const content = await this.getContent(id);
    if (!content) return undefined;

    const author = await this.getUser(content.userId);
    const { average, count } = await this.getAverageRating(id);
    const contentComments = await this.getComments(id);

    let userRating: number | undefined;
    if (userId) {
      const rating = await this.getUserRating(userId, id);
      userRating = rating?.rating;
    }

    return {
      ...content,
      author,
      averageRating: average,
      ratingCount: count,
      comments: contentComments,
      userRating,
    };
  }

  async getContents(filters?: {
    search?: string;
    contentType?: string;
    priceType?: string;
    category?: string;
    sortBy?: string;
    userId?: string;
  }): Promise<any[]> {
    let query = db.select().from(contents);

    const conditions: any[] = [];

    if (filters?.userId) {
      conditions.push(eq(contents.userId, filters.userId));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(contents.title, `%${filters.search}%`),
          ilike(contents.description, `%${filters.search}%`)
        )
      );
    }

    if (filters?.contentType && filters.contentType !== "all") {
      conditions.push(eq(contents.contentType, filters.contentType as any));
    }

    if (filters?.priceType === "free") {
      conditions.push(eq(contents.isFree, true));
    } else if (filters?.priceType === "paid") {
      conditions.push(eq(contents.isFree, false));
    }

    if (filters?.category && filters.category !== "all") {
      conditions.push(eq(contents.category, filters.category));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    let orderBy;
    switch (filters?.sortBy) {
      case "popular":
        orderBy = desc(contents.viewCount);
        break;
      case "downloads":
        orderBy = desc(contents.downloadCount);
        break;
      case "rating":
        orderBy = desc(contents.createdAt); // Will sort by rating after fetch
        break;
      default:
        orderBy = desc(contents.createdAt);
    }

    const results = await (query as any).orderBy(orderBy);

    // Add author and rating info
    const enrichedResults = await Promise.all(
      results.map(async (content: Content) => {
        const author = await this.getUser(content.userId);
        const { average, count } = await this.getAverageRating(content.id);
        return {
          ...content,
          author,
          averageRating: average,
          ratingCount: count,
        };
      })
    );

    if (filters?.sortBy === "rating") {
      enrichedResults.sort((a, b) => b.averageRating - a.averageRating);
    }

    return enrichedResults;
  }

  async updateContent(id: string, data: Partial<Content>): Promise<Content | undefined> {
    const [content] = await db
      .update(contents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(contents.id, id))
      .returning();
    return content;
  }

  async deleteContent(id: string): Promise<void> {
    await db.delete(contents).where(eq(contents.id, id));
  }

  async incrementViewCount(id: string): Promise<void> {
    await db
      .update(contents)
      .set({ viewCount: sql`${contents.viewCount} + 1` })
      .where(eq(contents.id, id));
  }

  async incrementDownloadCount(id: string): Promise<void> {
    await db
      .update(contents)
      .set({ downloadCount: sql`${contents.downloadCount} + 1` })
      .where(eq(contents.id, id));
  }

  // Rating operations
  async createOrUpdateRating(rating: InsertRating): Promise<Rating> {
    const existing = await this.getUserRating(rating.userId, rating.contentId);
    
    if (existing) {
      const [updated] = await db
        .update(ratings)
        .set({ rating: rating.rating })
        .where(eq(ratings.id, existing.id))
        .returning();
      return updated;
    }

    const [newRating] = await db.insert(ratings).values(rating).returning();
    return newRating;
  }

  async getAverageRating(contentId: string): Promise<{ average: number; count: number }> {
    const result = await db
      .select({
        average: sql<number>`COALESCE(AVG(${ratings.rating}), 0)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.contentId, contentId));

    return {
      average: Number(result[0]?.average) || 0,
      count: Number(result[0]?.count) || 0,
    };
  }

  async getUserRating(userId: string, contentId: string): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.contentId, contentId)));
    return rating;
  }

  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  async getComments(contentId: string): Promise<any[]> {
    const contentComments = await db
      .select()
      .from(comments)
      .where(eq(comments.contentId, contentId))
      .orderBy(desc(comments.createdAt));

    const enrichedComments = await Promise.all(
      contentComments.map(async (comment) => {
        const author = await this.getUser(comment.userId);
        return { ...comment, author };
      })
    );

    return enrichedComments;
  }

  async updateCommentVotes(id: string, type: 'up' | 'down'): Promise<void> {
    if (type === 'up') {
      await db
        .update(comments)
        .set({ upvotes: sql`${comments.upvotes} + 1` })
        .where(eq(comments.id, id));
    } else {
      await db
        .update(comments)
        .set({ downvotes: sql`${comments.downvotes} + 1` })
        .where(eq(comments.id, id));
    }
  }

  // Group operations
  async createGroup(group: InsertGroup): Promise<Group> {
    const [newGroup] = await db.insert(groups).values(group).returning();
    
    // Add owner as first member
    await this.addGroupMember({
      groupId: newGroup.id,
      userId: group.ownerId,
      role: "owner",
    });

    return newGroup;
  }

  async getGroup(id: string): Promise<Group | undefined> {
    const [group] = await db.select().from(groups).where(eq(groups.id, id));
    return group;
  }

  async getGroupWithDetails(id: string, userId?: string): Promise<any> {
    const group = await this.getGroup(id);
    if (!group) return undefined;

    const owner = await this.getUser(group.ownerId);
    const members = await this.getGroupMembers(id);

    let isMember = false;
    let isOwner = false;
    if (userId) {
      isMember = await this.isGroupMember(id, userId);
      isOwner = group.ownerId === userId;
    }

    return {
      ...group,
      owner,
      members,
      isMember,
      isOwner,
    };
  }

  async getGroups(filters?: { search?: string; userId?: string }): Promise<any[]> {
    let query = db.select().from(groups);

    if (filters?.search) {
      query = query.where(
        or(
          ilike(groups.name, `%${filters.search}%`),
          ilike(groups.description, `%${filters.search}%`)
        )
      ) as any;
    }

    const results = await (query as any).orderBy(desc(groups.createdAt));

    const enrichedResults = await Promise.all(
      results.map(async (group: Group) => {
        let isMember = false;
        if (filters?.userId) {
          isMember = await this.isGroupMember(group.id, filters.userId);
        }
        return { ...group, isMember };
      })
    );

    return enrichedResults;
  }

  async updateGroup(id: string, data: Partial<Group>): Promise<Group | undefined> {
    const [group] = await db
      .update(groups)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(groups.id, id))
      .returning();
    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    await db.delete(groupMembers).where(eq(groupMembers.groupId, id));
    await db.delete(groups).where(eq(groups.id, id));
  }

  // Group member operations
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const [newMember] = await db.insert(groupMembers).values(member).returning();
    
    // Update member count
    await db
      .update(groups)
      .set({ memberCount: sql`${groups.memberCount} + 1` })
      .where(eq(groups.id, member.groupId));

    return newMember;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));

    // Update member count
    await db
      .update(groups)
      .set({ memberCount: sql`GREATEST(${groups.memberCount} - 1, 0)` })
      .where(eq(groups.id, groupId));
  }

  async isGroupMember(groupId: string, userId: string): Promise<boolean> {
    const [member] = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)));
    return !!member;
  }

  async getGroupMembers(groupId: string): Promise<any[]> {
    const members = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    const enrichedMembers = await Promise.all(
      members.map(async (member) => {
        const user = await this.getUser(member.userId);
        return { ...member, user };
      })
    );

    return enrichedMembers;
  }

  // Saved content operations
  async saveContent(data: InsertSavedContent): Promise<SavedContent> {
    const [saved] = await db.insert(savedContents).values(data).returning();
    return saved;
  }

  async unsaveContent(userId: string, contentId: string): Promise<void> {
    await db
      .delete(savedContents)
      .where(and(eq(savedContents.userId, userId), eq(savedContents.contentId, contentId)));
  }

  async getSavedContents(userId: string): Promise<Content[]> {
    const saved = await db
      .select()
      .from(savedContents)
      .where(eq(savedContents.userId, userId));

    const contentIds = saved.map((s) => s.contentId);
    if (contentIds.length === 0) return [];

    const contentList = await Promise.all(
      contentIds.map((id) => this.getContent(id))
    );

    return contentList.filter(Boolean) as Content[];
  }

  async isContentSaved(userId: string, contentId: string): Promise<boolean> {
    const [saved] = await db
      .select()
      .from(savedContents)
      .where(and(eq(savedContents.userId, userId), eq(savedContents.contentId, contentId)));
    return !!saved;
  }
}

export const storage = new DatabaseStorage();
