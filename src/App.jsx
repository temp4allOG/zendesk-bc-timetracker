import React, { useEffect, useMemo, useState } from 'react';
import { ClientSelector, ProjectSelector } from './components/Selectors.jsx';
import { getTicketContext } from './services/zendeskService.js';
import { getSettings, fetchCustomers, fetchJobs, fetchEmployees, createTimeEntry } from './services/businessCentralService.js';
import { clampDescription, todayISO, isPositiveHours } from './utils/helpers.js';

export default function App({ client }) {
  const [settings, setSettings] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [clientId, setClientId] = useState('');
  const [jobId, setJobId] = useState('');
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(todayISO());
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState({ type: 'idle', msg: '' });

  useEffect(() => {
    (async () => {
      try {
        setStatus({ type: 'loading', msg: 'Loading Business Central data...' });
        const s = await getSettings(client);
        const t = await getTicketContext(client);
        setSettings(s);
        setTicket(t);
        const [cs, es] = await Promise.all([fetchCustomers(s), fetchEmployees(s)]);
        setCustomers(cs);
        setEmployees(es);
        const org = String(t.organizationName || '').toLowerCase();
        const matched = cs.find(c => org && String(c.displayName || c.name || '').toLowerCase().includes(org));
        if (matched) setClientId(matched.id);
        setStatus({ type: 'idle', msg: '' });
      } catch (e) {
        setStatus({ type: 'error', msg: e.message });
      }
    })();
  }, [client]);

  useEffect(() => {
    if (!settings) return;
    (async () => {
      try {
        setJobs(await fetchJobs(settings, clientId));
      } catch (e) {
        setStatus({ type: 'error', msg: e.message });
      }
    })();
  }, [settings, clientId]);

  const valid = useMemo(() => clientId && jobId && isPositiveHours(hours) && description.trim(), [clientId, jobId, hours, description]);

  async function save() {
    try {
      setStatus({ type: 'loading', msg: 'Saving time entry...' });
      const job = jobs.find(j => j.id === jobId) || {};
      const emp = employees.find(e => String(e.email || '').toLowerCase() === String(ticket.agentEmail || '').toLowerCase()) || {};
      if (!emp.id) throw new Error(`No Business Central employee matched Zendesk agent email ${ticket.agentEmail || '(unknown)'}`);
      await createTimeEntry(settings, {
        employeeId: emp.id,
        jobId: job.id,
        jobNo: job.number,
        jobNumber: job.number,
        jobTaskNumber: '',
        date,
        quantity: Number(hours),
        unitOfMeasureCode: settings.bc_default_unit || 'HOUR',
        description: clampDescription(description, ticket.ticketUrl)
      });
      setDescription('');
      setHours('');
      setStatus({ type: 'success', msg: 'Saved to Business Central' });
      if (client) client.invoke('notify', 'Time entry saved to Business Central', 'notice');
    } catch (e) {
      setStatus({ type: 'error', msg: e.message });
    }
  }

  return <main>
    <h2>BC Time Tracker</h2>
    {ticket && <p className="muted">Ticket #{ticket.ticketId}</p>}
    {status.type !== 'idle' && <div className={status.type}>{status.msg}</div>}
    <ClientSelector customers={customers} value={clientId} onChange={setClientId} />
    <ProjectSelector jobs={jobs} value={jobId} onChange={setJobId} />
    <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
    <label>Hours<input type="number" step="0.25" min="0.25" max="24" value={hours} onChange={e => setHours(e.target.value)} placeholder="1.5" /></label>
    <label>Description<textarea maxLength="250" value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the work performed..." /></label>
    <button disabled={!valid || status.type === 'loading'} onClick={save}>Save time</button>
    <p className="hint">Customer, job, employee and time entry data are loaded from Business Central using secure Zendesk app settings.</p>
  </main>;
}
