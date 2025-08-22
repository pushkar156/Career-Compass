
'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

import { Handshake, Search, Route, ListChecks, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';


const steps = [
  {
    icon: Handshake,
    title: 'Initiation & Rapport Building',
    description: "Let's start with the basics. What's on your mind?",
    schema: z.object({
      name: z.string().min(2, 'Please enter your name.'),
    }),
  },
  {
    icon: Search,
    title: 'In-Depth Exploration',
    description: "Let's dig a little deeper into your background and goals.",
    schema: z.object({
      careerGoal: z.string().min(3, 'Please describe your career goal.'),
      currentBackground: z.string().min(3, 'Tell us about your current background.'),
    }),
  },
  {
    icon: Route,
    title: 'Decision Making',
    description: 'What are your passions and what do you enjoy doing?',
    schema: z.object({
      interests: z.string().min(5, 'Describe your key interests and hobbies.'),
      skills: z.string().min(5, 'What are some of your strongest skills?'),
    }),
  },
  {
    icon: ListChecks,
    title: 'Action Plan Preparation',
    description: 'How do you prefer to learn?',
    schema: z.object({
      learningStyle: z.string().min(3, 'e.g., videos, articles, hands-on projects'),
      timeCommitment: z.string().min(2, 'e.g., 5 hours/week'),
    }),
  },
  {
    icon: CheckCircle,
    title: 'Implementation & Success',
    description: "Let's confirm and get started!",
    schema: z.object({
        confirmation: z.boolean().refine(val => val === true, { message: 'Please confirm to proceed.' })
    }),
  },
];

type FormValues = {
  step1: z.infer<typeof steps[0]['schema']>;
  step2: z.infer<typeof steps[1]['schema']>;
  step3: z.infer<typeof steps[2]['schema']>;
  step4: z.infer<typeof steps[3]['schema']>;
  step5: z.infer<typeof steps[4]['schema']>;
};


export function InteractiveQuestionnaire({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; onSubmit: (data: FormValues) => void; }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormValues>>({});

  const currentSchema = steps[currentStep].schema;
  const methods = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: (formData as any)[`step${currentStep + 1}`] || {},
  });


  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const stepData = { [`step${currentStep + 1}`]: methods.getValues() };
      setFormData(prev => ({ ...prev, ...stepData }));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleFormSubmit = () => {
     const finalData = { ...formData, [`step${currentStep + 1}`]: methods.getValues() } as FormValues;
     onSubmit(finalData);
     onOpenChange(false);
     // Reset state for next time
     setCurrentStep(0);
     setFormData({});
  }

  const progress = ((currentStep + 1) / steps.length) * 100;
  const Icon = steps[currentStep].icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <FormField
            control={methods.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label>What should we call you?</Label>
                <FormControl>
                  <Input placeholder="e.g., Alex" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case 1:
        return (
          <>
            <FormField
              control={methods.control}
              name="careerGoal"
              render={({ field }) => (
                <FormItem>
                  <Label>What is your main career goal right now?</Label>
                  <FormControl>
                    <Input placeholder="e.g., 'Become a UX Designer'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={methods.control}
              name="currentBackground"
              render={({ field }) => (
                <FormItem>
                  <Label>What is your current role or educational background?</Label>
                  <FormControl>
                    <Input placeholder="e.g., 'Graphic Design Student'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );
      case 2:
        return (
            <>
                <FormField
                    control={methods.control}
                    name="interests"
                    render={({ field }) => (
                        <FormItem>
                            <Label>What are your personal interests or hobbies?</Label>
                            <FormControl>
                                <Textarea placeholder="e.g., Painting, hiking, building PCs..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={methods.control}
                    name="skills"
                    render={({ field }) => (
                        <FormItem>
                            <Label>What skills are you most proud of?</Label>
                            <FormControl>
                                <Textarea placeholder="e.g., Communication, problem-solving, Photoshop..." {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            </>
        );
      case 3:
        return (
            <>
                <FormField
                    control={methods.control}
                    name="learningStyle"
                    render={({ field }) => (
                        <FormItem>
                            <Label>How do you learn best?</Label>
                            <FormControl>
                                <Input placeholder="e.g., Reading books, watching tutorials, project-based" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={methods.control}
                    name="timeCommitment"
                    render={({ field }) => (
                        <FormItem>
                            <Label>How much time can you commit per week?</Label>
                            <FormControl>
                                <Input placeholder="e.g., 3-5 hours" {...field} />
                            </FormControl>
                             <FormMessage />
                        </FormItem>
                    )}
                />
            </>
        );
      case 4:
          return (
            <FormField
                control={methods.control}
                name="confirmation"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                        <FormControl>
                            <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <Label>
                               I'm ready to generate my personalized career roadmap!
                            </Label>
                        </div>
                         <FormMessage />
                    </FormItem>
                )}
            />
          );
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0">
        <FormProvider {...methods}>
          <form className="flex flex-col h-full" onSubmit={(e) => e.preventDefault()}>
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="font-headline text-2xl flex items-center gap-3">
                <Icon className="h-8 w-8 text-primary shrink-0" />
                {steps[currentStep].title}
              </SheetTitle>
              <SheetDescription>{steps[currentStep].description}</SheetDescription>
            </SheetHeader>

            <div className="p-6 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {renderStepContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="p-6 border-t mt-auto bg-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                         {currentStep > 0 && (
                            <Button type="button" variant="outline" onClick={handleBack}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                         <Progress value={progress} className="w-32" />
                         {currentStep < steps.length - 1 ? (
                            <Button type="button" onClick={handleNext}>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="button" onClick={handleFormSubmit}>
                                Generate Roadmap
                                <CheckCircle className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
}

