import { build } from '/tmp/shapeshift-wrap-test/node_modules/esbuild/lib/main.js'
import { chromium } from '/tmp/shapeshift-wrap-test/node_modules/playwright-core/index.mjs'
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
const repo='/tmp/shapeshift-12799', out='/tmp/contribution-screens'
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
try {
for(const phase of ['before','after']){
const original=phase==='before'?execFileSync('git',['show','origin/develop:src/components/Modals/Send/Form.tsx'],{cwd:repo,encoding:'utf8'}):readFileSync(repo+'/src/components/Modals/Send/Form.tsx','utf8')
const source=original.replace(/^import[\s\S]*? from ['"][^'"]+['"];?\n/gm,'')
const code=`
import React,{useCallback,useMemo,useState} from 'react'
import {createRoot} from 'react-dom/client'
import {FormProvider,useForm,useWatch,useFormContext} from 'react-hook-form'
import {MemoryRouter,Navigate,useLocation,useNavigate} from 'react-router-dom'
import {Route,Switch} from 'wouter'
import {fromAssetId,CHAIN_NAMESPACE} from '@shapeshiftoss/caip'
const usdc='eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
const recipient='0x1111111111111111111111111111111111111111'
const FeeDataKey={Average:'average'}
const SendFormFields={AssetId:'assetId',Input:'input',AccountId:'accountId',AmountCryptoPrecision:'amountCryptoPrecision',FiatAmount:'fiatAmount',FiatSymbol:'fiatSymbol'}
const SendRoutes={Address:'/send/address',Select:'/send/select',Scan:'/send/scan',Confirm:'/send/confirm',AmountDetails:'/send/amount-details'}
const isToken=id=>id.includes('/erc20:')
const AnimatePresence=({children})=><>{children}</>,SlideTransition=AnimatePresence
const useCompleteSendFlow=()=>()=>{},useFormSend=()=>({}),getMixPanel=()=>null
const modal={close(){}};const useModal=()=>modal,useWallet=()=>({state:{}})
const preferences={selectors:{selectSelectedCurrency:()=> 'USD'}},useAppSelector=()=> 'USD'
const selectPortfolioAccountIdsByAssetIdFilter=()=>[],selectFirstAccountIdByChainId=()=>undefined
const selectMarketDataByAssetIdUserCurrency=()=>({price:1}),store={getState:()=>({})}
const parseUrlDirect=()=>null,parseAddress=async()=>({assetId:'eip155:1/slip44:60',chainId:'eip155:1'})
const parseAddressInputWithChainId=async()=>({address:recipient})
const maybeFetchChangeAddress=async()=>{},bnOrZero=()=>({times:()=>({toString:()=>''})})
const Confirm=()=>null,SendAmountDetails=()=>null
const SelectAssetRouter=({onClick})=><button type='button' onClick={()=>onClick(usdc)}>Select USDC</button>
const QrCodeScanner=({onSuccess})=><section><h2>Scan recipient</h2><p>Simulated scan: plain Ethereum address</p><code>{recipient}</code><button type='button' onClick={()=>onSuccess(recipient)}>Read QR fixture</button></section>
const Address=()=>{const {control}=useFormContext();const asset=useWatch({control,name:'assetId'});const address=useWatch({control,name:'input'});const navigate=useNavigate();return <section><h2>Send <span data-testid='symbol'>{asset===usdc?'USDC':'ETH'}</span></h2><p>Selected asset</p><code>{asset}</code><p>Recipient</p><code>{address||'Not scanned yet'}</code><button type='button' onClick={()=>navigate('/send/scan')}>Scan recipient QR</button></section>}
${source}
createRoot(document.getElementById('root')).render(<main><h1>ShapeShift #12797 — ${phase}</h1><p className='note'>Local integration fixture: production Form component, mocked wallet, scanner and leaf views. No transaction.</p><MemoryRouter initialEntries={['/send/select']}><Form/></MemoryRouter></main>)
`
await build({stdin:{contents:code,loader:'tsx',resolveDir:repo},absWorkingDir:repo,outfile:out+'/shape.js',bundle:true,banner:{js:'var process = {env:{},platform:"browser"};'},jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}})
writeFileSync(out+'/shape.html',`<html><meta charset='utf-8'><style>body{margin:0;background:#101923;color:#e2e8f0;font:18px system-ui}main{max-width:860px;margin:50px auto;padding:24px}h1{font-size:28px}.note{font-size:14px;color:#9eb0c4}section{margin-top:30px;background:#1e2b3a;border-radius:18px;padding:30px}code{display:block;font-size:15px;overflow-wrap:anywhere}button{display:block;background:#4a80ef;color:white;border:0;border-radius:8px;padding:14px;margin-top:24px;font:inherit}</style><div id='root'></div><script src='shape.js'></script></html>`)
const page=await browser.newPage({viewport:{width:1100,height:760}})
page.on('pageerror',e=>console.log('PAGEERROR',e.message));await page.goto('file://'+out+'/shape.html')
await page.getByRole('button',{name:'Select USDC'}).click()
await page.getByRole('button',{name:'Scan recipient QR'}).click()
await page.getByRole('button',{name:'Read QR fixture'}).click()
await page.getByRole('button',{name:'Scan recipient QR'}).waitFor()
const symbol=await page.getByTestId('symbol').innerText()
if(symbol!==(phase==='before'?'ETH':'USDC'))throw Error('Unexpected symbol '+symbol)
await page.screenshot({path:'/Users/masha/Documents/ChatGPT/Perso/contributions-19-nov/shape-12797-'+phase+'.png'})
console.log(phase,symbol)
await page.close()
}
}finally{await browser.close()}
