import { daysBetween, parseDate } from "./format";
import {
  isAttention,
  isPositive,
  typeLabel,
  type EnvironmentData,
  type ObservationRecord,
  type SchoolClass,
  type Student,
} from "./types";

export function activeClasses(data: EnvironmentData): SchoolClass[] {
  return data.classes.filter((c) => !c.archived);
}

export function classStudents(data: EnvironmentData, classId: string): Student[] {
  return data.students
    .filter((s) => s.classId === classId)
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export function classRecords(data: EnvironmentData, classId: string): ObservationRecord[] {
  return sortRecords(data.records.filter((r) => r.classId === classId));
}

export function studentRecords(data: EnvironmentData, studentId: string): ObservationRecord[] {
  return sortRecords(data.records.filter((r) => r.studentIds.includes(studentId)));
}

export function sortRecords(records: ObservationRecord[]): ObservationRecord[] {
  return [...records].sort((a, b) =>
    `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`),
  );
}

export function withinDays(record: ObservationRecord, days: number): boolean {
  const diff = daysBetween(record.date);
  return diff >= 0 && diff < days;
}

export function activeRecords(data: EnvironmentData): ObservationRecord[] {
  const ids = new Set(activeClasses(data).map((c) => c.id));
  return sortRecords(data.records.filter((r) => ids.has(r.classId)));
}

export function getClass(data: EnvironmentData, id: string): SchoolClass | undefined {
  return data.classes.find((c) => c.id === id);
}

export function getStudent(data: EnvironmentData, id: string): Student | undefined {
  return data.students.find((s) => s.id === id);
}

export function recordPeopleLabel(data: EnvironmentData, record: ObservationRecord): string {
  if (record.scope === "class") return "Turma inteira";
  const names = record.studentIds
    .map((id) => getStudent(data, id)?.name)
    .filter(Boolean) as string[];
  if (names.length === 0) return "Aluno(s) removido(s)";
  if (names.length === 1) return names[0] as string;
  return `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`;
}

export function typeCounts(records: ObservationRecord[]): Array<{ label: string; count: number }> {
  const map = new Map<string, number>();
  records.forEach((r) => {
    const label = typeLabel(r);
    map.set(label, (map.get(label) ?? 0) + 1);
  });
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

export function countAttention(records: ObservationRecord[]): number {
  return records.filter(isAttention).length;
}

export function countPositive(records: ObservationRecord[]): number {
  return records.filter(isPositive).length;
}

export function topics(records: ObservationRecord[]): string[] {
  return [...new Set(records.map((r) => r.topic).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function studentsInRecords(
  data: EnvironmentData,
  records: ObservationRecord[],
): Array<{ student: Student; count: number }> {
  const map = new Map<string, number>();
  records.forEach((r) => r.studentIds.forEach((id) => map.set(id, (map.get(id) ?? 0) + 1)));
  return [...map.entries()]
    .map(([id, count]) => ({ student: getStudent(data, id), count }))
    .filter((x): x is { student: Student; count: number } => Boolean(x.student))
    .sort((a, b) => b.count - a.count || a.student.name.localeCompare(b.student.name, "pt-BR"));
}

export function temporalSeries(
  records: ObservationRecord[],
  period: "7" | "30" | "todos",
): Array<{ label: string; atencao: number; positivas: number }> {
  const byMonth = period === "todos";
  const monthLabels = [
    "jan.",
    "fev.",
    "mar.",
    "abr.",
    "mai.",
    "jun.",
    "jul.",
    "ago.",
    "set.",
    "out.",
    "nov.",
    "dez.",
  ];
  const buckets = new Map<string, ObservationRecord[]>();

  records.forEach((record) => {
    const key = byMonth ? record.date.slice(0, 7) : record.date;
    const bucket = buckets.get(key) ?? [];
    bucket.push(record);
    buckets.set(key, bucket);
  });

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, bucket]) => {
      const date = parseDate(byMonth ? `${key}-01` : key);
      const label = byMonth
        ? (monthLabels[date.getMonth()] ?? "").replace(".", "").replace(/^./, (letter) =>
            letter.toUpperCase(),
          )
        : `${date.getDate()} ${monthLabels[date.getMonth()] ?? ""}`;

      return {
        label,
        atencao: bucket.filter(isAttention).length,
        positivas: bucket.filter(isPositive).length,
      };
    });
}

export function groupByDay(
  records: ObservationRecord[],
): Array<{ date: string; records: ObservationRecord[] }> {
  const map = new Map<string, ObservationRecord[]>();
  sortRecords(records).forEach((r) => {
    const list = map.get(r.date) ?? [];
    list.push(r);
    map.set(r.date, list);
  });
  return [...map.entries()]
    .sort((a, b) => parseDate(b[0]).getTime() - parseDate(a[0]).getTime())
    .map(([date, list]) => ({ date, records: list }));
}
