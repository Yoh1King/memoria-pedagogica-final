import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildDemoData, emptyData } from "./demo-data";
import type {
  EnvironmentData,
  EnvironmentName,
  ObservationRecord,
  SchoolClass,
  Student,
} from "./types";

const KEY_ENV = "mp:env";
const KEY_DEMO = "mp:data:demo";
const KEY_TEST = "mp:data:test";
const KEY_TEACHER = "mp:teacher";
const KEY_ONBOARDED = "mp:onboarded";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

type Ctx = {
  ready: boolean;
  env: EnvironmentName;
  setEnv: (e: EnvironmentName) => void;
  onboarded: boolean;
  completeOnboarding: (name: string) => void;
  teacherName: string;
  setTeacherName: (n: string) => void;
  data: EnvironmentData;
  resetDemo: () => void;
  addClass: (c: Omit<SchoolClass, "id" | "archived" | "createdAt">) => SchoolClass;
  updateClass: (id: string, patch: Partial<SchoolClass>) => void;
  setArchived: (id: string, archived: boolean) => void;
  deleteClass: (id: string) => void;
  addStudent: (classId: string, name: string) => Student | null;
  addStudents: (classId: string, names: string[]) => { added: number; skipped: number };
  updateStudent: (id: string, name: string) => void;
  deleteStudent: (id: string) => void;
  addRecord: (r: Omit<ObservationRecord, "id" | "createdAt">) => ObservationRecord;
  updateRecord: (id: string, patch: Partial<ObservationRecord>) => void;
  deleteRecord: (id: string) => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [env, setEnvState] = useState<EnvironmentName>("test");
  const [teacherName, setTeacherNameState] = useState("");
  const [onboarded, setOnboardedState] = useState(false);
  const [demo, setDemo] = useState<EnvironmentData>(emptyData);
  const [test, setTest] = useState<EnvironmentData>(emptyData);

  useEffect(() => {
    setEnvState(read<EnvironmentName>(KEY_ENV, "test"));
    setTeacherNameState(read<string>(KEY_TEACHER, ""));
    setOnboardedState(read<boolean>(KEY_ONBOARDED, false));
    setDemo(read<EnvironmentData>(KEY_DEMO, buildDemoData()));
    setTest(read<EnvironmentData>(KEY_TEST, emptyData));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY_DEMO, JSON.stringify(demo));
  }, [demo, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY_TEST, JSON.stringify(test));
  }, [test, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY_ENV, JSON.stringify(env));
  }, [env, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY_TEACHER, JSON.stringify(teacherName));
  }, [teacherName, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY_ONBOARDED, JSON.stringify(onboarded));
  }, [onboarded, ready]);

  const data = env === "demo" ? demo : test;
  const setData = useCallback(
    (updater: (d: EnvironmentData) => EnvironmentData) => {
      if (env === "demo") setDemo((d) => updater(d));
      else setTest((d) => updater(d));
    },
    [env],
  );

  const value = useMemo<Ctx>(() => {
    return {
      ready,
      env,
      setEnv: setEnvState,
      onboarded,
      completeOnboarding: (name: string) => {
        setOnboardedState(true);
        setTeacherNameState(name);
      },
      teacherName,
      setTeacherName: setTeacherNameState,
      data,
      resetDemo: () => setDemo(buildDemoData()),
      addClass: (c) => {
        const created: SchoolClass = {
          ...c,
          id: uid(),
          archived: false,
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, classes: [created, ...d.classes] }));
        return created;
      },
      updateClass: (id, patch) =>
        setData((d) => ({
          ...d,
          classes: d.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      setArchived: (id, archived) =>
        setData((d) => ({
          ...d,
          classes: d.classes.map((c) => (c.id === id ? { ...c, archived } : c)),
        })),
      deleteClass: (id) =>
        setData((d) => ({
          classes: d.classes.filter((c) => c.id !== id),
          students: d.students.filter((s) => s.classId !== id),
          records: d.records.filter((r) => r.classId !== id),
        })),
      addStudent: (classId, name) => {
        const clean = name.trim();
        const exists = data.students.some(
          (s) => s.classId === classId && s.name.trim().toLowerCase() === clean.toLowerCase(),
        );
        if (!clean || exists) return null;
        const created: Student = { id: uid(), classId, name: clean };
        setData((d) => ({ ...d, students: [...d.students, created] }));
        return created;
      },
      addStudents: (classId, names) => {
        const taken = new Set(
          data.students
            .filter((s) => s.classId === classId)
            .map((s) => s.name.trim().toLowerCase()),
        );
        const fresh: Student[] = [];
        let skipped = 0;
        names
          .map((n) => n.trim())
          .filter(Boolean)
          .forEach((name) => {
            const key = name.toLowerCase();
            if (taken.has(key)) {
              skipped += 1;
              return;
            }
            taken.add(key);
            fresh.push({ id: uid(), classId, name });
          });
        if (fresh.length > 0) setData((d) => ({ ...d, students: [...d.students, ...fresh] }));
        return { added: fresh.length, skipped };
      },
      updateStudent: (id, name) =>
        setData((d) => ({
          ...d,
          students: d.students.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)),
        })),
      deleteStudent: (id) =>
        setData((d) => ({
          ...d,
          students: d.students.filter((s) => s.id !== id),
          records: d.records
            .map((r) =>
              r.studentIds.includes(id)
                ? { ...r, studentIds: r.studentIds.filter((sid) => sid !== id) }
                : r,
            )
            .filter((r) => r.scope === "class" || r.studentIds.length > 0),
        })),
      addRecord: (r) => {
        const created: ObservationRecord = { ...r, id: uid(), createdAt: new Date().toISOString() };
        setData((d) => ({ ...d, records: [created, ...d.records] }));
        return created;
      },
      updateRecord: (id, patch) =>
        setData((d) => ({
          ...d,
          records: d.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        })),
      deleteRecord: (id) =>
        setData((d) => ({ ...d, records: d.records.filter((r) => r.id !== id) })),
    };
  }, [ready, env, onboarded, teacherName, data, setData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppProvider ausente");
  return ctx;
}
