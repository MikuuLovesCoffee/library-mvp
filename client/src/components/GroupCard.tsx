import { Users, Lock, Globe, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Group } from "@shared/schema";
import { Link } from "wouter";

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => void;
  isMember?: boolean;
}

export function GroupCard({ group, onJoin, isMember = false }: GroupCardProps) {
  const getPrivacyIcon = () => {
    switch (group.privacy) {
      case "open":
        return <Globe className="h-3.5 w-3.5" />;
      case "public":
        return <Eye className="h-3.5 w-3.5" />;
      case "private":
        return <Lock className="h-3.5 w-3.5" />;
    }
  };

  const getPrivacyLabel = () => {
    switch (group.privacy) {
      case "open":
        return "Open";
      case "public":
        return "Public";
      case "private":
        return "Private";
    }
  };

  const getPrivacyColor = () => {
    switch (group.privacy) {
      case "open":
        return "bg-green-500/20 text-green-600 dark:text-green-400";
      case "public":
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400";
      case "private":
        return "bg-amber-500/20 text-amber-600 dark:text-amber-400";
    }
  };

  return (
    <Card
      className="overflow-visible transition-all duration-300 hover:-translate-y-1"
      data-testid={`card-group-${group.id}`}
    >
      <div className="relative h-32 overflow-hidden rounded-t-md">
        {group.coverImageUrl ? (
          <img
            src={group.coverImageUrl}
            alt={group.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/60" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 right-2">
          <Badge className={getPrivacyColor()} size="sm">
            {getPrivacyIcon()}
            <span className="ml-1">{getPrivacyLabel()}</span>
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <Link href={`/groups/${group.id}`}>
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 hover:text-primary transition-colors cursor-pointer">
            {group.name}
          </h3>
        </Link>

        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {group.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{group.memberCount} members</span>
          </div>

          {isMember ? (
            <Badge variant="secondary">Joined</Badge>
          ) : (
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onJoin?.(group.id);
              }}
              data-testid={`button-join-group-${group.id}`}
            >
              {group.privacy === "private" ? "Request" : "Join"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
