/* ASR CRM — System Admin console (bugs/issues, archived records, data governance) */

const SEV_COLOR = { High: '#C0392B', Medium: '#E6AA00', Low: '#8B9FB7' };
const STATUS_COLOR = { 'Open': '#C0392B', 'In Progress': '#E6AA00', 'Resolved': '#1F8A5B' };
const STATUSES = ['Open', 'In Progress', 'Resolved'];

function AdminConsole({ store }) {
  const [tab, setTab] = React.useState('issues');
  const [sevFilter, setSevFilter] = React.useState('All');

  const archivedOpps = store.opps.filter(o => o.archived);
  const archivedContacts = store.contacts.filter(c => c.archived);
  const openIssues = store.issues.filter(i => i.status !== 'Resolved');

  let issues = store.issues;
  if (sevFilter !== 'All') issues = issues.filter(i => i.status === sevFilter);

  return (
    <div className="content">
      <div className="row" style={{ marginBottom: 'var(--space-6)', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--asr-gold-dark)', fontWeight: 700 }}>System administration</div>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.5rem', color: 'var(--asr-navy)' }}>Admin console</h2>
        </div>
        <button className="btn btn-gold" style={{ marginLeft: 'auto' }} onClick={() => store.openReportIssue()}><Icon name="bug" size={16} /> Log issue</button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <Stat k="Open issues" v={openIssues.length} delta={store.issues.filter(i => i.severity === 'High' && i.status !== 'Resolved').length + ' high severity'} dir="flat" accent="#C0392B" />
        <Stat k="Resolved" v={store.issues.filter(i => i.status === 'Resolved').length} accent="#1F8A5B" />
        <Stat k="Archived records" v={archivedOpps.length + archivedContacts.length} accent="var(--asr-gold)" />
        <Stat k="Active users" v={Object.keys(D().TEAM).length} delta="4 roles" dir="flat" accent="var(--asr-navy)" />
      </div>

      <div className="row" style={{ gap: 6, background: '#fff', border: '1px solid var(--border-default)', borderRadius: 999, padding: 4, width: 'fit-content', marginBottom: 'var(--space-6)' }}>
        {[['issues', 'Bugs & Issues'], ['users', 'Users & Roles'], ['archive', 'Archived records']].map(([v, l]) => (
          <button key={v} className="btn btn-sm" onClick={() => setTab(v)}
            style={tab === v ? { background: 'var(--asr-navy)', color: '#fff' } : { background: 'transparent', color: 'var(--fg-secondary)' }}>{l}</button>
        ))}
      </div>

      {tab === 'issues' && (
        <React.Fragment>
          <div className="row" style={{ gap: 6, marginBottom: 'var(--space-4)' }}>
            {['All', ...STATUSES].map(s => (
              <button key={s} className="badge" onClick={() => setSevFilter(s)}
                style={{ cursor: 'pointer', border: '1px solid ' + (sevFilter === s ? 'var(--asr-navy)' : 'var(--border-default)'), background: sevFilter === s ? 'var(--asr-navy)' : '#fff', color: sevFilter === s ? '#fff' : 'var(--fg-secondary)', padding: '5px 12px' }}>{s}</button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {issues.map(i => {
              const rep = D().TEAM[i.reporter];
              return (
                <div key={i.id} className="card card-pad">
                  <div className="row" style={{ alignItems: 'flex-start', gap: 'var(--space-4)' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: SEV_COLOR[i.severity] + '1F', display: 'grid', placeItems: 'center', flex: 'none' }}>
                      <Icon name="bug" size={20} color={SEV_COLOR[i.severity]} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: 'var(--asr-navy)' }}>{i.title}</span>
                        <span className="badge" style={{ background: SEV_COLOR[i.severity] + '1F', color: SEV_COLOR[i.severity] }}>{i.severity}</span>
                        <span className="tag">{i.area}</span>
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>{i.desc}</p>
                      <div className="row" style={{ marginTop: 10, gap: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
                        <Avatar id={rep.id} initials={rep.initials} size={22} />
                        <span>Reported by {rep.name} · {fmtDate(i.date)}</span>
                      </div>
                    </div>
                    <div className="field" style={{ flex: 'none', width: 150 }}>
                      <select value={i.status} onChange={e => store.updateIssue(i.id, { status: e.target.value })}
                        style={{ borderColor: STATUS_COLOR[i.status], color: STATUS_COLOR[i.status], fontWeight: 700 }}>
                        {STATUSES.map(s => <option key={s} value={s} style={{ color: 'var(--fg-primary)' }}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
            {!issues.length && <div className="empty">No issues in this view.</div>}
          </div>
        </React.Fragment>
      )}

      {tab === 'users' && <UserManagement store={store} />}

      {tab === 'archive' && (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Record</th><th>Type</th><th>Detail</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
            <tbody>
              {archivedOpps.map(o => (
                <tr key={o.id} style={{ cursor: 'default' }}>
                  <td className="strong">{o.name}</td>
                  <td><span className="badge" style={{ background: 'var(--asr-navy-10)', color: 'var(--asr-purple-mid)' }}>Opportunity</span></td>
                  <td>{o.class} · {o.territory} · {fmtMoney(o.premium)}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => store.archiveOpp(o.id, false)}><Icon name="restore" size={14} /> Restore</button>
                      <button className="icon-btn" style={{ width: 32, height: 32, borderColor: '#E7B9B3', color: '#C0392B' }} title="Delete permanently"
                        onClick={() => { if (confirm('Permanently delete “' + o.name + '”?')) store.deleteOpp(o.id); }}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {archivedContacts.map(c => (
                <tr key={c.id} style={{ cursor: 'default' }}>
                  <td className="strong">{c.name}</td>
                  <td><span className="badge" style={{ background: 'var(--asr-navy-10)', color: 'var(--asr-purple-mid)' }}>Contact</span></td>
                  <td>{c.company} · {c.type}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => store.archiveContact(c.id, false)}><Icon name="restore" size={14} /> Restore</button>
                      <button className="icon-btn" style={{ width: 32, height: 32, borderColor: '#E7B9B3', color: '#C0392B' }} title="Delete permanently"
                        onClick={() => { if (confirm('Permanently delete “' + c.name + '”?')) store.deleteContact(c.id); }}><Icon name="trash" size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!archivedOpps.length && !archivedContacts.length && <div className="empty">No archived records. Archive an opportunity or contact and it will appear here for restore or permanent deletion.</div>}
        </div>
      )}
    </div>
  );
}

// ---------- Report / log issue modal (available to all roles) ----------
function ReportIssueModal({ store, onClose }) {
  const [f, setF] = React.useState({ title: '', desc: '', severity: 'Medium', area: 'Pipeline' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.title;
  const submit = () => { store.addIssue({ ...f, status: 'Open', reporter: store.meId, assignee: 'tunu', date: '2026-05-23' }); onClose(); };
  return (
    <Modal title="Report an issue" icon="bug" onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!valid} style={!valid ? { opacity: .5 } : null}>Submit to admin</button>
      </React.Fragment>}>
      <div className="form-grid">
        <div className="field full"><label>What went wrong?</label><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="Short summary" autoFocus /></div>
        <div className="field"><label>Area</label><select value={f.area} onChange={e => set('area', e.target.value)}><option>Pipeline</option><option>Contacts</option><option>Activity</option><option>Convert to risk</option><option>Reports</option><option>Other</option></select></div>
        <div className="field"><label>Severity</label><select value={f.severity} onChange={e => set('severity', e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
        <div className="field full"><label>Details</label><textarea rows={4} value={f.desc} onChange={e => set('desc', e.target.value)} placeholder="Steps to reproduce, what you expected…"></textarea></div>
      </div>
    </Modal>
  );
}

Object.assign(window, { AdminConsole, ReportIssueModal });
