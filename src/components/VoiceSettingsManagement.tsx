'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Mic, 
  Phone, 
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';

// Recording Settings Component
function RecordingSettings() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/voice/recording-settings?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setSettings(data.recordingSettings);
      } else {
        setError(data.error || 'Failed to fetch recording settings');
      }
    } catch (error) {
      console.error('Error fetching recording settings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  const saveSettings = async () => {
    if (!isCredentialsValid || !credentials || !settings) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/voice/recording-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          recordingSettings: settings.defaultRecordingSettings,
          authenticationSettings: settings.authenticationSettings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Recording settings saved successfully');
      } else {
        setError(data.error || 'Failed to save recording settings');
      }
    } catch (error) {
      console.error('Error saving recording settings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = (path: string, value: unknown) => {
    setSettings((prev: Record<string, unknown> | null) => {
      if (!prev) return null;
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]] as Record<string, unknown>;
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Recording Settings
            </CardTitle>
            <CardDescription>
              Configure call recording options and authentication
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSettings} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={saveSettings} disabled={isSaving || !settings} size="sm">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        ) : settings ? (
          <div className="space-y-6">
            {/* Recording Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Recording Options</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="record">Enable Recording</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Automatically record all calls
                  </p>
                </div>
                <Switch
                  id="record"
                  checked={(settings.defaultRecordingSettings as Record<string, unknown>)?.record as boolean || false}
                  onCheckedChange={(checked) => updateSetting('defaultRecordingSettings.record', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordingChannels">Recording Channels</Label>
                <Select
                  value={(settings.defaultRecordingSettings as Record<string, unknown>)?.recordingChannels as string || 'dual'}
                  onValueChange={(value) => updateSetting('defaultRecordingSettings.recordingChannels', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dual">Dual (Both parties)</SelectItem>
                    <SelectItem value="mono">Mono (Single channel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="trim">Audio Trimming</Label>
                <Select
                  value={(settings.defaultRecordingSettings as Record<string, unknown>)?.trim as string || 'trim-silence'}
                  onValueChange={(value) => updateSetting('defaultRecordingSettings.trim', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trim-silence">Trim Silence</SelectItem>
                    <SelectItem value="do-not-trim">Do Not Trim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recordingStatusCallback">Recording Status Callback URL</Label>
                <Input
                  id="recordingStatusCallback"
                  type="url"
                  placeholder="https://your-domain.com/recording-status"
                  value={(settings.defaultRecordingSettings as Record<string, unknown>)?.recordingStatusCallback as string || ''}
                  onChange={(e) => updateSetting('defaultRecordingSettings.recordingStatusCallback', e.target.value)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  URL to receive recording status updates
                </p>
              </div>
            </div>

            {/* Authentication Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">HTTP Authentication for Recordings</h3>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="httpAuthEnabled">Enable HTTP Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Require HTTP authentication to access recordings
                  </p>
                </div>
                <Switch
                  id="httpAuthEnabled"
                  checked={(settings.authenticationSettings as Record<string, unknown>)?.httpAuthEnabled as boolean || false}
                  onCheckedChange={(checked) => updateSetting('authenticationSettings.httpAuthEnabled', checked)}
                />
              </div>

              {((settings.authenticationSettings as Record<string, unknown>)?.httpAuthEnabled as boolean) && (
                <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <Label htmlFor="authUsername">Username</Label>
                    <Input
                      id="authUsername"
                      type="text"
                      placeholder="recording_username"
                      value={(settings.authenticationSettings as Record<string, unknown>)?.username as string || ''}
                      onChange={(e) => updateSetting('authenticationSettings.username', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authPassword">Password</Label>
                    <Input
                      id="authPassword"
                      type="password"
                      placeholder="••••••••"
                      value={(settings.authenticationSettings as Record<string, unknown>)?.password as string || ''}
                      onChange={(e) => updateSetting('authenticationSettings.password', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No recording settings available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Voice Settings Component
function VoiceSettings() {
  const { credentials, isCredentialsValid } = useTwilioCredentials();
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/voice/settings?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
      } else {
        setError(data.error || 'Failed to fetch voice settings');
      }
    } catch (error) {
      console.error('Error fetching voice settings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  const saveSettings = async () => {
    if (!isCredentialsValid || !credentials || !settings) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/voice/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          recording: settings.recording,
          authentication: settings.authentication,
          callSettings: settings.callSettings,
          webhooks: settings.webhooks,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Voice settings saved successfully');
      } else {
        setError(data.error || 'Failed to save voice settings');
      }
    } catch (error) {
      console.error('Error saving voice settings:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = (path: string, value: unknown) => {
    setSettings((prev: Record<string, unknown> | null) => {
      if (!prev) return null;
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]] as Record<string, unknown>;
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Voice Settings
            </CardTitle>
            <CardDescription>
              Configure general voice and call settings
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchSettings} disabled={isLoading} variant="outline" size="sm">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={saveSettings} disabled={isSaving || !settings} size="sm">
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        ) : settings ? (
          <div className="space-y-6">
            {/* Webhook Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Webhook Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="voiceUrl">Voice Webhook URL</Label>
                <Input
                  id="voiceUrl"
                  type="url"
                  placeholder="https://your-domain.com/voice"
                  value={(settings.webhooks as Record<string, unknown>)?.voiceUrl as string || ''}
                  onChange={(e) => updateSetting('webhooks.voiceUrl', e.target.value)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  URL to handle incoming voice calls
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voiceMethod">Voice Webhook Method</Label>
                <Select
                  value={(settings.webhooks as Record<string, unknown>)?.voiceMethod as string || 'POST'}
                  onValueChange={(value) => updateSetting('webhooks.voiceMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="GET">GET</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusCallback">Status Callback URL</Label>
                <Input
                  id="statusCallback"
                  type="url"
                  placeholder="https://your-domain.com/status"
                  value={(settings.webhooks as Record<string, unknown>)?.statusCallback as string || ''}
                  onChange={(e) => updateSetting('webhooks.statusCallback', e.target.value)}
                />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  URL to receive call status updates
                </p>
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-300">Account SID</Label>
                  <p className="font-mono text-sm">{(settings.account as Record<string, unknown>)?.sid as string}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-300">Friendly Name</Label>
                  <p className="text-sm">{(settings.account as Record<string, unknown>)?.friendlyName as string}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-300">Status</Label>
                  <Badge variant={(settings.account as Record<string, unknown>)?.status === 'active' ? 'default' : 'secondary'}>
                    {(settings.account as Record<string, unknown>)?.status as string}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-gray-600 dark:text-gray-300">Type</Label>
                  <p className="text-sm">{(settings.account as Record<string, unknown>)?.type as string}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No voice settings available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main Voice Settings Management Component
export default function VoiceSettingsManagement() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="recording" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recording">Recording Settings</TabsTrigger>
          <TabsTrigger value="voice">Voice Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recording" className="space-y-4">
          <RecordingSettings />
        </TabsContent>
        
        <TabsContent value="voice" className="space-y-4">
          <VoiceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}