import { Link, useLocation } from "wouter";
import {
  Home,
  Upload,
  Users,
  User,
  Settings,
  LogOut,
  BookOpen,
  Search,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";

const menuItems = [
  { title: "Browse", url: "/", icon: Home },
  { title: "Upload", url: "/upload", icon: Upload },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "My Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <span className="text-xl font-display font-bold">LibraryVerse</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.title.toLowerCase().replace(" ", "-")}`}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>
              {user?.firstName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {user?.firstName || user?.email?.split("@")[0] || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
          <ThemeToggle />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          asChild
          data-testid="button-logout"
        >
          <a href="/api/logout">
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </a>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
