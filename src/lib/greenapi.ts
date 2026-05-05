function INSTANCE() { return process.env.GREEN_API_INSTANCE!; }
function TOKEN() { return process.env.GREEN_API_TOKEN!; }

function toChatId(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  return `${digits}@c.us`;
}

async function sendWA(to: string, body: string): Promise<void> {
  const url = `https://api.green-api.com/waInstance${INSTANCE()}/sendMessage/${TOKEN()}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chatId: toChatId(to), message: body }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Green API error: ${text}`);
  }
}

export async function sendWhatsAppNewAudit(opts: {
  toNumber: string;
  specialistName: string;
  sourceUrl: string;
  deadline: string;
  auditId: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  await sendWA(
    opts.toNumber,
    `🚨 *${opts.specialistName}* შენ დაგემატა ახალი აუდიტი\n` +
    `${opts.sourceUrl}\n` +
    `${opts.deadline}\n` +
    `${siteUrl}/specialist/audits/${opts.auditId}\n` +
    `გთხოვ სისტემაში აუდიტი მინიშნო როგორც მიღებული`
  );
}

export async function sendWhatsAppCorrection(opts: {
  toNumber: string;
  specialistName: string;
  sourceUrl: string;
  comments: string;
  auditId: string;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  await sendWA(
    opts.toNumber,
    `⚠️ ${opts.specialistName}, კორექცია საჭიროა!\n` +
    `🌐 ${opts.sourceUrl}\n` +
    `💬 ${opts.comments}\n` +
    `🔗 ${siteUrl}/specialist/audits/${opts.auditId}`
  );
}

export async function sendWhatsAppReviewReady(opts: {
  specialistName: string;
  sourceUrl: string;
  auditId: string;
}) {
  const adminWA = process.env.ADMIN_WHATSAPP;
  if (!adminWA) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  await sendWA(
    adminWA,
    `📋 შემოწმება მოლოდინშია!\n` +
    `🌐 ${opts.sourceUrl}\n` +
    `👤 სპეციალისტი: ${opts.specialistName}\n` +
    `🔗 ${siteUrl}/admin/audits/${opts.auditId}`
  );
}
