const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(screenshotsDir, { recursive: true });
for (const f of fs.readdirSync(screenshotsDir)) {
  if (f.endsWith('.png')) fs.unlinkSync(path.join(screenshotsDir, f));
}

const results = [];
function record(name, status, detail = '') {
  results.push({ name, status, detail });
  console.log(`${status === 'PASS' ? '✅' : '❌'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function waitFonts(page) {
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.waitForTimeout(150);
}

async function dismissSnackbar(page) {
  const snack = page.locator('.mat-mdc-snack-bar-container, simple-snack-bar');
  if (await snack.count()) {
    const action = page.locator('.mat-mdc-snack-bar-action, simple-snack-bar button').first();
    if (await action.count()) {
      await action.click({ timeout: 2000 }).catch(() => {});
    }
    await snack.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(async () => {
      await page.waitForTimeout(3500);
    });
  }
  await page.waitForTimeout(200);
}

async function login(page, username, password) {
  await page.goto('http://localhost:4200/login');
  await page.waitForSelector('#username', { timeout: 20000 });
  await waitFonts(page);
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.shell, .page-title', { timeout: 20000 });
  await dismissSnackbar(page);
  await waitFonts(page);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(20000);

  try {
    await page.goto('http://localhost:4200/login');
    await page.waitForSelector('#username');
    await waitFonts(page);
    await page.screenshot({ path: path.join(screenshotsDir, '01-login.png'), fullPage: true });
    record('Login page', 'PASS');

    await login(page, 'admin', 'password123');
    await page.waitForSelector('.stats-grid, .stat-card');
    await page.waitForTimeout(600);
    await dismissSnackbar(page);
    await waitFonts(page);
    await page.screenshot({ path: path.join(screenshotsDir, '02-dashboard.png'), fullPage: true });
    record('Dashboard + charts', 'PASS');

    await page.click('a[href="/products"]');
    await page.waitForSelector('.products-page');
    await page.waitForSelector('.money');
    await page.waitForTimeout(600);
    await dismissSnackbar(page);
    await waitFonts(page);
    await page.screenshot({ path: path.join(screenshotsDir, '03-products-list.png'), fullPage: true });
    record('Products list', 'PASS');

    await page.click('button:has-text("Add Product")');
    await page.waitForSelector('mat-dialog-container');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, '04-product-form.png'), fullPage: true });
    await page.keyboard.press('Escape');
    record('Product form dialog', 'PASS');

    await page.click('a[href="/stock-transactions"]');
    await page.waitForSelector('button:has-text("New Transaction")');
    await page.waitForTimeout(600);
    await page.click('button:has-text("New Transaction")');
    await page.waitForSelector('mat-dialog-container');
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(screenshotsDir, '05-stock-transaction-form.png'), fullPage: true });
    await page.keyboard.press('Escape');
    record('Stock transaction form', 'PASS');

    await page.click('a[href="/reports"]');
    await page.waitForSelector('.page-title');
    await page.waitForTimeout(1000);
    await dismissSnackbar(page);
    await page.screenshot({ path: path.join(screenshotsDir, '06-reports.png'), fullPage: true });
    record('Reports', 'PASS');

    const token = await page.evaluate(() => localStorage.getItem('token'));
    await page.request.post('http://localhost:8080/api/stock-transactions', {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { productId: 1, type: 'OUT', quantity: 40, reason: 'Screenshot low stock' }
    }).catch(() => {});
    await page.reload();
    await page.waitForSelector('.page-title');
    await dismissSnackbar(page);
    await page.getByRole('tab', { name: 'Low Stock' }).click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '07-low-stock.png'), fullPage: true });
    record('Low stock alert', 'PASS');

    await page.click('button:has-text("Logout")');
    await page.waitForSelector('#username');
    await login(page, 'staff', 'password123');
    await page.waitForSelector('.shell');
    await dismissSnackbar(page);
    const cat = await page.locator('a[href="/categories"]').count();
    record('Staff role restriction', cat === 0 ? 'PASS' : 'FAIL', cat === 0 ? 'Categories hidden' : 'Categories visible');
    await page.screenshot({ path: path.join(screenshotsDir, '08-staff-dashboard.png'), fullPage: true });

    await page.click('a[href="/products"]');
    await page.waitForSelector('.products-page');
    record('Staff products', 'PASS');
  } catch (err) {
    record('UI walkthrough', 'FAIL', err.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'ui-error.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  console.log('\nScreenshots:', fs.readdirSync(screenshotsDir).filter(f => f.endsWith('.png')).join(', '));
  process.exit(results.some(r => r.status === 'FAIL') ? 1 : 0);
}

run();
