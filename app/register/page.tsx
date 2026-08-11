'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Monitor,
  Lock,
  Mail,
  User,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace('/admin');
  }, [user, authLoading, router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !email || !password) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Minimum 6 characters required',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are the same',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    const result = await register(email, password, displayName);

    if (!result.ok) {
      toast({
        title: 'Registration failed',
        description: result.error,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Account created',
      description: 'You can now sign in with your credentials',
    });
    router.replace('/admin');
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
        className="absolute left-4 top-4 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:left-6 md:top-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Display
      </button>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-2xl backdrop-blur-xl md:p-8">
          <div className="mb-6 flex flex-col items-center gap-3 md:mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/30 md:h-16 md:w-16">
              <Monitor className="h-7 w-7 text-primary-foreground md:h-8 md:w-8" />
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight md:text-2xl">Create Account</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Register as an administrator
              </p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

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
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <button
              onClick={() => router.push('/login')}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
