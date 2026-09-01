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
    await db.insert(profiles).values({
      id: userId,
      username,
      displayName: username,
    });
  } catch (e) {
    if (
      e instanceof postgres.PostgresError &&
      e.code === "23505" &&
      e.constraint_name === "profiles_username_lower_idx"
    ) {
      throw new DuplicatedUsernameError({ cause: e });
    }

    throw e;
  }
}
