import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - List all queues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    const queues = await client.queues.list();

    const queueData = queues.map(queue => ({
      sid: queue.sid,
      friendlyName: queue.friendlyName,
      currentSize: queue.currentSize,
      maxSize: queue.maxSize,
      averageWaitTime: queue.averageWaitTime,
      dateCreated: queue.dateCreated,
      dateUpdated: queue.dateUpdated,
    }));

    return NextResponse.json({
      success: true,
      queues: queueData,
    });
  } catch (error: unknown) {
    console.error('Error fetching queues:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch queues' },
      { status: 500 }
    );
  }
}

// POST - Create a new queue
export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, friendlyName, maxSize } = await request.json();

    if (!accountSid || !authToken || !friendlyName) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, and friendly name are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const createOptions: Record<string, string | number> = {
      friendlyName,
    };

    if (maxSize && maxSize > 0) {
      createOptions.maxSize = parseInt(maxSize);
    }

    const queue = await client.queues.create(createOptions);

    return NextResponse.json({
      success: true,
      message: 'Queue created successfully',
      queue: {
        sid: queue.sid,
        friendlyName: queue.friendlyName,
        maxSize: queue.maxSize,
        currentSize: queue.currentSize,
        averageWaitTime: queue.averageWaitTime,
        dateCreated: queue.dateCreated,
        dateUpdated: queue.dateUpdated,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating queue:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create queue' },
      { status: 500 }
    );
  }
}