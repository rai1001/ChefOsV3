"use client";

import { AppError } from "../domain/errors";

type Props = {
  error?: unknown;
};

const defaultMessage =
  "Ha ocurrido un error inesperado. Intenta de nuevo o contacta al soporte.";

const mapMessage = (error: unknown): string => {
  if (!error) return "";
  if (error instanceof AppError) {
    switch (error.type) {
      case "AuthError":
        return "No pudimos iniciar sesión. Revisa tus credenciales.";
      case "ValidationError":
        return "Los datos introducidos no son válidos.";
      case "PermissionDeniedError":
        return "No tienes permisos para esta acción.";
      default:
        return defaultMessage;
    }
  }
  if (error instanceof Error) {
    return error.message || defaultMessage;
  }
  return defaultMessage;
};

export const ErrorMessage = ({ error }: Props) => {
  const message = mapMessage(error);
  if (!message) return null;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
      {message}
    </div>
  );
};
