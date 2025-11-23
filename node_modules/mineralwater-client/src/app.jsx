// client/src/app.jsx

import React, { useState, useEffect } from 'react';
import {
  getAdminDashboard,
  createRoute, updateRoute, deleteRoute,
  createCustomer, updateCustomer, deleteCustomer,
  createDriver, updateDriver, deleteDriver,
  login, getDriverDashboard, getCustomerDashboard
} from './api';

// Toast Notification
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-2xl ${bg} text-white animate-slide-in`}>
      <div className="flex items-center gap-3">
        <span className="font-medium">{message}</span>
        <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
      </div>
    </div>
  );
}

// Login Page - Matching your app mockup
function LoginPage({ onLogin, onNotify }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { role: 'Admin', email: 'admin@example.com', pass: 'adminpass' },
    { role: 'Driver', email: 'driver@example.com', pass: 'driverpass' },
    { role: 'Customer', email: 'customer@example.com', pass: 'customerpass' }
  ];

  async function submit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const r = await login(email, password);
      if (!r.token) {
        onNotify({ type: "error", text: r.error || "Login failed" });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", r.token);
      localStorage.setItem("role", r.user.role);
      localStorage.setItem("userName", r.user.name);

      onNotify({ type: "success", text: `Welcome ${r.user.name}!` });
      setTimeout(() => onLogin(r.user.role), 800);
    } catch (err) {
      onNotify({ type: "error", text: err?.error || "Login failed" });
      setLoading(false);
    }
  }

  function quickLogin(acc) {
    setEmail(acc.email);
    setPassword(acc.pass);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Pure Water.</h1>
          <h2 className="text-3xl font-bold text-white">Smart Management.</h2>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none transition"
                placeholder="Enter password"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition disabled:opacity-50 disabled:transform-none"
            >
              {loading ? "Signing in..." : "Get Started"}
            </button>
          </form>

          {/* Quick Login */}
          <div className="mt-6">
            <p className="text-xs text-center text-gray-500 mb-3">Quick Demo Login</p>
            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map(acc => (
                <button
                  key={acc.role}
                  onClick={() => quickLogin(acc)}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium"
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          🔒 Secure & Encrypted
        </p>
      </div>
    </div>
  );
}

// Header Component
function Header({ role, userName, onLogout }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <div>
            <div className="font-bold text-gray-900">MineralWater</div>
            <div className="text-xs text-gray-500">{role?.toUpperCase()}</div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow">
              {userName?.charAt(0)?.toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-semibold">{userName}</span>
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border py-2">
              <div className="px-4 py-3 border-b">
                <div className="text-sm font-semibold text-gray-900">{userName}</div>
                <div className="text-xs text-gray-500">{localStorage.getItem('userEmail')}</div>
              </div>
              <button
                onClick={() => { onLogout(); setShowMenu(false); }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Stat Card Component - Like your app mockup
function StatCard({ icon, title, value, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`${color} rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition text-white text-left w-full`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="text-4xl font-bold">{value}</div>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          {icon}
        </div>
      </div>
      <div className="text-lg font-semibold">{title}</div>
    </button>
  );
}

// Admin Dashboard - Matching your app design
function AdminDashboard() {
  const [data, setData] = useState({ routes: [], customers: [], drivers: [], reminders: [] });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const [routeForm, setRouteForm] = useState({ id: null, name: '', driverId: '' });
  const [customerForm, setCustomerForm] = useState({ id: null, name: '', email: '', phone: '', routeId: '' });
  const [driverForm, setDriverForm] = useState({ id: null, name: '', email: '', password: '' });

  async function refresh() {
    try {
      const d = await getAdminDashboard();
      setData(d);
    } catch (err) {
      showToast('error', err?.error || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  function showToast(type, text) {
    setToast({ type, text });
  }

  // CRUD Operations...
  async function submitRoute(e) {
    e.preventDefault();
    try {
      if (routeForm.id) await updateRoute(routeForm.id, { name: routeForm.name, driverId: routeForm.driverId || null });
      else await createRoute({ name: routeForm.name, driverId: routeForm.driverId || null });
      setRouteForm({ id: null, name: '', driverId: '' });
      showToast('success', 'Route saved!');
      refresh();
    } catch (err) {
      showToast('error', err?.error || 'Failed');
    }
  }

  async function deleteRouteHandler(id) {
    if (!confirm('Delete route?')) return;
    try {
      await deleteRoute(id);
      showToast('success', 'Deleted');
      refresh();
    } catch (err) {
      showToast('error', err?.error);
    }
  }

  async function submitCustomer(e) {
    e.preventDefault();
    try {
      if (customerForm.id) await updateCustomer(customerForm.id, customerForm);
      else await createCustomer(customerForm);
      setCustomerForm({ id: null, name: '', email: '', phone: '', routeId: '' });
      showToast('success', 'Customer saved!');
      refresh();
    } catch (err) {
      showToast('error', err?.error);
    }
  }

  async function deleteCustomerHandler(id) {
    if (!confirm('Delete customer?')) return;
    try {
      await deleteCustomer(id);
      showToast('success', 'Deleted');
      refresh();
    } catch (err) {
      showToast('error', err?.error);
    }
  }

  async function submitDriver(e) {
    e.preventDefault();
    try {
      if (driverForm.id) await updateDriver(driverForm.id, { name: driverForm.name, email: driverForm.email, password: driverForm.password || undefined });
      else await createDriver({ name: driverForm.name, email: driverForm.email, password: driverForm.password || 'driverpass' });
      setDriverForm({ id: null, name: '', email: '', password: '' });
      showToast('success', 'Driver saved!');
      refresh();
    } catch (err) {
      showToast('error', err?.error);
    }
  }

  async function deleteDriverHandler(id) {
    if (!confirm('Delete driver?')) return;
    try {
      await deleteDriver(id);
      showToast('success', 'Deleted');
      refresh();
    } catch (err) {
      showToast('error', err?.error);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}

      {/* Dashboard View */}
      {view === 'dashboard' && (
        <div className="p-4 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Hi {localStorage.getItem('userName')}!</h2>
          
          {/* Stats - Like your app mockup */}
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              icon={<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>}
              title="Orders" 
              value="02"
              color="bg-gradient-to-br from-cyan-500 to-cyan-600"
              onClick={() => setView('customers')}
            />
            <StatCard 
              icon={<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>}
              title="Drivers" 
              value={String(data.drivers.length).padStart(2, '0')}
              color="bg-gradient-to-br from-purple-500 to-purple-600"
              onClick={() => setView('drivers')}
            />
            <StatCard 
              icon={<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>}
              title="Pending" 
              value="05"
              color="bg-gradient-to-br from-orange-500 to-orange-600"
              onClick={() => setView('routes')}
            />
            <StatCard 
              icon={<svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>}
              title="Done" 
              value={String(data.customers.length).padStart(2, '0')}
              color="bg-gradient-to-br from-green-500 to-green-600"
            />
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
            <div className="space-y-3">
              {data.customers.slice(0, 2).map(c => (
                <div key={c.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">Order #{c.id.slice(-4)}</div>
                    <div className="text-sm text-gray-500">{c.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{c.balance || 20}</div>
                    <div className={`text-xs ${c.balance > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                      {c.balance > 0 ? 'Pending' : 'Done'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Deliveries */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-bold text-lg mb-4">Active Deliveries</h3>
            <div className="space-y-3">
              {data.routes.slice(0, 2).map(r => (
                <div key={r.id} className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">Route {r.name}</div>
                    <div className="text-sm text-gray-500">{r.driver?.name || 'No driver'}</div>
                  </div>
                  <div className="text-cyan-500 text-sm font-medium">In Transit</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Routes Management */}
      {view === 'routes' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('dashboard')} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold">Routes</h2>
          </div>

          {/* Route Form */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold mb-4">{routeForm.id ? 'Edit Route' : 'Create Route'}</h3>
            <form onSubmit={submitRoute} className="space-y-4">
              <input
                required
                value={routeForm.name}
                onChange={e => setRouteForm({ ...routeForm, name: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
                placeholder="Route name"
              />
              <select
                value={routeForm.driverId}
                onChange={e => setRouteForm({ ...routeForm, driverId: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none"
              >
                <option value="">Select Driver</option>
                {data.drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl">
                  {routeForm.id ? 'Update' : 'Create'}
                </button>
                {routeForm.id && (
                  <button type="button" onClick={() => setRouteForm({ id: null, name: '', driverId: '' })} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Routes List */}
          <div className="space-y-3">
            {data.routes.map(r => (
              <div key={r.id} className="bg-white rounded-2xl shadow-sm p-5 flex justify-between items-center">
                <div>
                  <div className="font-bold">{r.name}</div>
                  <div className="text-sm text-gray-500">{r.driver?.name || 'No driver'}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setRouteForm({ id: r.id, name: r.name, driverId: r.driverId || '' })} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium">Edit</button>
                  <button onClick={() => deleteRouteHandler(r.id)} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar layouts for customers and drivers... */}
      {view === 'customers' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('dashboard')} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold">Customers</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold mb-4">{customerForm.id ? 'Edit Customer' : 'Add Customer'}</h3>
            <form onSubmit={submitCustomer} className="space-y-4">
              <input required value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none" placeholder="Name" />
              <input type="email" required value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none" placeholder="Email" />
              <input value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none" placeholder="Phone" />
              <select value={customerForm.routeId} onChange={e => setCustomerForm({ ...customerForm, routeId: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none">
                <option value="">Select Route</option>
                {data.routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl">{customerForm.id ? 'Update' : 'Add'}</button>
                {customerForm.id && <button type="button" onClick={() => setCustomerForm({ id: null, name: '', email: '', phone: '', routeId: '' })} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold">Cancel</button>}
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {data.customers.map(c => (
              <div key={c.id} className="bg-white rounded-2xl shadow-sm p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-bold">{c.name}</div>
                    <div className="text-sm text-gray-500">{c.email}</div>
                    <div className="text-sm text-gray-500">{c.phone}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${c.balance > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                    ₹{c.balance}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setCustomerForm({ id: c.id, name: c.name, email: c.email, phone: c.phone, routeId: c.routeId || '' })} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium">Edit</button>
                  <button onClick={() => deleteCustomerHandler(c.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === 'drivers' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('dashboard')} className="p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-2xl font-bold">Drivers</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold mb-4">{driverForm.id ? 'Edit Driver' : 'Add Driver'}</h3>
            <form onSubmit={submitDriver} className="space-y-4">
              <input required value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none" placeholder="Name" />
              <input type="email" required value={driverForm.email} onChange={e => setDriverForm({ ...driverForm, email: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none" placeholder="Email" />
              <input type="password" value={driverForm.password} onChange={e => setDriverForm({ ...driverForm, password: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-cyan-500 focus:outline-none" placeholder={driverForm.id ? "Password (leave blank)" : "Password"} />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl">{driverForm.id ? 'Update' : 'Add'}</button>
                {driverForm.id && <button type="button" onClick={() => setDriverForm({ id: null, name: '', email: '', password: '' })} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold">Cancel</button>}
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {data.drivers.map(d => {
              const assignedRoute = data.routes.find(r => r.driverId === d.id);
              return (
                <div key={d.id} className="bg-white rounded-2xl shadow-sm p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold">{d.name}</div>
                      <div className="text-sm text-gray-500">{d.email}</div>
                      {assignedRoute && (
                        <div className="mt-1 inline-flex items-center px-2 py-1 bg-cyan-50 text-cyan-600 rounded-lg text-xs font-medium">
                          📍 {assignedRoute.name}
                        </div>
                      )}
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {d.name?.charAt(0)}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setDriverForm({ id: d.id, name: d.name, email: d.email, password: '' })} className="flex-1 py-2 bg-gray-100 rounded-lg text-sm font-medium">Edit</button>
                    <button onClick={() => deleteDriverHandler(d.id)} className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Driver Dashboard
function DriverDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getDriverDashboard();
        setData(d);
      } catch (err) {
        alert(err?.error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <h2 className="text-2xl font-bold">My Route</h2>
      
      {/* Route Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="text-3xl font-bold mb-2">{data?.route?.name || 'No Route'}</div>
        <div className="text-cyan-100">
          {data?.route?.Customers?.length || 0} customers assigned
        </div>
      </div>

      {/* Customers */}
      {data?.route && (
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h3 className="font-bold text-lg mb-4">My Customers</h3>
          <div className="space-y-3">
            {data.route.Customers?.map(c => (
              <div key={c.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-sm text-gray-500">{c.phone}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${c.balance > 0 ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  ₹{c.balance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deliveries */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-lg mb-4">Deliveries</h3>
        <div className="space-y-3">
          {data?.deliveries?.map(d => (
            <div key={d.id} className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-xl">
              <div>
                <div className="font-semibold">Delivery #{d.id.slice(-4)}</div>
                <div className="text-sm text-gray-500">{d.date}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${d.delivered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {d.delivered ? '✓ Done' : '⏳ Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Customer Dashboard
function CustomerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const d = await getCustomerDashboard();
        setData(d);
      } catch (err) {
        alert(err?.error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div></div>;

  const c = data?.cust;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="text-sm opacity-90 mb-1">Welcome back,</div>
        <div className="text-2xl font-bold mb-4">{c?.name}</div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm opacity-90">Balance</div>
            <div className="text-3xl font-bold">₹{c?.balance || 0}</div>
          </div>
          <div>
            <div className="text-sm opacity-90">Deposit</div>
            <div className="text-3xl font-bold">₹{c?.deposit || 0}</div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span>💳</span> Payment History
        </h3>
        <div className="space-y-3">
          {data?.payments?.map(p => (
            <div key={p.id} className="flex justify-between items-center p-3 border-b last:border-0">
              <div>
                <div className="font-medium text-sm">{p.method}</div>
                <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="text-lg font-bold text-green-600">+₹{p.amount}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery History */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <span>📦</span> Delivery History
        </h3>
        <div className="space-y-3">
          {data?.deliveries?.map(d => (
            <div key={d.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <div>
                <div className="font-semibold">Delivery #{d.id.slice(-4)}</div>
                <div className="text-sm text-gray-500">{d.date}</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${d.delivered ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                {d.delivered ? 'Delivered' : 'Pending'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main App
export default function App() {
  const [role, setRole] = useState(localStorage.getItem("role") || null);
  const [userName, setUserName] = useState(localStorage.getItem("userName") || "User");
  const [toast, setToast] = useState(null);

  function logout() {
    localStorage.clear();
    setRole(null);
    setUserName("User");
  }

  function showToast(type, text) {
    setToast({ type, text });
  }

  function handleLogin(newRole) {
    setRole(newRole);
    setUserName(localStorage.getItem("userName") || "User");
  }

  if (!role) {
    return (
      <>
        {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
        <LoginPage onLogin={handleLogin} onNotify={showToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast message={toast.text} type={toast.type} onClose={() => setToast(null)} />}
      <Header role={role} userName={userName} onLogout={logout} />
      {role === 'admin' && <AdminDashboard />}
      {role === 'driver' && <DriverDashboard />}
      {role === 'customer' && <CustomerDashboard />}
    </div>
  );
}