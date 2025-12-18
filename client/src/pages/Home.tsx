import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentCard } from "@/components/ContentCard";
import { ContentFilters, type FilterState } from "@/components/ContentFilters";
import type { Content, User } from "@shared/schema";

type ContentWithAuthor = Content & { author?: User; averageRating?: number; ratingCount?: number };

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    contentType: "all",
    priceType: "all",
    category: "all",
    sortBy: "newest",
  });

  const { data: contents, isLoading } = useQuery<ContentWithAuthor[]>({
    queryKey: ["/api/contents", filters],
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Discover Content</h1>
        <p className="text-muted-foreground">
          Explore thousands of books, manga, images, and more from creators worldwide
        </p>
      </div>

      <ContentFilters filters={filters} onFiltersChange={setFilters} />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[2/3] rounded-md" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : contents && contents.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {contents.map((content) => (
            <ContentCard key={content.id} content={content} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">
            {filters.search || filters.contentType !== "all" || filters.priceType !== "all"
              ? "Try adjusting your filters to see more results"
              : "Be the first to upload content!"}
          </p>
        </div>
      )}
    </div>
  );
}
