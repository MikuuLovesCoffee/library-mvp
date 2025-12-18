import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Textarea } from "@/components/ui/textarea";
import { GroupCard } from "@/components/GroupCard";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Group } from "@shared/schema";

const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  privacy: z.enum(["open", "public", "private"]),
});

type CreateGroupForm = z.infer<typeof createGroupSchema>;

type GroupWithMembership = Group & { isMember?: boolean };

export default function Groups() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "Please log in to view groups",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  const form = useForm<CreateGroupForm>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: "",
      description: "",
      privacy: "open",
    },
  });

  const { data: groups, isLoading } = useQuery<GroupWithMembership[]>({
    queryKey: ["/api/groups", { search }],
    enabled: isAuthenticated,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: CreateGroupForm) => {
      return await apiRequest("POST", "/api/groups", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsCreateOpen(false);
      form.reset();
      toast({ title: "Group created successfully!" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "Please log in to create groups",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    },
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (groupId: string) => {
      return await apiRequest("POST", `/api/groups/${groupId}/join`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2">Groups</h1>
          <p className="text-muted-foreground">
            Join communities, share content, and connect with others
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-group">
              <Plus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Group</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createGroupMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter group name..."
                          {...field}
                          data-testid="input-group-name"
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
                          placeholder="What's this group about?"
                          className="resize-none"
                          {...field}
                          data-testid="input-group-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Privacy</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-group-privacy">
                            <SelectValue placeholder="Select privacy level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="open">
                            Open - Anyone can join
                          </SelectItem>
                          <SelectItem value="public">
                            Public - Visible, join by request
                          </SelectItem>
                          <SelectItem value="private">
                            Private - Invite only
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createGroupMutation.isPending}
                    data-testid="button-submit-create-group"
                  >
                    {createGroupMutation.isPending ? "Creating..." : "Create Group"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search groups..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-groups"
        />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 rounded-t-md" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : groups && groups.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              isMember={group.isMember}
              onJoin={(groupId) => joinGroupMutation.mutate(groupId)}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <Users className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No groups found</h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? "Try a different search term"
              : "Be the first to create a group!"}
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      )}
    </div>
  );
}
