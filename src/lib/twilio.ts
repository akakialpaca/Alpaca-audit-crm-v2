import twilio from "twilio";

function getTwilio() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

function FROM() {
  return process.env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886";
}

function toWA(number: string) {
  return number.startsWith("whatsapp:") ? number : `whatsapp:${number}`;
}

export async function sendWhatsAppNewAudit(opts: {
  toNumber: string;
  specialistName: string;
  sourceUrl: string;
  deadline: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  await getTwilio().messages.create({
    from: FROM(),
    to: toWA(opts.toNumber),
    body:
      `🆕 გამარჯობა, ${opts.specialistName}!\n` +
      `ახალი SEO აუდიტი დაგენიჭა:\n` +
      `🌐 ${opts.sourceUrl}\n` +
      `📅 ვადა: ${opts.deadline}\n` +
      `🔗 ${siteUrl}/specialist`,
  });
}

export async function sendWhatsAppCorrection(opts: {
  toNumber: string;
  specialistName: string;
  sourceUrl: string;
  comments: string;
  auditId: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  await getTwilio().messages.create({
    from: FROM(),
    to: toWA(opts.toNumber),
    body:
      `⚠️ ${opts.specialistName}, კორექცია საჭიროა!\n` +
      `🌐 ${opts.sourceUrl}\n` +
      `💬 ${opts.comments}\n` +
      `🔗 ${siteUrl}/specialist/audits/${opts.auditId}`,
  });
}

export async function sendWhatsAppReviewReady(opts: {
  specialistName: string;
  sourceUrl: string;
  auditId: string;
}) {
  const adminWA = process.env.ADMIN_WHATSAPP;
  if (!adminWA) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  await getTwilio().messages.create({
    from: FROM(),
    to: toWA(adminWA),
    body:
      `📋 შემოწმება მოლოდინშია!\n` +
      `🌐 ${opts.sourceUrl}\n` +
      `👤 სპეციალისტი: ${opts.specialistName}\n` +
      `🔗 ${siteUrl}/admin/audits/${opts.auditId}`,
  });
}
