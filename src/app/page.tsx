import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ShieldCheck, BarChart3, Wrench, ArrowRight, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const navItems = [
    {
      title: 'Admin',
      description: 'Manage users and settings.',
      href: '/admin',
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
    },
    {
      title: 'Production Team',
      description: 'View production reports.',
      href: '/production',
      icon: <BarChart3 className="w-8 h-8 text-primary" />,
    },
    {
      title: 'Machine Selection',
      description: 'Select a machine to operate.',
      href: '/machine',
      icon: <Cog className="w-8 h-8 text-primary" />,
    },
    {
      title: 'Operator',
      description: 'Input daily production data.',
      href: '/operator',
      icon: <Wrench className="w-8 h-8 text-primary" />,
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl font-bold text-primary">Breaker Tracker</h1>
        <p className="text-muted-foreground mt-2 text-lg">Daily Production Monitoring System</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {navItems.map((item) => (
          <Link href={item.href} key={item.title} legacyBehavior passHref>
            <a className={cn(
              "block transform hover:scale-105 transition-transform duration-300 rounded-lg",
              item.title === 'Admin' && "animated-border-hover"
            )}>
              <Card className={cn(
                "h-full flex flex-col justify-between hover:shadow-xl transition-shadow duration-300 cursor-pointer overflow-hidden relative z-10",
                )}>
                <CardHeader className="flex flex-row items-center gap-4">
                  {item.icon}
                  <div>
                    <CardTitle className="font-headline text-2xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end items-center text-sm font-medium text-primary hover:text-primary/80">
                    Go to {item.title} <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </main>
  );
}
