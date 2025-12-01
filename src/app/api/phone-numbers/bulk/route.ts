import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// POST - Bulk purchase phone numbers
export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, phoneNumbers, friendlyName, voiceUrl, smsUrl } = await request.json();

    if (!accountSid || !authToken || !phoneNumbers || !Array.isArray(phoneNumbers)) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, and phone numbers array are required' },
        { status: 400 }
      );
    }

    if (phoneNumbers.length === 0) {
      return NextResponse.json(
        { error: 'At least one phone number is required' },
        { status: 400 }
      );
    }

    if (phoneNumbers.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 phone numbers can be purchased at once' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    const results = [];
    const errors = [];

    for (const phoneNumber of phoneNumbers) {
      try {
        const purchaseOptions: any = {
          phoneNumber,
        };

        if (friendlyName) purchaseOptions.friendlyName = friendlyName;
        if (voiceUrl) purchaseOptions.voiceUrl = voiceUrl;
        if (smsUrl) purchaseOptions.smsUrl = smsUrl;

        const purchasedNumber = await client.incomingPhoneNumbers.create(purchaseOptions);
        
        results.push({
          phoneNumber,
          success: true,
          sid: purchasedNumber.sid,
          friendlyName: purchasedNumber.friendlyName,
        });
      } catch (error: any) {
        errors.push({
          phoneNumber,
          success: false,
          error: error.message || 'Failed to purchase number',
          code: error.code,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk purchase completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
      summary: {
        total: phoneNumbers.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error: any) {
    console.error('Error in bulk purchase:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process bulk purchase' },
      { status: 500 }
    );
  }
}

// DELETE - Bulk release phone numbers
export async function DELETE(request: NextRequest) {
  try {
    const { accountSid, authToken, phoneNumberSids } = await request.json();

    if (!accountSid || !authToken || !phoneNumberSids || !Array.isArray(phoneNumberSids)) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, and phone number SIDs array are required' },
        { status: 400 }
      );
    }

    if (phoneNumberSids.length === 0) {
      return NextResponse.json(
        { error: 'At least one phone number SID is required' },
        { status: 400 }
      );
    }

    if (phoneNumberSids.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 phone numbers can be released at once' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    const results = [];
    const errors = [];

    for (const phoneNumberSid of phoneNumberSids) {
      try {
        await client.incomingPhoneNumbers(phoneNumberSid).remove();
        
        results.push({
          phoneNumberSid,
          success: true,
        });
      } catch (error: any) {
        errors.push({
          phoneNumberSid,
          success: false,
          error: error.message || 'Failed to release number',
          code: error.code,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk release completed. ${results.length} successful, ${errors.length} failed.`,
      results,
      errors,
      summary: {
        total: phoneNumberSids.length,
        successful: results.length,
        failed: errors.length,
      },
    });
  } catch (error: any) {
    console.error('Error in bulk release:', error);
    
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process bulk release' },
      { status: 500 }
    );
  }
}