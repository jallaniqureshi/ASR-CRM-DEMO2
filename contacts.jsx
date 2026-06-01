/* ASR CRM — Contacts & Accounts */

const TYPE_COLOR = { Broker: '#4A4F8D', Client: '#3BA4C8', Coverholder: '#E6AA00' };

function Contacts({ store }) {
  const [type, setType] = React.useState('All');
  let list = store.contacts.filter(c => !c.archived);
  if (type !== 'All') list = list.filter(c => c.type === type);
  if (store.query) list = list.filter(c => (c.name + c.company + c.location).toLowerCase().includes(store.query.toLowerCase()));

  const counts = { All: store.contacts.filter(c => !c.archived).length };
  store.contacts.filter(c => !c.archived).forEach(c => counts[c.type] = (counts[c.type] || 0) + 1);

  return (
    <div className="content">
      <div className="row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="row" style={{ gap: 6, background: '#fff', border: '1px solid var(--border-default)', borderRadius: 999, padding: 4 }}>
          {['All', 'Broker', 'Client', 'Coverholder'].map(t => (
            <button key={t} className="btn btn-sm" onClick={() => setType(t)}
              style={type === t ? { background: 'var(--asr-navy)', color: '#fff' } : { background: 'transparent', color: 'var(--fg-secondary)' }}>
              {t} <span style={{ opacity: .6, marginLeft: 4 }}>{counts[t] || 0}</span>
            </button>
          ))}
        </div>
        <button className="btn btn-gold" style={{ marginLeft: 'auto' }} onClick={() => store.openNewContact()}><Icon name="plus" size={17} /> New contact</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {list.map(c => {
          const opps = store.opps.filter(o => o.contact === c.id);
          const owner = D().TEAM[c.owner];
          return (
            <div key={c.id} className="card card-pad" style={{ cursor: 'pointer', transition: 'box-shadow .15s, transform .15s' }}
              onClick={() => store.openContact(c.id)}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'none'; }}>
              <div className="row" style={{ gap: 'var(--space-3)' }}>
                <Avatar id={c.id} initials={c.name.split(' ').map(n => n[0]).join('')} size={46} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: 'var(--asr-navy)' }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 14, justifyContent: 'space-between' }}>
                <span className="badge" style={{ background: TYPE_COLOR[c.type] + '1F', color: TYPE_COLOR[c.type] }}><span className="pip" style={{ background: TYPE_COLOR[c.type] }}></span>{c.type}</span>
                <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}><Icon name="building" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />{c.company}</span>
              </div>
              <div className="divider"></div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-muted)' }}>
                <span><Icon name="globe" size={13} style={{ verticalAlign: -2, marginRight: 4 }} />{c.location}</span>
                <span>{opps.length} {opps.length === 1 ? 'opp' : 'opps'} · {relDate(c.last)}</span>
              </div>
            </div>
          );
        })}
      </div>
      {!list.length && <div className="empty">No contacts match.</div>}
    </div>
  );
}

function ContactDrawer({ id, store, onClose }) {
  const c = store.contacts.find(x => x.id === id);
  if (!c) return null;
  const opps = store.opps.filter(o => o.contact === id);
  const acts = store.activities.filter(a => a.contact === id);
  const owner = D().TEAM[c.owner];
  const totalGwp = opps.reduce((a, o) => a + (o.premium || 0), 0);

  return (
    <Drawer onClose={onClose} subtitle={c.type}
      title={c.name}
      headExtra={
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,.85)' }}>{c.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{c.company} · {c.location}</div>
        </div>
      }
      footer={
        <React.Fragment>
          <button className="btn btn-gold" onClick={() => store.openActivityFor({ contact: c.id })}><Icon name="note" size={16} /> Log activity</button>
          <a className="btn btn-ghost" href={'mailto:' + c.email}><Icon name="mail" size={16} /> Email</a>
          {store.canArchive && <button className="icon-btn" title={c.archived ? 'Restore' : 'Archive'} style={{ marginLeft: 'auto' }}
            onClick={() => { store.archiveContact(c.id, !c.archived); onClose(); }}><Icon name={c.archived ? 'restore' : 'archive'} size={18} /></button>}
          {store.canDelete && <button className="icon-btn" title="Delete record" style={{ borderColor: '#E7B9B3', color: '#C0392B', marginLeft: store.canArchive ? 0 : 'auto' }}
            onClick={() => { if (confirm('Permanently delete this contact?')) { store.deleteContact(c.id); onClose(); } }}><Icon name="trash" size={18} /></button>}
        </React.Fragment>
      }>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="stat" style={{ padding: 'var(--space-4) var(--space-5)' }}>
          <div className="k">Open opps</div><div className="v" style={{ fontSize: '1.5rem' }}>{opps.filter(o => o.stage !== 'bound').length}</div>
        </div>
        <div className="stat" style={{ padding: 'var(--space-4) var(--space-5)' }}>
          <div className="k">Linked GWP</div><div className="v" style={{ fontSize: '1.5rem' }}>{fmtMoney(totalGwp)}</div>
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title">Details</div>
        <dl className="dl">
          <dt>Email</dt><dd><a href={'mailto:' + c.email}>{c.email}</a></dd>
          <dt>Phone</dt><dd>{c.phone}</dd>
          <dt>Type</dt><dd>{c.type}</dd>
          <dt>Relationship</dt><dd>{owner.name}</dd>
          <dt>Last contact</dt><dd>{fmtDate(c.last)}</dd>
          <dt>Tags</dt><dd><div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>{c.tags.map(t => <span key={t} className="tag">{t}</span>)}</div></dd>
        </dl>
      </div>

      <div>
        <div className="section-title">Opportunities ({opps.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {opps.map(o => (
            <div key={o.id} className="card card-pad" style={{ padding: '12px 16px', cursor: 'pointer' }} onClick={() => store.openOpp(o.id)}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--asr-navy)' }}>{o.name}</span>
                <StageBadge stageId={o.stage} />
              </div>
              <div className="row" style={{ marginTop: 6, fontSize: 12, color: 'var(--fg-muted)', justifyContent: 'space-between' }}>
                <span>{o.class} · {o.territory}</span>
                <span style={{ fontWeight: 700, color: 'var(--asr-navy)' }}>{fmtMoney(o.premium)}</span>
              </div>
            </div>
          ))}
          {!opps.length && <div className="muted" style={{ fontSize: 13 }}>No linked opportunities.</div>}
        </div>
      </div>

      <div>
        <div className="section-title">History ({acts.length})</div>
        {acts.length ? <ActivityTimeline acts={acts} store={store} compact /> : <div className="muted" style={{ fontSize: 13 }}>No activity yet.</div>}
      </div>
    </Drawer>
  );
}

function NewContactModal({ store, onClose }) {
  const [f, setF] = React.useState({ name: '', company: '', type: 'Broker', title: '', location: '', email: '', phone: '', tags: '' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name && f.company;
  const submit = () => {
    store.addContact({ ...f, owner: store.meId, last: '2026-05-23', tags: f.tags ? f.tags.split(',').map(t => t.trim()).filter(Boolean) : [] });
    onClose();
  };
  return (
    <Modal title="New contact" icon="contacts" onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!valid} style={!valid ? { opacity: .5 } : null}>Create contact</button>
      </React.Fragment>}>
      <div className="form-grid">
        <div className="field"><label>Full name</label><input value={f.name} onChange={e => set('name', e.target.value)} autoFocus /></div>
        <div className="field"><label>Type</label><select value={f.type} onChange={e => set('type', e.target.value)}><option>Broker</option><option>Client</option><option>Coverholder</option></select></div>
        <div className="field"><label>Company</label><input value={f.company} onChange={e => set('company', e.target.value)} /></div>
        <div className="field"><label>Job title</label><input value={f.title} onChange={e => set('title', e.target.value)} /></div>
        <div className="field"><label>Location</label><input value={f.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" /></div>
        <div className="field"><label>Email</label><input type="email" value={f.email} onChange={e => set('email', e.target.value)} /></div>
        <div className="field"><label>Phone</label><input value={f.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div className="field"><label>Tags (comma-separated)</label><input value={f.tags} onChange={e => set('tags', e.target.value)} placeholder="Key broker, PRT" /></div>
      </div>
    </Modal>
  );
}

Object.assign(window, { Contacts, ContactDrawer, NewContactModal });
