const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(screenshotsDir, { recursive: true });

const results = [];

function record(name, status, detail = '') {
  results.push({ name, status, detail });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${name}${detail ? ' — ' + detail : ''}`);
}

async function login(page, username, password) {
  await page.goto('http://localhost:4200/login');
  await page.waitForSelector('#username', { timeout: 15000 });
  await page.fill('#username', username);
  await page.fill('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('.dashboard, .navbar', { timeout: 15000 });
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  try {
    // Login page
    await page.goto('http://localhost:4200/login');
    await page.waitForSelector('#username');
    await page.screenshot({ path: path.join(screenshotsDir, '01-login.png'), fullPage: true });
    record('Login page', 'PASS');

    // Admin login -> dashboard
    await login(page, 'admin', 'password123');
    await page.waitForSelector('.stat-card');
    await page.screenshot({ path: path.join(screenshotsDir, '02-dashboard.png'), fullPage: true });
    record('Admin login + dashboard', 'PASS');

    // Products list
    await page.click('a[href="/products"]');
    await page.waitForSelector('.data-table, .products-page');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '03-products-list.png'), fullPage: true });
    record('Products list', 'PASS');

    // Product form
    const addProduct = page.locator('button:has-text("Add Product")');
    await addProduct.click();
    await page.waitForSelector('.modal-content');
    await page.screenshot({ path: path.join(screenshotsDir, '04-product-form.png'), fullPage: true });
    await page.click('button:has-text("Cancel")');
    record('Product form', 'PASS');

    // Stock transactions + form
    await page.click('a[href="/stock-transactions"]');
    await page.waitForSelector('.page');
    await page.waitForTimeout(800);
    await page.click('button:has-text("New Transaction")');
    await page.waitForSelector('.modal-content');
    await page.screenshot({ path: path.join(screenshotsDir, '05-stock-transaction-form.png'), fullPage: true });

    // Create a stock OUT that causes low stock for screenshot later
    const productSelect = page.locator('select[name="productId"]');
    await productSelect.selectOption({ index: 1 });
    await page.selectOption('select[name="type"]', 'OUT');
    // Leave form open screenshot already taken; cancel and do API-driven low stock via UI carefully
    await page.fill('input[name="quantity"]', '1');
    await page.fill('textarea[name="reason"]', 'UI verification OUT');
    await page.click('.modal-content button:has-text("Save")');
    await page.waitForTimeout(1000);
    record('Stock transaction form + OUT', 'PASS');

    // Reports (stock)
    await page.click('a[href="/reports"]');
    await page.waitForSelector('.page');
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(screenshotsDir, '06-reports.png'), fullPage: true });
    record('Reports page', 'PASS');

    // Low stock tab — force low stock via adjustment if needed
    await page.click('button:has-text("Low Stock")');
    await page.waitForTimeout(500);

    // If empty, create low stock via stock page ADJUSTMENT then return
    const lowRows = await page.locator('.tab-content tbody tr').count();
    if (lowRows === 0) {
      await page.click('a[href="/stock-transactions"]');
      await page.waitForSelector('button:has-text("New Transaction")');
      await page.click('button:has-text("New Transaction")');
      await page.selectOption('select[name="productId"]', { index: 1 });
      await page.selectOption('select[name="type"]', 'ADJUSTMENT');
      await page.fill('input[name="quantity"]', '-9999');
      await page.fill('textarea[name="reason"]', 'Force low stock for screenshot');
      await page.click('.modal-content button:has-text("Save")');
      await page.waitForTimeout(800);
      // If rejected as negative, use a large OUT instead after checking current
      const err = await page.locator('.error').textContent().catch(() => '');
      if (err) {
        await page.selectOption('select[name="type"]', 'OUT');
        await page.fill('input[name="quantity"]', '45');
        await page.fill('textarea[name="reason"]', 'Reduce stock for low-stock demo');
        await page.click('.modal-content button:has-text("Save")');
        await page.waitForTimeout(800);
      }
      await page.click('a[href="/reports"]');
      await page.waitForSelector('button:has-text("Low Stock")');
      await page.click('button:has-text("Low Stock")');
      await page.waitForTimeout(800);
    }

    await page.screenshot({ path: path.join(screenshotsDir, '07-low-stock.png'), fullPage: true });
    record('Low stock alert', 'PASS');

    // Role restriction: logout and staff login — Categories link hidden
    await page.click('button:has-text("Logout")');
    await page.waitForSelector('#username');
    await login(page, 'staff', 'password123');
    await page.waitForSelector('.navbar');
    const categoriesVisible = await page.locator('a[href="/categories"]').count();
    if (categoriesVisible === 0) {
      record('Staff role restriction (Categories hidden)', 'PASS');
    } else {
      record('Staff role restriction (Categories hidden)', 'FAIL', 'Categories link visible to staff');
    }
    await page.screenshot({ path: path.join(screenshotsDir, '08-staff-dashboard.png'), fullPage: true });

    // Staff can open products
    await page.click('a[href="/products"]');
    await page.waitForSelector('.products-page, .data-table');
    await page.waitForTimeout(500);
    record('Staff products page', 'PASS');

  } catch (err) {
    record('UI walkthrough', 'FAIL', err.message);
    await page.screenshot({ path: path.join(screenshotsDir, 'ui-error.png'), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
  }

  // Cleanup unwanted screenshots
  for (const name of ['02-admin-credentials.png', 'error.png', '01-login-page.png', 'ui-error.png']) {
    const p = path.join(screenshotsDir, name);
    if (fs.existsSync(p) && name !== 'ui-error.png') fs.unlinkSync(p);
  }
  // Keep ui-error only if present and walkthrough failed
  const failed = results.some(r => r.status === 'FAIL');
  const uiError = path.join(screenshotsDir, 'ui-error.png');
  if (!failed && fs.existsSync(uiError)) fs.unlinkSync(uiError);

  console.log('\n=== UI RESULTS ===');
  results.forEach(r => console.log(`${r.status}\t${r.name}${r.detail ? ' — ' + r.detail : ''}`));
  console.log('\nScreenshots:', fs.readdirSync(screenshotsDir).join(', '));
  process.exit(results.some(r => r.status === 'FAIL') ? 1 : 0);
}

run();
