import { test, expect } from '@playwright/test';

test('创建档案 → 进入数学山 → 玩一关 → 得星星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /数学山/ }).click();
  await page.getByRole('button', { name: /第 1 关/ }).click();
  await page.getByRole('button', { name: '3', exact: true }).click();
  await expect(page.getByLabel('获得星星')).toBeVisible();
});