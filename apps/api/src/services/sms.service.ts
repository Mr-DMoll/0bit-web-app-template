import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

export const sendSmsOtp = async (phoneNumber: string, code: string) => {
  await client.messages.create({
    body: `Your verification code is: ${code}. Valid for 15 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to:   phoneNumber,
  });
};