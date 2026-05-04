import { Importance, IMPORTANCE_COLORS, IMPORTANCE_LABELS } from "@/lib/utils";
import { Badge } from "./Badge";

export function ImportanceBadge({ importance }: { importance: Importance }) {
  return <Badge label={IMPORTANCE_LABELS[importance]} className={IMPORTANCE_COLORS[importance]} />;
}
