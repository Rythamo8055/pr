
"use client";
import Link from 'next/link';
import { Home, History, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Visualize', icon: Home },
  { href: '/history', label: 'History', icon: History },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNavBar() {
  const pathname = usePathname();

  // Hide nav bar on specific paths if needed, e.g. if a path is a full-screen view
  // const hiddenPaths = ['/some-full-screen-path'];
  // if (hiddenPaths.includes(pathname)) {
  //   return null;
  // }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-transparent z-50 flex justify-center items-center px-4">
      <div className="flex justify-around items-center bg-card/90 backdrop-blur-xl shadow-2xl rounded-full p-2 space-x-1 sm:space-x-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} passHref legacyBehavior>
              <a
                className={cn(
                  'flex flex-col items-center justify-center rounded-full p-2.5 sm:p-3 transition-all duration-300 ease-in-out',
                  'w-16 h-14 sm:w-20 sm:h-16', // Slightly adjusted sizes for better touch targets
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20',
                )}
                aria-label={item.label}
              >
                <item.icon className={cn('w-5 h-5 sm:w-6 sm:h-6', isActive ? 'text-primary-foreground': '')} />
                {isActive && <span className="text-xs mt-0.5 sm:mt-1">{item.label}</span>}
                {!isActive && <span className="text-xs mt-0.5 sm:mt-1 text-transparent">{item.label}</span>} {/* Keep space for non-active labels to prevent layout shift */}
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
