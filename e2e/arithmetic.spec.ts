import { test, expect } from '@playwright/test';

test('数学山 → 加减工厂 → 选择题答对 → 得星', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('名字').fill('测试宝宝');
  await page.getByRole('button', { name: '5-6岁' }).click();
  await page.getByRole('button', { name: '开始玩' }).click();
  await page.getByRole('button', { name: /数学山/ }).click();
  await page.getByRole('button', { name: /加减工厂/ }).click();
  await page.getByRole('button', { name: /第 1 关/ }).click();

  for (let i = 0; i < 5; i++) {
    await expect(page.locator('.arith-progress')).toHaveText(`第 ${i + 1} / 5 题`);
    const question = await page.locator('.arith-question').textContent();
    const [a, op, b] = (question ?? '').replace('= ?', '').trim().split(/\s+/);
    const answer = op === '+' ? Number(a) + Number(b) : Number(a) - Number(b);
    await page.getByRole('button', { name: String(answer), exact: true }).click();
  }

  await expect(page.getByLabel('获得星星')).toBeVisible({ timeout: 10000 });
});
