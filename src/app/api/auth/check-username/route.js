import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
} from "@/lib/account";

async function isUsernameTaken(username) {
  const normalizedUsername = normalizeUsername(username);
  const generatedEmail = usernameToEmail(normalizedUsername);
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const users = data?.users ?? [];
    const taken = users.some((user) => {
      const storedEmail = (user.email || "").toLowerCase();

      // This Supabase project is shared with other apps. Only consider accounts
      // in ziometer's own email namespace so usernames don't collide with users
      // that belong to those other apps.
      if (!storedEmail.endsWith("@accounts.ziometer.app")) {
        return false;
      }

      const storedUsername = normalizeUsername(user.user_metadata?.username || "");

      return storedUsername === normalizedUsername || storedEmail === generatedEmail;
    });

    if (taken) {
      return true;
    }

    if (users.length < 200) {
      return false;
    }

    page += 1;
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username") || "";
  const normalizedUsername = normalizeUsername(username);

  if (!isValidUsername(normalizedUsername)) {
    return NextResponse.json(
      {
        available: false,
        error:
          "Username must be 3-30 characters and use only letters, numbers, dots, dashes, or underscores.",
      },
      { status: 400 }
    );
  }

  try {
    const taken = await isUsernameTaken(normalizedUsername);

    return NextResponse.json({ available: !taken });
  } catch (error) {
    console.error("Username availability check failed:", error);

    return NextResponse.json(
      { available: false, error: "Failed to check username availability." },
      { status: 500 }
    );
  }
}
