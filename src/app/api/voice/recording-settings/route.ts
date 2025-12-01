import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Get recording settings for a specific call or phone number
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const phoneNumberSid = searchParams.get('phoneNumberSid');

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    let recordingSettings = {};
    
    if (phoneNumberSid) {
      // Get recording settings for a specific phone number
      try {
        const phoneNumber = await client.incomingPhoneNumbers(phoneNumberSid).fetch();
        recordingSettings = {
          phoneNumberSid: phoneNumber.sid,
          phoneNumber: phoneNumber.phoneNumber,
          friendlyName: phoneNumber.friendlyName,
          voiceUrl: phoneNumber.voiceUrl,
          voiceMethod: phoneNumber.voiceMethod,
          statusCallback: phoneNumber.statusCallback,
          statusCallbackMethod: phoneNumber.statusCallbackMethod,
          // Recording settings are typically set at call time, not stored on phone numbers
          defaultRecordingSettings: {
            record: false,
            recordingChannels: 'dual',
            recordingStatusCallback: '',
            recordingStatusCallbackMethod: 'POST',
          }
        };
      } catch {
        return NextResponse.json(
          { error: 'Phone number not found' },
          { status: 404 }
        );
      }
    } else {
      // Get general recording settings
      recordingSettings = {
        defaultRecordingSettings: {
          record: false,
          recordingChannels: 'dual', // dual or mono
          recordingStatusCallback: '',
          recordingStatusCallbackMethod: 'POST',
          trim: 'trim-silence', // trim-silence or do-not-trim
        },
        authenticationSettings: {
          httpAuthEnabled: false,
          username: '',
          password: '', // This would be masked in real implementation
        }
      };
    }

    return NextResponse.json({
      success: true,
      recordingSettings,
    });
  } catch (error: unknown) {
    console.error('Error fetching recording settings:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch recording settings' },
      { status: 500 }
    );
  }
}

// POST - Create a call with specific recording settings
export async function POST(request: NextRequest) {
  try {
    const { 
      accountSid, 
      authToken, 
      to, 
      from, 
      recordingSettings,
      authenticationSettings 
    } = await request.json();

    if (!accountSid || !authToken || !to || !from) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, to, and from are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Prepare call options with recording settings
    const callOptions: Record<string, string | boolean> = {
      to,
      from,
      record: recordingSettings?.record || false,
      recordingChannels: recordingSettings?.recordingChannels || 'dual',
      trim: recordingSettings?.trim || 'trim-silence',
    };

    // Add recording status callback if provided
    if (recordingSettings?.recordingStatusCallback) {
      callOptions.recordingStatusCallback = recordingSettings.recordingStatusCallback;
      callOptions.recordingStatusCallbackMethod = recordingSettings?.recordingStatusCallbackMethod || 'POST';
    }

    // Add HTTP authentication for recordings if enabled
    if (authenticationSettings?.httpAuthEnabled && authenticationSettings?.username && authenticationSettings?.password) {
      callOptions.recordingStatusCallback = recordingSettings?.recordingStatusCallback || '';
      // Note: HTTP auth for recordings is typically handled at the webhook level
      // The actual authentication would be implemented in your webhook endpoint
    }

    const call = await client.calls.create(callOptions as {
      to: string;
      from: string;
      record: boolean;
      recordingChannels: string;
      trim: string;
      recordingStatusCallback?: string;
      recordingStatusCallbackMethod?: string;
    });

    return NextResponse.json({
      success: true,
      message: 'Call created with recording settings',
      call: {
        sid: call.sid,
        to: call.to,
        from: call.from,
        status: call.status,
        recordingSettings: {
          record: callOptions.record,
          recordingChannels: callOptions.recordingChannels,
          trim: callOptions.trim,
          recordingStatusCallback: callOptions.recordingStatusCallback,
        }
      },
    });
  } catch (error: unknown) {
    console.error('Error creating call with recording settings:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create call with recording settings' },
      { status: 500 }
    );
  }
}