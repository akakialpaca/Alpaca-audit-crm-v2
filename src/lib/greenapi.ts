function INSTANCE() { return process.env.GREEN_API_INSTANCE!; }
function TOKEN() { return process.env.GREEN_API_TOKEN!; }

function toChatId(phone: string): string {
  if (phone.includes("@")) return phone;
  const digits = phone.replace(/[^\d]/g, "");
  return `${digits}@c.us`;
}

async function sendWA(to: string, body: string, mentions?: string[]): Promise<void> {
  const url = `https://api.green-api.com/waInstance${INSTANCE()}/sendMessage/${TOKEN()}`;
  const payload: Record<string, unknown> = { chatId: toChatId(to), message: body };
  if (mentions?.length) payload.mentionedPhones = mentions;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
  const groupId = process.env.WA_GROUP_CHAT_ID;
  if (!groupId) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  const digits = opts.toNumber.replace(/[^\d]/g, "");
  await sendWA(
    groupId,
    `@${digits} 🚨 შენ დაგემატა ახალი აუდიტი\n\n` +
    `🌐 ${opts.sourceUrl}\n\n` +
    `*დედლაინი:* ${opts.deadline}\n\n` +
    `${siteUrl}/specialist/audits/${opts.auditId}\n\n` +
    `*გთხოვ სისტემაში აუდიტი მინიშნო როგორც მიღებული*`,
    [digits]
  );
}

export async function sendWhatsAppCorrection(opts: {
  toNumber: string;
  specialistName: string;
  sourceUrl: string;
  comments: string;
  auditId: string;
}) {
  const groupId = process.env.WA_GROUP_CHAT_ID;
  if (!groupId) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  const digits = opts.toNumber.replace(/[^\d]/g, "");
  await sendWA(
    groupId,
    `@${digits} ⚠️ საჭიროებს ჩასწორებებს!\n\n` +
    `🌐 ${opts.sourceUrl}\n\n` +
    `💬 ${opts.comments}\n\n` +
    `🔗 ${siteUrl}/specialist/audits/${opts.auditId}`,
    [digits]
  );
}

export async function sendWhatsAppReviewReady(opts: {
  specialistName: string;
  sourceUrl: string;
  auditId: string;
}) {
  const groupId = process.env.WA_GROUP_CHAT_ID;
  if (!groupId) return;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alpaca-audit-crm.vercel.app";
  const adminWA = process.env.ADMIN_WHATSAPP;
  const digits = adminWA?.replace(/[^\d]/g, "") ?? "";
  await sendWA(
    groupId,
    `${digits ? `@${digits} ` : ""}📋 საჭიროებს გადახედვას!\n` +
    `🌐 ${opts.sourceUrl}\n` +
    `👤 სპეციალისტი: ${opts.specialistName}\n` +
    `🔗 ${siteUrl}/admin/audits/${opts.auditId}`,
    digits ? [digits] : []
  );
}

export async function sendWhatsAppCompletedGroup(opts: {
  sourceUrl: string;
  specialistName: string;
  auditResultUrl: string;
  auditPassword: string;
}) {
  const groupId = process.env.WA_GROUP_CHAT_ID;
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
