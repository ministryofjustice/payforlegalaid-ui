// tests/home.spec.js
import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("shows the report list and download links", async ({ page }) => {
    await page.goto("/")

    // 1. H1 text
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/get legal aid data/i)

    // 2. Report rows – assert there is at least one
    const rows = page.locator(".govuk-grid-row")
    const rowCount = await rows.count()
    expect(rowCount).toBeGreaterThan(0)

    // 3. Download links
    const links = page.getByRole("link", { name: /download/i })
    const linkCount = await links.count()
    expect(linkCount).toBeGreaterThan(0)
    await expect(links.first()).toHaveAttribute("href", /\/(csv|excel)\//)
  })
})
