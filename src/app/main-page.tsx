
'use client';

import { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Compass, Briefcase, Sparkles, Lightbulb, Loader2, User, Handshake, Search, Route, ListChecks, CheckCircle, ArrowRight, ArrowLeft, GraduationCap, TrendingUp, DollarSign, Globe, Building, MapPin, BarChart, PieChart, Moon, Sun, Check, BookCopy } from 'lucide-react';
import { Bar, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, PieChart as RechartsPieChart, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useTheme } from "next-themes"

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateCareerPathAction, exploreCareerAction, getCareerOpportunitiesAction } from '@/app/actions';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';
import type { CareerExplorationOutput } from '@/ai/flows/career-explorer';
import type { CareerOpportunitiesOutput } from '@/ai/flows/career-opportunities';
import { CareerRoadmap } from '@/components/career-roadmap';
import { InteractiveQuestionnaire } from '@/components/interactive-questionnaire';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';


const FormSchema = z.object({
  desiredCareer: z.string().min(3, {
    message: 'Desired career must be at least 3 characters.',
  }),
  currentRole: z.string().optional(),
  interests: z.string().optional(),
});

type UserInput = z.infer<typeof FormSchema>;

// Moved InputForm outside of MainPage to prevent re-renders and focus loss
const InputForm = ({ 
    form, 
    onSubmit, 
    loading,
    userPath,
    setUserPath,
  }: { 
    form: UseFormReturn<UserInput>,
    onSubmit: (data: UserInput) => void,
    loading: boolean,
    userPath: 'direct' | 'explore' | null,
    setUserPath: (path: 'direct' | 'explore' | null) => void,
  }) => (
    <div className="w-full max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setUserPath(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Back to choices</Button>
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">
                    {userPath === 'direct' ? 'Chart Your Course' : 'Explore Your Options'}
                </CardTitle>
                <CardDescription className="text-center">
                    {userPath === 'direct' 
                        ? "Tell us your goal, and we'll explore roles within that field." 
                        : "Tell us about a field you're curious about."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="desiredCareer"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Your Desired Career or Field</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <Lightbulb className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="e.g., 'Software Engineering' or 'Digital Marketing'" {...field} className="pl-10" />
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
                                <Input placeholder="e.g., '12th class student'" {...field} className="pl-10" />
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
                        Explore Roles
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
);

export default function MainPage() {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'exploring' | 'generating' | 'fetching_opportunities' | null>(null);
  const [explorationResult, setExplorationResult] = useState<CareerExplorationOutput | null>(null);
  const [opportunitiesResult, setOpportunitiesResult] = useState<CareerOpportunitiesOutput | null>(null);
  const [finalResult, setFinalResult] = useState<CareerPathOutput | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const [userPath, setUserPath] = useState<'explore' | 'direct' | null>(null);

  const form = useForm<UserInput>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      desiredCareer: '',
      currentRole: '',
      interests: '',
    },
  });
  
  const CareerExplorationResult = ({ data, userInput, onSelectRole, onReset }: { 
      data: CareerExplorationOutput, 
      userInput: UserInput, 
      onSelectRole: (role: string) => void,
      onReset: () => void 
  }) => (
      <div className="min-h-screen p-4 sm:p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
              <header className="mb-8">
                  <Button variant="ghost" onClick={onReset} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Start a new search</Button>
                  <h1 className="text-4xl font-headline font-bold">Explore: {userInput.desiredCareer}</h1>
                  <p className="text-muted-foreground mt-2">{data.description}</p>
              </header>

              <main>
                  {data.interestSuggestions && data.interestSuggestions.length > 0 && (
                      <section className="mb-12">
                          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
                              <Sparkles className="h-6 w-6 text-primary mr-2" />
                              According to Your Interests
                          </h2>
                          <div className="space-y-4">
                              {data.interestSuggestions.map((suggestion, index) => (
                                  <Card key={index}>
                                      <CardHeader>
                                          <CardTitle className="font-headline text-xl">Because you're interested in "{suggestion.interest}"...</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                          <p className="text-muted-foreground mb-4">{suggestion.guidance}</p>
                                          <h4 className="font-semibold mb-2">Related Roles to Explore:</h4>
                                          <div className="flex flex-wrap gap-2">
                                              {suggestion.relatedRoles.map(role => (
                                                  <Badge 
                                                    key={role} 
                                                    variant="secondary" 
                                                    className="cursor-pointer hover:bg-primary/20"
                                                    onClick={() => onSelectRole(role)}
                                                  >
                                                      {role}
                                                  </Badge>
                                              ))}
                                          </div>
                                      </CardContent>
                                  </Card>
                              ))}
                          </div>
                          <hr className="my-8 border-border/50" />
                      </section>
                  )}


                  {data.academicSuggestions && data.academicSuggestions.length > 0 && (
                      <section className="mb-12">
                          <h2 className="text-2xl font-headline font-semibold mb-4 flex items-center">
                              <GraduationCap className="h-6 w-6 text-primary mr-2" />
                              Academic & Competitive Suggestions
                          </h2>
                          <p className="text-muted-foreground mb-6">
                              Based on your current stage, here are some popular and relevant next steps to consider for a career in "{userInput.desiredCareer}".
                          </p>
                          <Accordion type="single" collapsible className="w-full">
                              {data.academicSuggestions.map((suggestion, index) => (
                                  <AccordionItem value={`item-${index}`} key={index}>
                                      <AccordionTrigger className="text-left">
                                          <span className="font-medium text-base flex-1">{suggestion.title}</span>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                          {suggestion.description}
                                      </AccordionContent>
                                  </AccordionItem>
                              ))}
                          </Accordion>
                      </section>
                  )}


                  <h2 className="text-2xl font-headline font-semibold mb-4">Specific Roles & Specializations</h2>
                  <p className="text-muted-foreground mb-6">
                      This is your starting point. Select a role below to generate a detailed, step-by-step learning roadmap.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.specificRoles.map(role => (
                        <motion.div
                          key={role}
                          whileHover={{ scale: 1.03, y: -5 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Card className="hover:shadow-lg hover:border-primary/50 group cursor-pointer h-full" onClick={() => onSelectRole(role)}>
                              <CardContent className="p-6 flex items-center justify-between">
                                  <h3 className="font-semibold text-base">{role}</h3>
                                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                              </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                  </div>
              </main>
          </div>
      </div>
  );

  const CareerOpportunitiesResult = ({ data, role, onBack }: { data: CareerOpportunitiesOutput, role: string, onBack: () => void }) => {
    const payScaleData = useMemo(() => [
        { level: 'Entry-Level', range: data.payScale.ranges.entry, fill: "hsl(var(--chart-1))" },
        { level: 'Mid-Level', range: data.payScale.ranges.mid, fill: "hsl(var(--chart-2))" },
        { level: 'Senior-Level', range: data.payScale.ranges.senior, fill: "hsl(var(--chart-3))" },
    ], [data.payScale.ranges]);

    const chartConfig = {
        entry: { label: "Entry-Level", color: "hsl(var(--chart-1))" },
        mid: { label: "Mid-Level", color: "hsl(var(--chart-2))" },
        senior: { label: "Senior-Level", color: "hsl(var(--chart-3))" },
    };

    const industryChartConfig = useMemo(() => {
        const config: any = {};
        data.existingJobMarket.industryDistribution.forEach((item, index) => {
            config[item.name] = {
                label: item.name,
                color: `hsl(var(--chart-${index + 1}))`
            }
        });
        return config;
    }, [data.existingJobMarket.industryDistribution]);
    
    const COLORS = useMemo(() => data.existingJobMarket.industryDistribution.map((_, index) => `hsl(var(--chart-${index + 1}))`), [data.existingJobMarket.industryDistribution]);


    return (
        <div className="min-h-screen p-4 sm:p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Role Selection</Button>
                    <h1 className="text-4xl font-headline font-bold">Career Opportunities: {role}</h1>
                    <p className="text-muted-foreground mt-2">An analysis of the job market and future trends for this role.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><TrendingUp />The Future Outlook</CardTitle>
                            <CardDescription>Upcoming trends and the long-term trajectory for {role}s.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                                {data.upcomingOpportunities.map((point, index) => (
                                    <li key={index}>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><DollarSign />Pay Scale Analysis</CardTitle>
                            <CardDescription>{data.payScale.summary}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="h-72 w-full">
                                <RechartsBarChart 
                                    data={payScaleData}
                                    layout="vertical"
                                    margin={{ left: 10, right: 10 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <XAxis type="number" dataKey="range.max" tickFormatter={(value) => `$${value/1000}k`} />
                                    <YAxis type="category" dataKey="level" tickLine={false} axisLine={false} width={80} />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="p-2 bg-background border rounded-lg shadow-sm">
                                                        <p className="font-bold">{data.level}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            ${data.range.min.toLocaleString()} - ${data.range.max.toLocaleString()}
                                                        </p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="range.max" name="Max Salary" radius={4}>
                                        {payScaleData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </RechartsBarChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className="font-headline text-2xl flex items-center gap-2"><PieChart />Job Market Distribution</CardTitle>
                             <CardDescription>Top industries hiring for the "{role}" role.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <ChartContainer config={industryChartConfig} className="h-64 w-full">
                                <RechartsPieChart>
                                    <RechartsTooltip 
                                        content={<ChartTooltipContent nameKey="name" />}
                                    />
                                    <Legend />
                                    <Pie 
                                        data={data.existingJobMarket.industryDistribution}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                                            const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                                            return (
                                            <text x={x} y={y} fill="hsl(var(--background))" textAnchor="middle" dominantBaseline="central" className="text-xs font-bold">
                                                {`${(percent * 100).toFixed(0)}%`}
                                            </text>
                                            );
                                        }}
                                    >
                                        {data.existingJobMarket.industryDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </RechartsPieChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Building />Current Market Overview</CardTitle>
                            <CardDescription>A summary of today's job landscape.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-3 list-disc list-inside text-muted-foreground">
                                {data.existingJobMarket.summary.map((point, index) => (
                                    <li key={index}>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className="font-headline text-2xl flex items-center gap-2"><Globe />Global Opportunities</CardTitle>
                             <CardDescription>Where this role is in high demand across the world.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground mb-4">{data.globalOpportunities.summary}</p>
                            <ul className="space-y-2">
                                {data.globalOpportunities.topRegions.map(region => (
                                    <li key={region.name} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <span className="font-semibold">{region.name}</span>
                                        </div>
                                        <Badge variant={region.demand === 'High' ? 'default' : 'secondary'}>{region.demand} Demand</Badge>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                </main>
            </div>
        </div>
    );
  }

  const RoleSelectionScreen = ({ role, onGenerateRoadmap, onExploreOpportunities, onBack }: { role: string; onGenerateRoadmap: () => void; onExploreOpportunities: () => void; onBack: () => void; }) => (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <Button variant="ghost" onClick={onBack} className="absolute top-24 left-6"><ArrowLeft className="mr-2 h-4 w-4"/>Back to exploration</Button>
        <div className="text-center mb-10">
            <h1 className="text-5xl font-headline font-bold">You've selected: {role}</h1>
            <p className="mt-4 text-lg text-muted-foreground">What would you like to do next?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="text-center p-8 h-full flex flex-col">
                    <CardHeader>
                        <Route className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="font-headline text-3xl">Custom Roadmap</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <p className="text-muted-foreground mb-6">
                            Generate a personalized, step-by-step learning path to master this role.
                        </p>
                        <Button size="lg" onClick={onGenerateRoadmap}>
                            Create My Plan
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="text-center p-8 h-full flex flex-col">
                    <CardHeader>
                        <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="font-headline text-3xl">Explore Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <p className="text-muted-foreground mb-6">
                            Get insights into job trends, salary expectations, and market demand for this role.
                        </p>
                        <Button size="lg" onClick={onExploreOpportunities}>
                            Analyze Career
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    </div>
  );

  async function onSubmit(data: UserInput) {
    setLoading(true);
    setLoadingStage('exploring');
    setFinalResult(null);
    setExplorationResult(null);
    setUserInput(data);

    try {
      const response = await exploreCareerAction({ career: data.desiredCareer, currentRole: data.currentRole, interests: data.interests });

      if (response.success) {
        setExplorationResult(response.data);
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
        description: 'An unexpected error occurred during exploration. Please try again.',
      });
    } finally {
      setLoading(false);
      setLoadingStage(null);
    }
  }

  async function onGenerateRoadmap(specificRole: string, currentData: UserInput | null) {
    const finalUserInput = currentData || userInput;
    if (!finalUserInput) return;

    setLoading(true);
    setLoadingStage('generating');
    setFinalResult(null);
    
    const updatedInput = { ...finalUserInput, desiredCareer: specificRole };
    setUserInput(updatedInput);

    try {
      const response = await generateCareerPathAction({ 
        career: specificRole, 
        currentRole: finalUserInput.currentRole, 
        interests: finalUserInput.interests 
      });

      if (response.success) {
        setFinalResult(response.data);
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
        description: 'An unexpected error occurred while generating the roadmap. Please try again.',
      });
    } finally {
      setLoading(false);
      setLoadingStage(null);
    }
  }

  async function onExploreOpportunities(specificRole: string) {
      setLoading(true);
      setLoadingStage('fetching_opportunities');
      setOpportunitiesResult(null);
      try {
          const response = await getCareerOpportunitiesAction({ specificRole });
          if (response.success) {
              setOpportunitiesResult(response.data);
          } else {
              toast({ variant: 'destructive', title: 'Error', description: response.error });
          }
      } catch (error) {
          toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred. Please try again.' });
      } finally {
          setLoading(false);
          setLoadingStage(null);
      }
  }
  
  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setExplorationResult(null); // Move to the selection screen
  }

  const handleReset = () => {
    setFinalResult(null);
    setExplorationResult(null);
    setUserInput(null);
    setUserPath(null);
    setSelectedRole(null);
    setOpportunitiesResult(null);
    form.reset();
  };
  
  const handleBackToExplore = () => {
      setSelectedRole(null);
      setOpportunitiesResult(null);
      if (userInput) {
          onSubmit(userInput);
      }
  }

  const handleBackToRoleSelection = () => {
      setOpportunitiesResult(null); // Clear opportunities result
  }

  const handleQuestionnaireSubmit = (data: any) => {
    const learningStyles = data.step4.learningStyles?.includes('other') 
      ? [...data.step4.learningStyles.filter((s: string) => s !== 'other'), data.step4.otherLearningStyle]
      : data.step4.learningStyles;

    const mappedData: UserInput = {
      desiredCareer: data.step2.careerGoal,
      currentRole: data.step2.currentBackground,
      interests: `Interests: ${data.step3.interests}. Skills: ${data.step3.skills}. Prefers learning styles: ${learningStyles.join(', ')}.`,
    }
    form.reset(mappedData);
    onSubmit(mappedData);
    setIsQuestionnaireOpen(false);
  }

  if (loading) {
    let message = 'Charting the course for your new career. Hang tight!';
    if (loadingStage === 'generating') message = 'Building your personalized roadmap...';
    if (loadingStage === 'exploring') message = 'Discovering career paths based on your interests...';
    if (loadingStage === 'fetching_opportunities') message = 'Analyzing job market data...';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-headline font-semibold">
          {loadingStage === 'exploring' && 'Exploring Possibilities...'}
          {loadingStage === 'generating' && 'Generating Your Future...'}
          {loadingStage === 'fetching_opportunities' && 'Gathering Insights...'}
        </h1>
        <p className="text-muted-foreground mt-2">{message}</p>
      </div>
    );
  }

  if (finalResult && userInput) {
    return <CareerRoadmap data={finalResult} userInput={userInput} onReset={handleReset} />;
  }
  
  if (opportunitiesResult && selectedRole) {
      return <CareerOpportunitiesResult data={opportunitiesResult} role={selectedRole} onBack={handleBackToRoleSelection} />;
  }

  if (selectedRole) {
      return <RoleSelectionScreen role={selectedRole} onGenerateRoadmap={() => onGenerateRoadmap(selectedRole, userInput)} onExploreOpportunities={() => onExploreOpportunities(selectedRole)} onBack={handleBackToExplore} />
  }

  if (explorationResult && userInput) {
    return <CareerExplorationResult 
                data={explorationResult} 
                userInput={userInput}
                onSelectRole={handleSelectRole}
                onReset={handleReset}
            />;
  }
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  const PathSelection = () => (
    <motion.div 
        className="text-center max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
    >
        <motion.h1 variants={itemVariants} className="text-5xl font-headline font-bold">Welcome, Explorer!</motion.h1>
        <motion.p variants={itemVariants} className="mt-4 text-lg text-muted-foreground">
            How would you like to start your journey today?
        </motion.p>
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="text-center p-8 h-full flex flex-col">
                    <CardHeader>
                        <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="font-headline text-3xl">Explore Career Options</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <p className="text-muted-foreground mb-6">
                            Not sure where to start? Discover your passions and find career paths that match your interests.
                        </p>
                        <Button size="lg" onClick={() => setUserPath('explore')}>
                            Guide Me
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05, y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <Card className="text-center p-8 h-full flex flex-col">
                    <CardHeader>
                        <Route className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="font-headline text-3xl">I Know My Path</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-between">
                        <p className="text-muted-foreground mb-6">
                            Already have a dream job in mind? Get a detailed, step-by-step roadmap to make it a reality.
                        </p>
                        <Button size="lg" onClick={() => setUserPath('direct')}>
                            Show Me The Way
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    </motion.div>
  );

  
  const ExplorationPath = () => (
     <div className="w-full max-w-4xl mx-auto text-center">
        <Button variant="ghost" onClick={() => setUserPath(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Back to choices</Button>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-headline font-bold">Your Guided Journey</h2>
          <p className="mt-4 text-lg text-muted-foreground">Answer a few questions to build a hyper-personalized career plan.</p>
        </div>
        <Card className="text-center p-8">
            <CardHeader>
                <Handshake className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle className="font-headline text-3xl">Let's Get to Know You</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Ready to find your calling? We'll walk you through a simple, 4-step process to explore your passions, define your goals, and create a custom-built action plan for your dream career.
                </p>
                <Button size="lg" onClick={() => setIsQuestionnaireOpen(true)}>
                    Start My Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardContent>
        </Card>
      </div>
  );


  return (
    <>
    <div className="min-h-screen flex items-center justify-center p-4">
        
        {!userPath && <PathSelection />}
        {userPath === 'direct' && <InputForm form={form} onSubmit={onSubmit} loading={loading} userPath={userPath} setUserPath={setUserPath} />}
        {userPath === 'explore' && <ExplorationPath />}
    </div>

    <InteractiveQuestionnaire 
        isOpen={isQuestionnaireOpen} 
        onOpenChange={setIsQuestionnaireOpen}
        onSubmit={handleQuestionnaireSubmit}
    />
    </>
  );
}

    
