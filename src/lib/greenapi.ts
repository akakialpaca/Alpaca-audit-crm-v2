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
    `🚨 შენ დაგემატა ახალი აუდიტი\n\n` +
    `🌐 ${opts.sourceUrl}\n\n` +
    `*დედლაინი:* ${opts.deadline}\n\n` +
    `${siteUrl}/specialist/audits/${opts.auditId}\n\n` +
    `*გთხოვ სისტემაში აუდიტი მინიშნო როგორც მიღებული*`
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
    `⚠️ კორექცია საჭიროა!\n\n` +
    `🌐 ${opts.sourceUrl}\n\n` +
    `💬 ${opts.comments}\n\n` +
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
    `📋 საჭიროებს გადახედვას!\n` +
    `🌐 ${opts.sourceUrl}\n` +
    `👤 სპეციალისტი: ${opts.specialistName}\n` +
    `🔗 ${siteUrl}/admin/audits/${opts.auditId}`
  );
}

export async function sendWhatsAppCompletedGroup(opts: {
  sourceUrl: string;
  specialistName: string;
  auditResultUrl: string;
  auditPassword: string;
}) {
  const groupId = process.env.AUDIT_GROUP_CHAT_ID;
  if (!groupId) return;
  await sendWA(
    groupId,
    `✅ *დასრულებული აუდიტი*\n\n` +
    `🌐 ${opts.sourceUrl}\n` +
    `👤 ${opts.specialistName}\n\n` +
    `🔗 ${opts.auditResultUrl || "—"}\n` +
    `🔑 პაროლი: ${opts.auditPassword || "—"}`
  );
}
