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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Users, 
  Clock, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useTwilioCredentials } from '@/contexts/TwilioCredentialsContext';
import { useCallback } from 'react';

const createQueueSchema = z.object({
  friendlyName: z.string().min(1, 'Queue name is required'),
  maxSize: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, 'Max size must be a positive number'),
});

const updateQueueSchema = z.object({
  friendlyName: z.string().min(1, 'Queue name is required'),
  maxSize: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val);
    return !isNaN(num) && num > 0;
  }, 'Max size must be a positive number'),
});

type CreateQueueData = z.infer<typeof createQueueSchema>;
type UpdateQueueData = z.infer<typeof updateQueueSchema>;

interface Queue {
  sid: string;
  friendlyName: string;
  currentSize: number;
  maxSize: number;
  averageWaitTime: number;
  dateCreated: string;
  dateUpdated: string;
}

interface QueueMember {
  callSid: string;
  position: number;
  dateEnqueued: string;
  waitTime: number;
  uri: string;
}

interface QueueDetails extends Queue {
  members: QueueMember[];
}

export default function QueueManagement() {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [selectedQueue, setSelectedQueue] = useState<QueueDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const { credentials, isCredentialsValid } = useTwilioCredentials();

  const createForm = useForm<CreateQueueData>({
    resolver: zodResolver(createQueueSchema),
  });

  const updateForm = useForm<UpdateQueueData>({
    resolver: zodResolver(updateQueueSchema),
  });

  const fetchQueues = useCallback(async () => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/queues?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setQueues(data.queues);
      } else {
        setError(data.error || 'Failed to fetch queues');
      }
    } catch (error) {
      console.error('Error fetching queues:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [isCredentialsValid, credentials]);

  const fetchQueueDetails = async (queueSid: string) => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    try {
      const response = await fetch(`/api/queues/${queueSid}?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedQueue(data);
        setDetailsDialogOpen(true);
      } else {
        setError(data.error || 'Failed to fetch queue details');
      }
    } catch (error) {
      console.error('Error fetching queue details:', error);
      setError('Network error. Please check your connection.');
    }
  };

  const createQueue = async (data: CreateQueueData) => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/queues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          friendlyName: data.friendlyName,
          maxSize: data.maxSize,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Queue created successfully!');
        setCreateDialogOpen(false);
        createForm.reset();
        fetchQueues();
      } else {
        setError(result.error || 'Failed to create queue');
      }
    } catch (error) {
      console.error('Error creating queue:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsCreating(false);
    }
  };

  const updateQueue = async (data: UpdateQueueData) => {
    if (!selectedQueue) return;

    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/queues/${selectedQueue.sid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountSid: credentials.accountSid,
          authToken: credentials.authToken,
          friendlyName: data.friendlyName,
          maxSize: data.maxSize,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Queue updated successfully!');
        setUpdateDialogOpen(false);
        updateForm.reset();
        fetchQueues();
      } else {
        setError(result.error || 'Failed to update queue');
      }
    } catch (error) {
      console.error('Error updating queue:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteQueue = async (queueSid: string) => {
    if (!isCredentialsValid || !credentials) {
      setError('Please validate your Twilio credentials first');
      return;
    }

    if (!confirm('Are you sure you want to delete this queue? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/queues/${queueSid}?accountSid=${credentials.accountSid}&authToken=${credentials.authToken}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess('Queue deleted successfully!');
        fetchQueues();
      } else {
        setError(result.error || 'Failed to delete queue');
      }
    } catch (error) {
      console.error('Error deleting queue:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsDeleting(false);
    }
  };

  const openUpdateDialog = (queue: Queue) => {
    setSelectedQueue(queue as QueueDetails);
    updateForm.setValue('friendlyName', queue.friendlyName);
    updateForm.setValue('maxSize', queue.maxSize.toString());
    setUpdateDialogOpen(true);
  };

  useEffect(() => {
    fetchQueues();
  }, [fetchQueues]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatWaitTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Queue Management</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your Twilio call queues
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchQueues} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Queue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Queue</DialogTitle>
                <DialogDescription>
                  Create a new call queue for managing incoming calls.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={createForm.handleSubmit(createQueue)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="friendlyName">Queue Name</Label>
                  <Input
                    id="friendlyName"
                    {...createForm.register('friendlyName')}
                    placeholder="e.g., Customer Support Queue"
                  />
                  {createForm.formState.errors.friendlyName && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.friendlyName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxSize">Max Size (optional)</Label>
                  <Input
                    id="maxSize"
                    type="number"
                    {...createForm.register('maxSize')}
                    placeholder="e.g., 100"
                  />
                  {createForm.formState.errors.maxSize && (
                    <p className="text-sm text-red-500">
                      {createForm.formState.errors.maxSize.message}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Queue'
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

      {/* Queues Table */}
      <Card>
        <CardHeader>
          <CardTitle>Call Queues</CardTitle>
          <CardDescription>
            Manage your Twilio call queues and monitor their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : queues.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No queues found. Create your first queue to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Current Size</TableHead>
                  <TableHead>Max Size</TableHead>
                  <TableHead>Avg Wait Time</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queues.map((queue) => (
                  <TableRow key={queue.sid}>
                    <TableCell className="font-medium">
                      {queue.friendlyName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={queue.currentSize > 0 ? "default" : "secondary"}>
                        <Users className="h-3 w-3 mr-1" />
                        {queue.currentSize}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {queue.maxSize || 'Unlimited'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatWaitTime(queue.averageWaitTime)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatDate(queue.dateCreated)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fetchQueueDetails(queue.sid)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openUpdateDialog(queue)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQueue(queue.sid)}
                          disabled={isDeleting}
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

      {/* Update Queue Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Queue</DialogTitle>
            <DialogDescription>
              Update the queue settings.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={updateForm.handleSubmit(updateQueue)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="updateFriendlyName">Queue Name</Label>
              <Input
                id="updateFriendlyName"
                {...updateForm.register('friendlyName')}
                placeholder="e.g., Customer Support Queue"
              />
              {updateForm.formState.errors.friendlyName && (
                <p className="text-sm text-red-500">
                  {updateForm.formState.errors.friendlyName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="updateMaxSize">Max Size (optional)</Label>
              <Input
                id="updateMaxSize"
                type="number"
                {...updateForm.register('maxSize')}
                placeholder="e.g., 100"
              />
              {updateForm.formState.errors.maxSize && (
                <p className="text-sm text-red-500">
                  {updateForm.formState.errors.maxSize.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setUpdateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Queue'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Queue Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Queue Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected queue
            </DialogDescription>
          </DialogHeader>
          {selectedQueue && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="members">Members ({selectedQueue.members?.length || 0})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Queue SID</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedQueue.sid}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Friendly Name</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedQueue.friendlyName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Current Size</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedQueue.currentSize}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Max Size</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{selectedQueue.maxSize || 'Unlimited'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Average Wait Time</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatWaitTime(selectedQueue.averageWaitTime)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Date Created</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(selectedQueue.dateCreated)}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="members">
                {selectedQueue.members && selectedQueue.members.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Call SID</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead>Date Enqueued</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedQueue.members.map((member) => (
                        <TableRow key={member.callSid}>
                          <TableCell className="font-mono text-sm">{member.callSid}</TableCell>
                          <TableCell>
                            <Badge variant="outline">#{member.position}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatWaitTime(member.waitTime)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(member.dateEnqueued)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No members currently in this queue.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}