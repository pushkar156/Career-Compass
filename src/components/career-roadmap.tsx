
'use client';

import { useState, useMemo } from 'react';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  ArrowLeft,
  User,
  Briefcase,
  Sparkles,
  Goal,
  BookOpen,
  Wrench,
  Youtube,
  Award,
  Book,
  Globe,
  FileText,
  GraduationCap,
  ListTree,
  DollarSign,
} from 'lucide-react';

interface CareerRoadmapProps {
  data: CareerPathOutput;
  userInput: {
    desiredCareer: string;
    currentRole?: string;
    interests?: string;
  };
  onReset: () => void;
}

type Resource = CareerPathOutput['resources'][0];
type Tool = CareerPathOutput['tools'][0];

export function CareerRoadmap({ data, userInput, onReset }: CareerRoadmapProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  
  const allKnowledgeAreas = useMemo(() => {
    const beginner = data.knowledgeAreas?.beginnerToIntermediate || [];
    const intermediate = data.knowledgeAreas?.intermediateToPro || [];
    const advanced = data.knowledgeAreas?.proToAdvanced || [];
    return [...beginner, ...intermediate, ...advanced];
  }, [data.knowledgeAreas]);

  const handleTaskToggle = (task: string) => {
    setCompletedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const progress = allKnowledgeAreas.length > 0 ? (completedTasks.length / allKnowledgeAreas.length) * 100 : 0;
  
  const getIconForResource = (resourceType: Resource['type']) => {
    switch (resourceType) {
      case 'video':
        return <Youtube className="h-5 w-5 text-red-500 mr-3 shrink-0" />;
      case 'course':
        return <GraduationCap className="h-5 w-5 text-primary mr-3 shrink-0" />;
      case 'book':
        return <Book className="h-5 w-5 text-primary mr-3 shrink-0" />;
      case 'article':
        return <FileText className="h-5 w-5 text-primary mr-3 shrink-0" />;
      case 'website':
        return <Globe className="h-5 w-5 text-primary mr-3 shrink-0" />;
      default:
        return <BookOpen className="h-5 w-5 text-primary mr-3 shrink-0" />;
    }
  };

  const renderKnowledgeAreaCheckbox = (area: string, index: number) => (
    <div key={index} className="flex items-center space-x-3 bg-slate-100 dark:bg-slate-800 p-3 rounded-md">
      <Checkbox
        id={`task-${area}-${index}`}
        checked={completedTasks.includes(area)}
        onCheckedChange={() => handleTaskToggle(area)}
      />
      <label
        htmlFor={`task-${area}-${index}`}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
      >
        {area}
      </label>
    </div>
  );

  const getBadgeForCost = (cost: Tool['cost']) => {
    switch (cost) {
      case 'Free':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">{cost}</Badge>;
      case 'Paid':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700">{cost}</Badge>;
      case 'Freemium':
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700">{cost}</Badge>;
      default:
        return <Badge variant="outline">{cost}</Badge>;
    }
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900/50 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-bold">Your Custom Roadmap</h1>
            <p className="text-muted-foreground">AI-generated guide for becoming a {userInput.desiredCareer}</p>
          </div>
          <Button variant="outline" onClick={onReset}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Start Over
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <aside className="lg:col-span-1 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><User />Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center">
                  <Goal className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-semibold text-muted-foreground">Desired Career</p>
                    <p className="font-bold">{userInput.desiredCareer}</p>
                  </div>
                </div>
                {userInput.currentRole && (
                  <div className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-semibold text-muted-foreground">Current Role</p>
                      <p>{userInput.currentRole}</p>
                    </div>
                  </div>
                )}
                {userInput.interests && (
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 mr-3 text-primary" />
                    <div>
                      <p className="font-semibold text-muted-foreground">Interests</p>
                      <p>{userInput.interests}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Progress Tracker</CardTitle>
                <CardDescription>
                  {completedTasks.length} of {allKnowledgeAreas.length} knowledge areas acquired
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm mt-2 font-bold text-primary">{Math.round(progress)}% Complete</p>
              </CardContent>
            </Card>
          </aside>

          {/* Right Column */}
          <main className="lg:col-span-2">
            <Tabs defaultValue="learning-path" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="learning-path"><Goal className="mr-2 h-4 w-4" />Learning Path</TabsTrigger>
                <TabsTrigger value="knowledge-areas"><ListTree className="mr-2 h-4 w-4" />Knowledge Areas</TabsTrigger>
                <TabsTrigger value="resources"><BookOpen className="mr-2 h-4 w-4" />Resources</TabsTrigger>
                <TabsTrigger value="tools"><Wrench className="mr-2 h-4 w-4" />Tools</TabsTrigger>
              </TabsList>

              <TabsContent value="learning-path" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Your Step-by-Step Roadmap</CardTitle>
                    <CardDescription>Follow these steps to achieve your career goals. This is your journey!</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="font-bold text-lg">Beginner to Intermediate</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-decimal list-inside space-y-2 pl-4">
                            {data.roadmap?.beginnerToIntermediate?.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="font-bold text-lg">Intermediate to Pro</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-decimal list-inside space-y-2 pl-4">
                            {data.roadmap?.intermediateToPro?.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="font-bold text-lg">Pro to Advanced</AccordionTrigger>
                        <AccordionContent>
                          <ul className="list-decimal list-inside space-y-2 pl-4">
                            {data.roadmap?.proToAdvanced?.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="knowledge-areas" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Key Knowledge Areas</CardTitle>
                    <CardDescription>Check off these areas as you master them.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger className="font-bold text-lg">Beginner to Intermediate</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          {data.knowledgeAreas?.beginnerToIntermediate?.map(renderKnowledgeAreaCheckbox)}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger className="font-bold text-lg">Intermediate to Pro</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          {data.knowledgeAreas?.intermediateToPro?.map(renderKnowledgeAreaCheckbox)}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger className="font-bold text-lg">Pro to Advanced</AccordionTrigger>
                        <AccordionContent className="space-y-3">
                          {data.knowledgeAreas?.proToAdvanced?.map(renderKnowledgeAreaCheckbox)}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Learning Resources</CardTitle>
                    <CardDescription>Curated courses, videos, and articles to help you on your journey.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full space-y-2">
                      {(data.resources || []).map((resource, index) => (
                        <AccordionItem value={`item-${index}`} key={index} className="bg-slate-100 dark:bg-slate-800/50 rounded-md px-4 border">
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <div className="flex items-center text-left">
                              {getIconForResource(resource.type)}
                              <span className="font-medium text-sm flex-1">{resource.title}</span>
                              {index === 0 && (
                                <Badge variant="outline" className="ml-2 border-accent text-accent">
                                  <Award className="mr-1 h-3 w-3" /> Expert Pick
                                </Badge>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            {resource.type === 'video' && resource.videoId ? (
                              <div>
                                <div className="aspect-video w-full overflow-hidden rounded-lg mb-2">
                                  <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${resource.videoId}`}
                                    title={resource.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  ></iframe>
                                </div>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                                  Watch on YouTube &rarr;
                                </a>
                              </div>
                            ) : (
                              <p className="text-sm">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                  Go to resource &rarr;
                                </a>
                              </p>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Essential Tools</CardTitle>
                    <CardDescription>The software and tools you'll need to master for this career, from most to least recommended.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <ul className="space-y-3">
                      {(data.tools || []).map((tool, index) => (
                        <li key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-md border">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Wrench className="h-5 w-5 text-primary mr-3" />
                                <span className="font-semibold text-base">{tool.name}</span>
                            </div>
                            {getBadgeForCost(tool.cost)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2 ml-8">{tool.description}</p>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
