import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { UploadForm } from "@/components/UploadForm";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Upload() {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to upload content",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  const uploadMutation = useMutation({
    mutationFn: async ({
      data,
      coverFile,
      contentFile,
    }: {
      data: any;
      coverFile: File | null;
      contentFile: File | null;
    }) => {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description || "");
      formData.append("contentType", data.contentType);
      formData.append("category", data.category || "");
      formData.append("tags", data.tags || "");
      formData.append("isFree", String(data.isFree));
      formData.append("price", data.price || "0");
      
      if (coverFile) {
        formData.append("cover", coverFile);
      }
      if (contentFile) {
        formData.append("content", contentFile);
      }

      const response = await fetch("/api/contents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful!",
        description: "Your content has been published.",
      });
      setLocation(`/content/${data.id}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to upload content",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any, coverFile: File | null, contentFile: File | null) => {
    if (!contentFile) {
      toast({
        title: "Missing file",
        description: "Please upload a content file",
        variant: "destructive",
      });
      return;
    }
    uploadMutation.mutate({ data, coverFile, contentFile });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">Upload Content</h1>
        <p className="text-muted-foreground">
          Share your books, manga, images, or PDFs with the community
        </p>
      </div>

      <UploadForm onSubmit={handleSubmit} isLoading={uploadMutation.isPending} />
    </div>
  );
}
