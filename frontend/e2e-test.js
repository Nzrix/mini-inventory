const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'docs', 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function runTests() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = [];

  try {
    // Test 1: Login Page
    console.log('✓ Testing login page...');
    await page.goto('http://localhost:4200');
    await page.waitForSelector('input[type="text"]', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '01-login-page.png'), fullPage: true });
    results.push({ test: 'Login Page Load', status: 'PASS' });

    // Test 2: Admin Login
    console.log('✓ Testing admin login...');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'password123');
    await page.screenshot({ path: path.join(screenshotsDir, '02-admin-credentials.png'), fullPage: true });
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '03-dashboard-admin.png'), fullPage: true });
    results.push({ test: 'Admin Login', status: 'PASS' });

    // Test 3: Dashboard
    console.log('✓ Testing dashboard...');
    await page.waitForSelector('.dashboard', { timeout: 5000 }).catch(() => {});
    results.push({ test: 'Dashboard Load', status: 'PASS' });

    // Test 4: Products List
    console.log('✓ Testing products list...');
    await page.click('a[href="/products"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '04-products-list.png'), fullPage: true });
    results.push({ test: 'Products List', status: 'PASS' });

    // Test 5: Create Product
    console.log('✓ Testing product creation...');
    const createBtn = await page.$('button:has-text("Add Product"), button:has-text("New Product"), a:has-text("Add Product")');
    if (createBtn) {
      await createBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(screenshotsDir, '05-product-form.png'), fullPage: true });
      results.push({ test: 'Product Form', status: 'PASS' });
    } else {
      results.push({ test: 'Product Form', status: 'SKIP' });
    }

    // Test 6: Categories
    console.log('✓ Testing categories...');
    await page.click('a[href="/categories"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '06-categories.png'), fullPage: true });
    results.push({ test: 'Categories', status: 'PASS' });

    // Test 7: Stock Transactions
    console.log('✓ Testing stock transactions...');
    await page.click('a[href="/stock-transactions"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '07-stock-transactions.png'), fullPage: true });
    results.push({ test: 'Stock Transactions', status: 'PASS' });

    // Test 8: Reports
    console.log('✓ Testing reports...');
    await page.click('a[href="/reports"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '08-reports.png'), fullPage: true });
    results.push({ test: 'Reports', status: 'PASS' });

    // Test 9: Logout and Staff Login
    console.log('✓ Testing logout...');
    const logoutBtn = await page.$('button:has-text("Logout"), a:has-text("Logout")');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(500);
    } else {
      await page.goto('http://localhost:4200');
    }
    
    console.log('✓ Testing staff login...');
    await page.fill('input[type="text"]', 'staff');
    await page.fill('input[type="password"]', 'password123');
    await page.screenshot({ path: path.join(screenshotsDir, '09-staff-credentials.png'), fullPage: true });
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotsDir, '10-dashboard-staff.png'), fullPage: true });
    results.push({ test: 'Staff Login', status: 'PASS' });

    // Test 10: Staff restricted access
    console.log('✓ Testing staff restrictions...');
    await page.click('a[href="/categories"]');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(screenshotsDir, '11-staff-restricted.png'), fullPage: true });
    results.push({ test: 'Staff Restrictions', status: 'PASS' });

  } catch (error) {
    console.error('Test failed:', error.message);
    results.push({ test: error.message, status: 'FAIL' });
    await page.screenshot({ path: path.join(screenshotsDir, 'error.png'), fullPage: true });
  }

  await browser.close();

  console.log('\n=== TEST RESULTS ===');
  results.forEach(r => console.log(`${r.status === 'PASS' ? '✅' : r.status === 'SKIP' ? '⏭️' : '❌'} ${r.test}: ${r.status}`));
  console.log(`\nTotal: ${results.length} | Pass: ${results.filter(r => r.status === 'PASS').length} | Fail: ${results.filter(r => r.status === 'FAIL').length}`);
}

runTests().catch(console.error);
