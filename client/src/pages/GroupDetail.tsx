import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ChevronLeft, Users, Lock, Globe, Eye, Settings, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import type { Group, User, GroupMember } from "@shared/schema";

type GroupWithDetails = Group & {
  owner?: User;
  members?: (GroupMember & { user?: User })[];
  isMember?: boolean;
  isOwner?: boolean;
};

export default function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to view group details",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: group, isLoading } = useQuery<GroupWithDetails>({
    queryKey: ["/api/groups", id],
    enabled: isAuthenticated && !!id,
  });

  const joinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/groups/${id}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id] });
      toast({ title: "Joined group successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to join groups",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", `/api/groups/${id}/leave`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id] });
      toast({ title: "Left group" });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    },
  });

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "open":
        return <Globe className="h-4 w-4" />;
      case "public":
        return <Eye className="h-4 w-4" />;
      case "private":
        return <Lock className="h-4 w-4" />;
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 rounded-xl" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-2xl font-semibold mb-2">Group Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The group you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/groups">Back to Groups</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/groups" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to Groups
      </Link>

      <div className="relative h-48 md:h-64 rounded-xl overflow-hidden">
        {group.coverImageUrl ? (
          <img
            src={group.coverImageUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 via-purple-500/20 to-pink-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-display font-bold text-white drop-shadow-lg">
                {group.name}
              </h1>
              <Badge className="bg-white/20 text-white backdrop-blur-sm">
                {getPrivacyIcon(group.privacy)}
                <span className="ml-1 capitalize">{group.privacy}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-white/80">
              <Users className="h-4 w-4" />
              <span>{group.memberCount} members</span>
            </div>
          </div>

          <div className="flex gap-2">
            {group.isOwner ? (
              <Button variant="secondary" className="backdrop-blur-sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            ) : group.isMember ? (
              <Button
                variant="outline"
                className="backdrop-blur-sm bg-white/10 text-white border-white/20 hover:bg-white/20"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
                data-testid="button-leave-group"
              >
                Leave Group
              </Button>
            ) : (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                data-testid="button-join-group"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {group.privacy === "private" ? "Request to Join" : "Join Group"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {group.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                No activity yet. Be the first to share something!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {group.owner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Created by</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/profile/${group.owner.id}`} className="flex items-center gap-3 group">
                  <Avatar>
                    <AvatarImage src={group.owner.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {group.owner.firstName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium group-hover:text-primary transition-colors">
                      {group.owner.firstName || group.owner.email?.split("@")[0] || "Anonymous"}
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {group.createdAt
                        ? formatDistanceToNow(new Date(group.createdAt), { addSuffix: true })
                        : "Recently"}
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-base">
                Members ({group.memberCount})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {group.members && group.members.length > 0 ? (
                <div className="space-y-3">
                  {group.members.slice(0, 10).map((member) => (
                    <Link
                      key={member.id}
                      href={`/profile/${member.user?.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.user?.profileImageUrl || undefined} />
                        <AvatarFallback className="text-xs">
                          {member.user?.firstName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm group-hover:text-primary transition-colors">
                        {member.user?.firstName || member.user?.email?.split("@")[0] || "Anonymous"}
                      </span>
                      {member.role === "owner" && (
                        <Badge size="sm" variant="secondary">
                          Owner
                        </Badge>
                      )}
                    </Link>
                  ))}
                  {(group.memberCount || 0) > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{(group.memberCount || 0) - 10} more members
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No members yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
