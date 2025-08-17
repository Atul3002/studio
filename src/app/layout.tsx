
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import { Sidebar, SidebarContent, SidebarHeader, SidebarInset } from '@/components/ui/sidebar';
import { Menu } from 'lucide-react';
import { MainNav } from '@/components/main-nav';


export const metadata: Metadata = {
  title: 'Job Tracker',
  description: 'Track the daily production of Jobs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="sidebar-container group">
          <button className="z-50 p-2 rounded-md hover:bg-accent">
            <Menu className="h-8 w-8" />
          </button>
          <div className="sidebar-content">
            <Sidebar>
                <SidebarHeader>
                     <Link href="/" className="font-headline text-2xl font-bold flex items-center gap-2">
                        <span>Job Tracker</span>
                    </Link>
                </SidebarHeader>
                <SidebarContent>
                    <MainNav />
                </SidebarContent>
            </Sidebar>
          </div>
        </div>
        <SidebarInset>
            {children}
        </SidebarInset>
      </body>
    </html>
  );
}
