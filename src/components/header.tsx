
'use client';

import Link from 'next/link';
import { useTheme } from "next-themes"
import { Moon, Sun, User as UserIcon, Compass, Menu, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import React from 'react';

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
    const { user, loading, signOut, signInWithGoogle } = useAuth();
    const { toast } = useToast();

    const handleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                console.error('Error signing in with Google:', error);
                toast({
                    variant: 'destructive',
                    title: 'Sign In Failed',
                    description: error.message,
                });
            }
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
                        <DropdownMenuItem asChild>
                            <Link href="/history">My History</Link>
                        </DropdownMenuItem>
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
        <div className="container flex h-16 items-center">
            <div className="md:hidden flex-none">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader className="p-4 border-b">
                      <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    </SheetHeader>
                  <div className="py-6">
                    <Link href="/" className="flex items-center space-x-2 mb-6 px-4" onClick={() => setIsOpen(false)}>
                      <Compass className="h-6 w-6 text-primary" />
                      <span className="font-bold font-headline text-xl">Career Compass</span>
                    </Link>
                    <nav className="flex flex-col space-y-1 px-4">
                      <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setIsOpen(false)}><Link href="/">Home</Link></Button>
                      <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setIsOpen(false)}><Link href="/about">About Us</Link></Button>
                      <Button variant="ghost" className="justify-start text-lg" asChild onClick={() => setIsOpen(false)}><Link href="/history">History</Link></Button>
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            
            <div className="flex-1 flex justify-center">
                <div className="hidden md:flex items-center">
                    <Link href="/" className="flex items-center space-x-2">
                        <Compass className="h-6 w-6 text-primary" />
                        <span className="font-bold font-headline text-xl">Career Compass</span>
                    </Link>
                    
                    <nav className="flex items-center space-x-6 text-sm font-medium ml-6">
                        <Link href="/" className="text-foreground/60 transition-colors hover:text-foreground/80">Home</Link>
                        <Link href="/about" className="text-foreground/60 transition-colors hover:text-foreground/80">About Us</Link>
                        <Link href="/history" className="text-foreground/60 transition-colors hover:text-foreground/80">History</Link>
                    </nav>
                </div>
            </div>
            
            <div className="flex-none flex items-center space-x-2">
                <ThemeToggle />
                <UserProfile />
            </div>
        </div>
    </header>
  );
}
