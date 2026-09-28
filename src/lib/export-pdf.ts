import { parseDate, todayISO } from "./format";
import { recordPeopleLabel, sortRecords, temporalSeries, typeCounts, withinDays } from "./selectors";
import {
  isAttention,
  isPositive,
  typeLabel,
  type EnvironmentData,
  type ObservationRecord,
} from "./types";

export type ExportKind = "todos" | "atencao" | "positiva";
export type ExportPeriod = "7" | "30" | "todos" | "custom";

export type ExportOptions = {
  classId: string;
  studentId: string; // "todos" or id
  kind: ExportKind;
  topics: string[]; // empty = all
  period: ExportPeriod;
  from: string; // yyyy-mm-dd
  to: string;
  includeSummary: boolean;
  includeCharts: boolean;
  includeHistory: boolean;
};

export function exportRecords(data: EnvironmentData, o: ExportOptions): ObservationRecord[] {
  if (!o.classId) return [];
  return sortRecords(
    data.records.filter((r) => {
      if (r.classId !== o.classId) return false;
      if (o.studentId !== "todos" && !r.studentIds.includes(o.studentId)) return false;
      if (o.kind === "atencao" && !isAttention(r)) return false;
      if (o.kind === "positiva" && !isPositive(r)) return false;
      if (o.topics.length > 0 && !o.topics.includes(r.topic)) return false;
      if (o.period === "7" || o.period === "30") return withinDays(r, Number(o.period));
      if (o.period === "custom") {
        if (o.from && r.date < o.from) return false;
        if (o.to && r.date > o.to) return false;
      }
      return true;
    }),
  );
}

const br = (iso: string) => {
  const d = parseDate(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};
const addDays = (iso: string, n: number) => {
  const d = parseDate(iso);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const joinPt = (list: string[]) =>
  list.length <= 1 ? (list[0] ?? "") : `${list.slice(0, -1).join(", ")} e ${list[list.length - 1]}`;

type RGB = [number, number, number];
const INK: RGB = [59, 49, 41];
const MUTED: RGB = [120, 110, 100];
const LINE: RGB = [225, 218, 208];
const TERRA: RGB = [176, 103, 74];
const SAGE: RGB = [110, 140, 90];
const NEUTRAL: RGB = [160, 150, 140];
const CARD: RGB = [250, 247, 242];

const colorOf = (r: ObservationRecord): RGB =>
  isAttention(r) ? TERRA : isPositive(r) ? SAGE : NEUTRAL;

export async function generatePdf(data: EnvironmentData, o: ExportOptions, records: ObservationRecord[]) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  doc.setLineHeightFactor(1.37);
  const W = 210;
  const H = 297;
  const M = 16;
  const CW = W - M * 2;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M - 8) {
      doc.addPage();
      y = M;
    }
  };
  const color = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const fill = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const draw = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const section = (title: string) => {
    ensure(16);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    color(INK);
    doc.text(title, M, y + 5);
    draw(LINE);
    doc.setLineWidth(0.3);
    doc.line(M, y + 8, W - M, y + 8);
    y += 13;
  };

  const cls = data.classes.find((c) => c.id === o.classId);
  const student = data.students.find((s) => s.id === o.studentId);
  const periodTitle =
    o.period === "7"
      ? "últimos 7 dias"
      : o.period === "30"
        ? "últimos 30 dias"
        : o.period === "custom"
          ? "período personalizado"
          : "todo o período";
  const today = todayISO();
  const periodText =
    o.period === "7" || o.period === "30"
      ? `${br(addDays(today, -(Number(o.period) - 1)))} a ${br(today)}`
      : o.period === "custom"
        ? `${o.from ? br(o.from) : "início"} a ${o.to ? br(o.to) : br(today)}`
        : "Todo o período";

  // Header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(MUTED);
  doc.text("MEMÓRIA PEDAGÓGICA", M, y + 3);
  y += 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  color(INK);
  doc.text(`Registros pedagógicos — ${periodTitle}`, M, y + 5);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  color(MUTED);
  doc.text(`Gerado em ${br(today)}`, M, y + 3);
  y += 9;

  const attention = records.filter(isAttention).length;
  const positive = records.filter(isPositive).length;

  if (o.includeSummary) {
    section("Resumo");
    const boxW = (CW - 8) / 3;
    const stats: Array<[string, number, RGB]> = [
      ["Registros encontrados", records.length, INK],
      ["Pontos de atenção", attention, TERRA],
      ["Observações positivas", positive, SAGE],
    ];
    stats.forEach(([label, n, c], i) => {
      const x = M + i * (boxW + 4);
      fill(CARD);
      draw(LINE);
      doc.roundedRect(x, y, boxW, 20, 2, 2, "FD");
      fill(c);
      doc.rect(x, y + 3, 1.2, 14, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      color(c);
      doc.text(String(n), x + 5, y + 10);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      color(MUTED);
      doc.text(label, x + 5, y + 16);
    });
    y += 26;

    const kindText =
      o.kind === "atencao" ? "Pontos de atenção" : o.kind === "positiva" ? "Observações positivas" : "Todos";
    const rows: Array<[string, string]> = [
      ["Turma", cls ? `${cls.name}${cls.subject ? ` — ${cls.subject}` : ""}` : "—"],
      ["Aluno", student ? student.name : "Todos"],
      ["Tipo", kindText],
      ["Conteúdos", o.topics.length ? joinPt(o.topics) : "Todos"],
      ["Período", periodText],
    ];
    doc.setFontSize(10);
    rows.forEach(([k, v]) => {
      const lines = doc.splitTextToSize(v, CW - 28) as string[];
      ensure(lines.length * 5 + 1);
      doc.setFont("helvetica", "bold");
      color(INK);
      doc.text(`${k}:`, M, y + 4);
      doc.setFont("helvetica", "normal");
      doc.text(lines, M + 28, y + 4);
      y += lines.length * 5 + 1;
    });
    y += 4;
  }

  if (o.includeCharts) {
    // Chart 1
    const counts = typeCounts(records);
    const colorByLabel = new Map<string, RGB>();
    records.forEach((r) => colorByLabel.set(typeLabel(r), colorOf(r)));
    const barH = 6;
    const chartH = counts.length * (barH + 3) + 12;
    section("O que tenho observado");
    ensure(chartH);
    const labelW = 62;
    const max = Math.max(1, ...counts.map((c) => c.count));
    const barArea = CW - labelW - 12;
    doc.setFontSize(9);
    counts.forEach((c, i) => {
      const by = y + i * (barH + 3);
      doc.setFont("helvetica", "normal");
      color(INK);
      const lbl = doc.splitTextToSize(c.label, labelW - 2)[0] as string;
      doc.text(lbl, M, by + barH / 2 + 1.2);
      fill(colorByLabel.get(c.label) ?? NEUTRAL);
      doc.roundedRect(M + labelW, by, Math.max(1.5, (c.count / max) * barArea), barH, 1, 1, "F");
      doc.setFont("helvetica", "bold");
      doc.text(String(c.count), M + labelW + (c.count / max) * barArea + 2, by + barH / 2 + 1.2);
    });
    y += counts.length * (barH + 3) + 2;
    legend();
    y += 8;

    // Chart 2
    let seriesPeriod: "7" | "30" | "todos" = o.period === "7" ? "7" : o.period === "30" ? "30" : "todos";
    if (o.period === "custom" && o.from && o.to) {
      const span = (parseDate(o.to).getTime() - parseDate(o.from).getTime()) / 86400000;
      if (span <= 62) seriesPeriod = "30";
    }
    const series = temporalSeries(records, seriesPeriod);
    section("Observações ao longo do tempo");
    const ch = 58;
    ensure(ch + 14);
    const left = M + 8;
    const right = W - M;
    const top = y;
    const bottom = y + ch - 10;
    const maxV = Math.max(1, ...series.map((s) => Math.max(s.atencao, s.positivas)));
    draw(LINE);
    doc.setLineWidth(0.2);
    doc.setFontSize(8);
    color(MUTED);
    const steps = Math.min(maxV, 4);
    for (let i = 0; i <= steps; i++) {
      const v = Math.round((maxV * i) / steps);
      const gy = bottom - (v / maxV) * (bottom - top);
      doc.line(left, gy, right, gy);
      doc.text(String(v), left - 2, gy + 1, { align: "right" });
    }
    const n = series.length;
    const xAt = (i: number) => (n === 1 ? (left + right) / 2 : left + 4 + (i * (right - left - 8)) / (n - 1));
    const yAt = (v: number) => bottom - (v / maxV) * (bottom - top);
    const every = Math.max(1, Math.ceil(n / 10));
    series.forEach((s, i) => {
      if (i % every === 0 || i === n - 1) doc.text(s.label, xAt(i), bottom + 5, { align: "center" });
    });
    (["atencao", "positivas"] as const).forEach((key) => {
      const c = key === "atencao" ? TERRA : SAGE;
      draw(c);
      fill(c);
      doc.setLineWidth(0.7);
      for (let i = 1; i < n; i++)
        doc.line(xAt(i - 1), yAt(series[i - 1]![key]), xAt(i), yAt(series[i]![key]));
      series.forEach((s, i) => doc.circle(xAt(i), yAt(s[key]), 0.9, "F"));
    });
    y = bottom + 9;
    legend();
    y += 8;
  }

  function legend() {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    let x = M;
    ([["Pontos de atenção", TERRA], ["Observações positivas", SAGE]] as Array<[string, RGB]>).forEach(
      ([l, c]) => {
        fill(c);
        doc.circle(x + 1.3, y + 2, 1.3, "F");
        color(MUTED);
        doc.text(l, x + 4, y + 3);
        x += doc.getTextWidth(l) + 12;
      },
    );
    y += 5;
  }

  if (o.includeHistory) {
    ensure(50);
    section("Histórico detalhado");
    records.forEach((r) => {
      const c = colorOf(r);
      const clsName = data.classes.find((k) => k.id === r.classId);
      const meta = [
        `${br(r.date)}${r.time ? `, ${r.time}` : ""}`,
        clsName ? `${clsName.name}${clsName.subject ? ` — ${clsName.subject}` : ""}` : "",
      ]
        .filter(Boolean)
        .join("  ·  ");
      const infoLines: Array<[string, string]> = [];
      if (r.topic) infoLines.push(["Conteúdo", r.topic]);
      infoLines.push([r.scope === "class" ? "Escopo" : "Aluno(s)", recordPeopleLabel(data, r)]);
      doc.setFontSize(9.5);
      const wrapped = infoLines.map(([k, v]) => [k, doc.splitTextToSize(v, CW - 34)] as [string, string[]]);
      const detail = r.detail ? (doc.splitTextToSize(r.detail, CW - 10) as string[]) : [];
      const h =
        16 + wrapped.reduce((a, [, l]) => a + l.length * 4.6, 0) + (detail.length ? detail.length * 4.6 + 3 : 0) + 3;
      ensure(h + 3);
      fill(CARD);
      draw(LINE);
      doc.setLineWidth(0.2);
      doc.roundedRect(M, y, CW, h, 2, 2, "FD");
      fill(c);
      doc.rect(M, y, 1.5, h, "F");
      let cy = y + 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      color(c);
      doc.text(typeLabel(r), M + 5, cy);
      cy += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      color(MUTED);
      doc.text(meta, M + 5, cy);
      cy += 5.5;
      doc.setFontSize(9.5);
      wrapped.forEach(([k, lines]) => {
        doc.setFont("helvetica", "bold");
        color(INK);
        doc.text(`${k}:`, M + 5, cy);
        doc.setFont("helvetica", "normal");
        doc.text(lines, M + 29, cy);
        cy += lines.length * 4.6;
      });
      if (detail.length) {
        cy += 2;
        color(INK);
        doc.setFont("helvetica", "italic");
        doc.text(detail, M + 5, cy);
      }
      y += h + 3;
    });
  }

  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    color(MUTED);
    doc.text("Memória Pedagógica", M, H - 8);
    doc.text(`Página ${p} de ${pages}`, W - M, H - 8, { align: "right" });
  }

  const slug = (cls?.name ?? "turma").normalize("NFD").replace(/[^\w]+/g, "-").toLowerCase();
  doc.save(`registros-${slug}-${today}.pdf`);
}
