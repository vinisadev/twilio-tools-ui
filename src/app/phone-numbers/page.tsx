import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CredentialGuard from '@/components/CredentialGuard';
import PhoneNumberManagement from '@/components/PhoneNumberManagement';

export default function PhoneNumbersPage() {
  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Phone Number Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
            Manage your Twilio phone numbers with comprehensive tools for purchasing, releasing, 
            and bulk operations. View all numbers, search by capabilities, and perform batch actions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📞</span>
                Account Numbers
              </CardTitle>
              <CardDescription>
                Overview of your phone number inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Total Numbers</span>
                  <Suspense fallback={<Skeleton className="h-4 w-8" />}>
                    <span className="font-semibold">-</span>
                  </Suspense>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Voice Enabled</span>
                  <Suspense fallback={<Skeleton className="h-4 w-8" />}>
                    <span className="font-semibold">-</span>
                  </Suspense>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">SMS Enabled</span>
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
                Common phone number operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Purchase new numbers
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Release unused numbers
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Bulk purchase operations
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  • Bulk release operations
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
                Learn about phone numbers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <a 
                  href="https://www.twilio.com/docs/phone-numbers/api/incoming-phone-numbers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block"
                >
                  Incoming Phone Numbers API
                </a>
                <a 
                  href="https://www.twilio.com/docs/phone-numbers/api/available-phone-numbers" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block"
                >
                  Available Phone Numbers API
                </a>
                <a 
                  href="https://www.twilio.com/docs/phone-numbers/global-catalog" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block"
                >
                  Global Phone Number Catalog
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <CredentialGuard 
          fallbackMessage="Please validate your Twilio credentials on the home page before managing phone numbers."
          fallbackTitle="Phone Number Management Requires Authentication"
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
            <PhoneNumberManagement />
          </Suspense>
        </CredentialGuard>
      </div>
    </div>
  );
}