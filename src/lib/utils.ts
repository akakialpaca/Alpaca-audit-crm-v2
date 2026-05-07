export type AuditStatus = "Pending" | "In Progress" | "Review" | "In Correction" | "Completed";
export type Importance = "High" | "Medium" | "Low";
export type Role = "admin" | "specialist";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  created_at: string;
}

export interface CorrectionEntry {
  comment: string;
  created_at: string;
}

export interface Audit {
  id: string;
  created_at: string;
  source_url: string;
  language: string;
  keyword_languages: string[];
  target_market: string;
  importance: Importance;
  deadline: string;
  status: AuditStatus;
  assigned_specialist_id: string | null;
  audit_result_url: string | null;
  audit_password: string | null;
  admin_comments: string | null;
  correction_history: CorrectionEntry[] | null;
  notes: string | null;
  created_by: string | null;
  acknowledged_at: string | null;
  profiles?: Profile;
}

export const STATUS_LABELS: Record<AuditStatus, string> = {
  "Pending": "მოლოდინში",
  "In Progress": "მიმდინარე",
  "Review": "შემოწმებაში",
  "In Correction": "კორექციაში",
  "Completed": "დასრულებული",
};

export const STATUS_COLORS: Record<AuditStatus, string> = {
  "Pending": "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  "Review": "bg-yellow-100 text-yellow-700",
  "In Correction": "bg-orange-100 text-orange-700",
  "Completed": "bg-green-100 text-green-700",
};

export const IMPORTANCE_LABELS: Record<Importance, string> = {
  "High": "მაღალი",
  "Medium": "საშუალო",
  "Low": "დაბალი",
};

export const IMPORTANCE_COLORS: Record<Importance, string> = {
  "High": "bg-red-100 text-red-700",
  "Medium": "bg-yellow-100 text-yellow-700",
  "Low": "bg-gray-100 text-gray-600",
};

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ka-GE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleString("ka-GE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tbilisi",
  });
}

export function isOverdue(deadline: string, status: AuditStatus): boolean {
  if (status === "Completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function isDueToday(deadline: string): boolean {
  const today = new Date();
  const d = new Date(deadline);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// ─── CRM Types ───────────────────────────────────────────

export type PipelineStage = "Lead" | "Meeting" | "Proposal" | "Negotiation" | "Won" | "Lost";
export type ActivityType = "call" | "email" | "meeting" | "note";

export const PIPELINE_STAGES: { value: PipelineStage; label: string; color: string }[] = [
  { value: "Lead",        label: "ლიდი",           color: "bg-gray-100 text-gray-700" },
  { value: "Meeting",     label: "შეხვედრა",        color: "bg-blue-100 text-blue-700" },
  { value: "Proposal",    label: "წინადადება",      color: "bg-purple-100 text-purple-700" },
  { value: "Negotiation", label: "მოლაპარაკება",    color: "bg-yellow-100 text-yellow-700" },
  { value: "Won",         label: "მოგებული",        color: "bg-green-100 text-green-700" },
  { value: "Lost",        label: "დაკარგული",       color: "bg-red-100 text-red-700" },
];

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call:    "📞 ზარი",
  email:   "✉️ მეილი",
  meeting: "🤝 შეხვედრა",
  note:    "📝 შენიშვნა",
};

export interface Company {
  id: string;
  created_at: string;
  name: string;
  website: string | null;
  industry: string | null;
  pipeline_stage: PipelineStage;
  notes: string | null;
  created_by: string | null;
  contacts?: Contact[];
}

export interface Contact {
  id: string;
  created_at: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_number: string | null;
  linkedin_url: string | null;
  notes: string | null;
  created_by: string | null;
  company?: Company;
}

export interface ContactActivity {
  id: string;
  created_at: string;
  contact_id: string;
  type: ActivityType;
  content: string;
  created_by: string | null;
  profiles?: { full_name: string };
}
