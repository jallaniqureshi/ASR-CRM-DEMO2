/* ASR CRM — Activity feed + meeting notes */

const ACT_ICON = { Meeting: 'meeting', Call: 'phone', Email: 'mail', Note: 'note' };

function ActivityTimeline({ acts, store, compact }) {
  const sorted = [...acts].sort((a, b) => new Date(b.date) - new Date(a.date));
  return (
    <div className="tl">
      {sorted.map(a => {
        const author = window.ASR_DATA.TEAM[a.author];
        const opp = a.opp && store.opps.find(o => o.id === a.opp);
        const contact = a.contact && window.ASR_DATA.NAMES[a.contact];
        return (
          <div className="tl-item" key={a.id}>
            <div className="tl-ic"><Icon name={ACT_ICON[a.type] || 'note'} /></div>
            <div className="tl-body">
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span className="t">{a.title}</span>
                <span className="m">{relDate(a.date)}</span>
              </div>
              <div className="m">
                <span className="badge" style={{ background: 'var(--asr-navy-10)', color: 'var(--asr-purple-mid)', marginRight: 6 }}>{a.type}</span>
                {contact && <span>{contact.name} · {contact.company}</span>}
              </div>
              <div className="b">{a.body}</div>
              {!compact && (
                <div className="row" style={{ marginTop: 10, gap: 8 }}>
                  <Avatar id={author.id} initials={author.initials} size={22} />
                  <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{author.name}</span>
                  {opp && <button className="tag" style={{ marginLeft: 'auto', border: 'none', cursor: 'pointer' }} onClick={() => store.openOpp(opp.id)}><Icon name="link" size={11} style={{ marginRight: 4 }} />{opp.name.split('—')[0].trim()}</button>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Activity({ store }) {
  const [type, setType] = React.useState('All');
  let acts = store.activities;
  if (type !== 'All') acts = acts.filter(a => a.type === type);
  if (store.query) acts = acts.filter(a => (a.title + a.body).toLowerCase().includes(store.query.toLowerCase()));

  return (
    <div className="content">
      <div className="row" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="row" style={{ gap: 6, background: '#fff', border: '1px solid var(--border-default)', borderRadius: 999, padding: 4 }}>
          {['All', 'Meeting', 'Call', 'Email', 'Note'].map(t => (
            <button key={t} className="btn btn-sm" onClick={() => setType(t)}
              style={type === t ? { background: 'var(--asr-navy)', color: '#fff' } : { background: 'transparent', color: 'var(--fg-secondary)' }}>{t}</button>
          ))}
        </div>
        <button className="btn btn-gold" style={{ marginLeft: 'auto' }} onClick={() => store.openActivityFor(null)}><Icon name="plus" size={17} /> Log activity</button>
      </div>
      <div style={{ maxWidth: 760 }}>
        {acts.length ? <ActivityTimeline acts={acts} store={store} /> : <div className="empty">No activity matches.</div>}
      </div>
    </div>
  );
}

function AddNoteModal({ store, preset, onClose }) {
  const [f, setF] = React.useState({
    type: 'Meeting', title: '', body: '',
    contact: preset && preset.contact ? preset.contact : (preset && preset.id && D().NAMES[preset.id] ? preset.id : ''),
    opp: preset && preset.id && store.opps.find(o => o.id === preset.id) ? preset.id : '',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.title;
  const submit = () => {
    store.addActivity({ ...f, author: store.meId, date: '2026-05-23T12:00' });
    onClose();
  };
  return (
    <Modal title="Log activity" icon="note" onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!valid} style={!valid ? { opacity: .5 } : null}>Save</button>
      </React.Fragment>}>
      <div className="form-grid">
        <div className="field"><label>Type</label><select value={f.type} onChange={e => set('type', e.target.value)}><option>Meeting</option><option>Call</option><option>Email</option><option>Note</option></select></div>
        <div className="field"><label>Date</label><input type="date" defaultValue="2026-05-23" /></div>
        <div className="field full"><label>Title</label><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Renewal strategy meeting" autoFocus /></div>
        <div className="field"><label>Contact</label><select value={f.contact} onChange={e => set('contact', e.target.value)}><option value="">— none —</option>{D().CONTACTS.map(c => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}</select></div>
        <div className="field"><label>Linked opportunity</label><select value={f.opp} onChange={e => set('opp', e.target.value)}><option value="">— none —</option>{store.opps.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
        <div className="field full"><label>Notes</label><textarea rows={5} value={f.body} onChange={e => set('body', e.target.value)} placeholder="What was discussed, next steps, follow-ups…"></textarea></div>
      </div>
    </Modal>
  );
}

Object.assign(window, { Activity, ActivityTimeline, AddNoteModal });
