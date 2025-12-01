'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';

const validationSchema = z.object({
  accountSid: z
    .string()
    .min(1, 'Account SID is required')
    .startsWith('AC', 'Account SID must start with "AC"'),
  authToken: z
    .string()
    .min(1, 'Auth Token is required')
    .min(32, 'Auth Token must be at least 32 characters'),
});

type ValidationFormData = z.infer<typeof validationSchema>;

interface ValidationResult {
  success: boolean;
  message: string;
  accountInfo?: {
    friendlyName: string;
    status: string;
    type: string;
  };
}

export default function TwilioValidationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [showAuthToken, setShowAuthToken] = useState(false);
  const { credentials, setCredentials, isCredentialsValid } = useTwilioCredentials();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ValidationFormData>({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: ValidationFormData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/validate-twilio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: result.message,
          accountInfo: result.accountInfo,
        });
        
        // Store credentials in context
        setCredentials({
          accountSid: data.accountSid,
          authToken: data.authToken,
          isValid: true,
          accountInfo: result.accountInfo,
        });
      } else {
        setResult({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setResult(null);
  };

  const handleClearCredentials = () => {
    setCredentials(null);
    setResult(null);
    reset();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">📱</span>
          Twilio Credentials Validator
        </CardTitle>
        <CardDescription>
          Enter your Twilio Account SID and Auth Token to validate your credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Credentials Status */}
        {isCredentialsValid && credentials && (
          <Alert className="border-green-500">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              <div className="space-y-1">
                <p><strong>Connected to:</strong> {credentials.accountInfo?.friendlyName}</p>
                <p><strong>Account SID:</strong> {credentials.accountSid}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearCredentials}
                  className="mt-2"
                >
                  Clear Credentials
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountSid">Account SID</Label>
            <Input
              id="accountSid"
              type="text"
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              {...register('accountSid')}
              className={errors.accountSid ? 'border-red-500' : ''}
            />
            {errors.accountSid && (
              <p className="text-sm text-red-500">{errors.accountSid.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="authToken">Auth Token</Label>
            <div className="relative">
              <Input
                id="authToken"
                type={showAuthToken ? 'text' : 'password'}
                placeholder="Enter your auth token"
                {...register('authToken')}
                className={errors.authToken ? 'border-red-500 pr-10' : 'pr-10'}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowAuthToken(!showAuthToken)}
              >
                {showAuthToken ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.authToken && (
              <p className="text-sm text-red-500">{errors.authToken.message}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Validate Credentials'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </div>
        </form>

        {result && (
          <Alert className={result.success ? 'border-green-500' : 'border-red-500'}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription className={result.success ? 'text-green-700' : 'text-red-700'}>
                {result.message}
              </AlertDescription>
            </div>
            {result.success && result.accountInfo && (
              <div className="mt-3 p-3 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-800 mb-2">Account Information:</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <p><strong>Name:</strong> {result.accountInfo.friendlyName}</p>
                  <p><strong>Status:</strong> {result.accountInfo.status}</p>
                  <p><strong>Type:</strong> {result.accountInfo.type}</p>
                </div>
              </div>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}