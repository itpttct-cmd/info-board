'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  LogOut,
  Monitor,
  LayoutGrid,
  Megaphone,
  ShieldCheck,
  Users,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { BoardContentManager } from '@/components/admin/board-content-manager';
import { RunningTextManager } from '@/components/admin/running-text-manager';
import { SidebarContentManager } from '@/components/admin/sidebar-content-manager';
import { UserManager } from '@/components/admin/user-manager';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, logout } = useAuth();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/login');
      } else {
        setChecked(true);
      }
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    toast({ title: 'Logged out', description: 'See you next time' });
    router.replace('/login');
  };

  if (!checked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
              <Monitor className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight">Admin Dashboard</h1>
              <p className="text-xs text-muted-foreground">
                Information Board PT Tri Cipta Teknindo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user?.display_name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Display
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <Tabs defaultValue="board" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="board" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Board Content</span>
              <span className="sm:hidden">Board</span>
            </TabsTrigger>
            <TabsTrigger value="sidebar" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Sidebar</span>
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <Megaphone className="h-4 w-4" />
              <span className="hidden sm:inline">Running Text</span>
              <span className="sm:hidden">Text</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-6">
            <BoardContentManager />
          </TabsContent>

          <TabsContent value="sidebar" className="space-y-6">
            <SidebarContentManager />
          </TabsContent>

          <TabsContent value="text" className="space-y-6">
            <RunningTextManager />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManager currentUser={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
