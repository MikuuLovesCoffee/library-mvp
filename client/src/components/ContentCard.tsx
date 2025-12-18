import { Star, Download, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Content, User } from "@shared/schema";
import { Link } from "wouter";

interface ContentCardProps {
  content: Content & { author?: User; averageRating?: number; ratingCount?: number };
}

export function ContentCard({ content }: ContentCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "book":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "manga":
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400";
      case "image":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "pdf":
        return "bg-orange-500/20 text-orange-600 dark:text-orange-400";
      default:
        return "";
    }
  };

  return (
    <Link href={`/content/${content.id}`}>
      <Card
        className="group cursor-pointer overflow-visible transition-all duration-300 hover:-translate-y-1"
        data-testid={`card-content-${content.id}`}
      >
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-md">
          {content.coverImageUrl ? (
            <img
              src={content.coverImageUrl}
              alt={content.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-primary/60">
                {content.title.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-2 right-2">
            <Badge
              className={`backdrop-blur-md ${content.isFree ? "bg-green-500/90 text-white" : "bg-amber-500/90 text-white"}`}
            >
              {content.isFree ? "FREE" : `$${content.price}`}
            </Badge>
          </div>
          
          <div className="absolute top-2 left-2">
            <Badge className={getTypeColor(content.contentType)} size="sm">
              {content.contentType.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {content.title}
          </h3>

          {content.author && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={content.author.profileImageUrl || undefined} />
                <AvatarFallback className="text-xs">
                  {content.author.firstName?.charAt(0) || content.author.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground truncate">
                {content.author.firstName || content.author.email?.split("@")[0] || "Anonymous"}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(content.averageRating || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="text-xs text-muted-foreground ml-1">
                ({content.ratingCount || 0})
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {content.viewCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                {content.downloadCount || 0}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
