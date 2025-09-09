
const API_URL = 'http://127.0.0.1:8000/api/';
function getHeaders(json=true) {
  const token = localStorage.getItem('token');
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}
export async function register(username, email, password) {
  const res = await fetch(API_URL + 'auth/register/', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ username, email, password }) });
  if (!res.ok) throw new Error('Registration failed');
  return res.json();
}
export async function login(username, password) {
  const res = await fetch(API_URL + 'auth/login/', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ username, password }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Login failed');
  localStorage.setItem('token', data.access);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}
export async function fetchArtworks() { const res = await fetch(API_URL + 'artworks/'); return res.json(); }
export async function addToCart(artwork_id, quantity=1) { const res = await fetch(API_URL + 'cart/', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ artwork_id, quantity }) }); if (!res.ok) throw new Error('Add to cart failed'); return res.json(); }
export async function getCart() { const res = await fetch(API_URL + 'cart/', { headers: getHeaders() }); if (!res.ok) throw new Error('Load cart failed (are you logged in?)'); return res.json(); }
export async function removeCartItem(id) { const res = await fetch(API_URL + 'cart/' + id + '/', { method: 'DELETE', headers: getHeaders() }); if (!res.ok && res.status !== 204) throw new Error('Remove failed'); }
export async function uploadArtwork({ title, description, price, imageFile }) {
  const token = localStorage.getItem('token');
  const form = new FormData();
  form.append('title', title);
  form.append('description', description || '');
  form.append('price', price);
  form.append('image', imageFile);
  const res = await fetch(API_URL + 'artworks/upload/', { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : {}, body: form });
  if (!res.ok) { const text = await res.text(); throw new Error('Upload failed: ' + text); }
  return res.json();
}
export async function createOrder(items) { const res = await fetch(API_URL + 'orders/', { method: 'POST', headers: getHeaders(), body: JSON.stringify({ items }) }); if (!res.ok) { const data = await res.json().catch(()=>({detail:'Failed'})); throw new Error(data.detail || 'Order creation failed'); } return res.json(); }
export async function listOrders() { const res = await fetch(API_URL + 'orders/list/', { headers: getHeaders() }); if (!res.ok) throw new Error('Failed to load orders'); return res.json(); }
