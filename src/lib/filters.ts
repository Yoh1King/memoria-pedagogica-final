import { withinDays } from "./selectors";
import { typeLabel, type EnvironmentData, type ObservationRecord } from "./types";

export type FilterState = {
  classId: string;
  studentId: string;
  type: string;
  topic: string;
  period: string;
  query: string;
};

export const ALL = "todos";

export const PERIOD_OPTIONS = [
  { value: ALL, label: "Todo o período" },
  { value: "7", label: "Últimos 7 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "90", label: "Últimos 90 dias" },
];

export function emptyFilters(partial?: Partial<FilterState>): FilterState {
  return {
    classId: ALL,
    studentId: ALL,
    type: ALL,
    topic: ALL,
    period: ALL,
    query: "",
    ...partial,
  };
}

export function applyFilters(
  data: EnvironmentData,
  records: ObservationRecord[],
  f: FilterState,
): ObservationRecord[] {
  const query = f.query.trim().toLowerCase();
  return records.filter((r) => {
    if (f.classId !== ALL && r.classId !== f.classId) return false;
    if (f.studentId !== ALL && !r.studentIds.includes(f.studentId)) return false;
    if (f.type !== ALL && typeLabel(r) !== f.type) return false;
    if (f.topic !== ALL && r.topic !== f.topic) return false;
    if (f.period !== ALL && !withinDays(r, Number(f.period))) return false;
    if (query) {
      const names = r.studentIds
        .map((id) => data.students.find((s) => s.id === id)?.name ?? "")
        .join(" ");
      const haystack = `${r.topic} ${typeLabel(r)} ${r.detail ?? ""} ${names}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}
