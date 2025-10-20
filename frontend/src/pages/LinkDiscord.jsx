import React from 'react'
export default function LinkDiscord({ whopUserId, onNext }){
  const [id, setId] = React.useState(whopUserId)
  const start = ()=> window.location.href = `/api/auth/discord/link/start?whop_user_id=${encodeURIComponent(id)}`
  return (
    <div>
      <h2>2) Link Discord</h2>
      <p>Link your Discord to your Whop account so we can grant roles instantly after purchase.</p>
      <div style={{display:'flex', gap:8, alignItems:'center', marginTop:12}}>
        <input style={{padding:8}} placeholder="Whop user id (dev only)" value={id} onChange={e=>setId(e.target.value)} />
        <button onClick={start}>Connect My Discord</button>
        <button onClick={onNext}>Skip (dev)</button>
      </div>
      <p style={{opacity:0.7, marginTop:8}}>In production, the Whop SDK will supply the user id automatically.</p>
    </div>
  )
}
