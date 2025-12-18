import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Camera, Edit2, BookOpen, Star, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ContentCard } from "@/components/ContentCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import type { User, Content } from "@shared/schema";

type ProfileData = User & {
  uploadedContents?: Content[];
  savedContents?: Content[];
  stats?: {
    totalUploads: number;
    averageRating: number;
    totalDownloads: number;
  };
};

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");

  const isOwnProfile = !id || id === currentUser?.id;
  const profileId = id || currentUser?.id;

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["/api/users", profileId],
    enabled: !!profileId,
  });

  useEffect(() => {
    if (profile?.bio) {
      setBio(profile.bio);
    }
  }, [profile?.bio]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { bio: string }) => {
      await apiRequest("PATCH", "/api/users/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", profileId] });
      setIsEditing(false);
      toast({ title: "Profile updated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="relative h-64 bg-muted rounded-xl">
          <Skeleton className="absolute -bottom-12 left-8 h-32 w-32 rounded-full" />
        </div>
        <div className="pt-16 px-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground">
          The profile you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative h-64 bg-gradient-to-br from-primary/30 via-purple-500/20 to-pink-500/20 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        <div className="absolute -bottom-12 left-8 z-10">
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.profileImageUrl || undefined} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {profile.firstName?.charAt(0) || profile.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-16 px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-display font-bold">
                {profile.firstName
                  ? `${profile.firstName}${profile.lastName ? ` ${profile.lastName}` : ""}`
                  : profile.email?.split("@")[0] || "Anonymous"}
              </h1>
              {profile.isCreator && (
                <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white">
                  Creator
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Joined{" "}
              {profile.createdAt
                ? formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true })
                : "recently"}
            </p>
          </div>

          {isOwnProfile && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              data-testid="button-edit-profile"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>

        <div className="mt-4">
          {isEditing ? (
            <div className="space-y-3 max-w-xl">
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="resize-none"
                data-testid="input-bio"
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => updateProfileMutation.mutate({ bio })}
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground max-w-2xl">
              {profile.bio || "No bio yet."}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 px-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-display font-bold text-primary">
              {profile.stats?.totalUploads || 0}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <BookOpen className="h-4 w-4" />
              Uploads
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-display font-bold text-primary">
              {(profile.stats?.averageRating || 0).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Star className="h-4 w-4" />
              Avg Rating
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-display font-bold text-primary">
              {profile.stats?.totalDownloads || 0}
            </div>
            <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
              <Download className="h-4 w-4" />
              Downloads
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="uploads" className="px-8">
        <TabsList>
          <TabsTrigger value="uploads" data-testid="tab-uploads">
            Uploaded ({profile.uploadedContents?.length || 0})
          </TabsTrigger>
          {isOwnProfile && (
            <TabsTrigger value="saved" data-testid="tab-saved">
              Saved ({profile.savedContents?.length || 0})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="uploads" className="mt-6">
          {profile.uploadedContents && profile.uploadedContents.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {profile.uploadedContents.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No uploads yet.</p>
            </div>
          )}
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="saved" className="mt-6">
            {profile.savedContents && profile.savedContents.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {profile.savedContents.map((content) => (
                  <ContentCard key={content.id} content={content} />
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-muted-foreground">No saved content yet.</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
