import {chromium,expect} from '@playwright/test';
import {writeFile,readFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const errors=[],checks=[];const url=process.env.TEST_URL||'http://127.0.0.1:5189/';
const state=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('inner-space-v2')));
const shot=(p,name)=>p.screenshot({path:`artifacts/v2/${name}.png`,fullPage:true,animations:'disabled'});
async function answer(p,i){await p.locator(`[data-option="${i}"]`).click();await p.locator('[data-action=next]').click();}
const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1,acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'networkidle'});
await expect(page.locator('#world canvas')).toBeVisible();
await expect(page.locator('.mode-card')).toHaveCount(3);await shot(page,'desktop-home');
await page.locator('nav [data-action=pro]').click();await expect(page.locator('dialog')).toContainText('付费服务尚未启用');await page.locator('[data-action=pro-report]').click();await expect(page.locator('.page-heading')).toContainText('示例');
await page.locator('[data-report-tab=growth]').click();await page.locator('[data-growth="1"]').click();await expect(page.locator('[data-growth="1"]')).toHaveAttribute('aria-pressed','true');expect((await state(page))?.history?.length||0).toBe(0);
await page.locator('nav [data-action=home]').click();
await page.locator('[data-action=start]').click();await expect(page.locator('[data-action=next]')).toBeDisabled();
await page.keyboard.press('Tab');await page.keyboard.press('Enter');await expect(page.locator('[data-option="0"]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-action=next]').click();
await answer(page,1);await answer(page,0);await page.locator('[data-action=back]').click();await page.locator('[data-action=back]').click();await answer(page,0);expect((await state(page)).drafts.quick.answers.length).toBe(3);await expect(page.locator('[data-option="0"]')).toHaveAttribute('aria-pressed','true');await page.locator('[data-action=next]').click();
await page.locator('[data-action=exit]').click();await page.locator('[data-tier=standard]').click();await page.locator('[data-action=start]').click();await answer(page,1);await page.locator('[data-action=exit]').click();await page.reload({waitUntil:'networkidle'});await page.locator('[data-tier=quick]').click();await page.locator('[data-action=start]').click();await expect(page.locator('.quiz-top b')).toHaveText('04');await shot(page,'desktop-quiz');
for(let i=3;i<12;i++)await answer(page,0);
await expect(page.locator('.result-type')).toHaveText('ESTJ');expect((await state(page)).history.length).toBe(1);await shot(page,'desktop-result');
const pngPromise=page.waitForEvent('download');await page.locator('[data-action=download]').click();const png=await pngPromise;await png.saveAs('artifacts/v2/personality-card.png');
await page.locator('#content [data-action=report]').click();await expect(page.locator('.report-summary')).toContainText('ESTJ');await expect(page.locator('.report-summary > div')).toHaveCount(3);await expect(page.locator('#workspace > .report-tabs')).toHaveCount(1);await expect(page.locator('.insight')).toHaveCount(8);await shot(page,'desktop-report');
await page.locator('[data-report-tab=growth]').click();await page.locator('[data-growth="3"]').click();expect((await state(page)).history[0].growthDone).toEqual([3]);await shot(page,'desktop-growth');
const reportPromise=page.waitForEvent('download');await page.locator('[data-action=export-report]').click();const report=await reportPromise;await report.saveAs('artifacts/v2/exported-report.html');const html=await readFile('artifacts/v2/exported-report.html','utf8');expect(html).toContain('ESTJ');expect(html).toContain('✓ DAY 3');expect(html).toContain('window.print()');
await page.reload({waitUntil:'networkidle'});await page.locator('nav [data-action=history]').click();await page.locator('[data-record]').first().click();await page.locator('[data-report-tab=growth]').click();await expect(page.locator('[data-growth="3"]')).toHaveAttribute('aria-pressed','true');
await page.locator('nav [data-action=home]').click();await page.locator('[data-tier=standard]').click();await page.locator('[data-action=start]').click();await expect(page.locator('.quiz-top b')).toHaveText('02');await page.locator('[data-action=back]').click();
for(let i=0;i<32;i++)await answer(page,i%2);
await expect(page.locator('.tie-note')).toContainText('均衡');expect((await state(page)).history.length).toBe(2);await shot(page,'standard-balanced');
await page.locator('[data-action=restart]').click();await page.locator('[data-tier=deep]').click();await page.locator('[data-action=start]').click();
for(let i=0;i<60;i++)await answer(page,1);
await expect(page.locator('.result-type')).toHaveText('INFP');expect((await state(page)).history.length).toBe(3);
await page.locator('nav [data-action=history]').click();await expect(page.locator('.history-item')).toHaveCount(3);await expect(page.locator('.compare-row')).toHaveCount(4);await shot(page,'desktop-history');
const records=(await state(page)).history;await page.locator('[data-compare="0"]').selectOption(records[2].id);await expect(page.locator('.compare-row').first()).toContainText('-100');
await page.locator('.delete-record').last().click();await page.locator('.dialog-close').click();await expect(page.locator('.history-item')).toHaveCount(3);await page.locator('.delete-record').last().click();await page.locator('[data-confirm-delete]').click();await expect(page.locator('.history-item')).toHaveCount(2);
checks.push('Desktop: all 12/32/60 real-input completions, balanced scores, independent resume, preserve future answers, preview vs real reports, PNG/HTML export, growth persistence, comparison, delete confirmation, keyboard');
await page.locator('nav [data-action=atlas]').click();await expect(page.locator('.type-card')).toHaveCount(16);await page.locator('[data-type=INFP]').click();await expect(page.locator('.atlas-detail-type')).toHaveText('INFP');await page.locator('.dialog-close').click();
for(const width of [390,320]){
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const p=await ctx.newPage();p.on('pageerror',e=>errors.push(e.message));await p.goto(url,{waitUntil:'networkidle'});
 expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(p.locator('[data-action=motion]')).toHaveAttribute('aria-label','播放场景动画');await shot(p,`mobile-${width}-home`);
 await p.locator('[data-action=start]').tap();for(let i=0;i<12;i++){await p.locator('[data-option="1"]').tap();await p.locator('[data-action=next]').tap();if(i===0)await shot(p,`mobile-${width}-quiz`);}
 await expect(p.locator('.result-type')).toHaveText('INFP');await shot(p,`mobile-${width}-result`);await p.locator('#content [data-action=report]').tap();await shot(p,`mobile-${width}-report`);expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await p.locator('[data-report-tab=growth]').tap();await p.locator('[data-growth="1"]').tap();await expect(p.locator('[data-growth="1"]')).toHaveAttribute('aria-pressed','true');await shot(p,`mobile-${width}-growth`);
 await p.locator('nav [data-action=history]').tap();await expect(p.locator('.history-item')).toHaveCount(1);await shot(p,`mobile-${width}-history`);expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await p.locator('nav [data-action=home]').tap();await p.locator('#sound').tap();await expect(p.locator('#sound')).toHaveAttribute('aria-pressed','true');await p.locator('#sound').tap();
 const canvas=p.locator('#world canvas');await canvas.scrollIntoViewIfNeeded();const a=await canvas.screenshot();const box=await canvas.boundingBox();await p.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await p.mouse.down();await p.mouse.move(box.x+box.width*.8,box.y+box.height*.55,{steps:12});await p.mouse.up();const b=await canvas.screenshot();expect(a.equals(b)).toBe(false);
 checks.push(`${width}px: no overflow home/report/history, real touch completion, result, report, growth, history, audio, reduced-motion and 3D drag`);await ctx.close();
}
await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});await page.waitForTimeout(300);const diagnostics=await page.evaluate(()=>window.__INNER_SPACE__.diagnostics());
for(let i=0;i<3;i++){await page.waitForTimeout(300);await page.locator('#world canvas').screenshot({path:`artifacts/v2/motion-${i}.png`});}
await browser.close();const result={checks,errors,diagnostics};await writeFile('artifacts/v2/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));expect(errors).toEqual([]);
