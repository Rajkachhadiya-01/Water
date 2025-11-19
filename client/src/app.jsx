// client/src/app.jsx
import React, { useState, useEffect } from 'react';
import {
  getAdminDashboard,
  createRoute, updateRoute, deleteRoute,
  createCustomer, updateCustomer, deleteCustomer,
  createDriver, updateDriver, deleteDriver,
  listDrivers, login,
  getDriverDashboard, getCustomerDashboard
} from './api';

/* ---------- UI atoms ---------- */
function IconLogout() {
  return (
    <svg className="w-5 h-5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 8v8"/></svg>
  );
}

/* ---------- Login (Glassmorphism Premium UI) ---------- */
function Login({ onLogin, onNotify }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await login(email, password);
      if (r.token) {
        localStorage.setItem('token', r.token);
        localStorage.setItem('role', r.user.role);
        onNotify({ type: "success", text: "Login successful" });
        onLogin(r.user.role);
      } else {
        onNotify({ type: "error", text: r.error || "Login failed" });
      }
    } catch (err) {
      onNotify({ type: "error", text: err?.error || "Login/network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-300 to-blue-700 p-6">
      {/* Background Water Ripples */}
      <div className="absolute inset-0 bg-[url('https://images.stockcake.com/public/e/f/c/efc8a74c-f18a-4276-8fa1-85ae0d29a8d8_large/rippling-water-droplets-stockcake.jpg')] opacity-10 bg-cover" />

      {/* Glass Box */}
      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow">
            Mineral Water
          </h1>
          <p className="mt-1 text-sky-100 text-sm">
            Secure access to your dashboard
          </p>
        </div>

        <form className="space-y-6" onSubmit={submit}>
          {/* Floating Input */}
          <div className="relative">
            <input
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full px-3 py-3 bg-white/20 border border-white/40 rounded-lg shadow text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white/60"
              placeholder="Email"
            />
            <label className="absolute left-3 top-1.5 text-white/80 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-white/60">
              Email
            </label>
          </div>

          {/* Floating Password */}
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-3 py-3 bg-white/20 border border-white/40 rounded-lg shadow text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-white/60"
              placeholder="Password"
            />
            <label className="absolute left-3 top-1.5 text-white/80 text-xs transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-placeholder-shown:text-white/60">
              Password
            </label>
          </div>

          {/* Submit Button */}
          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-white/30 text-white font-semibold shadow-xl backdrop-blur hover:bg-white/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- Layout: Topbar + Sidebar ---------- */
function Topbar({ role, onLogout }) {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="text-sky-600 font-bold text-lg">MineralWater</div>
            <div className="text-sm text-slate-500">— {role?.toUpperCase()}</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onLogout} className="flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900">
              <IconLogout /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ role, onSelect, selected }) {
  const items = role === 'admin'
    ? [{ id: 'dashboard', label: 'Dashboard' }, { id:'routes', label:'Routes' }, { id:'customers', label:'Customers' }, { id:'drivers', label:'Drivers' }]
    : role === 'driver'
      ? [{ id: 'dashboard', label: 'Dashboard' }]
      : [{ id:'dashboard', label:'Dashboard' }];

  return (
    <aside className="w-64 hidden md:block bg-slate-50 border-r">
      <nav className="p-4 space-y-1">
        {items.map(it=>(
          <button key={it.id} onClick={()=>onSelect(it.id)} className={`w-full text-left px-3 py-2 rounded ${selected===it.id ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-slate-100'}`}>
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* ---------- Admin UI pieces ---------- */
function Badge({ children, color='slate' }) {
  const base = 'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium';
  const map = {
    slate: 'bg-slate-100 text-slate-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-rose-100 text-rose-800',
    yellow: 'bg-amber-100 text-amber-800'
  };
  return <span className={`${base} ${map[color] || map.slate}`}>{children}</span>;
}

function AdminPanel() {
  const [data, setData] = useState({ routes: [], customers: [], drivers: [], bottles: [], jags: [], reminders: [] });
  const [loading, setLoading] = useState(true);

  // forms
  const [routeForm, setRouteForm] = useState({ id: null, name: '', driverId: '' });
  const [customerForm, setCustomerForm] = useState({ id: null, name: '', email: '', phone: '', routeId: '' });
  const [driverForm, setDriverForm] = useState({ id: null, name: '', email: '', password: '' });

  async function refresh() {
    setLoading(true);
    try {
      const d = await getAdminDashboard();
      setData(d);
    } catch (err) {
      console.error('Load admin dashboard failed', err);
      alert(err?.error || 'Failed to load admin data');
    } finally { setLoading(false); }
  }
  useEffect(()=>{ refresh(); }, []);

  /* routes */
  function startEditRoute(r) { setRouteForm({ id: r.id, name: r.name, driverId: r.driverId || '' }); }
  function resetRouteForm(){ setRouteForm({ id:null, name:'', driverId:'' }); }
  async function submitRoute(e){
    e.preventDefault();
    try {
      if (routeForm.id) await updateRoute(routeForm.id, { name: routeForm.name, driverId: routeForm.driverId || null });
      else await createRoute({ name: routeForm.name, driverId: routeForm.driverId || null });
      resetRouteForm(); refresh();
    } catch (err){ alert(err?.error || 'Route save failed'); }
  }
  async function onDeleteRoute(id){ if (!confirm('Delete route?')) return; try { await deleteRoute(id); refresh(); } catch (err){ alert(err?.error || 'Delete failed'); } }

  /* customers */
  function startEditCustomer(c){ setCustomerForm({ id: c.id, name: c.name, email: c.email, phone: c.phone || '', routeId: c.routeId || '' }); }
  function resetCustomerForm(){ setCustomerForm({ id:null, name:'', email:'', phone:'', routeId:''}); }
  async function submitCustomer(e){
    e.preventDefault();
    try {
      if (customerForm.id) await updateCustomer(customerForm.id, { name: customerForm.name, email: customerForm.email, phone: customerForm.phone, routeId: customerForm.routeId || null });
      else await createCustomer({ name: customerForm.name, email: customerForm.email, phone: customerForm.phone, routeId: customerForm.routeId || null });
      resetCustomerForm(); refresh();
    } catch (err){ alert(err?.error || 'Save customer failed'); }
  }
  async function onDeleteCustomer(id){ if (!confirm('Delete customer? This will remove payments/deliveries.')) return; try { await deleteCustomer(id); refresh(); } catch (err){ alert(err?.error || 'Delete failed'); } }

  /* drivers */
  function startEditDriver(d){ setDriverForm({ id: d.id, name: d.name, email: d.email, password: '' }); }
  function resetDriverForm(){ setDriverForm({ id:null, name:'', email:'', password:'' }); }
  async function submitDriver(e){
    e.preventDefault();
    try {
      if (driverForm.id) await updateDriver(driverForm.id, { name: driverForm.name, email: driverForm.email, password: driverForm.password || undefined });
      else await createDriver({ name: driverForm.name, email: driverForm.email, password: driverForm.password || 'driverpass' });
      resetDriverForm(); refresh();
    } catch (err){ alert(err?.error || 'Save driver failed'); }
  }
  async function onDeleteDriver(id){ if (!confirm('Delete driver?')) return; try { await deleteDriver(id); refresh(); } catch (err){ alert(err?.error || 'Delete failed'); } }

  if (loading) return <div className="p-6">Loading admin...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Routes</h3>
          <div className="text-sm text-slate-500 mt-1">{data.routes.length} routes</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Drivers</h3>
          <div className="text-sm text-slate-500 mt-1">{data.drivers.length} drivers</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold text-lg">Customers owing</h3>
          <div className="text-sm text-slate-500 mt-1">{data.reminders?.length || 0} with balance</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-4">
          <h4 className="font-semibold mb-2">Routes</h4>
          <div className="table-scroll">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Driver</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.routes.map(r=>(
                  <tr key={r.id} className="border-t">
                    <td className="py-2">{r.name}</td>
                    <td className="py-2">{r.driver ? r.driver.name : <span className="text-slate-400">Unassigned</span>}</td>
                    <td className="py-2">
                      <button onClick={()=>startEditRoute(r)} className="px-2 py-1 text-sm bg-slate-100 rounded">Edit</button>
                      <button onClick={()=>onDeleteRoute(r.id)} className="px-2 py-1 ml-2 text-sm bg-rose-50 text-rose-600 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 border-t pt-4">
            <h5 className="font-medium mb-2">{routeForm.id ? 'Edit Route' : 'Create Route'}</h5>
            <form onSubmit={submitRoute} className="space-y-2">
              <input placeholder="Route name" value={routeForm.name} onChange={e=>setRouteForm({...routeForm, name:e.target.value})}
                className="w-full rounded border-gray-200 p-2" required />
              <select value={routeForm.driverId || ''} onChange={e=>setRouteForm({...routeForm, driverId: e.target.value})} className="w-full rounded border-gray-200 p-2">
                <option value="">-- assign driver --</option>
                {data.drivers.map(d=> <option key={d.id} value={d.id}>{d.name} ({d.email})</option>)}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded">{routeForm.id ? 'Save' : 'Create'}</button>
                <button type="button" onClick={resetRouteForm} className="px-3 py-1 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h4 className="font-semibold mb-2">Customers</h4>
          <div className="table-scroll">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-slate-500">
                  <th className="text-left py-2">Name</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Phone</th>
                  <th className="text-left py-2">Route</th>
                  <th className="py-2">Balance</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.customers.map(c=>(
                  <tr key={c.id} className="border-t">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">{c.email}</td>
                    <td className="py-2">{c.phone}</td>
                    <td className="py-2">{(data.routes.find(r=>r.id===c.routeId) || {}).name || 'None'}</td>
                    <td className="py-2">{c.balance}</td>
                    <td className="py-2">
                      <button onClick={()=>startEditCustomer(c)} className="px-2 py-1 text-sm bg-slate-100 rounded">Edit</button>
                      <button onClick={()=>onDeleteCustomer(c.id)} className="px-2 py-1 ml-2 text-sm bg-rose-50 text-rose-600 rounded">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 border-t pt-4">
            <h5 className="font-medium mb-2">{customerForm.id ? 'Edit Customer' : 'Create Customer'}</h5>
            <form onSubmit={submitCustomer} className="space-y-2">
              <input placeholder="Name" value={customerForm.name} onChange={e=>setCustomerForm({...customerForm, name:e.target.value})} required className="w-full rounded border-gray-200 p-2" />
              <input placeholder="Email" value={customerForm.email} onChange={e=>setCustomerForm({...customerForm, email:e.target.value})} required className="w-full rounded border-gray-200 p-2" />
              <input placeholder="Phone" value={customerForm.phone} onChange={e=>setCustomerForm({...customerForm, phone:e.target.value})} className="w-full rounded border-gray-200 p-2" />
              <select value={customerForm.routeId || ''} onChange={e=>setCustomerForm({...customerForm, routeId: e.target.value})} className="w-full rounded border-gray-200 p-2">
                <option value="">-- route --</option>
                {data.routes.map(r=> <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded">{customerForm.id ? 'Save' : 'Create'}</button>
                <button type="button" onClick={resetCustomerForm} className="px-3 py-1 border rounded">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h4 className="font-semibold mb-2">Drivers</h4>
        <div className="table-scroll">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Email</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.drivers.map(d=>(
                <tr key={d.id} className="border-t">
                  <td className="py-2">{d.name}</td>
                  <td className="py-2">{d.email}</td>
                  <td className="py-2">
                    <button onClick={()=>startEditDriver(d)} className="px-2 py-1 text-sm bg-slate-100 rounded">Edit</button>
                    <button onClick={()=>onDeleteDriver(d.id)} className="px-2 py-1 ml-2 text-sm bg-rose-50 text-rose-600 rounded">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 border-t pt-4">
          <h5 className="font-medium mb-2">{driverForm.id ? 'Edit Driver' : 'Create Driver'}</h5>
          <form onSubmit={submitDriver} className="space-y-2">
            <input placeholder="Name" value={driverForm.name} onChange={e=>setDriverForm({...driverForm,name:e.target.value})} required className="w-full rounded border-gray-200 p-2" />
            <input placeholder="Email" value={driverForm.email} onChange={e=>setDriverForm({...driverForm,email:e.target.value})} required className="w-full rounded border-gray-200 p-2" />
            <input placeholder="Password (leave blank to keep existing)" value={driverForm.password} onChange={e=>setDriverForm({...driverForm,password:e.target.value})} type="password" className="w-full rounded border-gray-200 p-2" />
            <div className="flex gap-2">
              <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded">{driverForm.id ? 'Save' : 'Create'}</button>
              <button type="button" onClick={resetDriverForm} className="px-3 py-1 border rounded">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- Driver panel ---------- */
function DriverPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    async function load() {
      setLoading(true);
      try {
        const d = await getDriverDashboard();
        setData(d);
      } catch (err) {
        console.error('Driver load failed', err);
        alert(err?.error || 'Failed to load driver data');
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading driver...</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold">Route: {data.route?.name || 'No route assigned'}</h3>
        {data.route ? (
          <div className="mt-3">
            <h4 className="font-medium">Customers</h4>
            <ul className="mt-2 space-y-1">
              {data.route.Customers?.map(c=> <li key={c.id} className="flex justify-between"><div>{c.name} — {c.phone}</div><div className="text-sm text-slate-500">Balance: {c.balance}</div></li>)}
            </ul>
          </div>
        ) : null}
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold">Deliveries</h3>
        <ul className="mt-3 space-y-2">
          {data.deliveries.map(d=>(
            <li key={d.id} className="flex items-center justify-between border rounded p-3">
              <div>
                <div className="font-medium">Delivery #{d.id} — Customer {d.customerId}</div>
                <div className="text-sm text-slate-500">{d.date}</div>
              </div>
              <div>
                <Badge color={d.delivered ? 'green' : 'yellow'}>{d.delivered ? 'Delivered' : 'Pending'}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Customer panel ---------- */
function CustomerPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=> {
    async function load(){
      setLoading(true);
      try {
        const d = await getCustomerDashboard();
        setData(d);
      } catch (err) {
        console.error('Customer load failed', err);
        alert(err?.error || 'Failed to load customer data');
      } finally { setLoading(false); }
    }
    load();
  }, []);
  if (loading) return <div className="p-6">Loading customer...</div>;
  const c = data?.cust;
  return (
    <div className="p-6 space-y-6">
      <div className="bg-white p-4 rounded shadow flex items-center justify-between">
        <div>
          <div className="text-slate-500">Name</div>
          <div className="text-xl font-semibold">{c?.name}</div>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <div className="text-slate-500">Balance</div>
            <div className="text-lg font-semibold">{c?.balance}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500">Deposit</div>
            <div className="text-lg font-semibold">{c?.deposit}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold">Payments</h4>
        <ul className="mt-3 space-y-2">
          {data.payments.map(p=>(
            <li key={p.id} className="flex justify-between text-sm">
              <div>{new Date(p.createdAt).toLocaleString()} — {p.method}</div>
              <div className="font-medium">{p.amount}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold">Deliveries</h4>
        <ul className="mt-3 space-y-2">
          {data.deliveries.map(d=>(
            <li key={d.id} className="flex justify-between">
              <div>{d.date}</div>
              <div>{d.delivered ? 'Delivered' : 'Pending'}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- App shell ---------- */
export default function App(){
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [view, setView] = useState('dashboard');
  const [notify, setNotify] = useState(null);

  useEffect(()=>{ if (!role && localStorage.getItem('token') && localStorage.getItem('role')) setRole(localStorage.getItem('role')); }, []);

  function logout(){ localStorage.removeItem('token'); localStorage.removeItem('role'); setRole(null); setView('dashboard'); }
  function onNotify(n){ setNotify(n); setTimeout(()=>setNotify(null), 4000); }

  if (!role) return <Login onLogin={setRole} onNotify={onNotify} />;

  return (
    <div className="app-shell min-h-screen flex flex-col">
      <Topbar role={role} onLogout={logout} />
      <div className="flex flex-1">
        <Sidebar role={role} onSelect={setView} selected={view} />
        <main className="flex-1 bg-slate-50">
          <div className="max-w-7xl mx-auto p-4">
            {notify ? (
              <div className={`mb-4 p-3 rounded ${notify.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {notify.text}
              </div>
            ) : null}

            {role === 'admin' && <AdminPanel />}
            {role === 'driver' && <DriverPanel />}
            {role === 'customer' && <CustomerPanel />}
          </div>
        </main>
      </div>
    </div>
  );
}