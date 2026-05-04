import { AuditStatus, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { Badge } from "./Badge";

export function StatusBadge({ status }: { status: AuditStatus }) {
  return <Badge label={STATUS_LABELS[status]} className={STATUS_COLORS[status]} />;
}
