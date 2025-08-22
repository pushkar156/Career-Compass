
'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Compass, Briefcase, Sparkles, Lightbulb, Loader2, LogOut, User, Handshake, Search, Route, ListChecks, CheckCircle } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateCareerPathAction } from '@/app/actions';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';
import { CareerRoadmap } from '@/components/career-roadmap';
import { useAuth } from '@/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const FormSchema = z.object({
  desiredCareer: z.string().min(3, {
    message: 'Desired career must be at least 3 characters.',
  }),
  currentRole: z.string().optional(),
  interests: z.string().optional(),
});

type UserInput = z.infer<typeof FormSchema>;

const processSteps = [
  {
    icon: Handshake,
    title: '1. Initiation & Rapport Building',
    description: 'We begin by getting to know each other. This initial conversation is about building trust and open communication, ensuring you feel completely comfortable and understood.',
  },
  {
    icon: Search,
    title: '2. In-Depth Exploration',
    description: 'Through detailed questionnaires and analytical assessments, we explore your personality, interests, skills, and experience to build a complete personal and professional profile.',
  },
  {
    icon: Route,
    title: '3. Decision Making',
    description: 'Together, we analyze potential career paths that align with your profile. This stage focuses on narrowing down options and eliminating obstacles to help you make a confident, informed decision.',
  },
  {
    icon: ListChecks,
    title: '4. Action Plan Preparation',
    description: 'Once a path is chosen, we co-create a detailed, step-by-step action plan. This includes resources, milestones, and a contingency strategy to prepare you for success.',
  },
  {
    icon: CheckCircle,
    title: '5. Implementation & Success',
    description: 'The final stage is about executing your plan. With clear goals and deadlines, we support you as you take concrete steps toward your new career, transforming planning into achievement.',
  },
];

export default function MainPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerPathOutput | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();

  const form = useForm<UserInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      desiredCareer: '',
      currentRole: '',
      interests: '',
    },
  });

  async function onSubmit(data: UserInput) {
    setLoading(true);
    setUserInput(data);
    try {
      const response = await generateCareerPathAction({ career: data.desiredCareer, currentRole: data.currentRole, interests: data.interests });
      if (response.success) {
        setResult(response.data);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }
  
  const handleReset = () => {
    setResult(null);
    setUserInput(null);
    form.reset();
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-headline text-primary-foreground font-semibold">Authenticating...</h1>
        <p className="text-muted-foreground mt-2">Just a moment, we're checking your credentials.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-headline text-primary-foreground font-semibold">Generating your future...</h1>
        <p className="text-muted-foreground mt-2">Our AI is charting the course for your new career. Hang tight!</p>
      </div>
    );
  }

  if (result && userInput) {
    return <CareerRoadmap data={result} userInput={userInput} onReset={handleReset} />;
  }
  
  const UserMenu = () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
              ) : (
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              )}
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56" align="end" forceMount>
        <div className="flex items-center space-x-2 p-2">
            <Avatar>
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
              ) : (
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className='flex-1'>
                <p className="text-sm font-medium leading-none truncate">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
            </div>
        </div>
        <Button variant="ghost" className="w-full justify-start mt-2" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50">
      <div className="absolute top-4 right-4">
        {user && <UserMenu />}
      </div>
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-4">
            <Compass className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-5xl font-headline font-bold text-slate-800">Career Compass</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Let our AI career counselor guide you to the perfect career path, tailored just for you.
          </p>
        </div>

        <Card className="shadow-2xl shadow-slate-200">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-center">Chart Your Course</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="desiredCareer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Desired Career or Skill</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="e.g., 'Fashion Designer' or 'Graphic Design'" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="currentRole"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Role (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., 'Computer Science Student'" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Interests (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., 'Art, technology, reading'" {...field} className="pl-10" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" className="w-full !mt-8" size="lg" disabled={loading}>
                  Generate My Roadmap
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="w-full max-w-4xl mx-auto mt-20">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-headline font-bold text-slate-800">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">Our Five-Stage Process to Your Career Success</p>
        </div>
        <div className="relative">
          {/* Dotted line */}
          <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 border-l-2 border-dashed border-slate-300" aria-hidden="true"></div>
          
          <div className="space-y-12">
            {processSteps.map((step, index) => {
              const isEven = index % 2 === 0;
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex items-center">
                  <div className={`w-1/2 ${isEven ? 'pr-8' : 'pl-8'}`}>
                    {isEven && (
                       <Card className="shadow-lg">
                          <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-3">
                              <Icon className="h-8 w-8 text-primary" />
                              {step.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{step.description}</p>
                          </CardContent>
                        </Card>
                    )}
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full ring-8 ring-slate-50/50"></div>

                  <div className={`w-1/2 ${isEven ? 'pl-8' : 'pr-8'}`}>
                     {!isEven && (
                       <Card className="shadow-lg">
                          <CardHeader>
                            <CardTitle className="font-headline text-xl flex items-center gap-3">
                              <Icon className="h-8 w-8 text-primary" />
                              {step.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground">{step.description}</p>
                          </CardContent>
                        </Card>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

