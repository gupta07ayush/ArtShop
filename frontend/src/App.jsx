
import React, { useEffect, useState } from 'react'
import { login, register, fetchArtworks, addToCart, getCart, removeCartItem, uploadArtwork, createOrder, listOrders } from './services/api'

function Nav({ user, onLogout, onNav }){
  return (
    <div style={{display:'flex',gap:12,padding:12, borderBottom:'1px solid #ddd', alignItems:'center'}}>
      <strong>🖼️ Art Shop</strong>
      <button onClick={()=>onNav('gallery')}>Gallery</button>
      <button onClick={()=>onNav('cart')}>Cart</button>
      <button onClick={()=>onNav('myorders')}>My Orders</button>
      <button onClick={()=>onNav('upload')}>Upload</button>
      <div style={{marginLeft:'auto'}}>
        {user ? (<>
          <span style={{marginRight:8}}>Hello, {user.username}</span>
          <button onClick={onLogout}>Logout</button>
        </>) : null}
      </div>
    </div>
  )
}

function LoginForm({ onLoggedIn }){
  const [isRegister, setIsRegister] = useState(false)
  const [username, setUsername] = useState('demo')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('demo123')
  const [error, setError] = useState('')

  async function submit(e){
    e.preventDefault()
    setError('')
    try{
      if(isRegister){
        await register(username, email, password)
      }
      const data = await login(username, password)
      onLoggedIn(data.user)
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div style={{maxWidth:360, margin:'40px auto', padding:24, border:'1px solid #eee', borderRadius:12}}>
      <h2 style={{marginBottom:16}}>{isRegister?'Create account':'Login'}</h2>
      {error && <div style={{background:'#fee', padding:8, marginBottom:8}}>{error}</div>}
      <form onSubmit={submit}>
        <div style={{display:'grid', gap:8}}>
          <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} required />
          {isRegister && <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />}
          <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          <button type="submit">{isRegister?'Sign up & Login':'Login'}</button>
        </div>
      </form>
      <div style={{marginTop:12}}>
        <button onClick={()=>setIsRegister(v=>!v)}>
          {isRegister?'Have an account? Login':'No account? Register'}
        </button>
      </div>
    </div>
  )
}

function UploadArtwork({ onUploaded }){
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [price, setPrice] = useState('100.00')
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')

  async function submit(e){
    e.preventDefault()
    setMsg('Uploading...')
    try{
      await uploadArtwork({ title, description: desc, price, imageFile: file })
      setMsg('Uploaded successfully')
      setTitle(''); setDesc(''); setPrice('100.00'); setFile(null)
      onUploaded && onUploaded()
    }catch(err){
      setMsg('Error: ' + err.message)
    }
  }

  return (
    <div style={{maxWidth:540, margin:'24px auto'}}>
      <h2>Upload Artwork</h2>
      <form onSubmit={submit}>
        <div style={{display:'grid', gap:8}}>
          <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} required />
          <input placeholder="Description" value={desc} onChange={e=>setDesc(e.target.value)} />
          <input placeholder="Price" value={price} onChange={e=>setPrice(e.target.value)} required />
          <input type="file" accept="image/*" onChange={e=>setFile(e.target.files[0])} required />
          <button type="submit">Upload</button>
        </div>
      </form>
      {msg && <div style={{marginTop:8}}>{msg}</div>}
    </div>
  )
}

function Gallery({ onAdd, refreshSignal }){
  const [items, setItems] = useState([])
  useEffect(()=>{ fetchArtworks().then(setItems) }, [refreshSignal])
  return (
    <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16, padding:16}}>
      {items.map(a => (
        <div key={a.id} style={{border:'1px solid #eee', borderRadius:12, overflow:'hidden'}}>
          <div style={{height:180, background:'#f7f7f7', display:'flex',alignItems:'center',justifyContent:'center'}}>
            {a.image ? <img src={a.image} alt={a.title} style={{maxWidth:'100%', maxHeight:'100%'}}/> : <span>No Image</span>}
          </div>
          <div style={{padding:12}}>
            <div style={{fontWeight:600}}>{a.title}</div>
            <div style={{opacity:0.7, fontSize:14, minHeight:40}}>{a.description}</div>
            <div style={{marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span>₹ {a.price}</span>
              <button onClick={()=>onAdd(a.id)}>Add</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function Cart({ onCheckoutComplete }){
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  async function load(){ try{ setError(''); const data = await getCart(); setItems(data) }catch(e){ setError(e.message) } }
  useEffect(()=>{ load() }, [])
  async function removeItem(id){ await removeCartItem(id); load() }
  async function checkout(){
    if(!items.length) return alert('Cart is empty')
    const payload = items.map(it => ({ artwork_id: it.artwork.id, quantity: it.quantity }))
    try{
      const order = await createOrder(payload)
      alert('Order placed! Order id: ' + order.id)
      setItems([])
      onCheckoutComplete && onCheckoutComplete()
    }catch(e){
      alert('Checkout failed: ' + e.message)
    }
  }
  const total = items.reduce((sum, it) => sum + (Number(it.artwork?.price || 0) * (it.quantity||1)), 0)
  return (
    <div style={{maxWidth:720, margin:'20px auto', padding:16}}>
      {error && <div style={{background:'#fee', padding:8, marginBottom:8}}>{error}</div>}
      <h2>Your Cart</h2>
      {!items.length && <div>No items yet.</div>}
      {items.map(it => (
        <div key={it.id} style={{display:'grid', gridTemplateColumns:'80px 1fr auto', gap:12, alignItems:'center', padding:'8px 0', borderBottom:'1px solid #eee'}}>
          <div style={{height:60, width:80, background:'#f7f7f7', display:'flex', alignItems:'center', justifyContent:'center'}}>
            {it.artwork?.image ? <img src={`http://127.0.0.1:8000${it.artwork.image}`} style={{maxHeight:'100%', maxWidth:'100%'}} /> : '—'}
          </div>
          <div>
            <div style={{fontWeight:600}}>{it.artwork?.title}</div>
            <div>Qty: {it.quantity}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div>₹ {Number(it.artwork?.price||0) * it.quantity}</div>
            <button onClick={()=>removeItem(it.id)} style={{marginTop:8}}>Remove</button>
          </div>
        </div>
      ))}
      <div style={{textAlign:'right', marginTop:16, fontWeight:700}}>Total: ₹ {total.toFixed(2)}</div>
      <div style={{textAlign:'right', marginTop:8}}><button disabled={!items.length} onClick={checkout}>Checkout</button></div>
    </div>
  )
}

function OrdersList(){
  const [orders, setOrders] = useState([])
  useEffect(()=>{ listOrders().then(setOrders).catch(()=>{}) }, [])
  return (
    <div style={{maxWidth:720, margin:'20px auto', padding:16}}>
      <h2>My Orders</h2>
      {!orders.length && <div>No orders yet.</div>}
      {orders.map(o => (
        <div key={o.id} style={{border:'1px solid #eee', padding:12, marginBottom:8}}>
          <div><strong>Order #{o.id}</strong> — {new Date(o.created_at).toLocaleString()}</div>
          <div>Total: ₹ {o.total}</div>
          <div>{o.items.map(it => (<div key={it.id} style={{paddingTop:8}}>{it.artwork ? it.artwork.title : 'Deleted artwork'} — Qty: {it.quantity} — ₹ {it.price}</div>))}</div>
        </div>
      ))}
    </div>
  )
}

export default function App(){
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')||'null'))
  const [page, setPage] = useState('gallery')
  const [refreshSignal, setRefreshSignal] = useState(0)
  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null) }
  async function add(artwork_id){ try{ await addToCart(artwork_id, 1); alert('Added to cart!') }catch(e){ alert('Please login first to add items to cart.'); setPage('login') } }
  return (
    <div>
      <Nav user={user} onLogout={logout} onNav={setPage} />
      {!user && page==='login' ? <LoginForm onLoggedIn={(u)=>{setUser(u); setPage('gallery')}}/> : null}
      {page==='gallery' && <Gallery onAdd={add} refreshSignal={refreshSignal} />}
      {page==='cart' && <Cart onCheckoutComplete={()=>setRefreshSignal(s=>s+1)} />}
      {page==='upload' && <UploadArtwork onUploaded={()=>setRefreshSignal(s=>s+1)} />}
      {page==='myorders' && <OrdersList />}
      {!user && page!=='login' && (<div style={{textAlign:'center', padding:12}}><button onClick={()=>setPage('login')}>Login to purchase</button></div>)}
    </div>
  )
}
