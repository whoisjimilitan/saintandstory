/**
 * Safe database call wrapper
 * Catches all Prisma errors and returns structured failure
 * Never lets raw Prisma errors reach the client
 */

export interface DbCallResult<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Wrap any Prisma query to catch and log errors safely
 * Usage: const result = await safeDbCall(prisma.user.findUnique(...))
 */
export async function safeDbCall<T>(
  queryPromise: Promise<T>,
  operationName: string
): Promise<DbCallResult<T>> {
  try {
    const data = await queryPromise;
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "Unknown";

    // Log for debugging (never expose to client)
    console.error(`🔥 DB Error [${operationName}]:`, {
      name: errorName,
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });

    // Categorize error for proper HTTP response
    let code = "DATABASE_ERROR";
    if (errorMessage.includes("does not exist")) {
      code = "SCHEMA_ERROR";
    } else if (errorMessage.includes("not found")) {
      code = "NOT_FOUND";
    } else if (errorMessage.includes("unique constraint")) {
      code = "DUPLICATE_ERROR";
    } else if (errorMessage.includes("foreign key")) {
      code = "FOREIGN_KEY_ERROR";
    }

    return {
      success: false,
      error: {
        code,
        message: "Database operation failed",
      },
    };
  }
}

/**
 * Wrap SQL query to catch and log errors safely
 * Usage: const result = await safeSqlCall(sql`SELECT ...`, "fetch orders")
 */
export async function safeSqlCall<T>(
  queryPromise: Promise<T>,
  operationName: string
): Promise<DbCallResult<T>> {
  try {
    const data = await queryPromise;
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : "Unknown";

    // Log for debugging (never expose to client)
    console.error(`🔥 SQL Error [${operationName}]:`, {
      name: errorName,
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error,
    });

    // Categorize error for proper HTTP response
    let code = "DATABASE_ERROR";
    if (errorMessage.includes("does not exist")) {
      code = "SCHEMA_ERROR";
    } else if (errorMessage.includes("not found")) {
      code = "NOT_FOUND";
    } else if (errorMessage.includes("unique violation")) {
      code = "DUPLICATE_ERROR";
    } else if (errorMessage.includes("foreign key violation")) {
      code = "FOREIGN_KEY_ERROR";
    }

    return {
      success: false,
      error: {
        code,
        message: "Database operation failed",
      },
    };
  }
}
