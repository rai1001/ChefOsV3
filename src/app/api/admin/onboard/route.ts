import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { AppError } from "@/modules/shared/domain/errors";
import { logger } from "@/lib/logger";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  orgName: z.string().min(2),
  orgSlug: z.string().min(2).optional()
});

const slugify = (name: string) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

const toStatusCode = (error: AppError) => {
  switch (error.type) {
    case "ValidationError":
      return 400;
    case "AuthError":
      return 401;
    case "PermissionDeniedError":
      return 403;
    case "NotFoundError":
      return 404;
    case "ConflictError":
      return 409;
    default:
      return 500;
  }
};

const toErrorResponse = (error: AppError) =>
  NextResponse.json(
    {
      error: {
        code: error.type,
        message: error.message,
        details: error.context ?? undefined
      }
    },
    { status: toStatusCode(error) }
  );

export async function POST(request: Request) {
  let userId: string | null = null;

  try {
    const supabase = createServiceRoleClient();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      throw new AppError("ValidationError", "Payload invalido");
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new AppError("ValidationError", "Datos invalidos", {
        issues: parsed.error.flatten()
      });
    }

    const { email, password, orgName, orgSlug } = parsed.data;
    const orgSlugValue = orgSlug ?? slugify(orgName);

    const userResult = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userResult.error) {
      throw new AppError("ConflictError", userResult.error.message, {
        code: userResult.error.code
      });
    }

    userId = userResult.data.user?.id ?? null;
    if (!userId) {
      throw new AppError("UnknownError", "No se pudo crear el usuario");
    }

    const { data: orgId, error: orgError } = await supabase.rpc(
      "onboard_user_org",
      {
        p_user_id: userId,
        p_org_name: orgName,
        p_org_slug: orgSlugValue
      }
    );

    if (orgError) {
      const rollback = await supabase.auth.admin.deleteUser(userId);
      if (rollback.error) {
        logger.warn("admin.onboard.rollback_failed", {
          code: rollback.error.code,
          message: rollback.error.message
        });
      }

      if (orgError.code === "23505") {
        throw new AppError("ConflictError", "Slug de org ya existe", {
          code: orgError.code
        });
      }

      throw new AppError("UnknownError", "No se pudo crear la organizacion", {
        code: orgError.code
      });
    }

    if (!orgId) {
      throw new AppError("UnknownError", "No se pudo crear la organizacion");
    }

    return NextResponse.json(
      { orgId, userId, orgSlug: orgSlugValue, message: "Usuario y org creados" },
      { status: 201 }
    );
  } catch (err) {
    const appError =
      err instanceof AppError
        ? err
        : new AppError("UnknownError", "Error desconocido", {
            cause: err instanceof Error ? err.message : String(err)
          });

    logger.error("admin.onboard", {
      type: appError.type,
      message: appError.message,
      context: appError.context
    });

    return toErrorResponse(appError);
  }
}
