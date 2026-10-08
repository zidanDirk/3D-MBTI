import {chromium,expect} from '@playwright/test';
import {writeFile,mkdir} from 'node:fs/promises';
import {newAdventure,chooseAdventure,canChooseAdventure,getAdventureNode,adventureSummary} from '../src/adventure.js';
const paths=new Map();let routes=0;function walk(s,path=[]){if(s.status==='complete'){routes++;if(!paths.has(s.nodeId))paths.set(s.nodeId,path);return;}getAdventureNode(s).options.forEach((_,i)=>{if(canChooseAdventure(s,i).allowed)walk(chooseAdventure(s,i),[...path,i]);});}walk(newAdventure());
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const url=process.env.TEST_URL||'http://127.0.0.1:5189/';await mkdir('artifacts/gameplay',{recursive:true});const errors=[],checks=[];
const page=await browser.newPage({viewport:{width:1440,height:1050},reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
const shot=(p,n)=>p.screenshot({path:`artifacts/gameplay/${n}.png`,fullPage:true});
const play=()=>page.locator('nav [data-action=play]').click();
await page.goto(url,{waitUntil:'networkidle'});await expect(page.locator('.play-entry button')).toHaveCount(2);await play();await expect(page.locator('.play-mode-card')).toHaveCount(2);await page.waitForTimeout(300);await shot(page,'hub-desktop');
for(const [ending,path] of paths){
 await page.locator('[data-play=adventure]').click();await page.locator('[data-play-select=story-type]').selectOption('INFP');await page.locator('[data-play=story-start]').click();
 await expect(page.locator('.play-live-character canvas')).toBeVisible();
 for(let i=0;i<path.length;i++){
  if(i===0)await shot(page,'story-desktop');
  await page.locator(`[data-story-choice="${path[i]}"]`).click();await expect(page.locator('.choice-delta')).toBeVisible();await page.locator('[data-play=story-continue]').click();
  if(ending===[...paths.keys()][0]&&i===0){
   await page.locator('[data-play=hub]').first().click();await page.locator('[data-play=adventure]').click();await page.locator('[data-play=story-start]').click();await expect(page.locator('.play-confirm')).toBeVisible();await page.locator('[data-play=cancel-start]').click();await page.reload({waitUntil:'networkidle'});await play();await page.locator('[data-play=adventure]').click();await page.locator('[data-play=story-resume]').click();await expect(page.locator('.story-progress .done')).toHaveCount(1);
  }
 }
 await expect(page.locator('.ending-emblem')).toBeVisible();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('inner-space-play-v1')).current.nodeId)).toBe(ending);await shot(page,'ending-desktop');await page.locator('[data-play=hub]').first().click();
}
await expect(page.locator('.ending-stamp.owned')).toHaveCount(4);await page.reload({waitUntil:'networkidle'});await play();await expect(page.locator('.ending-stamp.owned')).toHaveCount(4);checks.push('4 endings completed via actual choices; route costs, feedback, restart cancellation, reload continuation, collection persistence');
for(const deck of ['daily','travel','creative']){
 await page.locator('[data-play=duo]').click();await page.locator(`[data-duo-deck=${deck}]`).click();await page.locator('[data-play=duo-start]').click();
 for(let i=0;i<6;i++){
  for(let p=0;p<2;p++){
   await expect(page.locator('.handoff-curtain')).toBeVisible();await expect(page.locator('.duo-options')).toHaveCount(0);await expect(page.locator('.duo-reveal-row')).toHaveCount(0);
   await page.locator('[data-play=duo-ready]').click();await expect(page.locator('[data-play=duo-submit]')).toBeDisabled();
   if(i===0&&p===1&&deck==='daily'){
    await page.locator('nav [data-action=home]').click();await play();await expect(page.locator('.handoff-curtain')).toBeVisible();await page.locator('[data-play=duo-ready]').click();
   }
   await page.locator(`[data-duo-answer=self][data-choice="${p}"]`).click();await expect(page.locator('[data-play=duo-submit]')).toBeDisabled();await page.locator(`[data-duo-answer=prediction][data-choice="${1-p}"]`).click();
   if(deck==='daily'&&i===0&&p===0)await shot(page,'duo-answer-desktop');
   await page.locator('[data-play=duo-submit]').click();
  }
  await expect(page.locator('.duo-reveal-row')).toBeVisible();await expect(page.locator('.reveal-pair em')).toHaveText(['✓ 这次猜中了','✓ 这次猜中了']);if(i===0)await shot(page,'duo-reveal-desktop');await page.locator('[data-play=duo-next]').click();
 }
 await expect(page.locator('.duo-finale')).toBeVisible();await expect(page.locator('.duo-scores>div').nth(0)).toContainText('0 / 6');await expect(page.locator('.duo-scores>div').nth(1)).toContainText('6 / 6');await expect(page.locator('.duo-scores>div').nth(2)).toContainText('6 / 6');await shot(page,'duo-summary-desktop');await page.locator('[data-play=hub]').first().click();
}
expect(await page.evaluate(()=>localStorage.getItem('inner-space-v2'))).toBe(null);expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>/duo/i.test(k)))).toEqual([]);
await page.reload({waitUntil:'networkidle'});await play();await expect(page.locator('[data-play=duo-resume]')).toHaveCount(0);checks.push('3 decks × 6 actual rounds; A/B curtains conceal options/answers; navigation re-curtains; incomplete submit blocked; exact prediction totals; no MBTI mutation; reload clears duo');
for(const width of [390,320]){
 const ctx=await browser.newContext({viewport:{width,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});const m=await ctx.newPage();m.on('pageerror',e=>errors.push(e.message));await m.goto(url,{waitUntil:'networkidle'});expect(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await m.locator('nav [data-action=play]').tap();await shot(m,`hub-${width}`);expect(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await m.locator('[data-play=adventure]').tap();await m.locator('[data-play=story-start]').tap();await shot(m,`story-${width}`);const canvas=m.locator('.play-live-character canvas');await canvas.scrollIntoViewIfNeeded();const before=await canvas.screenshot(),box=await canvas.boundingBox();await m.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await m.mouse.down();await m.mouse.move(box.x+box.width*.7,box.y+box.height*.5,{steps:10});await m.mouse.up();expect(before.equals(await canvas.screenshot())).toBe(false);
 for(const c of [...paths.values()][0]){await m.locator(`[data-story-choice="${c}"]`).tap();await m.locator('[data-play=story-continue]').tap();}await expect(m.locator('.ending-emblem')).toBeVisible();await m.locator('[data-play=duo]').tap();await m.locator('[data-play=duo-start]').tap();await shot(m,`handoff-${width}`);
 for(let i=0;i<6;i++){for(let p=0;p<2;p++){await m.locator('[data-play=duo-ready]').tap();await m.locator('[data-duo-answer=self][data-choice="0"]').tap();await m.locator('[data-duo-answer=prediction][data-choice="0"]').tap();if(i===0&&p===0)await shot(m,`duo-answer-${width}`);await m.locator('[data-play=duo-submit]').tap();}if(i===0)await shot(m,`duo-reveal-${width}`);await m.locator('[data-play=duo-next]').tap();}
 await expect(m.locator('.duo-finale')).toBeVisible();expect(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await shot(m,`duo-summary-${width}`);await ctx.close();checks.push(`${width}px: touch story completion, 3D drag, six duo rounds and summary, no horizontal overflow`);
}
await browser.close();const result={routes,endingPaths:Object.fromEntries(paths),checks,errors};await writeFile('artifacts/gameplay/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));expect(errors).toEqual([]);
