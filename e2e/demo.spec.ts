import { expect, test } from "@playwright/test";

// Démo du cas passant, de bout en bout. Chaque itération ajoute ses étapes (test.step).
test("Démo : le cas passant", async ({ page }) => {
  await test.step("J'ouvre l'application", async () => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });

  await test.step("Je choisis mon rôle", async () => {
    await page.getByRole("button", { name: /coordinatrice régionale/i }).click();
    await expect(page).toHaveURL(/\/depot/);
  });

  await test.step("Je dépose une ressource", async () => {
    await page.getByPlaceholder("Collez un lien ou un texte à organiser").fill(
      "https://exemple.org/droits-apres-diagnostic",
    );
    await page.getByRole("button", { name: "Déposer" }).click();
    await expect(page.getByText("https://exemple.org/droits-apres-diagnostic")).toBeVisible();
  });
});
