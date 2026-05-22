function encodeSegment(value) {
  return encodeURIComponent(String(value || '').trim());
}

function authHeader(settings) {
  return 'Basic ' + btoa(`${settings.bc_username}:${settings.bc_password}`);
}

function base(settings) {
  return `https://api.businesscentral.dynamics.com/v2.0/${encodeSegment(settings.bc_tenant_id)}/${encodeSegment(settings.bc_environment || 'production')}/api/v2.0/companies(${encodeSegment(settings.bc_company_id)})`;
}

function assertSettings(settings) {
  const missing = ['bc_tenant_id', 'bc_company_id', 'bc_username', 'bc_password'].filter(k => !settings[k]);
  if (missing.length) throw new Error(`Missing Business Central settings: ${missing.join(', ')}`);
}

async function bcFetch(settings, path, opts = {}) {
  assertSettings(settings);
  const r = await fetch(base(settings) + path, {
    ...opts,
    headers: {
      Authorization: authHeader(settings),
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {})
    }
  });
  if (!r.ok) {
    let m = `${r.status} ${r.statusText}`;
    try { const j = await r.json(); m = j.error?.message || m; } catch {}
    throw new Error(m);
  }
  return r.status === 204 ? null : r.json();
}

export async function getSettings(client) {
  if (!client) return { bc_tenant_id: 'tenant', bc_environment: 'production', bc_company_id: 'company', bc_username: 'user', bc_password: 'pass', bc_default_unit: 'HOUR' };
  const keys = ['bc_tenant_id', 'bc_environment', 'bc_company_id', 'bc_username', 'bc_password', 'bc_default_unit'];
  const res = await client.metadata();
  return Object.fromEntries(keys.map(k => [k, res.settings[k]]));
}

export async function fetchCustomers(settings) {
  const d = await bcFetch(settings, '/customers?$select=id,number,displayName,name');
  return d.value || [];
}

export async function fetchJobs(settings, customerId) {
  const filter = customerId ? `&$filter=billToCustomerId eq '${String(customerId).replace(/'/g, "''")}'` : '';
  const d = await bcFetch(settings, `/jobs?$select=id,number,displayName,description,billToCustomerId${filter}`);
  return d.value || [];
}

export async function fetchEmployees(settings) {
  const d = await bcFetch(settings, '/employees?$select=id,number,displayName,email');
  return d.value || [];
}

export async function createTimeEntry(settings, entry) {
  const payload = Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  return bcFetch(settings, '/timeRegistrationEntries', { method: 'POST', body: JSON.stringify(payload) });
}
