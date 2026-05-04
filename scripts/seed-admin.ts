/**
 * Run once to create the first Admin account.
 *
 * Usage:
 *   1. Set env vars in .env.local
 *   2. npx tsx scripts/seed-admin.ts
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "akaki@alpaca.ge";
const ADMIN_PASSWORD = process.env.FIRST_ADMIN_PASSWORD!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !ADMIN_PASSWORD) {
  console.error("❌ Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, FIRST_ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAdmin() {
  console.log(`Creating admin: ${ADMIN_EMAIL}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      full_name: "Akaki",
      role: "admin",
    },
  });

  if (error) {
    if (error.message.includes("already")) {
      console.log("⚠ Admin already exists.");
    } else {
      console.error("❌ Error:", error.message);
      process.exit(1);
    }
  } else {
    console.log(`✅ Admin created: ${data.user?.email}`);
  }
}

seedAdmin();
