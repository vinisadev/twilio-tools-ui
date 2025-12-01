import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Get specific phone number details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phoneNumberSid: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const { phoneNumberSid } = await params;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    const phoneNumber = await client.incomingPhoneNumbers(phoneNumberSid).fetch();

    return NextResponse.json({
      success: true,
      phoneNumber: {
        sid: phoneNumber.sid,
        phoneNumber: phoneNumber.phoneNumber,
        friendlyName: phoneNumber.friendlyName,
        voiceUrl: phoneNumber.voiceUrl,
        voiceMethod: phoneNumber.voiceMethod,
        smsUrl: phoneNumber.smsUrl,
        smsMethod: phoneNumber.smsMethod,
        capabilities: {
          voice: phoneNumber.capabilities.voice,
          sms: phoneNumber.capabilities.sms,
          mms: phoneNumber.capabilities.mms,
          fax: phoneNumber.capabilities.fax,
        },
        status: phoneNumber.status,
        dateCreated: phoneNumber.dateCreated,
        dateUpdated: phoneNumber.dateUpdated,
        uri: phoneNumber.uri,
      },
    });
  } catch (error: any) {
    console.error('Error fetching phone number:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }
    
    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Phone number not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch phone number' },
      { status: 500 }
    );
  }
}

// PUT - Update phone number
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ phoneNumberSid: string }> }
) {
  try {
    const { accountSid, authToken, friendlyName, voiceUrl, smsUrl } = await request.json();
    const { phoneNumberSid } = await params;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const updateOptions: any = {};
    if (friendlyName) updateOptions.friendlyName = friendlyName;
    if (voiceUrl) updateOptions.voiceUrl = voiceUrl;
    if (smsUrl) updateOptions.smsUrl = smsUrl;

    const phoneNumber = await client.incomingPhoneNumbers(phoneNumberSid).update(updateOptions);

    return NextResponse.json({
      success: true,
      message: 'Phone number updated successfully',
      phoneNumber: {
        sid: phoneNumber.sid,
        phoneNumber: phoneNumber.phoneNumber,
        friendlyName: phoneNumber.friendlyName,
        voiceUrl: phoneNumber.voiceUrl,
        smsUrl: phoneNumber.smsUrl,
        capabilities: phoneNumber.capabilities,
        status: phoneNumber.status,
        dateCreated: phoneNumber.dateCreated,
        dateUpdated: phoneNumber.dateUpdated,
      },
    });
  } catch (error: any) {
    console.error('Error updating phone number:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }
    
    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Phone number not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update phone number' },
      { status: 500 }
    );
  }
}

// DELETE - Release phone number
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ phoneNumberSid: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const { phoneNumberSid } = await params;

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    await client.incomingPhoneNumbers(phoneNumberSid).remove();

    return NextResponse.json({
      success: true,
      message: 'Phone number released successfully',
    });
  } catch (error: any) {
    console.error('Error releasing phone number:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }
    
    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Phone number not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to release phone number' },
      { status: 500 }
    );
  }
}