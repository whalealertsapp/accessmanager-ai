import React from 'react'
export default function Dashboard(){
  return (
    <div>
      <h2>4) Dashboard</h2>
      <ul>
        <li>Set Whop webhook → <code>/api/webhooks/whop</code></li>
        <li>Set <code>WHOP_WEBHOOK_SECRET</code> in backend env</li>
        <li>Fill Discord credentials before live tests</li>
      </ul>
    </div>
  )
}
