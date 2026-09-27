import type { EnvironmentData, ObservationRecord, SchoolClass, Student } from "./types";

function dateDaysAgo(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const NAMES_6A = [
  "Ana Ferreira",
  "João Santos",
  "Marina Costa",
  "Pedro Almeida",
  "Beatriz Lima",
  "Rafael Moreira",
  "Carla Nogueira",
  "Lucas Ribeiro",
  "Sofia Barbosa",
];

const NAMES_7B = [
  "Gabriel Souza",
  "Helena Martins",
  "Igor Cardoso",
  "Júlia Pacheco",
  "Mateus Rocha",
  "Nina Duarte",
  "Otávio Freitas",
  "Paula Teixeira",
  "Renata Vieira",
];

const NAMES_9C = [
  "Bruno Carvalho",
  "Camila Antunes",
  "Diego Pinto",
  "Elisa Moura",
  "Felipe Tavares",
  "Giovana Reis",
];

export function buildDemoData(): EnvironmentData {
  const classes: SchoolClass[] = [
    {
      id: "c-6a",
      name: "6º Ano A",
      subject: "Matemática",
      shift: "Manhã",
      days: ["Quinta"],
      archived: false,
      createdAt: dateDaysAgo(120),
    },
    {
      id: "c-7b",
      name: "7º Ano B",
      subject: "História",
      shift: "Tarde",
      days: ["Terça", "Quinta"],
      archived: false,
      createdAt: dateDaysAgo(120),
    },
    {
      id: "c-9c",
      name: "9º Ano C",
      subject: "Matemática",
      shift: "Noite",
      days: ["Segunda"],
      archived: true,
      createdAt: dateDaysAgo(300),
    },
  ];

  const students: Student[] = [];
  const push = (classId: string, names: string[]) =>
    names.forEach((name, i) => students.push({ id: `${classId}-s${i}`, classId, name }));
  push("c-6a", NAMES_6A);
  push("c-7b", NAMES_7B);
  push("c-9c", NAMES_9C);

  const s = (classId: string, i: number) => `${classId}-s${i}`;

  const raw: Array<Omit<ObservationRecord, "id" | "createdAt">> = [
    {
      classId: "c-6a",
      date: dateDaysAgo(0),
      time: "10:35",
      topic: "Frações",
      type: "Dificuldade de compreensão",
      scope: "students",
      studentIds: [s("c-6a", 0), s("c-6a", 1)],
      detail: "Apresentaram dificuldade principalmente com denominadores diferentes.",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(1),
      time: "14:20",
      topic: "Revolução Industrial",
      type: "Boa participação",
      scope: "class",
      studentIds: [],
      detail: "A turma trouxe muitos exemplos durante a discussão.",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(2),
      time: "09:10",
      topic: "Frações",
      type: "Falta de atenção",
      scope: "students",
      studentIds: [s("c-6a", 3)],
      detail: "",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(3),
      time: "10:05",
      topic: "Revisão",
      type: "Boa participação",
      scope: "students",
      studentIds: [s("c-6a", 2), s("c-6a", 4)],
      detail: "Participaram das explicações e ajudaram colegas.",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(4),
      time: "15:00",
      topic: "Idade Média",
      type: "Dificuldade na atividade",
      scope: "students",
      studentIds: [s("c-7b", 2), s("c-7b", 5)],
      detail: "Tiveram dúvidas na leitura do documento histórico.",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(6),
      time: "08:45",
      topic: "Frações",
      type: "Avanço / Boa compreensão",
      scope: "students",
      studentIds: [s("c-6a", 0)],
      detail: "Conseguiu realizar a atividade com menos auxílio.",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(7),
      time: "14:40",
      topic: "Idade Média",
      type: "Baixa participação",
      scope: "students",
      studentIds: [s("c-7b", 6)],
      detail: "",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(9),
      time: "09:30",
      topic: "Números decimais",
      type: "Comportamento / Convivência",
      scope: "students",
      studentIds: [s("c-6a", 1), s("c-6a", 7)],
      detail: "Conversa paralela durante a explicação.",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(11),
      time: "10:15",
      topic: "Números decimais",
      type: "Dificuldade de compreensão",
      scope: "class",
      studentIds: [],
      detail: "A turma demonstrou dúvidas na comparação de decimais.",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(12),
      time: "15:20",
      topic: "Grandes Navegações",
      type: "Avanço / Boa compreensão",
      scope: "students",
      studentIds: [s("c-7b", 1), s("c-7b", 3)],
      detail: "Retomaram os conceitos da aula anterior com autonomia.",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(14),
      time: "08:50",
      topic: "Frações",
      type: "Dificuldade de compreensão",
      scope: "students",
      studentIds: [s("c-6a", 0)],
      detail: "Dificuldade nas operações com denominadores diferentes.",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(16),
      time: "14:10",
      topic: "Grandes Navegações",
      type: "Falta de atenção",
      scope: "students",
      studentIds: [s("c-7b", 4), s("c-7b", 8)],
      detail: "",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(18),
      time: "09:55",
      topic: "Revisão",
      type: "Boa participação",
      scope: "class",
      studentIds: [],
      detail: "",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(21),
      time: "10:25",
      topic: "Geometria",
      type: "Dificuldade na atividade",
      scope: "students",
      studentIds: [s("c-6a", 5), s("c-6a", 8)],
      detail: "Dificuldade no uso do transferidor.",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(23),
      time: "15:35",
      topic: "Grandes Navegações",
      type: "Outro",
      customType: "Trabalho em grupo",
      scope: "students",
      studentIds: [s("c-7b", 0), s("c-7b", 7)],
      detail: "Organizaram bem a divisão de tarefas do grupo.",
    },
    {
      classId: "c-6a",
      date: dateDaysAgo(26),
      time: "08:40",
      topic: "Geometria",
      type: "Baixa participação",
      scope: "students",
      studentIds: [s("c-6a", 6)],
      detail: "",
    },
    {
      classId: "c-7b",
      date: dateDaysAgo(28),
      time: "14:05",
      topic: "Revisão",
      type: "Boa participação",
      scope: "students",
      studentIds: [s("c-7b", 1), s("c-7b", 2), s("c-7b", 5)],
      detail: "",
    },
    {
      classId: "c-9c",
      date: dateDaysAgo(95),
      time: "19:10",
      topic: "Equações do 2º grau",
      type: "Dificuldade de compreensão",
      scope: "class",
      studentIds: [],
      detail: "Dúvidas frequentes na fórmula resolutiva.",
    },
    {
      classId: "c-9c",
      date: dateDaysAgo(88),
      time: "19:40",
      topic: "Equações do 2º grau",
      type: "Avanço / Boa compreensão",
      scope: "students",
      studentIds: [s("c-9c", 1), s("c-9c", 4)],
      detail: "",
    },
    {
      classId: "c-9c",
      date: dateDaysAgo(80),
      time: "20:00",
      topic: "Funções",
      type: "Boa participação",
      scope: "students",
      studentIds: [s("c-9c", 0)],
      detail: "",
    },
  ];

  const records: ObservationRecord[] = raw.map((r, i) => ({
    ...r,
    id: `r-${i}`,
    createdAt: `${r.date}T${r.time}:00`,
  }));

  return { classes, students, records };
}

export const emptyData: EnvironmentData = { classes: [], students: [], records: [] };
