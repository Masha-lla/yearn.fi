import {chromium} from '/tmp/shapeshift-wrap-test/node_modules/playwright-core/index.mjs'
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'})
try{
const page=await browser.newPage({viewport:{width:1280,height:960}})
page.on('pageerror',e=>console.log('ERROR',e.message.slice(0,150)))
await page.addInitScript(()=>{
 const provider={isMetaMask:true,on(){},removeListener(){},async request({method}){
 if(method==='eth_accounts'||method==='eth_requestAccounts')return ['0x1111111111111111111111111111111111111111']
 if(method==='eth_chainId')return '0x1'
 if(method==='wallet_requestPermissions')return [{parentCapability:'eth_accounts'}]
 if(method==='wallet_getCapabilities')return {}
 throw Error('Read-only test wallet: unsupported '+method)
 }}
 window.ethereum=provider
 const announce=()=>window.dispatchEvent(new CustomEvent('eip6963:announceProvider',{detail:{info:{uuid:'21429b5c-2a42-4a32-a32d-1e863375a10a',name:'Local test wallet',icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',rdns:'org.local.testwallet'},provider}}))
 window.addEventListener('eip6963:requestProvider',announce);announce()
})
await page.goto('http://127.0.0.1:3002',{waitUntil:'domcontentloaded',timeout:60000})
await page.getByRole('button',{name:'Connect Wallet',exact:true}).first().click({timeout:60000})
await page.getByRole('button',{name:/Local test wallet/}).click()
await page.getByRole('button',{name:/Open wallet account/}).click({timeout:30000})
await page.getByRole('button',{name:'Open wallet settings'}).click()
const toggle=page.getByRole('switch',{name:'Auto-stake deposits'})
await toggle.click()
if(await toggle.getAttribute('aria-checked')!=='false')throw Error('Toggle did not turn off')
await page.waitForTimeout(700)
await page.screenshot({path:'/Users/masha/Documents/ChatGPT/Perso/yearn-1431-before.png'})
console.log('BEFORE: auto-stake disabled; staked output visible:',await page.getByText('0 Staked shares',{exact:true}).first().isVisible())
}finally{await browser.close()}
