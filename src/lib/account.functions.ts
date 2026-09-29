import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Permanently deletes the authenticated user's data and auth account. */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    if (!userId) throw new Error("Unauthorized");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Every delete is scoped to the caller's own user_id.
    for (const table of ["records", "students", "classes"] as const) {
      const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
      if (error) {
        console.error(error);
        throw new Error("delete_failed");
      }
    }
    const { error: pErr } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
    if (pErr) {
      console.error(pErr);
      throw new Error("delete_failed");
    }
    const { error: aErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (aErr) {
      console.error(aErr);
      throw new Error("delete_failed");
    }
    return { ok: true };
  });
