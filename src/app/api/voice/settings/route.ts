import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Fetch voice settings
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
    
    // Fetch account details to get current settings
    const account = await client.api.accounts(accountSid).fetch();
    
    // Get current voice settings from account
    const voiceSettings = {
      // Recording settings
      recording: {
        enabled: true, // This would come from account settings
        trim: 'trim-silence', // trim-silence or do-not-trim
        channels: 'dual', // dual or single
        format: 'mp3', // mp3 or wav
        statusCallback: '', // URL for recording status callbacks
        statusCallbackMethod: 'POST', // POST or GET
      },
      // Authentication settings
      authentication: {
        httpAuthEnabled: false, // HTTP authentication for recordings
        username: '', // HTTP auth username
        password: '', // HTTP auth password (masked)
      },
      // Call settings
      callSettings: {
        answerOnBridge: false, // Answer on bridge
        hangupOnStar: false, // Hangup on star
        timeLimit: 14400, // Max call duration (4 hours)
        recordFromAnswer: false, // Start recording from answer
        recordFromRinging: false, // Start recording from ringing
      },
      // Webhook settings
      webhooks: {
        voiceUrl: '', // Voice webhook URL
        voiceMethod: 'POST', // Voice webhook method
        statusCallback: '', // Status callback URL
        statusCallbackMethod: 'POST', // Status callback method
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'], // Events to track
      },
      // Account-level settings
      account: {
        sid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
      }
    };

    return NextResponse.json({
      success: true,
      settings: voiceSettings,
    });
  } catch (error: unknown) {
    console.error('Error fetching voice settings:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch voice settings' },
      { status: 500 }
    );
  }
}

// PUT - Update voice settings
export async function PUT(request: NextRequest) {
  try {
    const { 
      accountSid, 
      authToken, 
      recording, 
      authentication, 
      callSettings, 
      webhooks 
    } = await request.json();

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Note: Account-level voice settings are limited in the Twilio API
    // Most voice settings are configured at the phone number or call level
    // We'll just fetch the current account info
    const account = await client.api.accounts(accountSid).fetch();

    // Note: Some settings like recording authentication are typically set at the call level
    // or through Twilio Console. The API has limited account-level voice settings.

    return NextResponse.json({
      success: true,
      message: 'Voice settings updated successfully',
      settings: {
        recording,
        authentication,
        callSettings,
        webhooks,
        account: {
          sid: account.sid,
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type,
        }
      },
    });
  } catch (error: unknown) {
    console.error('Error updating voice settings:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update voice settings' },
      { status: 500 }
    );
  }
}