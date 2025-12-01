import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Get queue members
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
      members: memberData,
    });
  } catch (error: any) {
    console.error('Error fetching queue members:', error);
    
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
      { error: 'Failed to fetch queue members' },
      { status: 500 }
    );
  }
}