import { test, expect } from '@playwright/test';

test('user can log in and reach account dashboard', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });

  await page.goto('/#/');

  const loginButton = page.getByRole('button', { name: 'Продолжить с Telegram' });
  await expect(loginButton).toBeVisible();
  await loginButton.click();

  await expect(page).toHaveURL(/#\/account/);
  await expect(page.getByText('Ваше подключение')).toBeVisible();
});
