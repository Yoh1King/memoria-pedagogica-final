import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type {
  CustomClassification,
  EnvironmentData,
  ObservationRecord,
  ObservationType,
  SchoolClass,
  Shift,
  Student,
} from "./types";

const emptyData: EnvironmentData = { classes: [], students: [], records: [] };

function uid() {
  return crypto.randomUUID();
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function classFromRow(r: any): SchoolClass {
  return {
    id: r.id,
    name: r.name,
    subject: r.subject,
    shift: r.shift as Shift,
    days: r.days ?? [],
    archived: r.archived,
    createdAt: r.created_at,
  };
}
function studentFromRow(r: any): Student {
  return { id: r.id, classId: r.class_id, name: r.name };
}
function recordFromRow(r: any): ObservationRecord {
  return {
    id: r.id,
    classId: r.class_id,
    date: r.date,
    time: r.time,
    topic: r.topic,
    type: r.type as ObservationType,
    customType: r.custom_type ?? undefined,
    customClassification: (r.custom_classification ?? undefined) as
      | CustomClassification
      | undefined,
    scope: r.scope,
    studentIds: r.student_ids ?? [],
    detail: r.detail ?? undefined,
    createdAt: r.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function classToRow(p: Partial<SchoolClass>) {
  const o: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (p.id !== undefined) o.id = p.id;
  if (p.name !== undefined) o.name = p.name;
  if (p.subject !== undefined) o.subject = p.subject;
  if (p.shift !== undefined) o.shift = p.shift;
  if (p.days !== undefined) o.days = p.days;
  if (p.archived !== undefined) o.archived = p.archived;
  if (p.createdAt !== undefined) o.created_at = p.createdAt;
  return o;
}
function recordToRow(p: Partial<ObservationRecord>) {
  const o: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (p.id !== undefined) o.id = p.id;
  if (p.classId !== undefined) o.class_id = p.classId;
  if (p.date !== undefined) o.date = p.date;
  if (p.time !== undefined) o.time = p.time;
  if (p.topic !== undefined) o.topic = p.topic;
  if (p.type !== undefined) o.type = p.type;
  if ("customType" in p) o.custom_type = p.customType ?? null;
  if ("customClassification" in p) o.custom_classification = p.customClassification ?? null;
  if (p.scope !== undefined) o.scope = p.scope;
  if (p.studentIds !== undefined) o.student_ids = p.studentIds;
  if ("detail" in p) o.detail = p.detail ?? null;
  if (p.createdAt !== undefined) o.created_at = p.createdAt;
  return o;
}

type Ctx = {
  ready: boolean;
  authReady: boolean;
  session: Session | null;
  email: string;
  signOut: () => Promise<void>;
  teacherName: string;
  setTeacherName: (n: string) => Promise<void>;
  data: EnvironmentData;
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

function report(error: unknown) {
  if (error) {
    console.error(error);
    toast.error("Não foi possível salvar. Verifique sua conexão e tente novamente.");
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [teacherName, setTeacherNameState] = useState("");
  const [data, setDataState] = useState<EnvironmentData>(emptyData);
  const dataRef = useRef(data);
  dataRef.current = data;
  const userId = session?.user.id ?? null;

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setAuthReady(true);
    });
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) {
      setDataState(emptyData);
      setTeacherNameState("");
      setReady(false);
      return;
    }
    let cancelled = false;
    setReady(false);
    (async () => {
      const [p, c, s, r] = await Promise.all([
        supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
        supabase.from("classes").select("*").order("created_at", { ascending: false }),
        supabase.from("students").select("*").order("created_at", { ascending: true }),
        supabase.from("records").select("*").order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      if (c.error || s.error || r.error) report(c.error || s.error || r.error);
      setTeacherNameState(p.data?.name ?? "");
      setDataState({
        classes: (c.data ?? []).map(classFromRow),
        students: (s.data ?? []).map(studentFromRow),
        records: (r.data ?? []).map(recordFromRow),
      });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const setData = useCallback((updater: (d: EnvironmentData) => EnvironmentData) => {
    setDataState((d) => updater(d));
  }, []);

  const value = useMemo<Ctx>(() => {
    const db = supabase as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    return {
      ready,
      authReady,
      session,
      email: session?.user.email ?? "",
      signOut: async () => {
        await supabase.auth.signOut();
      },
      teacherName,
      setTeacherName: async (n: string) => {
        if (!userId) return;
        const name = n.trim();
        const { error } = await supabase.from("profiles").update({ name }).eq("id", userId);
        if (error) {
          report(error);
          throw error;
        }
        setTeacherNameState(name);
      },
      data,
      addClass: (c) => {
        const created: SchoolClass = {
          ...c,
          id: uid(),
          archived: false,
          createdAt: new Date().toISOString(),
        };
        setData((d) => ({ ...d, classes: [created, ...d.classes] }));
        db.from("classes").insert(classToRow(created)).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
        return created;
      },
      updateClass: (id, patch) => {
        setData((d) => ({
          ...d,
          classes: d.classes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        }));
        const { id: _i, ...rest } = patch;
        db.from("classes").update(classToRow(rest)).eq("id", id).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
      },
      setArchived: (id, archived) => {
        setData((d) => ({
          ...d,
          classes: d.classes.map((c) => (c.id === id ? { ...c, archived } : c)),
        }));
        db.from("classes").update({ archived }).eq("id", id).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
      },
      deleteClass: (id) => {
        setData((d) => ({
          classes: d.classes.filter((c) => c.id !== id),
          students: d.students.filter((s) => s.classId !== id),
          records: d.records.filter((r) => r.classId !== id),
        }));
        // students and records are removed by cascade
        db.from("classes").delete().eq("id", id).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
      },
      addStudent: (classId, name) => {
        const clean = name.trim();
        const exists = data.students.some(
          (s) => s.classId === classId && s.name.trim().toLowerCase() === clean.toLowerCase(),
        );
        if (!clean || exists) return null;
        const created: Student = { id: uid(), classId, name: clean };
        setData((d) => ({ ...d, students: [...d.students, created] }));
        db.from("students")
          .insert({ id: created.id, class_id: classId, name: clean })
          .then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
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
        if (fresh.length > 0) {
          setData((d) => ({ ...d, students: [...d.students, ...fresh] }));
          db.from("students")
            .insert(fresh.map((s) => ({ id: s.id, class_id: s.classId, name: s.name })))
            .then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
        }
        return { added: fresh.length, skipped };
      },
      updateStudent: (id, name) => {
        setData((d) => ({
          ...d,
          students: d.students.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)),
        }));
        db.from("students").update({ name: name.trim() }).eq("id", id).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
      },
      deleteStudent: (id) => {
        const affected = dataRef.current.records.filter((r) => r.studentIds.includes(id));
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
        }));
        (async () => {
          for (const r of affected) {
            const ids = r.studentIds.filter((sid) => sid !== id);
            const res =
              r.scope !== "class" && ids.length === 0
                ? await db.from("records").delete().eq("id", r.id)
                : await db.from("records").update({ student_ids: ids }).eq("id", r.id);
            if (res.error) return report(res.error);
          }
          const { error } = await db.from("students").delete().eq("id", id);
          report(error);
        })();
      },
      addRecord: (r) => {
        const created: ObservationRecord = { ...r, id: uid(), createdAt: new Date().toISOString() };
        setData((d) => ({ ...d, records: [created, ...d.records] }));
        db.from("records").insert(recordToRow(created)).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
        return created;
      },
      updateRecord: (id, patch) => {
        setData((d) => ({
          ...d,
          records: d.records.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        }));
        const { id: _i, ...rest } = patch;
        db.from("records").update(recordToRow(rest)).eq("id", id).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
      },
      deleteRecord: (id) => {
        setData((d) => ({ ...d, records: d.records.filter((r) => r.id !== id) }));
        db.from("records").delete().eq("id", id).then(({ error }: any) => report(error)); // eslint-disable-line @typescript-eslint/no-explicit-any
      },
    };
  }, [ready, authReady, session, userId, teacherName, data, setData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("AppProvider ausente");
  return ctx;
}
