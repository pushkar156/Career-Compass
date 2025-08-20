'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Compass, Briefcase, Sparkles, Lightbulb, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateCareerPathAction } from '@/app/actions';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';
import { CareerRoadmap } from '@/components/career-roadmap';

const FormSchema = z.object({
  desiredCareer: z.string().min(3, {
    message: 'Desired career must be at least 3 characters.',
  }),
  currentRole: z.string().optional(),
  interests: z.string().optional(),
});

type UserInput = z.infer<typeof FormSchema>;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CareerPathOutput | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const { toast } = useToast();

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
      const response = await generateCareerPathAction({ career: data.desiredCareer });
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
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
    </div>
  );
}
