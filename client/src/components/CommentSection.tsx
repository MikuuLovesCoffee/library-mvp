import { useState } from "react";
import { ThumbsUp, ThumbsDown, Reply, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Comment, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CommentWithAuthor extends Comment {
  author?: User;
  replies?: CommentWithAuthor[];
}

interface CommentItemProps {
  comment: CommentWithAuthor;
  onReply?: (parentId: string, text: string) => void;
  onVote?: (commentId: string, type: "up" | "down") => void;
  depth?: number;
}

function CommentItem({ comment, onReply, onVote, depth = 0 }: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply?.(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    }
  };

  const maxDepth = 2;
  const paddingLeft = depth > 0 ? `${Math.min(depth, maxDepth) * 2}rem` : "0";

  return (
    <div style={{ paddingLeft }} data-testid={`comment-${comment.id}`}>
      <div className="flex gap-3 py-4">
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={comment.author?.profileImageUrl || undefined} />
          <AvatarFallback className="text-xs">
            {comment.author?.firstName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">
              {comment.author?.firstName || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {comment.createdAt
                ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                : "Just now"}
            </span>
          </div>

          <p className="text-sm leading-relaxed">{comment.text}</p>

          <div className="flex items-center gap-4">
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onVote?.(comment.id, "up")}
              data-testid={`button-upvote-${comment.id}`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{comment.upvotes || 0}</span>
            </button>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onVote?.(comment.id, "down")}
              data-testid={`button-downvote-${comment.id}`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{comment.downvotes || 0}</span>
            </button>
            {depth < maxDepth && (
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowReplyForm(!showReplyForm)}
                data-testid={`button-reply-${comment.id}`}
              >
                <Reply className="h-3.5 w-3.5" />
                <span>Reply</span>
              </button>
            )}
          </div>

          {showReplyForm && (
            <div className="flex gap-2 pt-2">
              <Textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] text-sm resize-none"
                data-testid={`input-reply-${comment.id}`}
              />
              <Button
                size="icon"
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
                data-testid={`button-submit-reply-${comment.id}`}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="border-l-2 border-muted mt-3">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  onVote={onVote}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentSectionProps {
  comments: CommentWithAuthor[];
  onAddComment?: (text: string, parentId?: string) => void;
  onVote?: (commentId: string, type: "up" | "down") => void;
  isLoading?: boolean;
}

export function CommentSection({
  comments,
  onAddComment,
  onVote,
  isLoading = false,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState("");

  const handleSubmit = () => {
    if (newComment.trim()) {
      onAddComment?.(newComment);
      setNewComment("");
    }
  };

  const handleReply = (parentId: string, text: string) => {
    onAddComment?.(text, parentId);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="min-h-[80px] resize-none"
          data-testid="input-new-comment"
        />
        <Button
          onClick={handleSubmit}
          disabled={!newComment.trim() || isLoading}
          className="self-end"
          data-testid="button-submit-comment"
        >
          <Send className="h-4 w-4 mr-2" />
          Post
        </Button>
      </div>

      <div className="divide-y divide-border">
        {comments.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments
            .filter((c) => !c.parentId)
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={{
                  ...comment,
                  replies: comments.filter((c) => c.parentId === comment.id),
                }}
                onReply={handleReply}
                onVote={onVote}
              />
            ))
        )}
      </div>
    </div>
  );
}
