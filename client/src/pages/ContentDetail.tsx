import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import {
  Download,
  Heart,
  Share2,
  Flag,
  Calendar,
  Eye,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/StarRating";
import { CommentSection } from "@/components/CommentSection";
import { ContentCard } from "@/components/ContentCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Content, User, Comment, Rating } from "@shared/schema";

type ContentWithDetails = Content & {
  author?: User;
  averageRating?: number;
  ratingCount?: number;
  comments?: (Comment & { author?: User })[];
  userRating?: number;
};

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const { data: content, isLoading } = useQuery<ContentWithDetails>({
    queryKey: ["/api/contents", id],
  });

  const { data: relatedContents } = useQuery<Content[]>({
    queryKey: ["/api/contents", { related: id }],
    enabled: !!content,
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      await apiRequest("POST", `/api/contents/${id}/rate`, { rating });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents", id] });
      toast({ title: "Rating submitted", description: "Thank you for your feedback!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to rate content",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to submit rating", variant: "destructive" });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      await apiRequest("POST", `/api/contents/${id}/comments`, { text, parentId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contents", id] });
      toast({ title: "Comment added" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to comment",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({ title: "Error", description: "Failed to add comment", variant: "destructive" });
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/contents/${id}/save`);
    },
    onSuccess: () => {
      toast({ title: "Saved to library" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to save content",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-8">
          <Skeleton className="aspect-[3/4] rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Content Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The content you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Browse
      </Link>

      <div className="grid lg:grid-cols-[60%_40%] gap-8">
        <div className="relative aspect-[3/4] max-h-[600px] rounded-lg overflow-hidden bg-muted">
          {content.coverImageUrl ? (
            <img
              src={content.coverImageUrl}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-6xl font-display font-bold text-primary/60">
                {content.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge>{content.contentType.toUpperCase()}</Badge>
              {content.category && <Badge variant="outline">{content.category}</Badge>}
              <Badge variant={content.isFree ? "secondary" : "default"}>
                {content.isFree ? "FREE" : `$${content.price}`}
              </Badge>
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">{content.title}</h1>
            
            {content.author && (
              <Link
                href={`/profile/${content.author.id}`}
                className="flex items-center gap-3 group"
              >
                <Avatar>
                  <AvatarImage src={content.author.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {content.author.firstName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {content.author.firstName || content.author.email?.split("@")[0] || "Anonymous"}
                  </span>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <StarRating
                rating={content.averageRating || 0}
                readonly
                size="lg"
              />
              <span className="text-lg font-semibold">
                {(content.averageRating || 0).toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({content.ratingCount || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {content.viewCount || 0} views
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              {content.downloadCount || 0} downloads
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {content.createdAt
                ? formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })
                : "Recently"}
            </span>
          </div>

          <div className="flex gap-3 flex-wrap">
            <Button
              size="lg"
              className="flex-1"
              onClick={() => window.open(content.fileUrl, "_blank")}
              data-testid="button-download"
            >
              <Download className="h-5 w-5 mr-2" />
              {content.isFree ? "Download" : `Buy for $${content.price}`}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => saveMutation.mutate()}
              data-testid="button-save"
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" data-testid="button-share">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {isAuthenticated && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Rate this content</h4>
              <StarRating
                rating={content.userRating || 0}
                onRate={(rating) => rateMutation.mutate(rating)}
                size="lg"
              />
            </div>
          )}

          {content.tags && content.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {content.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <Tabs defaultValue="description" className="w-full">
        <TabsList>
          <TabsTrigger value="description" data-testid="tab-description">Description</TabsTrigger>
          <TabsTrigger value="comments" data-testid="tab-comments">
            Comments ({content.comments?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="related" data-testid="tab-related">Related</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {content.description ? (
              <p className="whitespace-pre-wrap">{content.description}</p>
            ) : (
              <p className="text-muted-foreground italic">No description provided.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <CommentSection
            comments={content.comments || []}
            onAddComment={(text, parentId) => commentMutation.mutate({ text, parentId })}
            isLoading={commentMutation.isPending}
          />
        </TabsContent>

        <TabsContent value="related" className="mt-6">
          {relatedContents && relatedContents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedContents.map((item) => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No related content found.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
