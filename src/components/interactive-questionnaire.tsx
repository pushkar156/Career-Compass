
'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Form, FormControl, FormField, FormItem, FormMessage, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';


import { Handshake, Search, Route, ListChecks, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';


const learningStyleOptions = [
    { id: 'visual', label: 'Visual (Videos, Diagrams)' },
    { id: 'auditory', label: 'Auditory (Podcasts, Lectures)' },
    { id: 'reading', label: 'Reading/Writing (Articles, Books)' },
    { id: 'kinesthetic', label: 'Kinesthetic (Hands-on Projects)' },
    { id: 'other', label: 'Other' },
] as const;


const steps = [
  {
    icon: Handshake,
    title: 'Initiation & Rapport Building',
    description: "Let's start with the basics. What's on your mind?",
    schema: z.object({
      name: z.string().min(2, 'Please enter your name.'),
    }),
    defaultValues: { name: '' },
  },
  {
    icon: Search,
    title: 'In-Depth Exploration',
    description: "Let's dig a little deeper into your background and goals.",
    schema: z.object({
      careerGoal: z.string().min(3, 'Please describe your career goal.'),
      currentBackground: z.string().min(3, 'Tell us about your current background.'),
    }),
    defaultValues: { careerGoal: '', currentBackground: '' },
  },
  {
    icon: Route,
    title: 'Decision Making',
    description: 'What are your passions and what do you enjoy doing?',
    schema: z.object({
      interests: z.string().min(5, 'Describe your key interests and hobbies.'),
      skills: z.string().min(5, 'What are some of your strongest skills?'),
    }),
    defaultValues: { interests: '', skills: '' },
  },
  {
    icon: ListChecks,
    title: 'Action Plan Preparation',
    description: 'How do you prefer to learn? Click "Generate Roadmap" when you are ready!',
    schema: z.object({
        learningStyles: z.array(z.string()).refine((value) => value.some((item) => item), {
            message: "You have to select at least one learning style.",
        }),
        otherLearningStyle: z.string().optional(),
        timeCommitment: z.string().min(2, 'e.g., 5 hours/week'),
    }).refine((data) => {
        if (data.learningStyles.includes('other')) {
            return !!data.otherLearningStyle && data.otherLearningStyle.length > 2;
        }
        return true;
    }, {
        message: "Please specify your learning style.",
        path: ["otherLearningStyle"],
    }),
    defaultValues: { learningStyles: [], otherLearningStyle: '', timeCommitment: '' },
  },
];

type FormValues = {
  step1: z.infer<typeof steps[0]['schema']>;
  step2: z.infer<typeof steps[1]['schema']>;
  step3: z.infer<typeof steps[2]['schema']>;
  step4: z.infer<typeof steps[3]['schema']>;
};


export function InteractiveQuestionnaire({ isOpen, onOpenChange, onSubmit }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void; onSubmit: (data: FormValues) => void; }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormValues>>({});

  const currentSchema = steps[currentStep].schema;
  const methods = useForm({
    resolver: zodResolver(currentSchema),
    // Use defaultValues from the current step and ensure they are not undefined
    defaultValues: steps[currentStep].defaultValues,
  });
  
  const watchLearningStyles = methods.watch('learningStyles');

  useEffect(() => {
    // When the step changes, reset the form with the correct default values
    const stepKey = `step${currentStep + 1}` as keyof FormValues;
    const existingDataForStep = formData[stepKey] || {};
    const defaultValues = steps[currentStep].defaultValues;

    // Ensure all default values are non-undefined
    const safeDefaultValues: any = {};
    for (const key in defaultValues) {
        safeDefaultValues[key] = (defaultValues as any)[key] ?? '';
    }
    
    methods.reset({
      ...safeDefaultValues,
      ...existingDataForStep,
    });
  }, [currentStep, methods, formData]);


  const processAndGoNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const stepData = { [`step${currentStep + 1}`]: methods.getValues() };
      const newFormData = { ...formData, ...stepData };
      setFormData(newFormData);

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // This is the final step, call submit
        onSubmit(newFormData as FormValues);
        onOpenChange(false);
        // Reset state for next time
        setTimeout(() => {
            setCurrentStep(0);
            setFormData({});
            methods.reset(steps[0].defaultValues);
        }, 500);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Save current step data before going back
      const stepData = { [`step${currentStep + 1}`]: methods.getValues() };
      setFormData({ ...formData, ...stepData });
      setCurrentStep(currentStep - 1);
    }
  };

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
                name="learningStyles"
                render={() => (
                    <FormItem>
                    <div className="mb-4">
                        <FormLabel className="text-base">How do you learn best?</FormLabel>
                    </div>
                    {learningStyleOptions.map((item) => (
                        <FormField
                        key={item.id}
                        control={methods.control}
                        name="learningStyles"
                        render={({ field }) => {
                            return (
                            <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                            >
                                <FormControl>
                                <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                    return checked
                                        ? field.onChange([...(field.value || []), item.id])
                                        : field.onChange(
                                            (field.value || []).filter(
                                                (value) => value !== item.id
                                            )
                                            );
                                    }}
                                />
                                </FormControl>
                                <FormLabel className="font-normal">
                                {item.label}
                                </FormLabel>
                            </FormItem>
                            );
                        }}
                        />
                    ))}
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                    {watchLearningStyles?.includes('other') && (
                        <div>
                            <FormField
                                control={methods.control}
                                name="otherLearningStyle"
                                render={({ field }) => (
                                    <FormItem className="pl-6 pt-2">
                                        <FormControl>
                                            <Input placeholder="Please specify your learning style" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    )}
            
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
      default:
        return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col" side="right">
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
                    <div
                        key={currentStep}
                        className="space-y-6"
                    >
                        {renderStepContent()}
                    </div>
            </div>

            <div className="p-6 border-t mt-auto bg-slate-50 dark:bg-slate-800/50">
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
                            <Button type="button" onClick={processAndGoNext}>
                                Next
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        ) : (
                            <Button type="button" onClick={processAndGoNext}>
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
