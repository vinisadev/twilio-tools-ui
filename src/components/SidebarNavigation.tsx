'use client';

import { useState } from 'react';
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
  MessageSquare,
  Phone,
  Video,
  Mail,
  Shield,
  Users,
  Settings,
  BarChart3,
  Globe,
  Zap,
  FileText,
  Database,
  Bot,
  CreditCard,
  Search,
  Bell,
  Lock,
  Smartphone,
  Wifi,
  Mic,
  Camera,
  Headphones,
  Monitor,
  Server,
  Cloud,
  Key,
  CheckCircle,
  AlertTriangle,
  Info,
  Home,
  Play,
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
    id: 'messaging',
    label: 'Messaging',
    icon: MessageSquare,
    children: [
      {
        id: 'sms',
        label: 'SMS',
        icon: MessageSquare,
        href: '/messaging/sms',
        description: 'Send and receive text messages',
      },
      {
        id: 'mms',
        label: 'MMS',
        icon: MessageSquare,
        href: '/messaging/mms',
        description: 'Send multimedia messages',
      },
      {
        id: 'whatsapp',
        label: 'WhatsApp',
        icon: MessageSquare,
        href: '/messaging/whatsapp',
        description: 'WhatsApp Business API',
      },
      {
        id: 'facebook-messenger',
        label: 'Facebook Messenger',
        icon: MessageSquare,
        href: '/messaging/facebook-messenger',
        description: 'Facebook Messenger integration',
      },
      {
        id: 'conversations',
        label: 'Conversations',
        icon: MessageSquare,
        href: '/messaging/conversations',
        description: 'Multi-channel conversations',
      },
    ],
  },
  {
    id: 'voice',
    label: 'Voice',
    icon: Phone,
    children: [
      {
        id: 'calls',
        label: 'Calls',
        icon: Phone,
        href: '/voice/calls',
        description: 'Make and receive phone calls',
      },
      {
        id: 'conference',
        label: 'Conference',
        icon: Users,
        href: '/voice/conference',
        description: 'Multi-party conference calls',
      },
      {
        id: 'recordings',
        label: 'Recordings',
        icon: Mic,
        href: '/voice/recordings',
        description: 'Call recording management',
      },
      {
        id: 'transcriptions',
        label: 'Transcriptions',
        icon: FileText,
        href: '/voice/transcriptions',
        description: 'Speech-to-text transcription',
      },
      {
        id: 'queues',
        label: 'Queues',
        icon: BarChart3,
        href: '/voice/queues',
        description: 'Call queue management',
      },
    ],
  },
  {
    id: 'video',
    label: 'Video',
    icon: Video,
    children: [
      {
        id: 'rooms',
        label: 'Rooms',
        icon: Video,
        href: '/video/rooms',
        description: 'Video conference rooms',
      },
      {
        id: 'compositions',
        label: 'Compositions',
        icon: Camera,
        href: '/video/compositions',
        description: 'Video composition and recording',
      },
      {
        id: 'recordings',
        label: 'Recordings',
        icon: Monitor,
        href: '/video/recordings',
        description: 'Video call recordings',
      },
    ],
  },
  {
    id: 'email',
    label: 'Email',
    icon: Mail,
    children: [
      {
        id: 'sendgrid',
        label: 'SendGrid',
        icon: Mail,
        href: '/email/sendgrid',
        description: 'Email delivery service',
      },
      {
        id: 'templates',
        label: 'Templates',
        icon: FileText,
        href: '/email/templates',
        description: 'Email template management',
      },
    ],
  },
  {
    id: 'authentication',
    label: 'Authentication',
    icon: Shield,
    children: [
      {
        id: 'verify',
        label: 'Verify',
        icon: CheckCircle,
        href: '/auth/verify',
        description: 'Phone number verification',
      },
      {
        id: 'authy',
        label: 'Authy',
        icon: Lock,
        href: '/auth/authy',
        description: 'Two-factor authentication',
      },
    ],
  },
  {
    id: 'notify',
    label: 'Notify',
    icon: Bell,
    children: [
      {
        id: 'push-notifications',
        label: 'Push Notifications',
        icon: Bell,
        href: '/notify/push',
        description: 'Mobile push notifications',
      },
      {
        id: 'binding-management',
        label: 'Binding Management',
        icon: Users,
        href: '/notify/bindings',
        description: 'Device binding management',
      },
    ],
  },
  {
    id: 'taskrouter',
    label: 'TaskRouter',
    icon: Settings,
    children: [
      {
        id: 'workspaces',
        label: 'Workspaces',
        icon: Server,
        href: '/taskrouter/workspaces',
        description: 'Task routing workspaces',
      },
      {
        id: 'task-queues',
        label: 'Task Queues',
        icon: BarChart3,
        href: '/taskrouter/queues',
        description: 'Task queue management',
      },
      {
        id: 'workers',
        label: 'Workers',
        icon: Users,
        href: '/taskrouter/workers',
        description: 'Worker management',
      },
    ],
  },
  {
    id: 'flex',
    label: 'Flex',
    icon: Headphones,
    children: [
      {
        id: 'flex-ui',
        label: 'Flex UI',
        icon: Monitor,
        href: '/flex/ui',
        description: 'Flex contact center UI',
      },
      {
        id: 'flex-insights',
        label: 'Insights',
        icon: BarChart3,
        href: '/flex/insights',
        description: 'Contact center analytics',
      },
    ],
  },
  {
    id: 'studio',
    label: 'Studio',
    icon: Zap,
    children: [
      {
        id: 'flows',
        label: 'Flows',
        icon: Zap,
        href: '/studio/flows',
        description: 'Visual flow builder',
      },
      {
        id: 'executions',
        label: 'Executions',
        icon: Play,
        href: '/studio/executions',
        description: 'Flow execution management',
      },
    ],
  },
  {
    id: 'functions',
    label: 'Functions',
    icon: Cloud,
    children: [
      {
        id: 'serverless-functions',
        label: 'Serverless Functions',
        icon: Cloud,
        href: '/functions/serverless',
        description: 'Serverless function execution',
      },
      {
        id: 'assets',
        label: 'Assets',
        icon: FileText,
        href: '/functions/assets',
        description: 'Function asset management',
      },
    ],
  },
  {
    id: 'sync',
    label: 'Sync',
    icon: Database,
    children: [
      {
        id: 'documents',
        label: 'Documents',
        icon: FileText,
        href: '/sync/documents',
        description: 'Real-time document sync',
      },
      {
        id: 'lists',
        label: 'Lists',
        icon: FileText,
        href: '/sync/lists',
        description: 'Real-time list sync',
      },
    ],
  },
  {
    id: 'proxy',
    label: 'Proxy',
    icon: Shield,
    children: [
      {
        id: 'proxy-services',
        label: 'Services',
        icon: Server,
        href: '/proxy/services',
        description: 'Proxy service management',
      },
      {
        id: 'phone-numbers',
        label: 'Phone Numbers',
        icon: Phone,
        href: '/proxy/phone-numbers',
        description: 'Proxy phone number management',
      },
    ],
  },
  {
    id: 'lookup',
    label: 'Lookup',
    icon: Search,
    children: [
      {
        id: 'phone-number-lookup',
        label: 'Phone Number Lookup',
        icon: Search,
        href: '/lookup/phone-numbers',
        description: 'Phone number validation and info',
      },
    ],
  },
  {
    id: 'monitor',
    label: 'Monitor',
    icon: BarChart3,
    children: [
      {
        id: 'alerts',
        label: 'Alerts',
        icon: AlertTriangle,
        href: '/monitor/alerts',
        description: 'System monitoring alerts',
      },
      {
        id: 'events',
        label: 'Events',
        icon: Info,
        href: '/monitor/events',
        description: 'System event monitoring',
      },
    ],
  },
  {
    id: 'billing',
    label: 'Billing',
    icon: CreditCard,
    children: [
      {
        id: 'usage',
        label: 'Usage',
        icon: BarChart3,
        href: '/billing/usage',
        description: 'Usage tracking and billing',
      },
      {
        id: 'invoices',
        label: 'Invoices',
        icon: FileText,
        href: '/billing/invoices',
        description: 'Invoice management',
      },
    ],
  },
];

interface SidebarNavigationProps {
  className?: string;
}

export default function SidebarNavigation({ className }: SidebarNavigationProps) {
  const [openItems, setOpenItems] = useState<string[]>([]);

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
    const isActive = false; // TODO: Implement active state based on current route

    return (
      <div key={item.id} className="w-full">
        <Collapsible
          open={isOpen}
          onOpenChange={() => hasChildren && toggleItem(item.id)}
        >
          <CollapsibleTrigger asChild>
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