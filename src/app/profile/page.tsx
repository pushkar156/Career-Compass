
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, LogIn, Trash2 } from 'lucide-react';

const profileSchema = z.object({
  displayName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, loading, updateUserProfile, deleteAccount } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      email: '',
    },
  });

  useEffect(() => {
    if (!loading && user) {
      form.reset({
        displayName: user.displayName || '',
        email: user.email || '',
      });
    }
  }, [user, loading, form]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
              <LogIn size={32} />
            </div>
            <CardTitle className="font-headline text-2xl">Access Denied</CardTitle>
            <CardDescription>
              You must be signed in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
                <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
        if (data.displayName !== user.displayName) {
            await updateUserProfile({ displayName: data.displayName });
        }
        toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully.",
        });
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
        await deleteAccount();
        toast({
            title: "Account Deleted",
            description: "Your account has been permanently deleted.",
        });
        router.push('/');
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Deletion Failed",
            description: error.message || "Could not delete account. Please try again.",
        });
    } finally {
        setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-10">
        <header>
          <h1 className="text-5xl font-headline font-bold text-primary flex items-center gap-4">
            <User size={48} />
            Your Profile
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            Manage your personal information and account settings.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Update Information</CardTitle>
            <CardDescription>Changes to your name will be reflected across the application.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                       <FormDescription>
                        Email addresses cannot be changed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                 <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>

        <Card className="border-destructive">
            <CardHeader>
                <CardTitle className="flex items-center gap-3 text-destructive"><Trash2 />Danger Zone</CardTitle>
                <CardDescription>Be careful, these actions are irreversible.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg">
                    <div>
                        <h4 className="font-semibold">Delete Your Account</h4>
                        <p className="text-sm text-muted-foreground">This will permanently delete your account and all associated data.</p>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                    Yes, delete my account
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
