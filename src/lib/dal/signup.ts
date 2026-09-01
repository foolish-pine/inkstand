import { DrizzleQueryError } from "drizzle-orm/errors";
import postgres from "postgres";
import { db } from "@/db";
import { profiles } from "@/db/schema";

export class DuplicatedUsernameError extends Error {
  constructor(options?: ErrorOptions) {
    super("This username has already been registered.", options);
    this.name = "DuplicatedUsernameError";
  }
}

export async function createProfile(userId: string, username: string) {
  try {
    const [profile] = await db
      .insert(profiles)
      .values({
        id: userId,
        username,
        displayName: username,
      })
      .returning();

    return profile;
  } catch (e) {
    if (
      e instanceof DrizzleQueryError &&
      e.cause instanceof postgres.PostgresError &&
      e.cause.code === "23505" &&
      e.cause.constraint_name === "profiles_username_lower_idx"
    ) {
      throw new DuplicatedUsernameError({ cause: e });
    }

    throw e;
  }
}
