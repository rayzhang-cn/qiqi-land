import { test, expect } from '@playwright/test';

test('进语言岛 → 诗词小径 → 听诗跟读 → 得星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /语言岛/ }).click();
  await page.getByRole('button', { name: /静夜思/ }).first().click();
  await page.getByRole('button', { name: '开始听' }).click();
  await expect(page.getByLabel('获得星星')).toBeVisible({ timeout: 20000 });
});
