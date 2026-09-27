export type Shift = "Manhã" | "Tarde" | "Noite";

export const SHIFTS: Shift[] = ["Manhã", "Tarde", "Noite"];

export const WEEKDAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;

export type SchoolClass = {
  id: string;
  name: string;
  subject: string;
  shift: Shift;
  days: string[];
  archived: boolean;
  createdAt: string;
};

export type Student = {
  id: string;
  classId: string;
  name: string;
};

export const OBSERVATION_TYPES = [
  "Falta de atenção",
  "Dificuldade de compreensão",
  "Dificuldade na atividade",
  "Baixa participação",
  "Comportamento / Convivência",
  "Avanço / Boa compreensão",
  "Boa participação",
  "Outro",
] as const;

export type ObservationType = (typeof OBSERVATION_TYPES)[number];

export const ATTENTION_TYPES: string[] = [
  "Falta de atenção",
  "Dificuldade de compreensão",
  "Dificuldade na atividade",
  "Baixa participação",
  "Comportamento / Convivência",
];

export const POSITIVE_TYPES: string[] = ["Avanço / Boa compreensão", "Boa participação"];

export type CustomClassification = "atencao" | "positiva";

export type ObservationRecord = {
  id: string;
  classId: string;
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  topic: string;
  type: ObservationType;
  customType?: string;
  customClassification?: CustomClassification | undefined;
  scope: "class" | "students";
  studentIds: string[];
  detail?: string;
  createdAt: string;
};

export type EnvironmentData = {
  classes: SchoolClass[];
  students: Student[];
  records: ObservationRecord[];
};


export function typeLabel(record: ObservationRecord): string {
  return record.type === "Outro" && record.customType ? record.customType : record.type;
}

export function isAttention(record: ObservationRecord): boolean {
  if (record.type === "Outro") return record.customClassification === "atencao";
  return ATTENTION_TYPES.includes(record.type);
}

export function isPositive(record: ObservationRecord): boolean {
  if (record.type === "Outro") return record.customClassification === "positiva";
  return POSITIVE_TYPES.includes(record.type);
}
