'use client';

import { Suspense } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import CredentialGuard from '@/components/CredentialGuard';
import TrustHubManagement from '@/components/TrustHubManagement';

export default function TrustHubPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Trust Hub
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Manage compliance and trust products for regulatory requirements
          </p>
        </div>
      </div>

      <CredentialGuard
        fallbackTitle="Twilio Credentials Required"
        fallbackMessage="Please validate your Twilio credentials on the home page to access Trust Hub products."
      >
        <Suspense
          fallback={
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        >
          <TrustHubManagement />
        </Suspense>
      </CredentialGuard>
    </div>
  );
}