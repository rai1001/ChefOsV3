import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { LoginForm } from "./login-form";

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  signInWithEmail: vi.fn()
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace })
}));

vi.mock("../data/auth-client", () => ({
  signInWithEmail: mocks.signInWithEmail
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mocks.replace.mockReset();
    mocks.signInWithEmail.mockReset();
  });

  it("hace login y redirige al dashboard", async () => {
    mocks.signInWithEmail.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    render(<LoginForm />);
    await user.type(screen.getByLabelText(/Correo/i), "user@example.com");
    await user.type(screen.getByLabelText(/Contraseña/i), "secreto123");
    await user.click(screen.getByRole("button", { name: /Entrar/i }));

    expect(mocks.signInWithEmail).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secreto123"
    });
    expect(mocks.replace).toHaveBeenCalledWith("/dashboard");
  });
});
