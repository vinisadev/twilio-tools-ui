'use client';

import { ReactNode } from 'react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface CredentialGuardProps {
  children: ReactNode;
  fallbackMessage?: string;
  fallbackTitle?: string;
}

export default function CredentialGuard({ 
  children, 
  fallbackMessage = "Please validate your Twilio credentials on the home page to access this feature.",
  fallbackTitle = "Credentials Required"
}: CredentialGuardProps) {
  const { isCredentialsValid, credentials } = useTwilioCredentials();

  if (!isCredentialsValid || !credentials) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">{fallbackTitle}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4 max-w-md">
            {fallbackMessage}
          </p>
          <Button asChild>
            <a href="/">Go to Home Page</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}