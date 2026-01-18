import { render, screen } from "@testing-library/react";
import { ErrorMessage } from "./error-message";
import { AppError } from "../domain/errors";

describe("ErrorMessage", () => {
  it("muestra mensaje de AppError de auth", () => {
    render(<ErrorMessage error={new AppError("AuthError", "invalid")} />);
    expect(
      screen.getByText(/No pudimos iniciar sesión/i)
    ).toBeInTheDocument();
  });

  it("no renderiza cuando no hay error", () => {
    const { container } = render(<ErrorMessage error={undefined} />);
    expect(container.textContent).toBe("");
  });
});
