'use client';

import { useAuth } from '@/hooks/use-auth';
import { useHistory } from '@/hooks/use-history';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, Clock, ArrowRight, User, Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { history, loading: historyLoading, error } = useHistory();

  if (authLoading || historyLoading) {
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
              <User size={32} />
            </div>
            <CardTitle className="font-headline text-2xl">Access Your History</CardTitle>
            <CardDescription>
              Please sign in to view your past career explorations and track your progress over time.
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

  if (error) {
    return (
        <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
            <Card className="max-w-md w-full text-center border-destructive">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-destructive">Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-5xl font-headline font-bold text-primary flex items-center gap-4">
            <History size={48} />
            Your Career History
          </h1>
          <p className="text-xl text-muted-foreground mt-4">
            Review your past explorations and continue your journey.
          </p>
        </header>

        {history.length === 0 ? (
          <Card className="text-center p-8">
            <CardHeader>
                <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <Search size={32} />
                </div>
              <CardTitle className="font-headline text-2xl">No History Found</CardTitle>
              <CardDescription>You haven't explored any careers yet. Let's get started!</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/">Start Exploring</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <main className="space-y-6">
            {history.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-headline text-2xl font-semibold text-primary">{item.generatedCareer}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2">
                      <Clock size={16} />
                      <span>Explored on {new Date(item.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        {/* In a real app, this would link to the specific roadmap */}
                        <Link href="/"> 
                            <ArrowRight size={20} />
                        </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </main>
        )}
      </div>
    </div>
  );
}
