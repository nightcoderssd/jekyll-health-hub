// Usage: node axe-run.js <outdir> <url> [url...]  — runs axe-core (WCAG 2.0/2.1 A+AA + best-practice) and saves screenshots
const puppeteer = require('puppeteer-core'); const fs = require('fs'); const path = require('path');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
(async () => {
  const [out, ...urls] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const summary = [];
  for (const u of urls) {
    const p = await b.newPage(); await p.setViewport({ width: 1280, height: 900 });
    await p.goto(u, { waitUntil: 'networkidle0' }); await p.addScriptTag({ content: axeSrc });
    const r = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice'] } }));
    const uo = new URL(u); const slug = (uo.pathname + (uo.search ? '-' + uo.search : '')).replace(/\/+$/,'').replace(/[^a-z0-9]+/gi,'-').replace(/^-/,'') || 'home';
    fs.writeFileSync(path.join(out, `axe-${slug}.json`), JSON.stringify({ url: u, version: r.testEngine.version, violations: r.violations, passes: r.passes.length, incomplete: r.incomplete.map(i=>({id:i.id,impact:i.impact,nodes:i.nodes.length})) }, null, 2));
    await p.screenshot({ path: path.join(out, `${slug}.png`), fullPage: true });
    summary.push({ url: u, violations: r.violations.map(v => `${v.id} (${v.impact}, ${v.nodes.length})`), passes: r.passes.length, needsReview: r.incomplete.map(i=>i.id) });
    await p.close();
  }
  await b.close(); console.log(JSON.stringify(summary, null, 1));
})();
