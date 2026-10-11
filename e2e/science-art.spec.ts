import { test, expect } from '@playwright/test';

test('科学森林 → 动物王国 → 分类 → 得星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /科学森林/ }).click();
  await page.getByRole('button', { name: /动物王国/ }).click();

  // 第 2 关（science-02 分类）在第 1 关得星前是锁定的，先通关第 1 关解锁。
  await page.getByRole('button', { name: /第 1 关/ }).click();
  await page.getByRole('button', { name: '大象' }).click();
  await expect(page.getByLabel('获得星星')).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: '继续' }).click();

  await page.getByRole('button', { name: /第 2 关/ }).click();

  await page.getByRole('button', { name: '小鸟' }).click();
  await page.getByRole('button', { name: '会飞' }).click();
  await page.getByRole('button', { name: '鱼' }).click();
  await page.getByRole('button', { name: '水里' }).click();
  await page.getByRole('button', { name: '鸭子' }).click();
  await page.getByRole('button', { name: '水里' }).click();
  await page.getByRole('button', { name: '蜜蜂' }).click();
  await page.getByRole('button', { name: '会飞' }).click();

  await expect(page.getByLabel('获得星星')).toBeVisible({ timeout: 10000 });
});

test('艺术城堡 → 涂鸦画室 → 完成 → 得星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /艺术城堡/ }).click();
  await page.getByRole('button', { name: /涂鸦画室/ }).click();
  await page.getByRole('button', { name: /第 1 关/ }).click();

  const canvas = page.locator('.coloring-canvas');
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.move(box.x + 40, box.y + 40);
    await page.mouse.down();
    await page.mouse.move(box.x + 120, box.y + 120, { steps: 8 });
    await page.mouse.up();
  }

  await page.getByRole('button', { name: '完成' }).click();
  await expect(page.getByLabel('获得星星')).toBeVisible({ timeout: 10000 });
});
