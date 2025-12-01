import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CredentialGuard from '@/components/CredentialGuard';
import QueueManagement from '../../../components/QueueManagement';

export default function QueuesPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Call Queue Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Manage your Twilio call queues with advanced routing, capacity management, 
            and real-time monitoring. Create, configure, and monitor queues to handle 
            incoming calls efficiently.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Queue Statistics
              </CardTitle>
              <CardDescription>
                Real-time queue performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Active Queues</span>
                  <Suspense fallback={<Skeleton className="h-4 w-8" />}>
                    <span className="font-semibold">-</span>
                  </Suspense>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Calls</span>
                  <Suspense fallback={<Skeleton className="h-4 w-8" />}>
                    <span className="font-semibold">-</span>
                  </Suspense>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Avg Wait Time</span>
                  <Suspense fallback={<Skeleton className="h-4 w-8" />}>
                    <span className="font-semibold">-</span>
                  </Suspense>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common queue management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Create new queue
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • View queue details
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Update queue settings
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Monitor queue activity
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📚</span>
                Documentation
              </CardTitle>
              <CardDescription>
                Learn about call queues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a 
                  href="https://www.twilio.com/docs/voice/api/queue-resource" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block"
                >
                  Queue Resource API
                </a>
                <a 
                  href="https://www.twilio.com/docs/voice/api/queue-members" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block"
                >
                  Queue Members API
                </a>
                <a 
                  href="https://www.twilio.com/docs/voice/api/queue-statistics" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block"
                >
                  Queue Statistics API
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <CredentialGuard 
          fallbackMessage="Please validate your Twilio credentials on the home page before managing call queues."
          fallbackTitle="Queue Management Requires Authentication"
        >
          <Suspense fallback={
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </CardContent>
            </Card>
          }>
            <QueueManagement />
          </Suspense>
        </CredentialGuard>
      </div>
    </div>
  );
}