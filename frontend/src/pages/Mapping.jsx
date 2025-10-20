import React from 'react'
export default function Mapping({ companyId, onNext }){
  const [rows, setRows] = React.useState([])
  const [form, setForm] = React.useState({ product_id:'', discord_server_id:'', discord_role_id:'' })

  const load = async ()=>{
    const r = await fetch(`/api/mappings?company_id=${companyId}`)
    const j = await r.json()
    setRows(j)
  }
  React.useEffect(()=>{ load() }, [])

  const add = async ()=>{
    const r = await fetch('/api/mappings', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ company_id: companyId, ...form })
    })
    if(r.ok){ setForm({ product_id:'', discord_server_id:'', discord_role_id:'' }); load() }
  }

  const del = async (id)=>{
    await fetch(`/api/mappings/${id}`, { method:'DELETE' })
    load()
  }

  return (
    <div>
      <h2>3) Map Products ↔ Roles</h2>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:8, marginTop:12}}>
        <input placeholder="Whop product_id" value={form.product_id} onChange={e=>setForm({...form, product_id:e.target.value})} />
        <input placeholder="Discord server_id" value={form.discord_server_id} onChange={e=>setForm({...form, discord_server_id:e.target.value})} />
        <input placeholder="Discord role_id" value={form.discord_role_id} onChange={e=>setForm({...form, discord_role_id:e.target.value})} />
        <button onClick={add}>Add</button>
      </div>

      <table style={{width:'100%', marginTop:16}}>
        <thead><tr><th>ID</th><th>Product</th><th>Server</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.product_id}</td>
              <td>{r.discord_server_id}</td>
              <td>{r.discord_role_id}</td>
              <td><button onClick={()=>del(r.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{marginTop:12}}>
        <button onClick={onNext}>Continue</button>
      </div>
    </div>
  )
}
