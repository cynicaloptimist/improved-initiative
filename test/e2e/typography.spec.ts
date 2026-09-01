import { expect, test } from "@playwright/test";

test("heading typography does not leak into nested tooltip content", async ({
  page
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    const fixture = document.createElement("h4");
    fixture.id = "typography-test-heading";
    fixture.innerHTML = `
      Heading
      <strong data-typography-test="heading-child">(experimental)</strong>
      <div data-tippy-root>
        <div class="tippy-box">
          <div
            class="tippy-content"
            data-typography-test="tooltip-content"
          >
            Tooltip content
            <code data-typography-test="code">[data-ii-role]</code>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(fixture);
  });

  await expect(page.locator("#typography-test-heading")).toHaveCSS(
    "font-family",
    '"Spectral SC", serif'
  );
  await expect(
    page.locator('[data-typography-test="heading-child"]')
  ).toHaveCSS("font-family", '"Spectral SC", serif');
  await expect(
    page.locator('[data-typography-test="tooltip-content"]')
  ).toHaveCSS("font-family", "Roboto, sans-serif");
  await expect(page.locator('[data-typography-test="code"]')).toHaveCSS(
    "font-family",
    '"Courier New", Courier, monospace'
  );
});
