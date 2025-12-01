'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Bell, 
  DollarSign,
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';
import { useCallback } from 'react';

// Usage Records Component
function UsageRecords() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [usageRecords, setUsageRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsageRecords = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First test the API connectivity
      const testResponse = await fetch(`/api/billing/test?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const testData = await testResponse.json();
      
      console.log('Twilio API test result:', testData);
      
      if (!testResponse.ok) {
        setError(testData.error || 'Failed to connect to Twilio API');
        return;
      }

      // Now try to fetch usage records
      const response = await fetch(`/api/billing/usage-records?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setUsageRecords(data.usageRecords || []);
        if (data.message) {
          console.log('Usage records message:', data.message);
        }
      } else {
        setError(data.error || 'Failed to fetch usage records');
      }
    } catch (error) {
      console.error('Error fetching usage records:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchUsageRecords();
  }, [fetchUsageRecords]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Usage Records
            </CardTitle>
            <CardDescription>
              Monitor your Twilio service usage and costs
            </CardDescription>
          </div>
          <Button onClick={fetchUsageRecords} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : usageRecords.length > 0 ? (
          <div className="space-y-3">
            {usageRecords.map((record: Record<string, unknown>, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{String(record.category || 'Unknown')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {String(record.description || 'No description')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${String(record.price || '0')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {String(record.count || '0')} {String(record.unit || 'units')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No usage records found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Billing History Component
function BillingHistory() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/invoices?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
      } else {
        setError(data.error || 'Failed to fetch invoices');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>
              View and download your invoices
            </CardDescription>
          </div>
          <Button onClick={fetchInvoices} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((invoice: Record<string, unknown>, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">Invoice #{String(invoice.sid || 'Unknown')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {invoice.dateCreated ? new Date(String(invoice.dateCreated)).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="font-medium">${String(invoice.amount || '0')}</div>
                    <Badge variant={String(invoice.status) === 'paid' ? 'default' : 'secondary'}>
                      {String(invoice.status || 'unknown')}
                    </Badge>
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No invoices found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Usage Triggers Component
function UsageTriggers() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [triggers, setTriggers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTriggers = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/usage-triggers?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setTriggers(data.triggers || []);
      } else {
        setError(data.error || 'Failed to fetch usage triggers');
      }
    } catch (error) {
      console.error('Error fetching usage triggers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchTriggers();
  }, [fetchTriggers]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Usage Triggers
            </CardTitle>
            <CardDescription>
              Set up alerts for usage thresholds
            </CardDescription>
          </div>
          <Button onClick={fetchTriggers} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : triggers.length > 0 ? (
          <div className="space-y-3">
            {triggers.map((trigger: Record<string, unknown>, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{String(trigger.friendlyName || 'Unknown')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {String(trigger.triggerBy || 'Unknown')} - {String(trigger.triggerValue || '0')}
                  </div>
                </div>
                <Badge variant={(Number(trigger.currentValue) || 0) > (Number(trigger.triggerValue) || 0) ? 'destructive' : 'default'}>
                  {(Number(trigger.currentValue) || 0) > (Number(trigger.triggerValue) || 0) ? 'Triggered' : 'Active'}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No usage triggers found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Pricing Information Component
function PricingInfo() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [pricing, setPricing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/pricing?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setPricing(data.pricing || []);
      } else {
        setError(data.error || 'Failed to fetch pricing information');
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
            <CardDescription>
              Current pricing for Twilio services
            </CardDescription>
          </div>
          <Button onClick={fetchPricing} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 border rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        ) : pricing.length > 0 ? (
          <div className="space-y-3">
            {pricing.map((price: Record<string, unknown>, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <div className="font-medium">{String(price.category || 'Unknown')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {String(price.numberType || 'Unknown')} - {String(price.country || 'Unknown')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${String(price.basePrice || '0')}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    per {String(price.unit || 'unit')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No pricing information available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Subscription Management Component
function SubscriptionManagement() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [subscription, setSubscription] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/billing/subscriptions?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
      } else {
        setError(data.error || 'Failed to fetch subscription information');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account & Subscription
            </CardTitle>
            <CardDescription>
              Manage your Twilio account and subscription details
            </CardDescription>
          </div>
          <Button onClick={fetchSubscription} disabled={isLoading} variant="outline" size="sm">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
              </div>
            </div>
          </div>
        ) : subscription ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Account SID:</span>
                    <span className="font-mono text-sm">{String((subscription.account as Record<string, unknown>).sid || 'Unknown')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Friendly Name:</span>
                    <span>{String((subscription.account as Record<string, unknown>).friendlyName || 'Unknown')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Status:</span>
                    <Badge variant={String((subscription.account as Record<string, unknown>).status) === 'active' ? 'default' : 'secondary'}>
                      {String((subscription.account as Record<string, unknown>).status || 'unknown')}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Type:</span>
                    <span>{String((subscription.account as Record<string, unknown>).type || 'Unknown')}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Balance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Current Balance:</span>
                    <span className="font-semibold text-lg">
                      {String((subscription.balance as Record<string, unknown>).balance || '0')} {String((subscription.balance as Record<string, unknown>).currency || 'USD')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-300">Currency:</span>
                    <span>{String((subscription.balance as Record<string, unknown>).currency || 'USD')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No subscription information available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Billing Management Component
export default function BillingManagement() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="usage">Usage Records</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="triggers">Usage Triggers</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Info</TabsTrigger>
          <TabsTrigger value="subscription">Account</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="space-y-4">
          <UsageRecords />
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <BillingHistory />
        </TabsContent>
        
        <TabsContent value="triggers" className="space-y-4">
          <UsageTriggers />
        </TabsContent>
        
        <TabsContent value="pricing" className="space-y-4">
          <PricingInfo />
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-4">
          <SubscriptionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}