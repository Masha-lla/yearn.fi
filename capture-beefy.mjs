import {build} from '/tmp/shapeshift-wrap-test/node_modules/esbuild/lib/main.js'
import {chromium} from '/tmp/shapeshift-wrap-test/node_modules/playwright-core/index.mjs'
import {readFileSync,writeFileSync} from 'node:fs'
import {execFileSync} from 'node:child_process'
const repo='/tmp/beefy-2226',out='/tmp/contribution-screens'
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
try{for(const phase of ['before','after']){
const path='src/features/vault/components/PnLGraph/standard/components/Header/Header.tsx'
const original=phase==='before'?execFileSync('git',['show','origin/main:'+path],{cwd:repo,encoding:'utf8'}):readFileSync(repo+'/'+path,'utf8')
const source=original.replace(/^import[\s\S]*? from ['"][^'"]+['"];?\n/gm,'')
const code=`import React,{memo,useState} from 'react';import {createRoot} from 'react-dom/client';import BigNumber from 'bignumber.js';
import {calculatePnlInCurrency} from '${repo}/src/helpers/pnl-currency.ts';
import {formatLargePercent,formatLargeUsd,formatPositiveOrNegative,formatTokenDisplay,formatTokenDisplayCondensed} from '${repo}/src/helpers/format.ts';
const bn=n=>new BigNumber(n),BIG_ZERO=bn(0);
const fixture={usdBalanceAtDeposit:bn(20000),balanceAtDeposit:bn(1),depositUsd:bn(44000),deposit:bn(1.1),tokenDecimals:8,totalYieldUsd:bn(4000),totalYield:bn(0.1),yieldPercentage:bn(0.1),totalPnlUsd:bn(24000),pnlPercentage:bn(1.2),pendingIndex:false};
const useAppSelector=()=>fixture,selectStandardGovPnl=()=>fixture;
const useBtcPerformance=()=>calculatePnlInCurrency([{datetime:new Date(100000),shareDiff:bn(1),shareToUnderlyingPrice:bn(1),underlyingToUsdPrice:bn(20000)}],[{t:100,v:20000}],bn(40000),bn(40000),bn(1.1),bn(4000));
const labels=${JSON.stringify(JSON.parse(readFileSync(repo+'/src/locales/en/main.json','utf8')))};
const useTranslation=()=>({t:k=>labels[k]||k});
const styles=Object.fromEntries(['header','itemContainer','labelContainer','label','value','greenValue','redValue','subValue','withTooltip','textOverflow','center'].map(k=>[k,k]));
const css=(...v)=>v.filter(x=>typeof x==='string').join(' ');const legacyMakeStyles=()=>()=>styles;
const PendingIndexNotice=()=>null,IconWithTooltip=()=>null;
const DivWithTooltip=({children})=><>{children}</>,BasicTooltipContent=()=>null;
const ToggleButtons=({value,options,onChange})=><nav>{options.map(o=><button key={o.value} aria-pressed={o.value===value} onClick={()=>onChange(o.value)}>{o.label}</button>)}</nav>;
${source}
createRoot(document.getElementById('root')).render(<main><h1>Beefy #2314 — ${phase}</h1><p>Local performance-panel fixture: production Header and currency calculator; mocked Redux and price hooks.</p><p>Same position: 1 token deposited at $20,000 → 1.1 tokens at $40,000. BTC: $20,000 → $40,000.</p><section><h2>Position performance</h2><Header vaultId='fixture' address='0x1111'/></section><p>No wallet connection or transaction. Charts are outside this fixture.</p></main>)`
await build({stdin:{contents:code,loader:'tsx',resolveDir:repo},outfile:out+'/beefy.js',bundle:true,jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})
writeFileSync(out+'/beefy.html',`<html><meta charset='utf-8'><style>body{margin:0;background:#101a1c;color:#e5efea;font:16px system-ui}main{max-width:1080px;margin:35px auto}h1{font-size:28px}p{line-height:1.6;color:#aebdb7}section{background:#1c2c2b;padding:25px;border-radius:15px}.header{display:grid;grid-template-columns:repeat(4,1fr);gap:2px}.itemContainer{background:#243936;padding:18px}.label{color:#a2bcb0;text-transform:uppercase;font-size:14px;font-weight:bold;margin-bottom:14px}.value{font-size:22px;display:flex;gap:5px}.value span{font-size:14px}.subValue{font-size:15px;color:#b6c8bf;margin-top:10px}.greenValue{color:#60e79b}.redValue{color:#f08080}nav{display:flex;justify-content:flex-end;margin-bottom:20px}button{padding:10px 24px;color:white;background:#29443d;border:1px solid #59756b;font:inherit}button[aria-pressed=true]{background:#397d57}</style><div id='root'></div><script src='beefy.js'></script></html>`)
const page=await browser.newPage({viewport:{width:1200,height:740}});page.on('pageerror',e=>console.log('ERROR',e.message));await page.goto('file://'+out+'/beefy.html');await page.getByText('Position performance',{exact:true}).waitFor();if(phase==='after'){await page.getByRole('button',{name:'BTC',exact:true}).click();await page.getByText('+0.1 BTC',{exact:false}).waitFor();}console.log(phase,(await page.locator('section').innerText()).slice(-550));await page.screenshot({path:'/Users/masha/Documents/ChatGPT/Perso/contributions-19-nov/beefy-2314-'+phase+'.png'});if(phase==='after'){await page.getByRole('button',{name:'USD',exact:true}).click();if(!(await page.locator('section').innerText()).includes('24,000'))throw Error('USD not restored');}await page.close()
}}finally{await browser.close()}
