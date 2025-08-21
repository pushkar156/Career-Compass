
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { app } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass, Mail, KeyRound, LogIn, Phone, MessageSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const emailPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
type EmailPasswordForm = z.infer<typeof emailPasswordSchema>;

const phoneSchema = z.object({
  phone: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Please enter a valid phone number with country code (e.g., +12223334444).'),
});
type PhoneForm = z.infer<typeof phoneSchema>;

const codeSchema = z.object({
  code: z.string().min(6, 'Verification code must be 6 digits.').max(6),
});
type CodeForm = z.infer<typeof codeSchema>;

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
  const [loading, setLoading] = useState(false);
  const [phoneSignInStep, setPhoneSignInStep] = useState<'entry' | 'verify'>('entry');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
    return window.recaptchaVerifier;
  }

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
          description = 'Sign-in popup closed before completion. Please try again.';
          break;
        case 'auth/invalid-phone-number':
            description = 'The phone number is not valid.';
            break;
        case 'auth/too-many-requests':
            description = 'Too many requests. Please try again later.';
            break;
        case 'auth/code-expired':
            description = 'The verification code has expired. Please send a new one.';
            break;
        case 'auth/invalid-verification-code':
            description = 'The verification code is invalid. Please try again.';
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
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const emailForm = useForm<EmailPasswordForm>({
    resolver: zodResolver(emailPasswordSchema),
    defaultValues: { email: '', password: '' },
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: '' },
  });

  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const handleEmailSignIn = async (data: EmailPasswordForm) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      router.push('/');
    } catch (error: any) {
       handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEmailSignUp = async () => {
    const isValid = await emailForm.trigger();
    if (!isValid) return;
    const data = emailForm.getValues();
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      router.push('/');
    } catch (error: any) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const onSendVerificationCode = async ({ phone }: PhoneForm) => {
    setLoading(true);
    try {
      const verifier = setupRecaptcha();
      const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
      setConfirmationResult(confirmation);
      setPhoneSignInStep('verify');
      toast({
        title: 'Verification Code Sent',
        description: `A code has been sent to ${phone}.`,
      });
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyCode = async ({ code }: CodeForm) => {
    if (!confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(code);
      router.push('/');
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div id="recaptcha-container"></div>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Compass className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-headline font-bold text-slate-800">Career Compass</h1>
          <p className="mt-3 text-lg text-muted-foreground">Sign in to continue your journey</p>
        </div>
        <Card className="shadow-2xl shadow-slate-200">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">Choose your sign-in method</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="email">Email & Google</TabsTrigger>
                <TabsTrigger value="phone">Phone</TabsTrigger>
              </TabsList>
              <TabsContent value="email" className="pt-6">
                {/* Email Form */}
                <form onSubmit={emailForm.handleSubmit(handleEmailSignIn)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="you@example.com" {...emailForm.register('email')} className="pl-10" />
                    </div>
                    {emailForm.formState.errors.email && <p className="text-xs text-destructive">{emailForm.formState.errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input id="password" type="password" placeholder="••••••••" {...emailForm.register('password')} className="pl-10" />
                    </div>
                    {emailForm.formState.errors.password && <p className="text-xs text-destructive">{emailForm.formState.errors.password.message}</p>}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <Button type="submit" className="w-full" disabled={loading}>
                      <LogIn className="mr-2" /> Sign In
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleEmailSignUp} disabled={loading}>
                      Sign Up
                    </Button>
                  </div>
                </form>
                
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
                
                {/* Google Button */}
                <Button onClick={handleGoogleSignIn} className="w-full" variant="outline" disabled={loading}>
                  <GoogleIcon className="mr-2" />
                  Sign In with Google
                </Button>
              </TabsContent>
              <TabsContent value="phone" className="pt-6">
                {/* Phone Form */}
                {phoneSignInStep === 'entry' && (
                  <form onSubmit={phoneForm.handleSubmit(onSendVerificationCode)} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input id="phone" type="tel" placeholder="+1 123 456 7890" {...phoneForm.register('phone')} className="pl-10" />
                        </div>
                        {phoneForm.formState.errors.phone && <p className="text-xs text-destructive">{phoneForm.formState.errors.phone.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" variant="outline" disabled={loading}>Send Code</Button>
                  </form>
                )}

                {phoneSignInStep === 'verify' && (
                  <form onSubmit={codeForm.handleSubmit(onVerifyCode)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">Verification Code</Label>
                      <div className="relative">
                          <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input id="code" type="text" placeholder="123456" {...codeForm.register('code')} className="pl-10" />
                      </div>
                      {codeForm.formState.errors.code && <p className="text-xs text-destructive">{codeForm.formState.errors.code.message}</p>}
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="w-full" variant="outline" disabled={loading}>Verify & Sign In</Button>
                      <Button type="button" variant="link" onClick={() => setPhoneSignInStep('entry')} disabled={loading}>Back</Button>
                    </div>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add this to your global declarations if you use TypeScript in a separate file
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

    