import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface FilterState {
  search: string;
  contentType: string;
  priceType: string;
  category: string;
  sortBy: string;
}

interface ContentFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  categories?: string[];
}

const contentTypes = [
  { value: "all", label: "All Types" },
  { value: "book", label: "Books" },
  { value: "manga", label: "Manga" },
  { value: "image", label: "Images" },
  { value: "pdf", label: "PDFs" },
];

const priceTypes = [
  { value: "all", label: "All Prices" },
  { value: "free", label: "Free Only" },
  { value: "paid", label: "Paid Only" },
];

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
  { value: "downloads", label: "Most Downloads" },
];

export function ContentFilters({
  filters,
  onFiltersChange,
  categories = [],
}: ContentFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      contentType: "all",
      priceType: "all",
      category: "all",
      sortBy: "newest",
    });
  };

  const hasActiveFilters =
    filters.contentType !== "all" ||
    filters.priceType !== "all" ||
    filters.category !== "all" ||
    filters.search !== "";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search content..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={filters.contentType}
            onValueChange={(value) => updateFilter("contentType", value)}
          >
            <SelectTrigger className="w-[140px]" data-testid="select-content-type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {contentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.sortBy}
            onValueChange={(value) => updateFilter("sortBy", value)}
          >
            <SelectTrigger className="w-[150px]" data-testid="select-sort">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-filters">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-3">
                  <Label>Price</Label>
                  <div className="space-y-2">
                    {priceTypes.map((type) => (
                      <div
                        key={type.value}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                          filters.priceType === type.value
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                        onClick={() => updateFilter("priceType", type.value)}
                      >
                        <span className="text-sm">{type.label}</span>
                        {filters.priceType === type.value && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-3">
                    <Label>Category</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => updateFilter("category", value)}
                    >
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <button onClick={() => updateFilter("search", "")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.contentType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {contentTypes.find((t) => t.value === filters.contentType)?.label}
              <button onClick={() => updateFilter("contentType", "all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.priceType !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {priceTypes.find((t) => t.value === filters.priceType)?.label}
              <button onClick={() => updateFilter("priceType", "all")}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
