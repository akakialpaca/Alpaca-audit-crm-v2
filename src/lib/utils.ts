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
  created_by: string | null;
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

export function isOverdue(deadline: string, status: AuditStatus): boolean {
  if (status === "Completed") return false;
  return new Date(deadline) < new Date();
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
