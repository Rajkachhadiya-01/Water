// client/src/app.jsx
import React, { useState, useEffect } from 'react';
import {
  getAdminDashboard,
  createRoute, updateRoute, deleteRoute,
  createCustomer, updateCustomer, deleteCustomer,
  createDriver, updateDriver, deleteDriver,
  login,
  getDriverDashboard, getCustomerDashboard
} from './api';

/* ---------- Icons ---------- */
function IconLogout() {
  return (
    <svg className="w-5 h-5 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 8v8" />
    </svg>
  );
}

/* ---------- Badge ---------- */
function Badge({ children, color = 'slate' }) {
  const map = {
    slate: 'bg-slate-100 text-slate-800',
    green: 'bg-emerald-100 text-emerald-800',
    red: 'bg-rose-100 text-rose-800',
    yellow: 'bg-amber-100 text-amber-800',
    blue: 'bg-blue-100 text-blue-800'
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[color]}`}>{children}</span>;
}

/* ---------- Notification ---------- */
function Notification({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800';

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${bg} max-w-md`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">{message}</div>
        <button onClick={onClose} className="text-current opacity-70 hover:opacity-100 text-xl">×</button>
      </div>
    </div>
  );
}

/* ---------- LOGIN PAGE ---------- */
function Login({ onLogin, onNotify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const r = await login(email, password);

      if (!r.token) {
        onNotify({ type: "error", text: r.error || "Login failed" });
        return;
      }

      localStorage.setItem("token", r.token);
      localStorage.setItem("role", r.user.role);
      localStorage.setItem("userName", r.user.name);

      onNotify({ type: "success", text: "Login successful" });

      setTimeout(() => {
        onLogin(r.user.role);
      }, 500);

    } catch (err) {
      onNotify({ type: "error", text: err?.error || "Login/network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-300 to-blue-700 p-6">
      <div className="absolute inset-0 bg-blue-900 opacity-10" />

      <div className="relative w-full max-w-md backdrop-blur-xl bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-white drop-shadow">Mineral Water</h1>
          <p className="mt-1 text-sky-100 text-sm">Secure access to your dashboard</p>
        </div>

        <form className="space-y-6" onSubmit={submit}>
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

          <button
            disabled={loading}
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-white/30 text-white font-semibold shadow-xl backdrop-blur hover:bg-white/40 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
            ) : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ---------- LAYOUT COMPONENTS ---------- */
function Topbar({ role, userName, onLogout }) {
  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="text-sky-600 font-bold text-lg">MineralWater</div>
            <div className="text-sm text-slate-500">— {role?.toUpperCase()}</div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 hidden sm:inline">{userName}</span>
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
    ? [{ id: 'dashboard', label: 'Dashboard' }, { id: 'routes', label: 'Routes' }, { id: 'customers', label: 'Customers' }, { id: 'drivers', label: 'Drivers' }]
    : [{ id: 'dashboard', label: 'Dashboard' }];

  return (
    <aside className="w-64 hidden md:block bg-slate-50 border-r">
      <nav className="p-4 space-y-1">
        {items.map(it => (
          <button
            key={it.id}
            onClick={() => onSelect(it.id)}
            className={`w-full text-left px-3 py-2 rounded ${selected === it.id ? 'bg-sky-100 text-sky-700' : 'text-slate-700 hover:bg-slate-100'}`}
          >
            {it.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* ---------- ADMIN PANEL ---------- */
function AdminPanel() {
  const [data, setData] = useState({ routes: [], customers: [], drivers: [], bottles: [], jags: [], reminders: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');

  const [routeForm, setRouteForm] = useState({ id: null, name: '', driverId: '' });
  const [customerForm, setCustomerForm] = useState({ id: null, name: '', email: '', phone: '', routeId: '' });
  const [driverForm, setDriverForm] = useState({ id: null, name: '', email: '', password: '' });

  async function refresh() {
    try {
      setLoading(true);
      const d = await getAdminDashboard();
      setData(d);
    } catch (err) {
      alert(err?.error || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  /* ---------- ROUTES CRUD ---------- */
  function startEditRoute(r) { setRouteForm({ id: r.id, name: r.name, driverId: r.driverId || '' }); }
  function resetRouteForm() { setRouteForm({ id: null, name: '', driverId: '' }); }

  async function submitRoute(e) {
    e.preventDefault();
    try {
      if (routeForm.id) await updateRoute(routeForm.id, { name: routeForm.name, driverId: routeForm.driverId || null });
      else await createRoute({ name: routeForm.name, driverId: routeForm.driverId || null });
      resetRouteForm();
      refresh();
    } catch (err) {
      alert(err?.error || "Failed to save route");
    }
  }

  async function onDeleteRoute(id) {
    if (!confirm("Delete this route?")) return;
    try {
      await deleteRoute(id);
      refresh();
    } catch (err) {
      alert(err?.error || "Delete failed");
    }
  }

  /* ---------- CUSTOMERS CRUD ---------- */
  function startEditCustomer(c) {
    setCustomerForm({ id: c.id, name: c.name, email: c.email, phone: c.phone, routeId: c.routeId || '' });
  }
  function resetCustomerForm() { setCustomerForm({ id: null, name: '', email: '', phone: '', routeId: '' }); }

  async function submitCustomer(e) {
    e.preventDefault();
    try {
      if (customerForm.id)
        await updateCustomer(customerForm.id, {
          name: customerForm.name,
          email: customerForm.email,
          phone: customerForm.phone,
          routeId: customerForm.routeId || null
        });
      else
        await createCustomer({
          name: customerForm.name,
          email: customerForm.email,
          phone: customerForm.phone,
          routeId: customerForm.routeId || null
        });

      resetCustomerForm();
      refresh();
    } catch (err) {
      alert(err?.error || "Failed to save customer");
    }
  }

  async function onDeleteCustomer(id) {
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(id);
      refresh();
    } catch (err) {
      alert(err?.error || "Delete failed");
    }
  }

  /* ---------- DRIVERS CRUD ---------- */
  function startEditDriver(d) {
    setDriverForm({ id: d.id, name: d.name, email: d.email, password: '' });
  }
  function resetDriverForm() { setDriverForm({ id: null, name: '', email: '', password: '' }); }

  async function submitDriver(e) {
    e.preventDefault();
    try {
      if (driverForm.id)
        await updateDriver(driverForm.id, {
          name: driverForm.name,
          email: driverForm.email,
          password: driverForm.password || undefined
        });
      else
        await createDriver({
          name: driverForm.name,
          email: driverForm.email,
          password: driverForm.password || "driverpass"
        });

      resetDriverForm();
      refresh();
    } catch (err) {
      alert(err?.error || "Failed to save driver");
    }
  }

  async function onDeleteDriver(id) {
    if (!confirm("Delete this driver?")) return;
    try {
      await deleteDriver(id);
      refresh();
    } catch (err) {
      alert(err?.error || "Delete failed");
    }
  }

  if (loading) return <div className="p-6">Loading admin...</div>;

  return (
    <div className="flex">
      <Sidebar role="admin" onSelect={setView} selected={view} />
      
      <main className="flex-1 bg-slate-50 p-6">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg">Routes</h3>
                <p className="text-sm text-slate-500">{data.routes.length} routes</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg">Drivers</h3>
                <p className="text-sm text-slate-500">{data.drivers.length} drivers</p>
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg">Customers with Balance</h3>
                <p className="text-sm text-slate-500">{data.reminders.length}</p>
              </div>
            </div>
          </div>
        )}

        {view === 'routes' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Routes Management</h2>
            
            <div className="bg-white rounded shadow p-4">
              <h4 className="font-semibold mb-2">Routes</h4>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Driver</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.routes.map(r => (
                      <tr key={r.id} className="border-t">
                        <td className="py-2">{r.name}</td>
                        <td className="py-2">{r.driver ? r.driver.name : <span className="text-slate-400">No Driver</span>}</td>
                        <td className="py-2">
                          <button onClick={() => startEditRoute(r)} className="px-2 py-1 bg-slate-100 rounded text-sm">Edit</button>
                          <button onClick={() => onDeleteRoute(r.id)} className="px-2 py-1 ml-2 text-sm bg-rose-50 text-rose-600 rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium mb-2">{routeForm.id ? "Edit Route" : "Create Route"}</h5>
                <form onSubmit={submitRoute} className="space-y-2">
                  <input
                    className="w-full rounded border p-2"
                    placeholder="Route name"
                    value={routeForm.name}
                    onChange={e => setRouteForm({ ...routeForm, name: e.target.value })}
                    required
                  />
                  <select
                    className="w-full rounded border p-2"
                    value={routeForm.driverId}
                    onChange={e => setRouteForm({ ...routeForm, driverId: e.target.value })}
                  >
                    <option value="">-- assign driver --</option>
                    {data.drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded">
                      {routeForm.id ? "Save" : "Create"}
                    </button>
                    <button type="button" onClick={resetRouteForm} className="px-3 py-1 border rounded">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {view === 'customers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Customers Management</h2>
            
            <div className="bg-white rounded shadow p-4">
              <h4 className="font-semibold mb-2">Customers</h4>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Email</th>
                      <th className="py-2 text-left">Phone</th>
                      <th className="py-2 text-left">Route</th>
                      <th className="py-2">Balance</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.customers.map(c => (
                      <tr key={c.id} className="border-t">
                        <td className="py-2">{c.name}</td>
                        <td className="py-2">{c.email}</td>
                        <td className="py-2">{c.phone}</td>
                        <td className="py-2">{data.routes.find(r => r.id === c.routeId)?.name || "None"}</td>
                        <td className="py-2">{c.balance}</td>
                        <td className="py-2">
                          <button onClick={() => startEditCustomer(c)} className="px-2 py-1 bg-slate-100 text-sm rounded">Edit</button>
                          <button onClick={() => onDeleteCustomer(c.id)} className="px-2 py-1 ml-2 bg-rose-50 text-rose-600 text-sm rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium mb-2">{customerForm.id ? "Edit Customer" : "Create Customer"}</h5>

                <form onSubmit={submitCustomer} className="space-y-2">
                  <input className="w-full border p-2 rounded" placeholder="Name"
                    value={customerForm.name}
                    onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                    required />

                  <input className="w-full border p-2 rounded" placeholder="Email"
                    value={customerForm.email}
                    onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                    required />

                  <input className="w-full border p-2 rounded" placeholder="Phone"
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  />

                  <select className="w-full border p-2 rounded" value={customerForm.routeId}
                    onChange={e => setCustomerForm({ ...customerForm, routeId: e.target.value })}>
                    <option value="">-- route --</option>
                    {data.routes.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded">
                      {customerForm.id ? "Save" : "Create"}
                    </button>
                    <button type="button" onClick={resetCustomerForm} className="px-3 py-1 border rounded">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {view === 'drivers' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Drivers Management</h2>
            
            <div className="bg-white rounded shadow p-4">
              <h4 className="font-semibold mb-2">Drivers</h4>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-slate-500">
                      <th className="py-2 text-left">Name</th>
                      <th className="py-2 text-left">Email</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {data.drivers.map(d => (
                      <tr key={d.id} className="border-t">
                        <td className="py-2">{d.name}</td>
                        <td className="py-2">{d.email}</td>
                        <td className="py-2">
                          <button onClick={() => startEditDriver(d)} className="px-2 py-1 bg-slate-100 text-sm rounded">Edit</button>
                          <button onClick={() => onDeleteDriver(d.id)} className="px-2 py-1 ml-2 bg-rose-50 text-rose-600 text-sm rounded">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 border-t pt-4">
                <h5 className="font-medium mb-2">{driverForm.id ? "Edit Driver" : "Create Driver"}</h5>

                <form onSubmit={submitDriver} className="space-y-2">
                  <input className="w-full border p-2 rounded" placeholder="Name"
                    value={driverForm.name}
                    onChange={e => setDriverForm({ ...driverForm, name: e.target.value })}
                    required />

                  <input className="w-full border p-2 rounded" placeholder="Email"
                    value={driverForm.email}
                    onChange={e => setDriverForm({ ...driverForm, email: e.target.value })}
                    required />

                  <input className="w-full border p-2 rounded" type="password"
                    placeholder="Password (leave blank to keep existing)"
                    value={driverForm.password}
                    onChange={e => setDriverForm({ ...driverForm, password: e.target.value })}
                  />

                  <div className="flex gap-2">
                    <button type="submit" className="px-3 py-1 bg-sky-600 text-white rounded">
                      {driverForm.id ? "Save" : "Create"}
                    </button>
                    <button type="button" onClick={resetDriverForm} className="px-3 py-1 border rounded">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

/* ---------- DRIVER PANEL ---------- */
function DriverPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getDriverDashboard();
        setData(d);
      } catch (err) {
        alert(err?.error || "Failed to load driver data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading driver...</div>;
  if (!data) return <div className="p-6">No data</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold">Route: {data.route?.name || "No route assigned"}</h3>

        {data.route && (
          <div className="mt-3">
            <h4 className="font-medium">Customers</h4>
            <ul className="mt-2 space-y-1">
              {data.route.Customers?.map(c => (
                <li key={c.id} className="flex justify-between">
                  <div>{c.name} — {c.phone}</div>
                  <div className="text-sm text-slate-500">Balance: {c.balance}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white rounded shadow p-4">
        <h3 className="text-lg font-semibold">Deliveries</h3>
        <ul className="mt-3 space-y-2">
          {data.deliveries.map(d => (
            <li key={d.id} className="flex justify-between border rounded p-3">
              <div>
                <div className="font-medium">Delivery #{d.id}</div>
                <div className="text-sm text-slate-500">{d.date}</div>
              </div>
              <Badge color={d.delivered ? "green" : "yellow"}>
                {d.delivered ? "Delivered" : "Pending"}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- CUSTOMER PANEL ---------- */
function CustomerPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getCustomerDashboard();
        setData(d);
      } catch (err) {
        alert(err?.error || "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="p-6">Loading customer...</div>;
  const c = data?.cust;

  return (
    <div className="p-6 space-y-6">

      <div className="bg-white rounded shadow p-4 flex justify-between">
        <div>
          <div className="text-slate-500">Name</div>
          <div className="text-xl font-semibold">{c?.name}</div>
        </div>

        <div className="flex gap-8">
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

      <div className="bg-white rounded shadow p-4">
        <h4 className="font-semibold">Payments</h4>

        <ul className="mt-3 space-y-2">
          {data.payments.map(p => (
            <li key={p.id} className="flex justify-between text-sm">
              <div>{new Date(p.createdAt).toLocaleString()} — {p.method}</div>
              <div className="font-medium">{p.amount}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded shadow p-4">
        <h4 className="font-semibold">Deliveries</h4>
        <ul className="mt-3 space-y-2">
          {data.deliveries.map(d => (
            <li key={d.id} className="flex justify-between">
              <div>{d.date}</div>
              <div>{d.delivered ? "Delivered" : "Pending"}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------- MAIN APP ---------- */
export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [notify, setNotify] = useState(null);

  useEffect(() => {
    if (!role && localStorage.getItem("token") && localStorage.getItem("role")) {
      setRole(localStorage.getItem("role"));
      setUserName(localStorage.getItem("userName") || "User");
    }
  }, [role]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    setRole(null);
    setUserName("User");
  }
function onNotify(n) {
    setNotify(n);
    setTimeout(() => setNotify(null), 3000);
  }

  function handleLogin(newRole) {
    setRole(newRole);
    setUserName(localStorage.getItem("userName") || "User");
  }

  if (!role) return (
    <>
      {notify && <Notification message={notify.text} type={notify.type} onClose={() => setNotify(null)} />}
      <Login onLogin={handleLogin} onNotify={onNotify} />
    </>
  );

  return (
    <div className="app-shell min-h-screen flex flex-col">
      {notify && <Notification message={notify.text} type={notify.type} onClose={() => setNotify(null)} />}
      
      <Topbar role={role} userName={userName} onLogout={logout} />

      <div className="flex flex-1">
        {role === "admin" && <AdminPanel />}
        {role === "driver" && <DriverPanel />}
        {role === "customer" && <CustomerPanel />}
      </div>
    </div>
  );
}