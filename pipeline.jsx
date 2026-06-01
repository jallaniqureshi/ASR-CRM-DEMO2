/* ASR CRM — Pipeline (kanban board, table, opportunity drawer, convert-to-risk) */

const D = () => window.ASR_DATA;

function oppValue(o) { return o.premium || 0; }
function weighted(o) { return (o.premium || 0) * (o.prob || 0) / 100; }

// ---------- Opportunity card ----------
function OppCard({ o, onOpen, onDragStart, dragging }) {
  const contact = D().NAMES[o.contact];
  return (
    <div className={'opp-card' + (dragging ? ' dragging' : '')} draggable
      onDragStart={e => onDragStart(e, o.id)} onClick={() => onOpen(o.id)}>
      <div className="nm">{o.name}</div>
      <div className="meta-row">
        <span className="tag">{o.class.replace(' & ', ' & ').split(' ').slice(0, 2).join(' ')}</span>
        <PaperBadge paperId={o.paper} />
        {o.prob >= 60 && <span className="badge" style={{ background: '#FFF5CC', color: '#E6AA00' }}><Icon name="flame" size={12} /> Hot</span>}
        <span style={{ marginLeft: 'auto' }}><ScoreBadge o={o} /></span>
      </div>
      <div className="foot">
        <span className="prem">{fmtMoney(o.premium)}</span>
        <span className="terr"><Icon name="pin" size={13} />{o.territory}</span>
        <span style={{ marginLeft: 'auto' }}><Avatar id={o.owner} initials={D().TEAM[o.owner].initials} size={24} /></span>
      </div>
    </div>
  );
}

// ---------- Board ----------
function PipelineBoard({ opps, onOpen, onDrop }) {
  const [drag, setDrag] = React.useState(null);
  const [over, setOver] = React.useState(null);
  const onDragStart = (e, id) => { setDrag(id); e.dataTransfer.effectAllowed = 'move'; };
  return (
    <div className="board">
      {D().STAGES.map(stage => {
        const items = opps.filter(o => o.stage === stage.id);
        const sum = items.reduce((a, o) => a + oppValue(o), 0);
        return (
          <div key={stage.id}
            className={'col' + (over === stage.id ? ' dragover' : '')}
            onDragOver={e => { e.preventDefault(); setOver(stage.id); }}
            onDragLeave={() => setOver(o => o === stage.id ? null : o)}
            onDrop={() => { if (drag) onDrop(drag, stage.id); setDrag(null); setOver(null); }}>
            <div className="col-head">
              <span className="pip" style={{ width: 9, height: 9, borderRadius: '50%', background: stage.color }}></span>
              <span className="ttl">{stage.label}</span>
              <span className="ct">{items.length}</span>
              <span className="sum">{fmtMoney(sum)}</span>
            </div>
            <div className="col-body">
              {items.map(o => <OppCard key={o.id} o={o} onOpen={onOpen} onDragStart={onDragStart} dragging={drag === o.id} />)}
              {!items.length && <div style={{ padding: '18px 6px', textAlign: 'center', fontSize: 12, color: 'var(--fg-muted)' }}>Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Table view ----------
function PipelineTable({ opps, onOpen }) {
  const [sort, setSort] = React.useState({ key: 'premium', dir: 'desc' });
  const head = (key, label, align) => (
    <th onClick={() => setSort(s => ({ key, dir: s.key === key && s.dir === 'desc' ? 'asc' : 'desc' }))}
      style={{ textAlign: align || 'left', cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>
      {label}{sort.key === key && <span style={{ marginLeft: 5, color: 'var(--asr-navy)' }}>{sort.dir === 'desc' ? '↓' : '↑'}</span>}
    </th>
  );
  const val = (o, k) => k === 'owner' ? D().TEAM[o.owner].name : k === 'paper' ? paperOf(o.paper).short
    : k === 'stage' ? D().STAGES.findIndex(s => s.id === o.stage) : k === 'score' ? oppScore(o).score : o[k];
  const rows = [...opps].sort((a, b) => {
    const av = val(a, sort.key), bv = val(b, sort.key);
    const c = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
    return sort.dir === 'desc' ? -c : c;
  });
  return (
    <div style={{ padding: 'var(--space-6) var(--space-8) var(--space-8)' }}>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              {head('name', 'Opportunity')}{head('class', 'Class')}{head('paper', 'Paper')}{head('territory', 'Territory')}{head('stage', 'Stage')}
              {head('score', 'Score', 'center')}{head('premium', 'Est. GWP', 'right')}{head('share', 'Line', 'right')}{head('owner', 'Owner')}{head('inception', 'Inception')}
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.id} onClick={() => onOpen(o.id)}>
                <td className="strong">{o.name}</td>
                <td>{o.class}</td>
                <td><PaperBadge paperId={o.paper} /></td>
                <td>{o.territory}</td>
                <td><StageBadge stageId={o.stage} /></td>
                <td style={{ textAlign: 'center' }}><ScoreBadge o={o} /></td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--asr-navy)' }}>{fmtMoney(o.premium)}</td>
                <td style={{ textAlign: 'right' }}>{o.share}%</td>
                <td><div className="row"><Avatar id={o.owner} initials={D().TEAM[o.owner].initials} size={26} /><span>{D().TEAM[o.owner].name.split(' ')[0]}</span></div></td>
                <td>{fmtDate(o.inception)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------- Pipeline screen ----------
function Pipeline({ store }) {
  const [view, setView] = React.useState('board');
  const [filter, setFilter] = React.useState('all');
  const [paper, setPaper] = React.useState('all');
  const [showNew, setShowNew] = React.useState(false);

  let opps = store.opps.filter(o => !o.archived);
  if (filter === 'mine') opps = opps.filter(o => o.owner === store.meId);
  else if (filter !== 'all') opps = opps.filter(o => o.class === filter);
  if (paper !== 'all') opps = opps.filter(o => (o.paper || 'syn2454') === paper);
  if (store.query) opps = opps.filter(o => (o.name + o.insured + o.territory).toLowerCase().includes(store.query.toLowerCase()));

  const total = opps.reduce((a, o) => a + oppValue(o), 0);
  const wtd = opps.reduce((a, o) => a + weighted(o), 0);

  const exportCsv = () => {
    downloadCSV('asr-pipeline.csv',
      ['Opportunity', 'Insured', 'Class', 'Paper', 'Territory', 'Stage', 'Score', 'Est. GWP (USD)', 'Line %', 'Win %', 'Owner', 'Inception'],
      opps.map(o => [o.name, o.insured, o.class, paperOf(o.paper).label, o.territory,
        (D().STAGES.find(s => s.id === o.stage) || {}).label, oppScore(o).score,
        o.premium, o.share, o.prob, D().TEAM[o.owner].name, o.inception]));
    store.notify('Exported ' + opps.length + ' opportunities to CSV');
  };

  return (
    <div className="content flush">
      <div style={{ padding: 'var(--space-6) var(--space-8) 0', display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div className="row" style={{ gap: 6, background: '#fff', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: 4 }}>
          {[['board', 'Board'], ['table', 'Table']].map(([v, l]) => (
            <button key={v} className="btn btn-sm" onClick={() => setView(v)}
              style={view === v ? { background: 'var(--asr-navy)', color: '#fff' } : { background: 'transparent', color: 'var(--fg-secondary)' }}>{l}</button>
          ))}
        </div>
        <select className="field" value={filter} onChange={e => setFilter(e.target.value)}
          style={{ height: 38, borderRadius: 999, border: '1px solid var(--border-default)', padding: '0 14px', fontSize: 13, background: '#fff', color: 'var(--fg-primary)' }}>
          <option value="all">All classes</option>
          <option value="mine">My opportunities</option>
          {D().CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="field" value={paper} onChange={e => setPaper(e.target.value)} title="Underwriting platform / paper"
          style={{ height: 38, borderRadius: 999, border: '1px solid var(--border-default)', padding: '0 14px', fontSize: 13, background: '#fff', color: 'var(--fg-primary)' }}>
          <option value="all">All paper</option>
          {D().PAPERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--fg-muted)', fontWeight: 600 }}>Pipeline GWP</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--asr-navy)', fontFamily: 'var(--font-display)' }}>{fmtMoney(total)}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--fg-muted)', fontWeight: 600 }}>Weighted</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--asr-gold-dark)', fontFamily: 'var(--font-display)' }}>{fmtMoney(wtd)}</div>
          </div>
          <button className="btn btn-ghost" onClick={exportCsv} title="Export current view to CSV"><Icon name="download" size={16} /> Export</button>
          <button className="btn btn-gold" onClick={() => setShowNew(true)}><Icon name="plus" size={17} /> New opportunity</button>
        </div>
      </div>
      {view === 'board'
        ? <PipelineBoard opps={opps} onOpen={store.openOpp} onDrop={store.moveOpp} />
        : <PipelineTable opps={opps} onOpen={store.openOpp} />}
      {showNew && <NewOpportunityModal store={store} onClose={() => setShowNew(false)} />}
    </div>
  );
}

// ---------- Opportunity drawer ----------
function OpportunityDrawer({ id, store, onClose }) {
  const o = store.opps.find(x => x.id === id);
  const [showConvert, setShowConvert] = React.useState(false);
  const [showAssign, setShowAssign] = React.useState(false);
  if (!o) return null;
  const contact = D().NAMES[o.contact];
  const acts = store.activities.filter(a => a.opp === id);
  const owner = D().TEAM[o.owner];
  const oppTasks = store.tasks.filter(t => t.opp === id);
  const stageIdx = D().STAGES.findIndex(s => s.id === o.stage);
  const canConvert = o.stage === 'quoted' || o.stage === 'bound';

  return (
    <Drawer onClose={onClose} subtitle={o.class}
      title={o.name}
      headExtra={
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 16, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: 'rgba(255,255,255,.14)', color: '#fff' }}>{o.territory}</span>
          <span style={{ fontSize: 22, fontWeight: 900, fontFamily: 'var(--font-display)' }}>{fmtMoney(o.premium)}</span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.7)' }}>est. GWP · {o.share}% line</span>
          <span style={{ marginLeft: 'auto' }}><PaperBadge paperId={o.paper} /></span>
        </div>
      }
      footer={
        <React.Fragment>
          {o.converted
            ? <div className="row" style={{ color: '#1F8A5B', fontWeight: 700, fontSize: 13 }}><Icon name="check" size={16} /> {o.riskRef} · sent to Navigator</div>
            : <button className="btn btn-gold" disabled={!canConvert} style={!canConvert ? { opacity: .45, cursor: 'not-allowed' } : null}
                onClick={() => setShowConvert(true)}><Icon name="convert" size={16} /> Convert to risk</button>}
          <button className="btn btn-ghost" onClick={() => store.openActivityFor(o)}><Icon name="note" size={16} /> Log</button>
          {store.canArchive && <button className="icon-btn" title={o.archived ? 'Restore' : 'Archive'} style={{ marginLeft: 'auto' }}
            onClick={() => { store.archiveOpp(o.id, !o.archived); onClose(); }}><Icon name={o.archived ? 'restore' : 'archive'} size={18} /></button>}
          {store.canDelete && <button className="icon-btn" title="Delete record" style={{ borderColor: '#E7B9B3', color: '#C0392B', marginLeft: store.canArchive ? 0 : 'auto' }}
            onClick={() => { if (confirm('Permanently delete this opportunity? This cannot be undone.')) { store.deleteOpp(o.id); onClose(); } }}><Icon name="trash" size={18} /></button>}
        </React.Fragment>
      }>
      {/* Stage stepper */}
      <div>
        <div className="section-title">Stage</div>
        <div style={{ display: 'flex', gap: 4 }}>
          {D().STAGES.map((s, i) => (
            <button key={s.id} onClick={() => store.moveOpp(o.id, s.id)}
              style={{ flex: 1, padding: '8px 4px', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: i <= stageIdx ? s.color : 'var(--asr-navy-10)', color: i <= stageIdx ? '#fff' : 'var(--fg-muted)',
                transition: 'all .2s' }}>{s.label}</button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Win probability</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--asr-navy)' }}>{o.prob}%</span>
          </div>
          <div className="prog"><span style={{ width: o.prob + '%' }}></span></div>
          {(() => { const sc = oppScore(o); return (
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 12, background: sc.color + '12', borderRadius: 'var(--radius-md)', padding: '10px 12px' }}>
              <span className="row" style={{ gap: 8 }}><Icon name="spark" size={16} color={sc.color} />
                <span style={{ fontSize: 12, color: 'var(--fg-secondary)' }}>ASR opportunity score <strong style={{ color: sc.color }}>{sc.label}</strong></span>
              </span>
              <span style={{ fontSize: 15, fontWeight: 900, color: sc.color, fontFamily: 'var(--font-display)' }}>{sc.grade} · {sc.score}</span>
            </div>
          ); })()}
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title">Risk summary</div>
        <dl className="dl">
          <dt>Insured</dt><dd>{o.insured}</dd>
          <dt>Class</dt><dd>{o.class}</dd>
          <dt>Territory</dt><dd>{o.territory}</dd>
          <dt>Limit</dt><dd>{fmtMoney(o.limit)} {o.currency}</dd>
          <dt>ASR line</dt><dd>{o.share}% · {fmtMoney(o.premium)} GWP</dd>
          <dt>Inception</dt><dd>{fmtDate(o.inception)}</dd>
        </dl>
        <div className="field" style={{ marginTop: 14 }}>
          <label>Underwriting paper / platform</label>
          <select value={o.paper || 'syn2454'} onChange={e => store.setPaper(o.id, e.target.value)}>
            {D().PAPERS.map(p => <option key={p.id} value={p.id}>{p.label} · {p.platform}</option>)}
          </select>
        </div>
        <div className="row" style={{ marginTop: 10, gap: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
          <Icon name="scale" size={14} color={paperOf(o.paper).color} />
          <span>{paperOf(o.paper).regulator} · Financial strength {paperOf(o.paper).rating}</span>
        </div>
      </div>

      <div className="card card-pad">
        <div className="row" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="section-title" style={{ margin: 0 }}>Assignment</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowAssign(true)}><Icon name="userplus" size={14} /> Assign action</button>
        </div>
        <div className="row" style={{ gap: 'var(--space-3)', marginBottom: 14 }}>
          <Avatar id={owner.id} initials={owner.initials} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: 'var(--asr-navy)', fontSize: 14 }}>{owner.name}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>Opportunity owner · {owner.team}</div>
          </div>
        </div>
        <div className="field">
          <label>Reassign owner to</label>
          <select value={o.owner} onChange={e => store.reassignOpp(o.id, e.target.value)}>
            {Object.values(D().TEAM).filter(m => m.roleType !== 'sysadmin').map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}
          </select>
        </div>
        {oppTasks.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div className="section-title">Assigned actions ({oppTasks.length})</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {oppTasks.map(t => <TaskRow key={t.id} t={t} store={store} />)}
            </div>
          </div>
        )}
      </div>

      <div className="card card-pad">
        <div className="section-title">Distribution contact</div>
        {contact && (
          <div className="row" style={{ cursor: 'pointer' }} onClick={() => store.openContact(contact.id)}>
            <Avatar id={contact.id} initials={contact.name.split(' ').map(n => n[0]).join('')} size={42} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--asr-navy)' }}>{contact.name}</div>
              <div style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{contact.title}</div>
              <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>{contact.company} · {contact.location}</div>
            </div>
            <Icon name="chevronr" size={18} style={{ marginLeft: 'auto', color: 'var(--fg-muted)' }} />
          </div>
        )}
      </div>

      <div>
        <div className="section-title">Activity ({acts.length})</div>
        {acts.length ? <ActivityTimeline acts={acts} store={store} compact /> : <div className="muted" style={{ fontSize: 13 }}>No activity logged yet.</div>}
      </div>

      {showConvert && <ConvertModal o={o} store={store} onClose={() => setShowConvert(false)} onDone={() => { setShowConvert(false); }} />}
      {showAssign && <AssignActionModal opp={o} store={store} onClose={() => setShowAssign(false)} />}
    </Drawer>
  );
}

// ---------- New opportunity modal ----------
function NewOpportunityModal({ store, onClose }) {
  const [f, setF] = React.useState({ name: '', insured: '', class: D().CLASSES[0], territory: D().TERRITORIES[0], stage: 'lead', premium: '', limit: '', share: '', contact: D().CONTACTS[0].id, inception: '', prob: 15, paper: 'syn2454' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.name && f.insured && f.premium;
  const submit = () => {
    store.addOpp({ ...f, premium: +f.premium || 0, limit: +f.limit || 0, share: +f.share || 0, currency: 'USD', prob: +f.prob, owner: store.meId, created: '2026-05-23', updated: '2026-05-23' });
    onClose();
  };
  return (
    <Modal title="New opportunity" icon="target" onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!valid} style={!valid ? { opacity: .5 } : null}>Create opportunity</button>
      </React.Fragment>}>
      <div className="form-grid">
        <div className="field full"><label>Opportunity name</label><input value={f.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Lagos Port — Construction All Risks" autoFocus /></div>
        <div className="field"><label>Insured</label><input value={f.insured} onChange={e => set('insured', e.target.value)} placeholder="Named insured" /></div>
        <div className="field"><label>Class of business</label><select value={f.class} onChange={e => set('class', e.target.value)}>{D().CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Territory</label><select value={f.territory} onChange={e => set('territory', e.target.value)}>{D().TERRITORIES.map(c => <option key={c}>{c}</option>)}</select></div>
        <div className="field"><label>Distribution contact</label><select value={f.contact} onChange={e => set('contact', e.target.value)}>{D().CONTACTS.map(c => <option key={c.id} value={c.id}>{c.name} · {c.company}</option>)}</select></div>
        <div className="field"><label>Underwriting paper</label><select value={f.paper} onChange={e => set('paper', e.target.value)}>{D().PAPERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
        <div className="field"><label>Est. GWP (USD)</label><input type="number" value={f.premium} onChange={e => set('premium', e.target.value)} placeholder="0" /></div>
        <div className="field"><label>Limit (USD)</label><input type="number" value={f.limit} onChange={e => set('limit', e.target.value)} placeholder="0" /></div>
        <div className="field"><label>ASR line (%)</label><input type="number" value={f.share} onChange={e => set('share', e.target.value)} placeholder="0" /></div>
        <div className="field"><label>Target inception</label><input type="date" value={f.inception} onChange={e => set('inception', e.target.value)} /></div>
        <div className="field"><label>Stage</label><select value={f.stage} onChange={e => set('stage', e.target.value)}>{D().STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      </div>
    </Modal>
  );
}

// ---------- Convert to risk modal ----------
function ConvertModal({ o, store, onClose }) {
  const [done, setDone] = React.useState(false);
  const ref = 'NAV-2026-' + (4400 + Math.floor(Math.random() * 600));
  const c = D().NAMES[o.contact];
  const [f, setF] = React.useState({
    insured: o.insured, class: o.class, territory: o.territory,
    limit: o.limit, share: o.share, premium: o.premium, currency: o.currency,
    umr: 'B' + (1280 + Math.floor(Math.random() * 99)) + 'ASR' + (24000 + Math.floor(Math.random() * 900)),
    inception: o.inception, expiry: '', brokerage: 12.5, broker: c ? c.company : '', basis: 'Risks Attaching',
    paper: o.paper || 'syn2454',
  });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const finish = () => { store.convertOpp(o.id, ref, f.paper); setDone(true); };

  if (done) {
    return (
      <Modal title="Risk created" icon="check" onClose={onClose}
        footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#E8F6EF', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <Icon name="check" size={32} color="#1F8A5B" />
          </div>
          <h2 style={{ margin: '0 0 8px', color: 'var(--asr-navy)' }}>{ref}</h2>
          <p style={{ margin: 0, color: 'var(--fg-secondary)', maxWidth: 440, marginInline: 'auto' }}>
            Risk record created and queued for transfer to <strong>Navigator (NAV PAS)</strong>. The opportunity has been marked as bound and removed from open pipeline. The booking team will receive the slip for processing.
          </p>
          <div className="card card-pad" style={{ textAlign: 'left', marginTop: 20 }}>
            <dl className="dl">
              <dt>Insured</dt><dd>{f.insured}</dd>
              <dt>Paper</dt><dd>{paperOf(f.paper).label}</dd>
              <dt>UMR</dt><dd style={{ fontFamily: 'var(--font-mono)' }}>{f.umr}</dd>
              <dt>ASR line</dt><dd>{f.share}% · {fmtMoney(f.premium)} {f.currency}</dd>
              <dt>Status</dt><dd><span className="badge" style={{ background: '#FFF5CC', color: '#E6AA00' }}><Icon name="clock" size={12} /> Pending PAS sync</span></dd>
            </dl>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Convert opportunity to risk" icon="convert" wide onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-gold" onClick={finish}><Icon name="convert" size={16} /> Create risk & send to PAS</button>
      </React.Fragment>}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--asr-navy-10)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
        <Icon name="layers" size={18} color="var(--asr-navy)" />
        <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>Confirm the bound terms below. On submit, a risk record is created and transferred to the <strong>Navigator</strong> Policy Admin System.</span>
      </div>
      <div className="form-grid">
        <div className="field full"><label>Insured</label><input value={f.insured} onChange={e => set('insured', e.target.value)} /></div>
        <div className="field"><label>Underwriting paper / carrier</label><select value={f.paper} onChange={e => set('paper', e.target.value)}>{D().PAPERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></div>
        <div className="field"><label>UMR / Slip reference</label><input value={f.umr} onChange={e => set('umr', e.target.value)} style={{ fontFamily: 'var(--font-mono)' }} /></div>
        <div className="field"><label>Placing broker</label><input value={f.broker} onChange={e => set('broker', e.target.value)} /></div>
        <div className="field"><label>Class of business</label><select value={f.class} onChange={e => set('class', e.target.value)}>{D().CLASSES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Territory</label><select value={f.territory} onChange={e => set('territory', e.target.value)}>{D().TERRITORIES.map(x => <option key={x}>{x}</option>)}</select></div>
        <div className="field"><label>Period — inception</label><input type="date" value={f.inception} onChange={e => set('inception', e.target.value)} /></div>
        <div className="field"><label>Period — expiry</label><input type="date" value={f.expiry} onChange={e => set('expiry', e.target.value)} /></div>
        <div className="field"><label>100% limit</label><input type="number" value={f.limit} onChange={e => set('limit', e.target.value)} /></div>
        <div className="field"><label>ASR written line (%)</label><input type="number" value={f.share} onChange={e => set('share', e.target.value)} /></div>
        <div className="field"><label>ASR premium (GWP)</label><input type="number" value={f.premium} onChange={e => set('premium', e.target.value)} /></div>
        <div className="field"><label>Currency</label><select value={f.currency} onChange={e => set('currency', e.target.value)}><option>USD</option><option>EUR</option><option>GBP</option><option>ZAR</option></select></div>
        <div className="field"><label>Brokerage (%)</label><input type="number" value={f.brokerage} onChange={e => set('brokerage', e.target.value)} /></div>
        <div className="field"><label>Basis</label><select value={f.basis} onChange={e => set('basis', e.target.value)}><option>Risks Attaching</option><option>Losses Occurring</option><option>Claims Made</option></select></div>
      </div>
    </Modal>
  );
}

// ---------- Task row (assigned action) ----------
function TaskRow({ t, store, showOpp }) {
  const assignee = D().TEAM[t.assignee];
  const by = D().TEAM[t.assignedBy];
  const opp = store.opps.find(o => o.id === t.opp);
  const PCOLOR = { High: '#C0392B', Medium: '#E6AA00', Low: '#8B9FB7' };
  return (
    <div className="row" style={{ gap: 10, padding: '10px 12px', background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', opacity: t.done ? .6 : 1 }}>
      <button onClick={() => store.toggleTask(t.id)} title="Toggle complete"
        style={{ width: 22, height: 22, borderRadius: 6, flex: 'none', border: '1.5px solid ' + (t.done ? '#1F8A5B' : 'var(--border-default)'), background: t.done ? '#1F8A5B' : '#fff', display: 'grid', placeItems: 'center', color: '#fff' }}>
        {t.done && <Icon name="check" size={13} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--asr-navy)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.title}</div>
        <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginTop: 2 }}>
          {showOpp && opp ? opp.name.split('—')[0].trim() + ' · ' : ''}from {by ? by.name.split(' ')[0] : '—'} · due {fmtDate(t.due)}
        </div>
      </div>
      <span className="badge" style={{ background: PCOLOR[t.priority] + '1F', color: PCOLOR[t.priority] }}>{t.priority}</span>
      <Avatar id={assignee.id} initials={assignee.initials} size={26} />
    </div>
  );
}

// ---------- Assign action modal (standalone or opportunity-linked) ----------
function AssignActionModal({ opp, store, onClose }) {
  const team = Object.values(D().TEAM).filter(m => m.roleType !== 'sysadmin' && m.id !== store.meId);
  const [f, setF] = React.useState({ title: '', assignee: (team[0] || {}).id || store.meId, due: '', priority: 'Medium', opp: opp ? opp.id : '', contact: opp ? opp.contact : '' });
  const set = (k, v) => setF(s => ({ ...s, [k]: v }));
  const valid = f.title && f.assignee;
  const submit = () => { store.addTask({ title: f.title, assignee: f.assignee, due: f.due, priority: f.priority, opp: f.opp, contact: f.contact, assignedBy: store.meId, done: false }); onClose(); };
  const openOpps = store.opps.filter(o => !o.archived);
  return (
    <Modal title="Assign an action" icon="userplus" onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={submit} disabled={!valid} style={!valid ? { opacity: .5 } : null}>Assign action</button>
      </React.Fragment>}>
      {opp && <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'var(--asr-navy-10)', borderRadius: 10, padding: '12px 16px', marginBottom: 20 }}>
        <Icon name="target" size={18} color="var(--asr-navy)" />
        <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>Action on <strong>{opp.name}</strong></span>
      </div>}
      <div className="form-grid">
        <div className="field full"><label>Action</label><input value={f.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Prepare pricing indication" autoFocus /></div>
        <div className="field"><label>Assign to</label><select value={f.assignee} onChange={e => set('assignee', e.target.value)}>{team.map(m => <option key={m.id} value={m.id}>{m.name} · {m.role}</option>)}</select></div>
        <div className="field"><label>Priority</label><select value={f.priority} onChange={e => set('priority', e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select></div>
        <div className="field"><label>Due date</label><input type="date" value={f.due} onChange={e => set('due', e.target.value)} /></div>
        {!opp && <div className="field"><label>Linked opportunity (optional)</label><select value={f.opp} onChange={e => set('opp', e.target.value)}><option value="">— none —</option>{openOpps.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>}
      </div>
    </Modal>
  );
}

Object.assign(window, { Pipeline, OpportunityDrawer, oppValue, weighted, TaskRow, AssignActionModal });
