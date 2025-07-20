// services/googleMeetService.ts
import { google } from "googleapis";
import fs from "fs";
import path from "path";

// Load service account credentials from file
const credentialsPath = path.join(__dirname, "../../google-service-account.json");

if (!fs.existsSync(credentialsPath)) {
  throw new Error("Service account credentials file not found.");
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));

// Define required scopes
const SCOPES = ["https://www.googleapis.com/auth/calendar"];

// Initialize JWT client with loaded credentials
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: SCOPES,
});

// Initialize Google Calendar client
const calendar = google.calendar({ version: "v3", auth });

// Main function to create a Meet link
export async function createGoogleMeetLink(summary: string, startTime: string, endTime: string): Promise<string> {
  try {
    const event = {
      summary,
      start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      requestBody: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri;

    if (!meetLink) {
      console.error("Google Calendar API returned no Meet link. Response:", response.data);
      throw new Error("Google Meet link was not generated.");
    }

    return meetLink;
  } catch (error: any) {
    // Google API errors
    if (error?.response?.data?.error) {
      console.error("Google API error:", error.response.data.error);
      throw new Error(`Google API error: ${error.response.data.error.message}`);
    }

    // Auth-specific errors
    if (error.message?.includes("invalid_grant") || error.message?.includes("invalid_client")) {
      console.error("Authentication failed with Google API:", error.message);
      throw new Error("Authentication with Google API failed. Check service account credentials.");
    }

    // Node/OpenSSL key compatibility issue
    if (error.code === "ERR_OSSL_UNSUPPORTED") {
      console.error("Private key format unsupported in current Node.js version:", error);
      throw new Error("Private key format not supported in current Node.js/OpenSSL version. Consider updating key or downgrading Node.");
    }

    // Fallback error
    console.error("Unexpected error during Google Meet link generation:", error);
    throw new Error("Unexpected error occurred while generating Google Meet link.");
  }
}
