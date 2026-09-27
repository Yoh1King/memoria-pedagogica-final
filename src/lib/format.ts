const MONTHS = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

const MONTHS_SHORT = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

export function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1);
}

export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function nowTime(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function daysBetween(date: string): number {
  const a = parseDate(date).getTime();
  const b = parseDate(todayISO()).getTime();
  return Math.round((b - a) / 86400000);
}

export function relativeDay(date: string): string {
  const diff = daysBetween(date);
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  const d = parseDate(date);
  return `${d.getDate()} de ${MONTHS[d.getMonth()]}`;
}

export function dayHeading(date: string): string {
  return relativeDay(date).toUpperCase();
}

export function shortDate(date: string): string {
  const d = parseDate(date);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function relativeDayTime(date: string, time: string): string {
  return `${relativeDay(date)}, ${time}`;
}
