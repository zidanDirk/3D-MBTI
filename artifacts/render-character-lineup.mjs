import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:960,height:1140},reducedMotion:'reduce'});
await page.goto('http://127.0.0.1:5188/',{waitUntil:'networkidle'});
await page.evaluate(async()=>{
 const {getCharacterPortrait}=await import('/src/character-viewer.js');
 const types=['ISTP','ISFP','ESFP','ESTP','INFJ','ENFP','ENFJ','INFP','ISTJ','ISFJ','ESTJ','ESFJ','INTJ','INTP','ENTJ','ENTP'];
 const data=types.map(t=>({t,src:getCharacterPortrait(t,720)}));
 document.body.innerHTML='<div id="sheet">'+data.map(({t,src})=>`<div class="item"><img src="${src}"><b>${t}</b></div>`).join('')+'</div>';
 const style=document.createElement('style');style.textContent='html,body{margin:0!important;padding:0!important;min-height:100vh!important;background:#fbf8f0!important;overflow:hidden}#sheet{display:grid;grid-template-columns:repeat(4,1fr);padding:18px 24px;gap:4px 12px}.item{height:270px;display:flex;flex-direction:column;align-items:center;justify-content:center}.item img{width:224px;height:245px;object-fit:contain}.item b{font:700 22px/1.4 Arial,sans-serif;letter-spacing:3px;color:#292828}';document.head.appendChild(style);
 await Promise.all([...document.images].map(i=>i.decode()));
});
await page.screenshot({path:'artifacts/characters/reference-style-lineup.png'});
await page.reload({waitUntil:'networkidle'});await page.locator('nav [data-action=atlas]').click();await page.locator('[data-type=ISFJ]').click();
const c=page.locator('#character-detail-viewer canvas');await c.waitFor();const box=await c.boundingBox();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.5);await page.mouse.down();await page.mouse.move(box.x+box.width*.7,box.y+box.height*.5,{steps:10});await page.mouse.up();await c.screenshot({path:'artifacts/characters/side-view.png'});
await browser.close();
