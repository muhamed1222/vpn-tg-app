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

test('instructions show vpn key and platform download link', async ({ page }) => {
  await addMockUser(page);

  await page.goto('/#/instructions');

  const instructionsPanel = page.getByRole('tabpanel');

  await expect(instructionsPanel.getByText('Установка клиента')).toBeVisible();
  await expect(instructionsPanel.getByText('Копирование ключа')).toBeVisible();

  const vpnKey = instructionsPanel.getByLabel('VPN ключ. Нажмите для копирования');
  await expect(vpnKey).toBeVisible();
  await expect(vpnKey).toContainText('vless://');

  await expect(instructionsPanel.getByRole('link', { name: 'Скачать из App Store' })).toBeVisible();

  const androidTab = page.getByRole('tab', { name: 'Android' });
  await androidTab.click();
  await expect(instructionsPanel.getByRole('link', { name: 'Скачать из Google Play' })).toBeVisible();

  await vpnKey.hover();
  await expect(instructionsPanel.getByText('Скопировать', { exact: true })).toBeVisible();
});

test('qr code is generated on account page', async ({ page }) => {
  await addMockUser(page);

  await page.goto('/#/account');

  const qrToggle = page.getByRole('button', { name: 'Показать QR код' });
  await expect(qrToggle).toBeVisible();
  await qrToggle.click();

  const qrImage = page.getByRole('img', { name: 'QR код VPN ключа' });
  await expect(qrImage).toBeVisible();
  await expect(qrImage).toHaveAttribute('src', /^data:image\/png;base64,/);
});
