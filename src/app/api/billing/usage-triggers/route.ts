import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// GET - Fetch usage triggers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountSid = searchParams.get('accountSid');
    const authToken = searchParams.get('authToken');
    const limit = searchParams.get('limit') || '20';

    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Account SID and Auth Token are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Check if usage triggers API is available
    if (!client.usage || !client.usage.triggers) {
      return NextResponse.json({
        success: true,
        triggers: [],
        totalTriggers: 0,
        message: 'Usage triggers API not available in this Twilio SDK version'
      });
    }
    
    const options: Record<string, string> = {
      limit: limit,
    };

    const triggers = await client.usage.triggers.list(options);

    const triggerData = triggers.map(trigger => ({
      sid: trigger.sid,
      accountSid: trigger.accountSid,
      friendlyName: trigger.friendlyName,
      callbackUrl: trigger.callbackUrl,
      callbackMethod: trigger.callbackMethod,
      triggerBy: trigger.triggerBy,
      triggerValue: trigger.triggerValue,
      currentValue: trigger.currentValue,
      dateCreated: trigger.dateCreated,
      dateUpdated: trigger.dateUpdated,
      uri: trigger.uri,
    }));

    return NextResponse.json({
      success: true,
      triggers: triggerData,
      totalTriggers: triggers.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching usage triggers:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch usage triggers' },
      { status: 500 }
    );
  }
}

// POST - Create usage trigger
export async function POST(request: NextRequest) {
  try {
    const { accountSid, authToken, friendlyName, callbackUrl, triggerBy, triggerValue, usageCategory } = await request.json();

    if (!accountSid || !authToken || !friendlyName || !callbackUrl || !triggerBy || !triggerValue || !usageCategory) {
      return NextResponse.json(
        { error: 'Account SID, Auth Token, friendly name, callback URL, trigger by, trigger value, and usage category are required' },
        { status: 400 }
      );
    }

    const client = twilio(accountSid, authToken);
    
    // Check if usage triggers API is available
    if (!client.usage || !client.usage.triggers) {
      return NextResponse.json(
        { error: 'Usage triggers API not available in this Twilio SDK version' },
        { status: 501 }
      );
    }
    
    const trigger = await client.usage.triggers.create({
      friendlyName,
      callbackUrl,
      triggerBy,
      triggerValue,
      usageCategory,
    });

    return NextResponse.json({
      success: true,
      message: 'Usage trigger created successfully',
      trigger: {
        sid: trigger.sid,
        accountSid: trigger.accountSid,
        friendlyName: trigger.friendlyName,
        callbackUrl: trigger.callbackUrl,
        callbackMethod: trigger.callbackMethod,
        triggerBy: trigger.triggerBy,
        triggerValue: trigger.triggerValue,
        currentValue: trigger.currentValue,
        dateCreated: trigger.dateCreated,
        dateUpdated: trigger.dateUpdated,
        uri: trigger.uri,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating usage trigger:', error);
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 20003) {
        return NextResponse.json(
          { error: 'Invalid Account SID or Auth Token' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create usage trigger' },
      { status: 500 }
    );
  }
}