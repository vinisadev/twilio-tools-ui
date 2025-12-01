import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - List all phone numbers
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
    const phoneNumbers = await client.incomingPhoneNumbers.list();

    const phoneNumberData = phoneNumbers.map(number => ({
      sid: number.sid,
      phoneNumber: number.phoneNumber,
      friendlyName: number.friendlyName,
      voiceUrl: number.voiceUrl,
      voiceMethod: number.voiceMethod,
      smsUrl: number.smsUrl,
      smsMethod: number.smsMethod,
      capabilities: {
        voice: number.capabilities.voice,
        sms: number.capabilities.sms,
        mms: number.capabilities.mms,
        fax: number.capabilities.fax,
      },
      status: number.status,
      dateCreated: number.dateCreated,
      dateUpdated: number.dateUpdated,
      uri: number.uri,
    }));

    return NextResponse.json({
      success: true,
      phoneNumbers: phoneNumberData,
    });
  } catch (error: unknown) {
    console.error('Error fetching phone numbers:', error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch phone numbers' },
      { status: 500 }
    );
  }
}

// POST - Purchase a phone number
export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, phoneNumber, friendlyName, voiceUrl, smsUrl } = await request.json();

    if (!accountSid || !authToken || !phoneNumber) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, and phone number are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    const purchaseOptions: Record<string, string> = {
      phoneNumber,
    };

    if (friendlyName) purchaseOptions.friendlyName = friendlyName;
    if (voiceUrl) purchaseOptions.voiceUrl = voiceUrl;
    if (smsUrl) purchaseOptions.smsUrl = smsUrl;

    const purchasedNumber = await client.incomingPhoneNumbers.create(purchaseOptions);

    return NextResponse.json({
      success: true,
      message: 'Phone number purchased successfully',
      phoneNumber: {
        sid: purchasedNumber.sid,
        phoneNumber: purchasedNumber.phoneNumber,
        friendlyName: purchasedNumber.friendlyName,
        voiceUrl: purchasedNumber.voiceUrl,
        smsUrl: purchasedNumber.smsUrl,
        capabilities: purchasedNumber.capabilities,
        status: purchasedNumber.status,
        dateCreated: purchasedNumber.dateCreated,
      },
    });
  } catch (error: unknown) {
    console.error('Error purchasing phone number:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
      
      if (error.code === 21211) {
        return NextResponse.json(
          { error: 'Phone number is not available for purchase' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to purchase phone number' },
      { status: 500 }
    );
  }
}