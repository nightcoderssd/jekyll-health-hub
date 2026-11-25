// Usage: node keyboard-check.js <url> — presses Tab once and Enter, reports first focus target and where focus lands.
const puppeteer = require('puppeteer-core');
(async () => {
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  for (const u of process.argv.slice(2)) {
    const p = await b.newPage(); await p.goto(u, { waitUntil: 'networkidle0' });
    await p.keyboard.press('Tab');
    const first = await p.evaluate(() => ({ text: document.activeElement.textContent.trim(), href: document.activeElement.getAttribute('href'), visible: document.activeElement.getBoundingClientRect().left >= 0 }));
    await p.keyboard.press('Enter'); await new Promise(r => setTimeout(r, 300));
    const after = await p.evaluate(() => document.activeElement.id || document.activeElement.tagName);
    console.log(JSON.stringify({ url: u, firstTab: first, focusAfterEnter: after }));
    await p.close();
  }
  await b.close();
})();
