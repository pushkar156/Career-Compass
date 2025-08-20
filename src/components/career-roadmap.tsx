
'use client';

import { useState, useMemo } from 'react';
import type { CareerPathOutput } from '@/ai/flows/career-path-generator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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

export function CareerRoadmap({ data, userInput, onReset }: CareerRoadmapProps) {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const knowledgeAreas = useMemo(() => data.knowledgeAreas || [], [data.knowledgeAreas]);

  const handleTaskToggle = (task: string) => {
    setCompletedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const progress = knowledgeAreas.length > 0 ? (completedTasks.length / knowledgeAreas.length) * 100 : 0;
  
  const getIconForResource = (resource: Resource) => {
    switch (resource.type) {
      case 'video':
        return <Youtube className="h-4 w-4 text-red-500 mr-3 shrink-0" />;
      case 'course':
        return <GraduationCap className="h-4 w-4 text-primary mr-3 shrink-0" />;
      case 'book':
        return <Book className="h-4 w-4 text-primary mr-3 shrink-0" />;
      case 'article':
        return <FileText className="h-4 w-4 text-primary mr-3 shrink-0" />;
      case 'website':
        return <Globe className="h-4 w-4 text-primary mr-3 shrink-0" />;
      default:
        return <BookOpen className="h-4 w-4 text-primary mr-3 shrink-0" />;
    }
  };
  
  const roadmapSteps = useMemo(() => {
    return data.roadmap.split(/\n\s*\d+\.\s*/).filter(n => n.length > 0);
  }, [data.roadmap]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-headline font-bold text-slate-800">Your Custom Roadmap</h1>
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
                  {completedTasks.length} of {knowledgeAreas.length} knowledge areas acquired
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
                     <ol className="list-decimal list-inside space-y-3">
                      {roadmapSteps.map((step, index) => (
                        <li key={index} className="bg-slate-50 p-3 rounded-md">{step}</li>
                      ))}
                    </ol>
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
                    {knowledgeAreas.map((area, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-md">
                        <Checkbox
                          id={`task-${index}`}
                          checked={completedTasks.includes(area)}
                          onCheckedChange={() => handleTaskToggle(area)}
                        />
                        <label
                          htmlFor={`task-${index}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1"
                        >
                          {area}
                        </label>
                      </div>
                    ))}
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
                    <ul className="space-y-3">
                      {(data.resources || []).map((resource, index) => (
                        <li key={index} className="p-3 bg-slate-50 rounded-md transition-all hover:bg-slate-100">
                           <a href={resource.url} target="_blank" rel="noopener noreferrer" className="flex items-start">
                            {getIconForResource(resource)}
                            <div className="flex-1">
                              <span className="font-medium text-sm">{resource.title}</span>
                              {index === 0 && (
                                 <Badge variant="outline" className="ml-2 border-accent text-accent">
                                  <Award className="mr-1 h-3 w-3" /> Expert Pick
                                </Badge>
                              )}
                            </div>
                           </a>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tools" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Essential Tools</CardTitle>
                    <CardDescription>The software and tools you'll need to master for this career.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <ul className="space-y-3">
                      {(data.tools || []).map((tool, index) => (
                        <li key={index} className="flex items-center p-3 bg-slate-50 rounded-md">
                          <Wrench className="h-4 w-4 text-primary mr-3" />
                          <span className="font-medium text-sm">{tool}</span>
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
