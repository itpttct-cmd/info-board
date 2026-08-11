import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateUserBody {
  email: string;
  password: string;
  displayName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify the caller is authenticated
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: anonKey,
      },
    });

    if (!verifyRes.ok) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const callerUser = await verifyRes.json();

    // Verify caller has an admin_profiles entry
    const adminCheckRes = await fetch(
      `${supabaseUrl}/rest/v1/admin_profiles?id=eq.${callerUser.id}&select=id`,
      {
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      }
    );
    const adminRows = await adminCheckRes.json();

    if (!Array.isArray(adminRows) || adminRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Forbidden: admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET: list all admin users
    if (req.method === "GET") {
      const listRes = await fetch(
        `${supabaseUrl}/auth/v1/admin/users?per_page=100`,
        {
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      if (!listRes.ok) {
        return new Response(
          JSON.stringify({ error: "Failed to list users" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const authUsers = await listRes.json();
      const userIds = (authUsers.users ?? []).map((u: { id: string }) => u.id);

      // Fetch admin profiles
      let profiles: { id: string; display_name: string; created_at: string }[] = [];
      if (userIds.length > 0) {
        const filter = userIds.map((id: string) => `"${id}"`).join(",");
        const profileRes = await fetch(
          `${supabaseUrl}/rest/v1/admin_profiles?id=in.(${filter})&select=id,display_name,created_at`,
          {
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
          }
        );
        profiles = await profileRes.json();
      }

      const profileMap = new Map(profiles.map((p) => [p.id, p]));
      const users = (authUsers.users ?? []).map((u: { id: string; email: string; created_at: string }) => {
        const profile = profileMap.get(u.id);
        return {
          id: u.id,
          email: u.email ?? "",
          display_name: profile?.display_name ?? "Administrator",
          created_at: profile?.created_at ?? u.created_at ?? new Date().toISOString(),
        };
      });

      return new Response(
        JSON.stringify({ users }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CreateUserBody = await req.json();

    if (!body.email || !body.password || !body.displayName) {
      return new Response(
        JSON.stringify({ error: "Missing email, password, or display name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.password.length < 6) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 6 characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create the user via the Admin API
    const createRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        email_confirm: true,
      }),
    });

    if (!createRes.ok) {
      const errData = await createRes.json();
      return new Response(
        JSON.stringify({ error: errData.msg || errData.message || "Failed to create user" }),
        { status: createRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const newUser = await createRes.json();

    // Insert admin profile
    await fetch(`${supabaseUrl}/rest/v1/admin_profiles`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        id: newUser.id,
        display_name: body.displayName,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, userId: newUser.id, email: body.email }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
