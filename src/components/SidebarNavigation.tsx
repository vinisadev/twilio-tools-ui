'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  ChevronRight,
  Phone,
  BarChart3,
  Home,
  CreditCard,
  Settings,
  Shield,
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavigationItem[];
  badge?: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Home,
    href: '/',
    description: 'Get started with Twilio',
  },
  {
    id: 'phone-numbers',
    label: 'Phone Numbers',
    icon: Phone,
    href: '/phone-numbers',
    description: 'Manage phone numbers and inventory',
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: Phone,
    children: [
      {
        id: 'queues',
        label: 'Queues',
        icon: BarChart3,
        href: '/voice/queues',
        description: 'Call queue management',
      },
      {
        id: 'voice-settings',
        label: 'Voice Settings',
        icon: Settings,
        href: '/voice/settings',
        description: 'Configure voice recording and authentication settings',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    href: '/billing',
    description: 'Usage records, invoices, and billing management',
  },
  {
    id: 'trust-hub',
    label: 'Trust Hub',
    icon: Shield,
    href: '/trust-hub',
    description: 'Compliance and trust management products',
  }
];

interface SidebarNavigationProps {
  className?: string;
}

export default function SidebarNavigation({ className }: SidebarNavigationProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const pathname = usePathname();

  const toggleItem = (itemId: string) => {
    setOpenItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const renderNavigationItem = (item: NavigationItem, level = 0) => {
    const isOpen = openItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.href === pathname;

    return (
      <div key={item.id} className="w-full">
        <Collapsible
          open={isOpen}
          onOpenChange={() => hasChildren && toggleItem(item.id)}
        >
          <CollapsibleTrigger asChild>
            {item.href ? (
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start h-auto p-2 text-left',
                    level > 0 && 'ml-4',
                    isActive && 'bg-accent text-accent-foreground'
                  )}
                >
                  <div className="flex items-center gap-2 w-full">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      )}
                    </div>
                    {hasChildren && (
                      <div className="flex-shrink-0">
                        {isOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </div>
                </Button>
              </Link>
            ) : (
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start h-auto p-2 text-left',
                  level > 0 && 'ml-4',
                  isActive && 'bg-accent text-accent-foreground'
                )}
              >
                <div className="flex items-center gap-2 w-full">
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  {hasChildren && (
                    <div className="flex-shrink-0">
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  )}
                </div>
              </Button>
            )}
          </CollapsibleTrigger>
          {hasChildren && (
            <CollapsibleContent className="space-y-1">
              {item.children?.map(child => renderNavigationItem(child, level + 1))}
            </CollapsibleContent>
          )}
        </Collapsible>
      </div>
    );
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="p-4">
        <h2 className="text-lg font-semibold text-foreground">Twilio APIs</h2>
        <p className="text-sm text-muted-foreground">
          Explore all Twilio services and APIs
        </p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1 py-2">
          {navigationItems.map(item => renderNavigationItem(item))}
        </div>
      </ScrollArea>
    </div>
  );
}