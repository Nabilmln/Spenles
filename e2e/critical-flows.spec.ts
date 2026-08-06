import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { parseE2eEnvironment } from "./support/environment";

const environment = parseE2eEnvironment(process.env);

async function login(
  page: Page,
  user: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Kata sandi").fill(user.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/dashboard$/u);
}

async function expectNoSeriousAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .disableRules(["color-contrast"])
    .analyze();
  expect(
    result.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    ),
  ).toEqual([]);
}

test("authentication, private navigation, transaction, and exports", async ({
  page,
}) => {
  await page.goto("/reports");
  await expect(page).toHaveURL(/\/login/u);
  await login(page, environment.users.a);

  await page.goto("/transactions/new");
  await page.getByLabel("Jumlah (rupiah)").fill("12345");
  await page.getByLabel("Akun").selectOption({ index: 1 });
  await page.getByLabel("Kategori").selectOption({ index: 1 });
  await page.getByLabel("Tanggal dan waktu").fill("2026-08-06T10:00");
  await page.getByLabel("Catatan (opsional)").fill("E2E Phase 07");
  await page.getByRole("button", { name: "Simpan transaksi" }).click();
  await expect(page).toHaveURL(/\/transactions/u);
  await expect(page.getByText("E2E Phase 07")).toBeVisible();

  for (const route of [
    "/dashboard",
    "/transactions",
    "/accounts",
    "/transfers",
    "/categories",
    "/budgets",
    "/recurring-transactions",
    "/split-bills",
    "/reports",
    "/settings/profile",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  }

  const month = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  const pdf = await page.request.get(
    `/api/reports/pdf?period=month&month=${month}`,
  );
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("application/pdf");
  expect(pdf.headers()["cache-control"]).toContain("no-store");
  expect((await pdf.body()).subarray(0, 5).toString()).toBe("%PDF-");

  const csv = await page.request.get(
    `/api/exports/transactions.csv?period=month&month=${month}`,
  );
  expect(csv.status()).toBe(200);
  expect(csv.headers()["content-type"]).toContain("text/csv");
  expect((await csv.text()).startsWith("\uFEFF")).toBe(true);

  const backup = await page.request.get("/api/exports/backup");
  expect(backup.status()).toBe(200);
  expect((await backup.json()).schemaVersion).toBe("1.0");

  await page.getByRole("button", { name: "Keluar" }).click();
  await expect(page).toHaveURL(/\/login$/u);
});

test("owned route cannot be opened by another user", async ({ browser }) => {
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await login(pageA, environment.users.a);
  await pageA.goto("/transactions");
  const href = await pageA
    .getByRole("link", { name: /^Edit /u })
    .first()
    .getAttribute("href");
  expect(href).toBeTruthy();
  await contextA.close();

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await login(pageB, environment.users.b);
  await pageB.goto(href!);
  await expect(pageB.getByRole("heading", { name: "Halaman tidak ditemukan" })).toBeVisible();
  await contextB.close();
});

test("major pages do not overflow at release viewports and themes", async ({
  page,
}) => {
  await login(page, environment.users.a);
  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/dashboard", "/transactions", "/reports", "/split-bills"]) {
      await page.goto(route);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth,
      );
      expect(overflow, `${route} overflow at ${width}px`).toBe(false);
    }
  }
  for (const theme of ["Tema Terang", "Tema Gelap", "Tema Sistem"]) {
    await page.getByRole("button", { name: theme }).click();
    await expect(page.locator("html")).toHaveClass(/theme-/u);
  }
});
