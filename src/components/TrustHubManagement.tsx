'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';

// Compliance Overview Component
function ComplianceOverview() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [trustHubData, setTrustHubData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrustHubData = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trust-hub?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setTrustHubData(data.trustHub);
      } else {
        setError(data.error || 'Failed to fetch Trust Hub data');
      }
    } catch (error) {
      console.error('Error fetching Trust Hub data:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchTrustHubData();
  }, [fetchTrustHubData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'certified':
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Compliance Overview
            </CardTitle>
            <CardDescription>
              Current compliance status and certifications
            </CardDescription>
          </div>
          <Button onClick={fetchTrustHubData} disabled={isLoading} variant="outline" size="sm">
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
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        ) : trustHubData ? (
          <div className="space-y-6">
            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Account SID</p>
                  <p className="font-mono text-sm">{(trustHubData.account as Record<string, unknown>)?.sid as string}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Friendly Name</p>
                  <p className="text-sm">{(trustHubData.account as Record<string, unknown>)?.friendlyName as string}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
                  <Badge variant={getStatusColor((trustHubData.account as Record<string, unknown>)?.status as string)}>
                    {(trustHubData.account as Record<string, unknown>)?.status as string}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Type</p>
                  <p className="text-sm">{(trustHubData.account as Record<string, unknown>)?.type as string}</p>
                </div>
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <div className="space-y-3">
                {(() => {
                  const compliance = trustHubData.compliance as Record<string, unknown>;
                  const regulatoryCompliance = compliance?.regulatoryCompliance as Record<string, unknown>;
                  const certifications = regulatoryCompliance?.certifications as Record<string, unknown>[];
                  
                  return certifications?.map((cert: Record<string, unknown>, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{cert.name as string}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {cert.description as string}
                        </div>
                        <div className="text-sm text-gray-500">
                          Expires: {cert.expiryDate as string}
                        </div>
                      </div>
                      <Badge variant={getStatusColor(cert.status as string)}>
                        {cert.status as string}
                      </Badge>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Security Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security Features</h3>
              <div className="grid grid-cols-2 gap-4">
                {(() => {
                  const compliance = trustHubData.compliance as Record<string, unknown>;
                  const securityFeatures = compliance?.securityFeatures as Record<string, unknown>;
                  
                  return securityFeatures && Object.entries(securityFeatures).map(([feature, enabled]) => (
                    <div key={feature} className="flex items-center gap-2">
                      {enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm capitalize">
                        {feature.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No Trust Hub data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compliance Policies Component
function CompliancePolicies() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [policies, setPolicies] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trust-hub/policies?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setPolicies(data.policies || []);
      } else {
        setError(data.error || 'Failed to fetch compliance policies');
      }
    } catch (error) {
      console.error('Error fetching compliance policies:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Compliance Policies
            </CardTitle>
            <CardDescription>
              Manage compliance policies and procedures
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchPolicies} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
        ) : policies.length > 0 ? (
          <div className="space-y-3">
            {policies.map((policy: Record<string, unknown>, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{policy.name as string}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {policy.description as string}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {policy.category as string}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      v{policy.version as string}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(policy.lastUpdated as string).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusColor(policy.status as string)}>
                    {policy.status as string}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No compliance policies found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compliance Assessments Component
function ComplianceAssessments() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [assessments, setAssessments] = useState<Record<string, unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trust-hub/assessments?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setAssessments(data.assessments || []);
      } else {
        setError(data.error || 'Failed to fetch compliance assessments');
      }
    } catch (error) {
      console.error('Error fetching compliance assessments:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Clock className="h-4 w-4" />;
      case 'scheduled':
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Compliance Assessments
            </CardTitle>
            <CardDescription>
              Track compliance assessments and audit results
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAssessments} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
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
        ) : assessments.length > 0 ? (
          <div className="space-y-3">
            {assessments.map((assessment: Record<string, unknown>, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded">
                <div className="flex-1">
                  <div className="font-medium">{assessment.name as string}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {assessment.type as string} • {assessment.auditor as string}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(assessment.startDate as string).toLocaleDateString()} - {new Date(assessment.endDate as string).toLocaleDateString()}
                    </span>
                    {(assessment.score as number) && (
                      <span className="text-xs text-gray-500">
                        Score: {assessment.score as number}/{assessment.maxScore as number}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getStatusIcon(assessment.status as string)}
                    <Badge variant={getStatusColor(assessment.status as string)}>
                      {assessment.status as string}
                    </Badge>
                  </div>
                  {(assessment.reportUrl as string) && (
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No compliance assessments found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Trust Hub Management Component
export default function TrustHubManagement() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Compliance Overview</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ComplianceOverview />
        </TabsContent>
        
        <TabsContent value="policies" className="space-y-4">
          <CompliancePolicies />
        </TabsContent>
        
        <TabsContent value="assessments" className="space-y-4">
          <ComplianceAssessments />
        </TabsContent>
      </Tabs>
    </div>
  );
}