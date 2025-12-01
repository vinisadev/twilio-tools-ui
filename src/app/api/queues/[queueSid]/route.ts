import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Get specific queue details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ queueSid: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const { queueSid } = await params;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    const queue = await client.queues(queueSid).fetch();

    // Get queue members
    const members = await client.queues(queueSid).members.list();
    const memberData = members.map(member => ({
      callSid: member.callSid,
      position: member.position,
      dateEnqueued: member.dateEnqueued,
      waitTime: member.waitTime,
      uri: member.uri,
    }));

    return NextResponse.json({
      success: true,
      queue: {
        sid: queue.sid,
        friendlyName: queue.friendlyName,
        currentSize: queue.currentSize,
        maxSize: queue.maxSize,
        averageWaitTime: queue.averageWaitTime,
        dateCreated: queue.dateCreated,
        dateUpdated: queue.dateUpdated,
        uri: queue.uri,
      },
      members: memberData,
    });
  } catch (error: any) {
    console.error('Error fetching queue:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }
    
    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Queue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch queue' },
      { status: 500 }
    );
  }
}

// PUT - Update queue
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ queueSid: string }> }
) {
  try {
    const { accountSid, authToken, friendlyName, maxSize } = await request.json();
    const { queueSid } = await params;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const updateOptions: any = {};
    if (friendlyName) updateOptions.friendlyName = friendlyName;
    if (maxSize !== undefined && maxSize > 0) updateOptions.maxSize = parseInt(maxSize);

    const queue = await client.queues(queueSid).update(updateOptions);

    return NextResponse.json({
      success: true,
      message: 'Queue updated successfully',
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
  } catch (error: any) {
    console.error('Error updating queue:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }
    
    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Queue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update queue' },
      { status: 500 }
    );
  }
}

// DELETE - Delete queue
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ queueSid: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const { queueSid } = await params;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    await client.queues(queueSid).remove();

    return NextResponse.json({
      success: true,
      message: 'Queue deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting queue:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }
    
    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Queue not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete queue' },
      { status: 500 }
    );
  }
}