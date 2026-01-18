import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { SignOutButton } from "./sign-out-button";

const signOut = vi.fn();
const replace = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createSupabaseBrowserClient: () => ({
    auth: { signOut }
  })
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace })
}));

describe("SignOutButton", () => {
  beforeEach(() => {
    signOut.mockReset();
    replace.mockReset();
  });

  it("cierra sesión y redirige a login", async () => {
    signOut.mockResolvedValueOnce({ error: null });
    const user = userEvent.setup();
    render(<SignOutButton />);

    await user.click(screen.getByRole("button", { name: /Salir/i }));

    expect(signOut).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
