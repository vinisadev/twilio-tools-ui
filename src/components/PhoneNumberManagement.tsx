'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Download,
  Search
} from 'lucide-react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';
import { useCallback } from 'react';

const searchAvailableSchema = z.object({
  countryCode: z.string().min(1, 'Country code is required'),
  areaCode: z.string().optional(),
  contains: z.string().optional(),
  voiceEnabled: z.boolean().optional(),
  smsEnabled: z.boolean().optional(),
  limit: z.string().optional(),
});

type SearchAvailableData = z.infer<typeof searchAvailableSchema>;

interface PhoneNumber {
  sid: string;
  phoneNumber: string;
  friendlyName: string;
  voiceUrl: string;
  voiceMethod: string;
  smsUrl: string;
  smsMethod: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
  status: string;
  dateCreated: string;
  dateUpdated: string;
  uri: string;
}

interface AvailableNumber {
  phoneNumber: string;
  friendlyName: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
    mms: boolean;
    fax: boolean;
  };
  locality: string;
  region: string;
  countryCode: string;
  lata: string;
  rateCenter: string;
  latitude: number;
  longitude: number;
}

export default function PhoneNumberManagement() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<AvailableNumber[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [selectedAvailableNumbers, setSelectedAvailableNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isBulkPurchasing, setIsBulkPurchasing] = useState(false);
  const [isBulkReleasing, setIsBulkReleasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [bulkReleaseDialogOpen, setBulkReleaseDialogOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { credentials, isCredentialsValid } = useTwilioCredentials();

  const searchForm = useForm<SearchAvailableData>({
    resolver: zodResolver(searchAvailableSchema),
    defaultValues: {
      countryCode: 'US',
      limit: '20',
    },
  });

  const fetchPhoneNumbers = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/phone-numbers?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setPhoneNumbers(data.phoneNumbers);
      } else {
        setError(data.error || 'Failed to fetch phone numbers');
      }
    } catch (error) {
      console.error('Error fetching phone numbers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  const searchAvailableNumbers = async (data: SearchAvailableData) => {
    console.log('Search form submitted with data:', data);
    
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        accountSid: credentials.accountSid,
        authToken: credentials.authToken,
        countryCode: data.countryCode,
        limit: data.limit || '20',
      });

      if (data.areaCode) params.append('areaCode', data.areaCode);
      if (data.contains) params.append('contains', data.contains);
      if (data.voiceEnabled) params.append('voiceEnabled', 'true');
      if (data.smsEnabled) params.append('smsEnabled', 'true');

      console.log('Making API request to:', `/api/phone-numbers/available?${params}`);
      const response = await fetch(`/api/phone-numbers/available?${params}`);
      const result = await response.json();
      console.log('API response:', result);

      if (response.ok) {
        setAvailableNumbers(result.availableNumbers);
        setSelectedAvailableNumbers([]);
        setShowSearchResults(true);
        setSearchDialogOpen(false);
      } else {
        setError(result.error || 'Failed to search available numbers');
      }
    } catch (error) {
      console.error('Error searching available numbers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsSearching(false);
    }
  };


  const releaseNumber = async (phoneNumberSid: string) => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    if (!confirm('Are you sure you want to release this phone number? This action cannot be undone.')) {
      return;
    }

    setIsReleasing(true);
    setError(null);

    try {
      const response = await fetch(`/api/phone-numbers/${phoneNumberSid}?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Phone number released successfully!');
        fetchPhoneNumbers();
      } else {
        setError(result.error || 'Failed to release phone number');
      }
    } catch (error) {
      console.error('Error releasing phone number:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsReleasing(false);
    }
  };


  const bulkReleaseNumbers = async () => {
    if (selectedNumbers.length === 0) {
      setError('Please select at least one phone number to release');
      return;
    }

    if (!confirm(`Are you sure you want to release ${selectedNumbers.length} phone numbers? This action cannot be undone.`)) {
      return;
    }

    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsBulkReleasing(true);
    setError(null);

    try {
      const response = await fetch('/api/phone-numbers/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          phoneNumberSids: selectedNumbers,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setSelectedNumbers([]);
        setBulkReleaseDialogOpen(false);
        fetchPhoneNumbers();
      } else {
        setError(result.error || 'Failed to bulk release phone numbers');
      }
    } catch (error) {
      console.error('Error bulk releasing phone numbers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsBulkReleasing(false);
    }
  };

  const toggleNumberSelection = (phoneNumberSid: string) => {
    setSelectedNumbers(prev =>
      prev.includes(phoneNumberSid)
        ? prev.filter(id => id !== phoneNumberSid)
        : [...prev, phoneNumberSid]
    );
  };

  const toggleAvailableNumberSelection = (phoneNumber: string) => {
    setSelectedAvailableNumbers(prev =>
      prev.includes(phoneNumber)
        ? prev.filter(num => num !== phoneNumber)
        : [...prev, phoneNumber]
    );
  };

  const selectAllNumbers = () => {
    if (selectedNumbers.length === phoneNumbers.length) {
      setSelectedNumbers([]);
    } else {
      setSelectedNumbers(phoneNumbers.map(num => num.sid));
    }
  };

  const selectAllAvailableNumbers = () => {
    if (selectedAvailableNumbers.length === availableNumbers.length) {
      setSelectedAvailableNumbers([]);
    } else {
      setSelectedAvailableNumbers(availableNumbers.map(num => num.phoneNumber));
    }
  };

  const purchaseSelectedNumbers = async () => {
    if (selectedAvailableNumbers.length === 0) {
      setError('Please select at least one phone number to purchase');
      return;
    }

    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsBulkPurchasing(true);
    setError(null);

    try {
      const response = await fetch('/api/phone-numbers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          phoneNumbers: selectedAvailableNumbers,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(result.message);
        setSelectedAvailableNumbers([]);
        setShowSearchResults(false);
        setAvailableNumbers([]);
        fetchPhoneNumbers();
      } else {
        setError(result.error || 'Failed to purchase selected phone numbers');
      }
    } catch (error) {
      console.error('Error purchasing selected numbers:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsBulkPurchasing(false);
    }
  };

  useEffect(() => {
    fetchPhoneNumbers();
  }, [fetchPhoneNumbers]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Basic phone number formatting
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    return phoneNumber;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Phone Number Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your Twilio phone numbers
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPhoneNumbers} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Search className="h-4 w-4 mr-2" />
                Search & Purchase Numbers
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Search Available Phone Numbers</DialogTitle>
                <DialogDescription>
                  Search for available phone numbers to purchase
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                console.log('Form submitted, calling handleSubmit');
                searchForm.handleSubmit(searchAvailableNumbers)(e);
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="countryCode">Country Code</Label>
                    <Select 
                      value={searchForm.watch('countryCode')} 
                      onValueChange={(value) => searchForm.setValue('countryCode', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="GB">United Kingdom</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="areaCode">Area Code</Label>
                    <Input
                      id="areaCode"
                      {...searchForm.register('areaCode')}
                      placeholder="e.g., 415"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contains">Contains</Label>
                  <Input
                    id="contains"
                    {...searchForm.register('contains')}
                    placeholder="e.g., 123"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="voiceEnabled"
                      checked={searchForm.watch('voiceEnabled') || false}
                      onCheckedChange={(checked) => searchForm.setValue('voiceEnabled', !!checked)}
                    />
                    <Label htmlFor="voiceEnabled">Voice Enabled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsEnabled"
                      checked={searchForm.watch('smsEnabled') || false}
                      onCheckedChange={(checked) => searchForm.setValue('smsEnabled', !!checked)}
                    />
                    <Label htmlFor="smsEnabled">SMS Enabled</Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="limit">Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    {...searchForm.register('limit')}
                    placeholder="20"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSearchDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="border-red-500">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Available Numbers Results */}
      {showSearchResults && availableNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Available Numbers</CardTitle>
                <CardDescription>
                  Found {availableNumbers.length} available numbers. Select numbers to purchase.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllAvailableNumbers}
                >
                  {selectedAvailableNumbers.length === availableNumbers.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  onClick={purchaseSelectedNumbers}
                  disabled={selectedAvailableNumbers.length === 0 || isBulkPurchasing}
                >
                  {isBulkPurchasing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Purchasing...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Purchase Selected ({selectedAvailableNumbers.length})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAvailableNumbers.length === availableNumbers.length && availableNumbers.length > 0}
                      onCheckedChange={selectAllAvailableNumbers}
                    />
                  </TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Capabilities</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableNumbers.map((number) => (
                  <TableRow key={number.phoneNumber}>
                    <TableCell>
                      <Checkbox
                        checked={selectedAvailableNumbers.includes(number.phoneNumber)}
                        onCheckedChange={() => toggleAvailableNumberSelection(number.phoneNumber)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatPhoneNumber(number.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      {number.locality}, {number.region}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {number.capabilities.voice && <Badge variant="outline">Voice</Badge>}
                        {number.capabilities.sms && <Badge variant="outline">SMS</Badge>}
                        {number.capabilities.mms && <Badge variant="outline">MMS</Badge>}
                        {number.capabilities.fax && <Badge variant="outline">Fax</Badge>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Results Message */}
      {showSearchResults && availableNumbers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Search className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Numbers Found</h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
              No phone numbers match your search criteria. Try adjusting your search parameters.
            </p>
            <Button onClick={() => setSearchDialogOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Search Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Bulk Release Actions */}
      {phoneNumbers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Release</CardTitle>
            <CardDescription>
              Release multiple selected phone numbers at once
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Dialog open={bulkReleaseDialogOpen} onOpenChange={setBulkReleaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    disabled={selectedNumbers.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Bulk Release ({selectedNumbers.length})
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Bulk Release Phone Numbers</DialogTitle>
                    <DialogDescription>
                      Release {selectedNumbers.length} selected phone numbers
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      This action cannot be undone. The following phone numbers will be released:
                    </p>
                    <div className="max-h-32 overflow-y-auto">
                      {selectedNumbers.map(sid => {
                        const number = phoneNumbers.find(n => n.sid === sid);
                        return (
                          <div key={sid} className="text-sm font-mono">
                            {number?.phoneNumber}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setBulkReleaseDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={bulkReleaseNumbers}
                        disabled={isBulkReleasing}
                        variant="destructive"
                      >
                        {isBulkReleasing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Releasing...
                          </>
                        ) : (
                          'Release All'
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Phone Numbers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Phone Numbers</CardTitle>
          <CardDescription>
            Manage your Twilio phone numbers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : phoneNumbers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No phone numbers found. Purchase your first number to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedNumbers.length === phoneNumbers.length}
                      onCheckedChange={selectAllNumbers}
                    />
                  </TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Friendly Name</TableHead>
                  <TableHead>Capabilities</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phoneNumbers.map((number) => (
                  <TableRow key={number.sid}>
                    <TableCell>
                      <Checkbox
                        checked={selectedNumbers.includes(number.sid)}
                        onCheckedChange={() => toggleNumberSelection(number.sid)}
                      />
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatPhoneNumber(number.phoneNumber)}
                    </TableCell>
                    <TableCell>
                      {number.friendlyName || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {number.capabilities.voice && <Badge variant="outline">Voice</Badge>}
                        {number.capabilities.sms && <Badge variant="outline">SMS</Badge>}
                        {number.capabilities.mms && <Badge variant="outline">MMS</Badge>}
                        {number.capabilities.fax && <Badge variant="outline">Fax</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={number.status === 'in-use' ? 'default' : 'secondary'}>
                        {number.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(number.dateCreated)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => releaseNumber(number.sid)}
                          disabled={isReleasing}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}