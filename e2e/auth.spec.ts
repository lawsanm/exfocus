import { expect, test } from "@playwright/test";

test.describe("public routes and auth guards", () => {
  test("login page renders with the sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("register page renders with the sign-up form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
  });

  test("can navigate between login and register", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Create one" }).click();
    await expect(page).toHaveURL(/\/register$/);
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("protected routes redirect unauthenticated users to login", async ({ page }) => {
    await page.goto("/dashboard");
    // Auth.js appends a callbackUrl query param on redirect.
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("the root path redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("server-side validation blocks an empty login submission", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Sign in" }).click();
    // The action rejects the empty form and we stay on the login page.
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByLabel("Email")).toBeVisible();
  });
});
