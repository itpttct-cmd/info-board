import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RegisterBody {
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

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: RegisterBody = await req.json();

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

    // Create the user via Admin API with email_confirm: true
    // This bypasses the email verification step
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
