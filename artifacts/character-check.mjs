import {chromium,expect} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
await mkdir('artifacts/characters',{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const errors=[],diagnostics=[],checks=[];
const p=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});await p.locator('nav [data-action=atlas]').click();
await p.waitForFunction(()=>document.querySelectorAll('.character-portrait.ready').length===16);await p.waitForTimeout(350);
expect(await p.locator('.character-portrait').evaluateAll(images=>new Set(images.map(i=>i.src)).size)).toBe(16);
await p.screenshot({path:'artifacts/characters/atlas-desktop.png',fullPage:true});
for(const family of ['analysts','diplomats','sentinels','explorers']){await p.locator(`[data-family=${family}]`).click();await expect(p.locator('.character-card')).toHaveCount(4);}
await p.locator('[data-family=all]').click();await p.locator('[data-type=INTJ]').click();
for(let i=0;i<16;i++){
 await expect(p.locator('#character-detail-viewer canvas')).toBeVisible();await p.waitForTimeout(90);
 const ds=await p.evaluate(()=>window.__INNER_SPACE__.characters());expect(ds).toHaveLength(1);expect(ds[0].drawCalls).toBeGreaterThan(0);expect(ds[0].drawCalls).toBeLessThanOrEqual(170);diagnostics.push(ds[0]);
 if(i===1)await p.screenshot({path:'artifacts/characters/detail-desktop.png'});
 if(i<15)await p.locator('[data-character-step="1"]').click();
}
const canvas=p.locator('#character-detail-viewer canvas');const initial=await canvas.screenshot();await p.waitForTimeout(150);expect(initial.equals(await canvas.screenshot())).toBe(true);
const box=await canvas.boundingBox();await p.mouse.move(box.x+box.width*.45,box.y+box.height*.5);await p.mouse.down();await p.mouse.move(box.x+box.width*.8,box.y+box.height*.5,{steps:10});await p.mouse.up();expect(initial.equals(await canvas.screenshot())).toBe(false);
await p.locator('[data-character-action=reset]').click();expect(initial.equals(await canvas.screenshot())).toBe(true);
await p.locator('[data-action=character-motion]').click();await p.locator('[data-character-action=greet]').click();
for(let i=0;i<3;i++){await p.waitForTimeout(250);await canvas.screenshot({path:`artifacts/characters/motion-${i}.png`});}
await p.keyboard.press('Escape');await expect.poll(()=>p.evaluate(()=>window.__INNER_SPACE__.characters().length)).toBe(0);
checks.push('16 unique portraits; four family filters; all 16 live models render; drag/reset; neutral animation freeze; greeting sequence; dialog disposal');
for(const width of [390,320]){
 const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const m=await ctx.newPage();m.on('pageerror',e=>errors.push(e.message));
 await m.goto('http://127.0.0.1:5189/',{waitUntil:'networkidle'});await m.locator('nav [data-action=atlas]').tap();await m.waitForFunction(()=>document.querySelectorAll('.character-portrait.ready').length===16);
 expect(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await m.screenshot({path:`artifacts/characters/atlas-${width}.png`,fullPage:true});await m.locator('[data-type=ENFP]').tap();await expect(m.locator('#character-detail-viewer canvas')).toBeVisible();
 expect(await m.locator('dialog').evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true);await m.screenshot({path:`artifacts/characters/detail-${width}.png`});await m.locator('.dialog-close').tap();
 await m.locator('nav [data-action=home]').tap();await m.locator('[data-action=start]').tap();for(let i=0;i<12;i++){await m.locator('[data-option="1"]').tap();await m.locator('[data-action=next]').tap();}
 await expect(m.locator('.result-type')).toHaveText('INFP');await expect(m.locator('.result-persona-viewer canvas')).toHaveAttribute('aria-label',/INFP/);await m.screenshot({path:`artifacts/characters/result-${width}.png`,fullPage:true});
 const download=m.waitForEvent('download');await m.locator('[data-action=download]').tap();await (await download).saveAs(`artifacts/characters/card-${width}.png`);
 await m.locator('#content [data-action=report]').tap();await expect(m.locator('.report-persona-preview img')).toHaveAttribute('data-portrait','INFP');await m.locator('.report-persona-preview').tap();await expect(m.locator('.atlas-detail-type')).toHaveText('INFP');
 checks.push(`${width}px production: atlas no overflow, touch detail, live result INFP, PNG portrait export, report character link`);await ctx.close();
}
expect(errors).toEqual([]);await browser.close();await writeFile('artifacts/characters/results.json',JSON.stringify({checks,errors,diagnostics},null,2));console.log(JSON.stringify({checks,errors,diagnostics},null,2));
