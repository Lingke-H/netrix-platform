import { expect, test } from "@playwright/test";

const demoIds = {
  peerUser: "10000000-0000-4000-8000-000000000002",
  thread: "10000000-0000-4000-8000-000000000701",
};

test.skip(!process.env.DATABASE_URL, "DATABASE_URL is required for the seeded demo E2E path.");

test("demo data supports the posts to profile to recommendation to message loop", async ({ page }) => {
  await page.goto("/feed");
  await expect(page.getByRole("heading", { name: "Academic Feed" })).toBeVisible();
  await expect(page.getByText("How are people debugging COMP1048 React state loops?")).toBeVisible();
  await expect(page.getByText("TypeScript narrowing checklist for coursework bugs")).toBeVisible();
  await expect(page.getByText("What helped me prepare for ELEC2043 signals labs")).toBeVisible();

  await page.goto(`/profiles/${demoIds.peerUser}`);
  await expect(page.getByRole("heading", { name: "Arun Algorithm Partner" })).toBeVisible();
  await expect(page.getByText("COMP1048")).toBeVisible();
  await expect(page.getByText("algorithm visualisation")).toBeVisible();

  await page.goto("/recommendations");
  await expect(page.getByRole("heading", { name: "Recommended Connections" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Arun Algorithm Partner" })).toBeVisible();
  await expect(page.getByText("Shared module: COMP1048")).toBeVisible();
  await expect(page.getByText("Candidate can help with: TypeScript debugging")).toBeVisible();

  await page.goto("/connections");
  await expect(page.getByRole("heading", { name: "Connection Requests" })).toBeVisible();
  await expect(page.getByText("messages available")).toBeVisible();
  await page.getByRole("link", { name: "Open messages" }).click();
  await expect(page).toHaveURL(new RegExp(`/messages/${demoIds.thread}$`));

  await expect(page.getByRole("heading", { name: "Conversation" })).toBeVisible();
  await expect(page.getByText("I can share my ELEC2043 signal sketch template before the lab.")).toBeVisible();
  await expect(page.getByText("Great, I can bring my MATH1031 revision notes in return.")).toBeVisible();

  await page.getByLabel("Message").fill("E2E check: let us meet near the library after COMP1048.");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("E2E check: let us meet near the library after COMP1048.")).toBeVisible();
});
