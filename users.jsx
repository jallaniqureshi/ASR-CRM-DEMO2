/* ASR CRM — User management (System Admin) */

const ROLE_BADGE = { underwriter: '#3BA4C8', cuo: '#240B60', admin: '#7A60A0', sysadmin: '#E6AA00' };

function UserManagement({ store }) {
  const [edit, setEdit] = React.useState(undefined); // undefined=closed, null=new, obj=edit
  const users = Object.values(D().TEAM);
  const roleLabel = (rt) => (D().ROLE_TYPES.find(r => r.id === rt) || {}).label || rt;

  // workload per user
  const load = {};
  store.opps.filter(o => !o.archived).forEach(o => load[o.owner] = (load[o.owner] || 0) + 1);
  const taskLoad = {};
  store.tasks.filter(t => !t.done).forEach(t => taskLoad[t.assignee] = (taskLoad[t.assignee] || 0) + 1);

  return (
    <React.Fragment>
      <div className="row" style={{ marginBottom: 'var(--space-4)' }}>
        <span className="muted" style={{ fontSize: 13 }}>{users.length} users across {D().ROLE_TYPES.length} roles</span>
        <button className="btn btn-gold btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setEdit(null)}><Icon name="userplus" size={15} /> Add user</button>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>User</th><th>Role</th><th>Team</th><th style={{ textAlign: 'right' }}>Open opps</th><th style={{ textAlign: 'right' }}>Open actions</th><th style={{ textAlign: 'right' }}>Manage</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ cursor: 'default' }}>
                <td><div className="row"><Avatar id={u.id} initials={u.initials} size={32} /><div><div className="strong">{u.name}</div><div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{u.role}</div></div></div></td>
                <td><span className="badge" style={{ background: ROLE_BADGE[u.roleType] + '1F', color: ROLE_BADGE[u.roleType] }}><span className="pip" style={{ background: ROLE_BADGE[u.roleType] }}></span>{roleLabel(u.roleType)}</span></td>
                <td>{u.team}</td>
                <td style={{ textAlign: 'right' }}>{load[u.id] || 0}</td>
                <td style={{ textAlign: 'right' }}>{taskLoad[u.id] || 0}</td>
                <td style={{ textAlign: 'right' }}>
                  <div className="row" style={{ justifyContent: 'flex-end', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEdit(u)}><Icon name="edit" size={14} /> Amend</button>
                    <button className="icon-btn" style={{ width: 32, height: 32, borderColor: '#E7B9B3', color: '#C0392B' }} title="Remove user"
                      onClick={() => {
                        const n = (load[u.id] || 0) + (taskLoad[u.id] || 0);
                        if (confirm('Remove ' + u.name + '?' + (n ? '\n\nTheir ' + n + ' open record(s)/action(s) will be reassigned to the Chief Underwriting Officer.' : ''))) store.removeUser(u.id);
                      }}><Icon name="trash" size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {edit !== undefined && <UserModal store={store} user={edit} onClose={() => setEdit(undefined)} />}
    </React.Fragment>
  );
}

function UserModal({ store, user, onClose }) {
  const [f, setF] = React.useState(user
    ? { ...user }
    : { name: '', role: '', team: '', roleType: 'underwriter' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name && f.role;
  const initials = (f.name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  const submit = () => {
    if (user) store.updateUser(user.id, { name: f.name, role: f.role, team: f.team, roleType: f.roleType, initials });
    else store.addUser({ name: f.name, role: f.role, team: f.team, roleType: f.roleType, initials });
    onClose();
  };
  return (
    <Modal title={user ? 'Amend user' : 'Add user'} icon="contacts" onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!valid} style={!valid ? { opacity: .5 } : null}>{user ? 'Save changes' : 'Create user'}</button>
      </React.Fragment>}>
      <div className="row" style={{ gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
        <Avatar id={user ? user.id : f.name} initials={initials} size={52} />
        <div>
          <div style={{ fontWeight: 700, color: 'var(--asr-navy)' }}>{f.name || 'New user'}</div>
          <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>{f.role || 'Job title'}</div>
        </div>
      </div>
      <div className="form-grid">
        <div className="field"><label>Full name</label><input value={f.name} onChange={e => set('name', e.target.value)} autoFocus /></div>
        <div className="field"><label>Job title</label><input value={f.role} onChange={e => set('role', e.target.value)} placeholder="e.g. Senior Underwriter" /></div>
        <div className="field"><label>Team</label><input value={f.team} onChange={e => set('team', e.target.value)} placeholder="e.g. Energy" /></div>
        <div className="field"><label>Role / access</label>
          <select value={f.roleType} onChange={e => set('roleType', e.target.value)}>
            {D().ROLE_TYPES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
        </div>
        <div className="full" style={{ fontSize: 12, color: 'var(--fg-muted)', background: 'var(--asr-navy-10)', padding: '10px 14px', borderRadius: 8 }}>
          <Icon name="shield" size={13} style={{ verticalAlign: -2, marginRight: 6 }} />
          {(D().ROLE_TYPES.find(r => r.id === f.roleType) || {}).desc}
        </div>
      </div>
    </Modal>
  );
}

Object.assign(window, { UserManagement, UserModal });
