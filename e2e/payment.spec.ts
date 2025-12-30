import { test, expect, Page } from '@playwright/test';

const addMockUser = async (page: Page) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'usr_1',
        telegramId: 12345678,
        username: 'Test User',
        avatar: 'https://cdn.visitors.now/users/e2ccd994-4e15-425d-81b4-ad614a9d46dc/avatars/vVBAtzhu4sxfKkQ5_Y7_3.png',
      }),
    );
  });
};

test('payment flow reaches success result', async ({ page }) => {
  await addMockUser(page);

  await page.goto('/#/');

  const loginButton = page.getByRole('button', { name: 'Продолжить с Telegram' });
  if (await loginButton.count()) {
    await loginButton.click();
  }

  await expect(page).toHaveURL(/#\/account/);

  await page.goto('/#/pay');
  await expect(page.getByRole('heading', { name: 'Обновите ваш тариф' })).toBeVisible();
  await page.waitForTimeout(400);

  const payButton = page.getByRole('button', { name: 'Оплатить сейчас' });
  await expect(payButton).toBeEnabled();
  await payButton.click({ force: true });

  await expect(page).toHaveURL(/#\/result/);
  await expect(page.getByRole('heading', { name: 'Готово!' })).toBeVisible();
});
