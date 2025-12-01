import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Test Twilio API connectivity
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
    
    // Test basic account access
    const account = await client.api.accounts(accountSid).fetch();
    
    // Test what's available in the client
    const availableMethods = {
      hasUsage: !!client.usage,
      hasUsageRecords: !!client.usage?.records,
      hasUsageTriggers: !!client.usage?.triggers,
      hasPricing: !!client.pricing,
      hasBalance: !!client.balance,
      accountInfo: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Twilio API test successful',
      availableMethods,
    });
  } catch (error: unknown) {
    console.error('Error testing Twilio API:', error);
    
    const errorMessage = error && typeof error === 'object' && 'message' in error 
      ? (error as { message: string }).message 
      : 'Unknown error';
    
    const errorCode = error && typeof error === 'object' && 'code' in error 
      ? (error as { code: number }).code 
      : undefined;

    return NextResponse.json(
      { 
        error: 'Failed to test Twilio API',
        details: errorMessage,
        code: errorCode
      },
      { status: 500 }
    );
  }
}