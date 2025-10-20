import React from 'react'
export default function Connect({ onNext }){
  return (
    <div>
      <h2>1) Connect</h2>
      <p>Connect your Discord and Whop accounts. (OAuth placeholders — fill keys in backend <code>.env</code>)</p>
      <button onClick={onNext}>Continue</button>
    </div>
  )
}
