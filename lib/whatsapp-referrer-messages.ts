import { Referrer } from "@prisma/client";

/**
 * WhatsApp Message Templates for Referrer Network
 * Uses your existing Meta WhatsApp Business API configuration
 * Requires: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN (in .env.local or Vercel)
 */

interface ReferrerJobDetails {
  customerName?: string;
  jobValue: number;
  commission: number;
}

const META_API_VERSION = "v18.0";
const META_GRAPH_URL = "https://graph.instagram.com";

/**
 * Send welcome message when referrer joins network
 * Side-gig positioning: emphasize ease and earning potential
 */
export async function sendWhatsAppReferrerWelcome(referrer: Referrer): Promise<void> {
  const message = `🎉 You're In! Start Earning Today

Your code: *${referrer.referralCode}*

💰 The Setup:
Everyone knows someone needing urgent delivery. You get £${referrer.commission} every time they use your code.

📱 Copy & Share:
"For urgent deliveries, I recommend Saint & Story. Use code ${referrer.referralCode}."

💸 Watch Your Earnings:
https://saintandstoryltd.co.uk/referral/dashboard?code=${referrer.referralCode}

No limits. No catch. Refer as much as you want.

❓ Questions? Reply here or call 0203 051 9243`;

  await sendWhatsAppMessage(referrer.phone, message);
}

/**
 * Send confirmation when a referral converts to a job
 * Includes: Customer name, job value, commission earned
 */
export async function sendWhatsAppReferrerJobConfirmed(
  referrer: Referrer,
  jobDetails: ReferrerJobDetails
): Promise<void> {
  const message = `✅ Referral Confirmed!

Customer: ${jobDetails.customerName}
Job value: £${jobDetails.jobValue.toFixed(2)}
Your commission: £${jobDetails.commission.toFixed(2)}

This has been added to your account. 🎉

Keep sharing code *${referrer.referralCode}* to earn more!`;

  await sendWhatsAppMessage(referrer.phone, message);
}

/**
 * Send weekly earnings summary
 * Includes: Week's earnings, total referrals, next payout
 */
export async function sendWhatsAppWeeklyEarningsSummary(
  referrer: Referrer,
  weeklyStats: {
    weeklyEarnings: number;
    weeklyReferrals: number;
    totalMonth: number;
    nextPayoutDate: string;
  }
): Promise<void> {
  const message = `📊 Weekly Summary

This week: £${weeklyStats.weeklyEarnings.toFixed(2)} (${weeklyStats.weeklyReferrals} referrals)
Month to date: £${weeklyStats.totalMonth.toFixed(2)}

Next payout: ${weeklyStats.nextPayoutDate}

Keep it up! 💪 Share code *${referrer.referralCode}*`;

  await sendWhatsAppMessage(referrer.phone, message);
}

/**
 * Send payout confirmation
 * Includes: Amount paid, account details, next month info
 */
export async function sendWhatsAppPayoutConfirmed(
  referrer: Referrer,
  payoutInfo: {
    amount: number;
    month: string;
    referralCount: number;
    bankTransferId: string;
  }
): Promise<void> {
  const message = `✅ Payout Processed!

Amount: £${payoutInfo.amount.toFixed(2)}
Period: ${payoutInfo.month}
Referrals: ${payoutInfo.referralCount}
Reference: ${payoutInfo.bankTransferId}

Check your bank account. Transfer may take 1-2 business days.

Thanks for referring! 🙌`;

  await sendWhatsAppMessage(referrer.phone, message);
}

/**
 * Core WhatsApp message sender using Meta API
 * Uses: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN
 * Dev mode: WHATSAPP_DEV_MODE=true logs instead of sending
 */
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
  console.log(`[WHATSAPP REFERRER] Sending message to ${phoneNumber}`);

  try {
    // Get credentials from env
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const isDev = process.env.WHATSAPP_DEV_MODE === "true";

    if (!phoneNumberId || !accessToken) {
      if (isDev) {
        // DEV MODE: Log message instead of sending
        console.log("[WHATSAPP REFERRER] 📱 DEV MODE - Would send to:", phoneNumber);
        console.log("[WHATSAPP REFERRER] Message preview:");
        console.log("---");
        console.log(message);
        console.log("---");
        return;
      }

      console.warn(
        "[WHATSAPP REFERRER] ⚠ WhatsApp credentials not configured. Set WHATSAPP_PHONE_NUMBER_ID and WHATSAPP_ACCESS_TOKEN"
      );
      console.log("[WHATSAPP REFERRER] Message would be sent to:", phoneNumber);
      console.log("[WHATSAPP REFERRER] Message:", message);
      return;
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);

    // Call Meta WhatsApp API
    const url = `${META_GRAPH_URL}/${META_API_VERSION}/${phoneNumberId}/messages`;

    console.log(`[WHATSAPP REFERRER] Calling Meta API...`);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[WHATSAPP REFERRER] ✗ API Error:`, data);
      throw new Error(`Meta API error: ${JSON.stringify(data.error)}`);
    }

    const messageId = data.messages?.[0]?.id;
    console.log(`[WHATSAPP REFERRER] ✓ Message sent: ${messageId}`);
  } catch (error) {
    console.error(`[WHATSAPP REFERRER] Error:`, error);
    // Don't throw - allow signup/job confirmation to continue even if WhatsApp fails
    // The referrer is created successfully, just without instant WhatsApp notification
  }
}

/**
 * Format phone number for Meta API
 * Input: "0203 123 4567" or "+44203123456"
 * Output: "442031234567"
 */
function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  // If starts with 0 (UK number without country code), replace with 44
  if (cleaned.startsWith("0")) {
    return "44" + cleaned.slice(1);
  }

  // If already has country code, use as-is
  if (cleaned.length > 10) {
    return cleaned;
  }

  // Otherwise assume UK and add 44
  return "44" + cleaned;
}
