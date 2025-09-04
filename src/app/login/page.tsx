
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Mail, KeyRound, LogIn, User, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.99,34.556,44,29.861,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
  );
}

export default function LoginPage() {
  const [isSigningUp, setIsSigningUp] = useState(false);
  
  // State for forms
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const handleAuthError = (error: any) => {
    let description = 'An unexpected error occurred. Please try again.';
    if (error && error.code) {
      const firebaseError = error as FirebaseError;
      switch (firebaseError.code) {
        case 'auth/user-not-found':
          description = 'No user found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          description = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          description = 'This email is already registered. Please sign in instead.';
          break;
        case 'auth/invalid-email':
          description = 'The email address is not valid.';
          break;
        case 'auth/weak-password':
          description = 'The password is too weak. Please choose a stronger one.';
          break;
        case 'auth/popup-closed-by-user':
          description = 'Sign-in popup was closed before completion. Please try again.';
          break;
        default:
          description = firebaseError.message;
      }
    }
    toast({
      variant: 'destructive',
      title: 'Authentication Error',
      description,
    });
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email and password are required.' });
      return;
    }
    setLoading(true);
    const auth = getAuth(app);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error: any) {
       handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: "Passwords don't match." });
      return;
    }
    setLoading(true);
    const auth = getAuth(app);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      router.push('/');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Compass className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-headline font-bold text-foreground">Career Compass</h1>
          <p className="mt-3 text-lg text-muted-foreground">Sign in to continue your journey</p>
        </div>
        <Card className="shadow-lg shadow-slate-200/20 dark:shadow-black/20">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">{isSigningUp ? 'Create an Account' : 'Welcome Back'}</CardTitle>
            <CardDescription className="text-center">{isSigningUp ? 'Enter your details to get started.' : 'Sign in with your email or Google account.'}</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            
            {isSigningUp ? (
              // Sign Up Form
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name-signup">Full Name</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="name-signup" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email-signup">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="email-signup" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password-signup">Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="password-signup" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword-signup">Confirm Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="confirmPassword-signup" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="pl-10" />
                    </div>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                         {loading ? <Loader2 className="mr-2 animate-spin" /> : 'Create Account'}
                    </Button>
                     <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Button variant="link" type="button" onClick={() => setIsSigningUp(false)} className="p-0 h-auto">Sign in</Button>
                    </p>
                </div>
              </form>
            ) : (
              // Sign In Form
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="email-signin">Email</Label>
                      <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="email-signin" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10" />
                      </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="password-signin">Password</Label>
                      <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="password-signin" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10" />
                      </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                      <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? <Loader2 className="mr-2 animate-spin" /> : <LogIn className="mr-2" />}
                          Sign In
                      </Button>
                       <p className="text-center text-sm text-muted-foreground">
                          Don't have an account?{' '}
                          <Button variant="link" type="button" onClick={() => setIsSigningUp(true)} className="p-0 h-auto">Sign up</Button>
                      </p>
                  </div>
              </form>
            )}
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            
            <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={googleLoading}>
              {googleLoading ? <Loader2 className="mr-2 animate-spin" /> : <GoogleIcon className="mr-2" />}
              Sign In with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
