/* ASR CRM — Actions (assigned tasks) workspace */

function Actions({ store }) {
  const me = store.meId;
  const isLead = store.role === 'cuo' || store.role === 'admin' || store.role === 'sysadmin';
  const [scope, setScope] = React.useState('me');
  const [showDone, setShowDone] = React.useState(false);

  let tasks = store.tasks;
  if (scope === 'me') tasks = tasks.filter(t => t.assignee === me);
  else if (scope === 'by') tasks = tasks.filter(t => t.assignedBy === me);
  if (!showDone) tasks = tasks.filter(t => !t.done);
  if (store.query) tasks = tasks.filter(t => t.title.toLowerCase().includes(store.query.toLowerCase()));

  const today = new Date('2026-05-23');
  const overdue = tasks.filter(t => !t.done && t.due && new Date(t.due) < today);
  const upcoming = tasks.filter(t => !t.done && !(t.due && new Date(t.due) < today));
  const done = tasks.filter(t => t.done);

  const Section = ({ title, items, tone }) => items.length ? (
    <div style={{ marginBottom: 'var(--space-6)' }}>
      <div className="section-title" style={{ color: tone || 'var(--fg-muted)' }}>{title} ({items.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(t => <TaskRow key={t.id} t={t} store={store} showOpp />)}
      </div>
    </div>
  ) : null;

  const scopes = [['me', 'Assigned to me'], ['by', 'Assigned by me']];
  if (isLead) scopes.push(['all', 'All actions']);

  return (
    <div className="content">
      <div className="row" style={{ marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div className="row" style={{ gap: 6, background: '#fff', border: '1px solid var(--border-default)', borderRadius: 999, padding: 4 }}>
          {scopes.map(([v, l]) => (
            <button key={v} className="btn btn-sm" onClick={() => setScope(v)}
              style={scope === v ? { background: 'var(--asr-navy)', color: '#fff' } : { background: 'transparent', color: 'var(--fg-secondary)' }}>{l}</button>
          ))}
        </div>
        <label className="row" style={{ gap: 8, fontSize: 13, color: 'var(--fg-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)} /> Show completed
        </label>
        <button className="btn btn-gold" style={{ marginLeft: 'auto' }} onClick={() => store.openNewAction()}><Icon name="plus" size={17} /> New action</button>
      </div>

      <div style={{ maxWidth: 820 }}>
        {!tasks.length && <div className="empty">No actions here. Use <strong>New action</strong> to delegate work to a colleague.</div>}
        <Section title="Overdue" items={overdue} tone="#C0392B" />
        <Section title={scope === 'me' ? 'To do' : 'Open'} items={upcoming} tone="var(--asr-navy)" />
        {showDone && <Section title="Completed" items={done} />}
      </div>
    </div>
  );
}

Object.assign(window, { Actions });
