import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, X, Image, FileText, Book, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().optional(),
  contentType: z.enum(["book", "manga", "image", "pdf"]),
  category: z.string().optional(),
  tags: z.string().optional(),
  isFree: z.boolean().default(true),
  price: z.string().optional(),
});

type UploadFormData = z.infer<typeof uploadSchema>;

interface UploadFormProps {
  onSubmit: (data: UploadFormData, coverFile: File | null, contentFile: File | null) => void;
  isLoading?: boolean;
}

const contentTypeIcons = {
  book: Book,
  manga: Layers,
  image: Image,
  pdf: FileText,
};

const categories = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "Art",
  "Comics",
  "Education",
  "Business",
  "Self-Help",
  "Other",
];

export function UploadForm({ onSubmit, isLoading = false }: UploadFormProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      description: "",
      contentType: "book",
      category: "",
      tags: "",
      isFree: true,
      price: "0",
    },
  });

  const isFree = form.watch("isFree");
  const contentType = form.watch("contentType");

  const handleCoverDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }, []);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleContentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setContentFile(file);
    }
  };

  const handleFormSubmit = (data: UploadFormData) => {
    onSubmit(data, coverFile, contentFile);
  };

  const ContentIcon = contentTypeIcons[contentType];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {(["book", "manga", "image", "pdf"] as const).map((type) => {
                      const Icon = contentTypeIcons[type];
                      return (
                        <div
                          key={type}
                          className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-all ${
                            field.value === type
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => field.onChange(type)}
                          data-testid={`select-type-${type}`}
                        >
                          <Icon className={`h-5 w-5 ${field.value === type ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium capitalize">{type}</span>
                        </div>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter content title..."
                      {...field}
                      data-testid="input-title"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your content..."
                      className="min-h-[120px] resize-none"
                      {...field}
                      data-testid="input-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas..."
                      {...field}
                      data-testid="input-tags"
                    />
                  </FormControl>
                  <FormDescription>
                    Add tags to help people discover your content
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Cover Image</Label>
              <div
                className={`relative border-2 border-dashed rounded-md p-6 transition-colors ${
                  coverPreview ? "border-primary" : "border-border hover:border-primary/50"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleCoverDrop}
              >
                {coverPreview ? (
                  <div className="relative aspect-[2/3] max-w-[200px] mx-auto">
                    <img
                      src={coverPreview}
                      alt="Cover preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-destructive-foreground"
                      onClick={() => {
                        setCoverFile(null);
                        setCoverPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <div className="p-4 rounded-full bg-muted">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Drag and drop your cover image</p>
                      <p className="text-sm text-muted-foreground">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      data-testid="input-cover-file"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Content File</Label>
              <div
                className={`relative border-2 border-dashed rounded-md p-6 transition-colors ${
                  contentFile ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
              >
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="p-4 rounded-full bg-muted">
                    <ContentIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  {contentFile ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {contentFile.name}
                      </span>
                      <button
                        type="button"
                        className="p-1 hover:bg-muted rounded"
                        onClick={() => setContentFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="font-medium">Upload your {contentType} file</p>
                      <p className="text-sm text-muted-foreground">PDF, EPUB, or image files</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.epub,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleContentSelect}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    data-testid="input-content-file"
                  />
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div>
                        <FormLabel>Free Content</FormLabel>
                        <FormDescription>
                          Toggle off to set a price
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-free"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isFree && (
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (USD)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              {...field}
                              data-testid="input-price"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-publish">
            <Upload className="h-4 w-4 mr-2" />
            {isLoading ? "Publishing..." : "Publish Content"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
