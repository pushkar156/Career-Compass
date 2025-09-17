
'use client';

import Link from 'next/link';
import { useTheme } from "next-themes"
import { Moon, Sun, User as UserIcon, Compass, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React from 'react';

const auth = getAuth(app);

const ThemeToggle = () => {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const UserProfile = () => {
    const { user, loading, signOut } = useAuth();
    const { toast } = useToast();

    const handleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            toast({
                variant: 'destructive',
                title: 'Sign In Failed',
                description: error.message,
            });
        }
    };

    if (loading) {
        return <Button variant="ghost" size="icon" disabled><UserIcon className="h-5 w-5" /></Button>
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    {user ? (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                            <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    ) : (
                        <UserIcon className="h-5 w-5" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {user ? (
                    <>
                        <DropdownMenuItem disabled>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => signOut()}>
                            Log out
                        </DropdownMenuItem>
                    </>
                ) : (
                    <DropdownMenuItem onClick={handleSignIn}>
                        Sign In with Google
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};


export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-center">
            <div className="flex items-center space-x-8">
                <Link href="/" className="flex items-center space-x-2">
                    <Compass className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline text-xl">Career Compass</span>
                </Link>
                
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">Home</Link>
                    <Link href="/about" className="text-foreground/60 transition-colors hover:text-foreground/80">About Us</Link>
                </nav>
            </div>
            
            <div className="ml-auto flex items-center md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="py-6">
                    <Link href="/" className="flex items-center space-x-2 mb-6" onClick={() => setIsOpen(false)}>
                      <Compass className="h-6 w-6 text-primary" />
                      <span className="font-bold font-headline text-xl">Career Compass</span>
                    </Link>
                    <nav className="flex flex-col space-y-4">
                      <Link href="/" className="text-lg font-medium" onClick={() => setIsOpen(false)}>Home</Link>
                      <Link href="/about" className="text-lg font-medium" onClick={() => setIsOpen(false)}>About Us</Link>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="hidden md:flex items-center space-x-2 ml-8">
                <ThemeToggle />
                <UserProfile />
            </div>
        </div>
    </header>
  );
}
