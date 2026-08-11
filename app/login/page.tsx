'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Monitor, Lock, Mail, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace('/admin');
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    const result = await login(email, password);

    if (!result.ok) {
      toast({
        title: 'Login failed',
        description: result.error,
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({ title: 'Welcome back', description: 'Login successful' });
      router.replace('/admin');
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-chart-2/10 blur-3xl" />

      <button
        onClick={() => router.push('/')}
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Display
      </button>

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30">
              <Monitor className="h-8 w-8 text-primary-foreground" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight">Admin Login</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Information Board PT Tri Cipta Teknindo
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-medium text-primary hover:underline"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
