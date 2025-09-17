
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Briefcase, Compass, Lightbulb, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AboutPage() {
  const teamMembers = [
    { name: 'Mitali Agarwal', role: 'Senior Developer', seed: 'mitali', fallback: 'MA', hint: 'woman portrait' },
    { name: 'Pushkar Gangurde', role: 'Senior Developer', seed: 'pushkar', fallback: 'PG', hint: 'man portrait' },
    { name: 'Purvesh Gandhi', role: 'Junior Developer', seed: 'purvesh', fallback: 'PG', hint: 'man smiling' },
    { name: 'Atharva Rathi', role: 'Junior Developer', seed: 'atharva', fallback: 'AR', hint: 'man glasses' },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-headline font-bold text-primary">About Career Compass</h1>
          <p className="text-xl text-muted-foreground mt-4">
            Your AI-powered guide to navigating the complexities of modern career paths.
          </p>
        </header>

        <main className="space-y-16">
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-3xl text-center">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-lg text-center text-muted-foreground">
                <p>
                  In a world of ever-evolving industries and countless job titles, finding the right career path can be overwhelming. Career Compass was built to demystify this process. Our mission is to provide clear, personalized, and actionable guidance to students and professionals, empowering them to make informed decisions and confidently pursue their dreams.
                </p>
              </CardContent>
            </Card>
          </section>
          
          <section>
            <h2 className="text-4xl font-headline font-bold text-center mb-8">What We Do</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <Compass size={32} />
                  </div>
                  <CardTitle className="font-headline text-2xl">Career Exploration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Discover new career fields and specific roles that align with your unique interests and background.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <Lightbulb size={32} />
                  </div>
                  <CardTitle className="font-headline text-2xl">Personalized Roadmaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Receive step-by-step learning paths, curated resources, and essential tool recommendations for any role.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardHeader>
                  <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                    <Briefcase size={32} />
                  </div>
                  <CardTitle className="font-headline text-2xl">Market Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gain valuable insights into salary expectations, job market trends, and global opportunities for your chosen career.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-4xl font-headline font-bold text-center mb-8">Meet Our Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.name} className="text-center">
                  <CardHeader>
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/10">
                      <AvatarImage src={`https://picsum.photos/seed/${member.seed}/200`} data-ai-hint={member.hint} />
                      <AvatarFallback>{member.fallback}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-xl">{member.name}</CardTitle>
                    <CardDescription>{member.role}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="text-center">
            <h2 className="text-4xl font-headline font-bold mb-4">Join Our Community</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Whether you're a student planning your future or a professional considering a change, Career Compass is here to support you. Start your journey today and take the first step towards a more fulfilling career.
            </p>
            <div className="mt-8">
                <Users size={40} className="mx-auto text-primary" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
