import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken } = await request.json();

    // Validate required fields
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    // Validate Account SID format (starts with AC)
    if (!accountSid.startsWith('AC')) {
      return NextResponse.json(
        { error: 'Invalid Account SID format. Account SID should start with "AC"' },
        { status: 400 }
      );
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Test the credentials by fetching account information
    const account = await client.api.accounts(accountSid).fetch();

    return NextResponse.json({
      success: true,
      message: 'Twilio credentials are valid!',
      accountInfo: {
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      },
    });
  } catch (error: any) {
    console.error('twilio validation error: ', error);

    // Handle specific Twilio errors
    if (error.code === 20003) {
      return NextResponse.json(
        { error: 'Invalid Account SID or Auth Token' },
        { status: 401 }
      );
    }

    if (error.code === 20404) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to validate Twilio credentials. Please check your credentials and try again.' },
      { status: 500 }
    );
  }
}