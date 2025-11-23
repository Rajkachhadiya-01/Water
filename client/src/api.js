// client/src/api.js
const API_BASE = "https://water-x75b.onrender.com/api";

export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = json || { error: "Server error" };
    err.status = res.status;
    throw err;
  }
  return json;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function getAdminDashboard() {
  const res = await fetch(`${API_BASE}/admin/dashboard`, { headers: authHeader() });
  return handleResponse(res);
}

export async function createRoute(payload) {
  const res = await fetch(`${API_BASE}/admin/routes`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateRoute(id, payload) {
  const res = await fetch(`${API_BASE}/admin/routes/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteRoute(id) {
  const res = await fetch(`${API_BASE}/admin/routes/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function createCustomer(payload) {
  const res = await fetch(`${API_BASE}/admin/customers`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateCustomer(id, payload) {
  const res = await fetch(`${API_BASE}/admin/customers/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteCustomer(id) {
  const res = await fetch(`${API_BASE}/admin/customers/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function createDriver(payload) {
  const res = await fetch(`${API_BASE}/admin/drivers`, {
    method: "POST",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateDriver(id, payload) {
  const res = await fetch(`${API_BASE}/admin/drivers/${id}`, {
    method: "PUT",
    headers: { ...authHeader(), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteDriver(id) {
  const res = await fetch(`${API_BASE}/admin/drivers/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  return handleResponse(res);
}

export async function getDriverDashboard() {
  const res = await fetch(`${API_BASE}/driver/dashboard`, { headers: authHeader() });
  return handleResponse(res);
}

export async function getCustomerDashboard() {
  const res = await fetch(`${API_BASE}/customer/dashboard`, { headers: authHeader() });
  return handleResponse(res);
}