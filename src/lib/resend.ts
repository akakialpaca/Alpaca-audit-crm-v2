import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}
function FROM() { return process.env.ADMIN_FROM_EMAIL ?? "noreply@audits.alpaca.ge"; }
function ADMIN_EMAIL() { return process.env.ADMIN_EMAIL ?? "akaki@alpaca.ge"; }

function auditEmailHtml(title: string, body: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
      <div style="background:#D42B2B;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Alpaca SEO</h1>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 16px;font-size:18px;color:#1A1A1A;">${title}</h2>
        ${body}
      </div>
      <div style="padding:16px 32px;background:#f8f8f8;border-top:1px solid #e5e5e5;">
        <p style="margin:0;font-size:12px;color:#666;">Alpaca SEO Agency · audits.alpaca.ge</p>
      </div>
    </div>
  `;
}

export async function sendNewAssignmentEmail(opts: {
  specialistEmail: string;
  specialistName: string;
  sourceUrl: string;
  deadline: string;
  importance: string;
}) {
  await getResend().emails.send({
    from: FROM(),
    to: opts.specialistEmail,
    subject: `[Alpaca] ახალი დავალება: ${opts.sourceUrl}`,
    html: auditEmailHtml(
      "ახალი SEO აუდიტი დაგენიჭა",
      `<p style="color:#444;line-height:1.6;">გამარჯობა, <strong>${opts.specialistName}</strong>!</p>
       <p style="color:#444;line-height:1.6;">შენ დაგენიჭა ახალი SEO აუდიტი:</p>
       <table style="width:100%;border-collapse:collapse;margin:16px 0;">
         <tr><td style="padding:8px 0;color:#666;width:140px;">ვებსაიტი:</td><td style="padding:8px 0;font-weight:600;">${opts.sourceUrl}</td></tr>
         <tr><td style="padding:8px 0;color:#666;">ვადა:</td><td style="padding:8px 0;font-weight:600;">${opts.deadline}</td></tr>
         <tr><td style="padding:8px 0;color:#666;">მნიშვნელობა:</td><td style="padding:8px 0;font-weight:600;">${opts.importance}</td></tr>
       </table>
       <a href="${process.env.NEXT_PUBLIC_SITE_URL}/specialist" style="display:inline-block;background:#D42B2B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;">დავალების ნახვა</a>`
    ),
  });
}

export async function sendReviewRequestEmail(opts: {
  sourceUrl: string;
  specialistName: string;
  auditId: string;
}) {
  await getResend().emails.send({
    from: FROM(),
    to: ADMIN_EMAIL(),
    subject: `[Alpaca] აუდიტი მზადაა შესამოწმებლად: ${opts.sourceUrl}`,
    html: auditEmailHtml(
      "აუდიტი შემოწმებას ელის",
      `<p style="color:#444;line-height:1.6;"><strong>${opts.specialistName}</strong>-მა დაასრულა და Review-ზე გამოაგზავნა:</p>
       <p style="color:#444;"><strong>${opts.sourceUrl}</strong></p>
       <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/audits/${opts.auditId}" style="display:inline-block;background:#D42B2B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px;">შემოწმება</a>`
    ),
  });
}

export async function sendCorrectionEmail(opts: {
  specialistEmail: string;
  specialistName: string;
  sourceUrl: string;
  comments: string;
  auditId: string;
}) {
  await getResend().emails.send({
    from: FROM(),
    to: opts.specialistEmail,
    subject: `[Alpaca] კორექციაა საჭირო: ${opts.sourceUrl}`,
    html: auditEmailHtml(
      "კორექციაა საჭირო",
      `<p style="color:#444;line-height:1.6;">გამარჯობა, <strong>${opts.specialistName}</strong>!</p>
       <p style="color:#444;line-height:1.6;">ადმინი ითხოვს კორექციას <strong>${opts.sourceUrl}</strong>-სთვის:</p>
       <div style="background:#fff3f3;border-left:4px solid #D42B2B;padding:16px;margin:16px 0;border-radius:4px;">
         <p style="margin:0;color:#444;">${opts.comments}</p>
       </div>
       <a href="${process.env.NEXT_PUBLIC_SITE_URL}/specialist/audits/${opts.auditId}" style="display:inline-block;background:#D42B2B;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:8px;">დავალების გახსნა</a>`
    ),
  });
}

export async function sendCompletedEmail(opts: {
  specialistEmail: string;
  specialistName: string;
  sourceUrl: string;
}) {
  await getResend().emails.send({
    from: FROM(),
    to: opts.specialistEmail,
    subject: `[Alpaca] დავალება დასრულებულია: ${opts.sourceUrl}`,
    html: auditEmailHtml(
      "დავალება დასრულდა",
      `<p style="color:#444;line-height:1.6;">გამარჯობა, <strong>${opts.specialistName}</strong>!</p>
       <p style="color:#444;line-height:1.6;"><strong>${opts.sourceUrl}</strong>-ის აუდიტი ადმინმა დაამტკიცა და სტატუსი <span style="color:#16a34a;font-weight:700;">დასრულებული</span>-ზე გადავიდა.</p>
       <p style="color:#444;">გმადლობ შესანიშნავი მუშაობისთვის!</p>`
    ),
  });
}
