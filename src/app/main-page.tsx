
'use client';

import { useState, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Compass, Briefcase, Sparkles, Lightbulb, Loader2, LogOut, User, Handshake, Search, Route, ListChecks, CheckCircle, ArrowRight, ArrowLeft, GraduationCap, TrendingUp, DollarSign, Globe, Building, MapPin, BarChart, PieChart, Moon, Sun, Check } from 'lucide-react';
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
import { useAuth } from '@/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { InteractiveQuestionnaire } from '@/components/interactive-questionnaire';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


const FormSchema = z.object({
  desiredCareer: z.string().min(3, {
    message: 'Desired career must be at least 3 characters.',
  }),
  currentRole: z.string().optional(),
  interests: z.string().optional(),
});

type UserInput = z.infer<typeof FormSchema>;

export default function MainPage() {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<'exploring' | 'generating' | 'fetching_opportunities' | null>(null);
  const [explorationResult, setExplorationResult] = useState<CareerExplorationOutput | null>(null);
  const [opportunitiesResult, setOpportunitiesResult] = useState<CareerOpportunitiesOutput | null>(null);
  const [finalResult, setFinalResult] = useState<CareerPathOutput | null>(null);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, loading: authLoading, signOut } = useAuth();
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
              <header className="mb-8">
                  <Button variant="ghost" onClick={onReset} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Start a new search</Button>
                  <h1 className="text-4xl font-headline font-bold">Explore: {userInput.desiredCareer}</h1>
                  <p className="text-muted-foreground mt-2">{data.description}</p>
              </header>

              <main>
                  <h2 className="text-2xl font-headline font-semibold mb-4">Specific Roles & Specializations</h2>
                  <p className="text-muted-foreground mb-6">
                      This is your starting point. Select a role below to generate a detailed, step-by-step learning roadmap.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.specificRoles.map(role => (
                          <Card key={role} className="hover:shadow-lg hover:border-primary transition-all cursor-pointer group" onClick={() => onSelectRole(role)}>
                              <CardContent className="p-6 flex items-center justify-between">
                                  <div className="flex items-center">
                                      <div className="p-3 bg-primary/10 rounded-lg mr-4">
                                          <GraduationCap className="h-6 w-6 text-primary" />
                                      </div>
                                      <h3 className="font-semibold text-base">{role}</h3>
                                  </div>
                                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </CardContent>
                          </Card>
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Role Selection</Button>
                    <h1 className="text-4xl font-headline font-bold">Career Opportunities: {role}</h1>
                    <p className="text-muted-foreground mt-2">An AI-powered analysis of the job market and future trends for this role.</p>
                </header>

                <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <Card className="lg:col-span-2">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <TrendingUp className="h-8 w-8 text-primary" />
                            <div>
                                <CardTitle className="font-headline text-2xl">The Future Outlook</CardTitle>
                                <CardDescription>Upcoming trends and the long-term trajectory for {role}s.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <ul className="space-y-3">
                                {data.upcomingOpportunities.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                                        <span className="text-muted-foreground">{point}</span>
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
                            <ChartContainer config={chartConfig} className="h-64 w-full">
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
                                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                            return (
                                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
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
                           <ul className="space-y-3">
                                {data.existingJobMarket.summary.map((point, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-primary mt-1 shrink-0" />
                                        <span className="text-muted-foreground">{point}</span>
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
                                    <li key={region.name} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-md">
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-background">
        <div className="w-full max-w-4xl mx-auto text-center">
            <Button variant="ghost" onClick={onBack} className="absolute top-6 left-6"><ArrowLeft className="mr-2 h-4 w-4"/>Back to exploration</Button>
            <div className="text-center mb-10">
                <h1 className="text-5xl font-headline font-bold">You've selected: {role}</h1>
                <p className="mt-4 text-lg text-muted-foreground">What would you like to do next?</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-2xl shadow-slate-200 dark:shadow-black/20 text-center p-8 hover:shadow-primary/20 transition-shadow">
                    <CardHeader>
                        <Route className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="font-headline text-3xl">Custom Roadmap</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Generate a personalized, step-by-step learning path to master this role.
                        </p>
                        <Button size="lg" onClick={onGenerateRoadmap}>
                            Create My Plan
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
                <Card className="shadow-2xl shadow-slate-200 dark:shadow-black/20 text-center p-8 hover:shadow-primary/20 transition-shadow">
                    <CardHeader>
                        <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
                        <CardTitle className="font-headline text-3xl">Explore Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-6">
                            Get insights into job trends, salary expectations, and market demand for this role.
                        </p>
                        <Button size="lg" onClick={onExploreOpportunities}>
                            Analyze Career
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );

  async function onExploreSubmit(data: UserInput) {
    setLoading(true);
    setLoadingStage('exploring');
    setFinalResult(null);
    setExplorationResult(null);
    setUserInput(data);
    try {
      const response = await exploreCareerAction({ career: data.desiredCareer });

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

  async function onGenerateRoadmap(specificRole: string) {
    if (!userInput) return;
    setLoading(true);
    setLoadingStage('generating');
    setFinalResult(null);
    
    const updatedInput = { ...userInput, desiredCareer: specificRole };
    setUserInput(updatedInput);

    try {
      const response = await generateCareerPathAction({ 
        career: specificRole, 
        currentRole: userInput.currentRole, 
        interests: userInput.interests 
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
      setFinalResult(null);
      // This is tricky. We need to re-run the exploration.
      // For now, let's just go back to the beginning of the "direct" path
      setSelectedRole(null);
      setExplorationResult(null); // This will show the input form again if userInput is set.
      if (!userInput) { // If for some reason userInput is gone, go all the way back
          setUserPath(null);
      }
  }

  const handleBackToRoleSelection = () => {
      setOpportunitiesResult(null);
      setExplorationResult(null); // Don't show exploration result
      setSelectedRole(selectedRole); // Stay on role selection by keeping selectedRole
  }

  const handleQuestionnaireSubmit = (data: any) => {
    const learningStyles = data.step4.learningStyles?.includes('other') 
      ? [...data.step4.learningStyles.filter((s: string) => s !== 'other'), data.step4.otherLearningStyle]
      : data.step4.learningStyles;

    const mappedData: UserInput = {
      desiredCareer: data.step2.careerGoal,
      currentRole: data.step2.currentBackground,
      interests: `${data.step3.interests}, ${data.step3.skills}, Prefers learning styles: ${learningStyles.join(', ')}`,
    }
    form.reset(mappedData);
    onExploreSubmit(mappedData);
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-headline font-semibold">Authenticating...</h1>
        <p className="text-muted-foreground mt-2">Just a moment, we're checking your credentials.</p>
      </div>
    );
  }

  if (loading) {
    let message = 'Our AI is charting the course for your new career. Hang tight!';
    if (loadingStage === 'fetching_opportunities') message = 'Analyzing job market data...';

    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <h1 className="text-2xl font-headline font-semibold">
          {loadingStage === 'exploring' && 'Exploring possibilities...'}
          {loadingStage === 'generating' && 'Generating your future...'}
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
      return <RoleSelectionScreen role={selectedRole} onGenerateRoadmap={() => onGenerateRoadmap(selectedRole)} onExploreOpportunities={() => onExploreOpportunities(selectedRole)} onBack={handleBackToExplore} />
  }

  if (explorationResult && userInput) {
    return <CareerExplorationResult 
                data={explorationResult} 
                userInput={userInput}
                onSelectRole={handleSelectRole}
                onReset={handleReset}
            />;
  }
  
  const ThemeToggle = () => {
    const { setTheme } = useTheme()
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
    )
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
            <div className='flex-1 min-w-0'>
                <p className="text-sm font-medium leading-none truncate">{user?.displayName}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">{user?.email}</p>
            </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
          <ThemeToggle />
        </div>
      </PopoverContent>
    </Popover>
  );

  const PathSelection = () => (
    <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
            <h1 className="text-5xl font-headline font-bold">Welcome, {user?.displayName || 'Explorer'}!</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                How would you like to start your journey today?
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-2xl shadow-slate-200 dark:shadow-black/20 text-center p-8 hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                    <Search className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="font-headline text-3xl">Explore Career Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Not sure where to start? Let's discover your passions and find career paths that match your interests.
                    </p>
                    <Button size="lg" onClick={() => setUserPath('explore')}>
                        Guide Me
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
            <Card className="shadow-2xl shadow-slate-200 dark:shadow-black/20 text-center p-8 hover:shadow-primary/20 transition-shadow">
                <CardHeader>
                    <Route className="h-12 w-12 text-primary mx-auto mb-4" />
                    <CardTitle className="font-headline text-3xl">I Know My Path</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-6">
                        Already have a dream job in mind? Get a detailed, step-by-step roadmap to make it a reality.
                    </p>
                    <Button size="lg" onClick={() => setUserPath('direct')}>
                        Show Me The Way
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );

  const DirectInputPath = () => (
    <div className="w-full max-w-2xl mx-auto">
        <Button variant="ghost" onClick={() => setUserPath(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Back to choices</Button>
        <Card className="shadow-2xl shadow-slate-200 dark:shadow-black/20">
            <CardHeader>
                <CardTitle className="font-headline text-2xl text-center">Chart Your Course</CardTitle>
                <CardDescription className="text-center">Tell us your goal, and we'll build the roadmap.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onExploreSubmit)} className="space-y-6">
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
                    Explore Career
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </div>
  );
  
  const ExplorationPath = () => (
     <div className="w-full max-w-4xl mx-auto text-center">
        <Button variant="ghost" onClick={() => setUserPath(null)} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4"/>Back to choices</Button>
        <div className="text-center mb-12">
          <h2 className="text-4xl font-headline font-bold">Your Guided Journey</h2>
          <p className="mt-4 text-lg text-muted-foreground">Answer a few questions to build a hyper-personalized career plan.</p>
        </div>
        <Card className="shadow-2xl shadow-slate-200 dark:shadow-black/20 text-center p-8">
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50/50 dark:bg-background">
        <div className="absolute top-4 right-4">
            {user && <UserMenu />}
        </div>
        
        <div className="w-full flex-1 flex items-center justify-center">
            {!userPath && <PathSelection />}
            {userPath === 'direct' && <DirectInputPath />}
            {userPath === 'explore' && <ExplorationPath />}
        </div>
    </div>

    <InteractiveQuestionnaire 
        isOpen={isQuestionnaireOpen} 
        onOpenChange={setIsQuestionnaireOpen}
        onSubmit={handleQuestionnaireSubmit}
    />
    </>
  );
}
