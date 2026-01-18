import { test, expect } from "@playwright/test";

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error("Configura SEED_ADMIN_EMAIL y SEED_ADMIN_PASSWORD para e2e");
}

test("login con usuario seed y acceso a dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill(email);
  await page.getByLabel("Contraseña").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();

  await page.waitForURL("**/dashboard");
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("Organización", { exact: false }).first()
  ).toBeVisible();
  await expect(page.getByText("Pedidos")).toBeVisible();
});
