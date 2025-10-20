import React from 'react'
import Connect from './pages/Connect.jsx'
import LinkDiscord from './pages/LinkDiscord.jsx'
import Mapping from './pages/Mapping.jsx'
import Dashboard from './pages/Dashboard.jsx'

export default function App(){
  const [step, setStep] = React.useState('connect')
  const [companyId] = React.useState(import.meta.env.VITE_WHOP_COMPANY_ID || 'biz_ES0i2F5jEDA6kb')
  const [whopUserId] = React.useState('test_user_123')

  return (
    <div style={{fontFamily:'Inter, system-ui', color:'#eaeaea', background:'#0b0b0c', minHeight:'100vh'}}>
      <div style={{maxWidth:960, margin:'0 auto', padding:'24px'}}>
        <header style={{display:'flex', alignItems:'center', gap:12, marginBottom:16}}>
          <img src="/logo.png" alt="AccessManager.ai" style={{height:36}} />
          <h1 style={{fontSize:24, margin:0}}>Access Manager</h1>
        </header>

        {step === 'connect' && <Connect onNext={()=>setStep('link')} />}
        {step === 'link' && <LinkDiscord whopUserId={whopUserId} onNext={()=>setStep('mapping')} />}
        {step === 'mapping' && <Mapping companyId={companyId} onNext={()=>setStep('dashboard')} />}
        {step === 'dashboard' && <Dashboard />}
      </div>
    </div>
  )
}
