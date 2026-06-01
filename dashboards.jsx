/* ASR CRM — Dashboards (Underwriter + CUO) and shared chart bits */

function Donut({ segments, size = 160, thickness = 26, center }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const stops = segments.map(s => {
    const start = acc / total * 360; acc += s.value;
    const end = acc / total * 360;
    return `${s.color} ${start}deg ${end}deg`;
  }).join(', ');
  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${stops})` }}></div>
      <div style={{ position: 'absolute', inset: thickness, borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        {center}
      </div>
    </div>
  );
}

function BarChart({ rows, max, fmt, onRowClick }) {
  const m = max || Math.max(...rows.map(r => r.value), 1);
  return (
    <div className="bars">
      {rows.map(r => (
        <div className={'bar-row' + (onRowClick ? ' clickable' : '')} key={r.label} onClick={onRowClick ? () => onRowClick(r) : undefined}>
          <span className="lbl">{r.label}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: (r.value / m * 100) + '%', background: r.color || 'var(--asr-navy)' }}></div></div>
          <span className="amt">{fmt ? fmt(r.value) : r.value}</span>
        </div>
      ))}
    </div>
  );
}

function Stat({ k, v, delta, dir, accent, onClick }) {
  return (
    <div className={'stat' + (onClick ? ' clickable' : '')} onClick={onClick}>
      {accent && <div className="accent" style={{ background: accent }}></div>}
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      {delta && <div className={'d ' + (dir || 'flat')}>{dir === 'up' ? '▲' : dir === 'down' ? '▼' : '•'} {delta}</div>}
      {onClick && <span className="stat-drill"><Icon name="arrowr" size={15} /></span>}
    </div>
  );
}

// ============ UNDERWRITER DASHBOARD ============
function UnderwriterDash({ store }) {
  const me = store.meId;
  const mine = store.opps.filter(o => o.owner === me && !o.archived);
  const open = mine.filter(o => o.stage !== 'bound');
  const pipeline = open.reduce((a, o) => a + o.premium, 0);
  const weightedV = open.reduce((a, o) => a + o.premium * o.prob / 100, 0);
  const boundYtd = mine.filter(o => o.stage === 'bound').reduce((a, o) => a + o.premium, 0);
  const myActs = store.activities.filter(a => a.author === me);
  const followUps = open.filter(o => o.stage === 'quoted' || o.stage === 'quoting').sort((a, b) => b.prob - a.prob);
  const myTasks = store.tasks.filter(t => t.assignee === me).sort((a, b) => (a.done - b.done) || (new Date(a.due) - new Date(b.due)));
  const u = D().TEAM[me];

  return (
    <div className="content">
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--asr-navy)' }}>Good morning, {u.name.split(' ')[0]}</h2>
        <p style={{ margin: '4px 0 0', color: 'var(--fg-muted)' }}>{u.role} · {open.length} open opportunities need your attention</p>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <Stat k="My open pipeline" v={fmtMoney(pipeline)} delta="3 new this week" dir="up" accent="var(--asr-navy)" />
        <Stat k="Weighted forecast" v={fmtMoney(weightedV)} delta="vs. plan +8%" dir="up" accent="var(--asr-gold)" />
        <Stat k="Bound YTD" v={fmtMoney(boundYtd)} delta="2 risks" dir="flat" accent="#1F8A5B" />
        <Stat k="Actions assigned to me" v={myTasks.filter(t => !t.done).length} delta={followUps.length + ' opps awaiting action'} dir="flat" accent="var(--asr-sky)" />
      </div>

      {myTasks.filter(t => !t.done).length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="card-head"><h3>My assigned actions</h3><span className="sub">Delegated to you by the team</span></div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myTasks.map(t => <TaskRow key={t.id} t={t} store={store} showOpp />)}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-head"><h3>Needs follow-up</h3><span className="sub">Quoting & quoted — act to convert</span>
            <button className="btn btn-ghost btn-sm right" onClick={() => store.go('pipeline')}>View pipeline <Icon name="arrowr" size={14} /></button></div>
          <div style={{ padding: 'var(--space-2) 0' }}>
            {followUps.slice(0, 5).map(o => {
              const c = D().NAMES[o.contact];
              return (
                <div key={o.id} className="row" style={{ padding: '12px var(--space-6)', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => store.openOpp(o.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--asr-navy)' }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{c ? c.company : ''} · updated {relDate(o.updated)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 14 }}>
                    <div style={{ fontWeight: 700, color: 'var(--asr-navy)', fontSize: 14 }}>{fmtMoney(o.premium)}</div>
                    <div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>{o.prob}% likely</div>
                  </div>
                  <StageBadge stageId={o.stage} />
                </div>
              );
            })}
            {!followUps.length && <div className="empty">Nothing awaiting action 🎉</div>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>My recent activity</h3>
            <button className="btn btn-ghost btn-sm right" onClick={() => store.openActivityFor(null)}><Icon name="plus" size={14} /> Log</button></div>
          <div style={{ padding: 'var(--space-5) var(--space-6)' }}>
            {myActs.length ? <ActivityTimeline acts={myActs.slice(0, 4)} store={store} compact /> : <div className="muted" style={{ fontSize: 13 }}>No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ CUO STATE-OF-NATION DASHBOARD ============
function CuoDash({ store }) {
  const opps = store.opps.filter(o => !o.archived);
  const open = opps.filter(o => o.stage !== 'bound');
  const pipeline = open.reduce((a, o) => a + o.premium, 0);
  const bound = opps.filter(o => o.stage === 'bound').reduce((a, o) => a + o.premium, 0);
  const weightedV = open.reduce((a, o) => a + o.premium * o.prob / 100, 0);

  const [drill, setDrill] = React.useState(null);
  const openDrill = (title, subtitle, list) => setDrill({ title, subtitle, list });

  // by stage funnel
  const byStage = D().STAGES.map(s => ({ id: s.id, label: s.label, value: opps.filter(o => o.stage === s.id).reduce((a, o) => a + o.premium, 0), color: s.color, count: opps.filter(o => o.stage === s.id).length }));
  // by class
  const byClass = {};
  open.forEach(o => byClass[o.class] = (byClass[o.class] || 0) + o.premium);
  const PALETTE = ['#240B60', '#4A4F8D', '#3BA4C8', '#E6AA00', '#7A60A0', '#1F8A5B', '#8B9FB7'];
  const classRows = Object.entries(byClass).sort((a, b) => b[1] - a[1]).map(([cls, value], i) => ({ id: cls, label: cls.replace(' & Trade Credit', '').replace(' & Engineering', ''), value, color: PALETTE[i % PALETTE.length] }));
  // by territory
  const byTerr = {};
  open.forEach(o => byTerr[o.territory] = (byTerr[o.territory] || 0) + o.premium);
  const terrRows = Object.entries(byTerr).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, value]) => ({ id: label, label, value, color: 'var(--asr-sky)' }));

  // by underwriting platform / paper — percentages computed so they always total 100
  const totalOpen = pipeline || 1;
  const paperSplit = D().PAPERS.map(p => {
    const list = open.filter(o => (o.paper || 'syn2454') === p.id);
    return { paper: p, gwp: list.reduce((a, o) => a + o.premium, 0), n: list.length };
  });
  let pctAcc = 0;
  paperSplit.forEach((r, i) => {
    r.pct = i === paperSplit.length - 1 ? Math.max(0, 100 - pctAcc) : Math.round(r.gwp / totalOpen * 100);
    pctAcc += r.pct;
  });

  // key dialogues — high value open opps with key contacts
  const keyDialogues = [...open].sort((a, b) => b.premium - a.premium).slice(0, 5);

  return (
    <div className="content">
      <div className="row" style={{ marginBottom: 'var(--space-6)', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--asr-gold-dark)', fontWeight: 700 }}>State of nation</div>
          <h2 style={{ margin: '4px 0 0', fontSize: '1.6rem', color: 'var(--asr-navy)' }}>Underwriting pipeline overview</h2>
        </div>
        <div style={{ marginLeft: 'auto' }} className="row">
          <span className="badge" style={{ background: 'var(--asr-navy-10)', color: 'var(--asr-purple-mid)' }}>Syndicate 2454 · FY2026</span>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <Stat k="Total open pipeline" v={fmtMoney(pipeline)} delta={open.length + ' opportunities'} dir="up" accent="var(--asr-navy)"
          onClick={() => openDrill('Total open pipeline', open.length + ' open opportunities · ' + fmtMoney(pipeline) + ' GWP', open)} />
        <Stat k="Weighted forecast" v={fmtMoney(weightedV)} delta="61% of plan" dir="up" accent="var(--asr-gold)"
          onClick={() => openDrill('Weighted forecast', 'Open opportunities, weighted by win probability', open)} />
        <Stat k="Bound GWP YTD" v={fmtMoney(bound)} delta="+14% YoY" dir="up" accent="#1F8A5B"
          onClick={() => openDrill('Bound GWP YTD', opps.filter(o => o.stage === 'bound').length + ' bound risks', opps.filter(o => o.stage === 'bound'))} />
        <Stat k="Avg. win rate" v="58%" delta="quote→bind, 12mo" dir="flat" accent="var(--asr-sky)"
          onClick={() => openDrill('Quoted & bound', 'Opportunities at quote stage or beyond', opps.filter(o => ['quoted', 'bound'].includes(o.stage)))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-head"><h3>Pipeline by stage</h3><span className="sub">Estimated GWP · click to view</span></div>
          <div className="card-pad"><BarChart rows={byStage} fmt={fmtMoney}
            onRowClick={r => openDrill(r.label, r.count + ' opportunities · ' + fmtMoney(r.value) + ' GWP', opps.filter(o => o.stage === r.id))} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Open pipeline by class</h3><span className="sub">click a class to view</span></div>
          <div className="card-pad row" style={{ gap: 'var(--space-8)', alignItems: 'center' }}>
            <Donut segments={classRows} center={<div><div style={{ fontSize: 20, fontWeight: 900, color: 'var(--asr-navy)', fontFamily: 'var(--font-display)' }}>{fmtMoney(pipeline)}</div><div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>open GWP</div></div>} />
            <div className="legend grow">
              {classRows.map(r => (
                <div className="li clickable" key={r.id} onClick={() => openDrill(r.id, fmtMoney(r.value) + ' open GWP', open.filter(o => o.class === r.id))}>
                  <span className="sw" style={{ background: r.color }}></span>{r.label}<span className="amt">{fmtMoney(r.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-head"><h3>Key open dialogues</h3><span className="sub">Largest live conversations with brokers & clients</span>
            <button className="btn btn-ghost btn-sm right" onClick={() => store.go('pipeline')}>All <Icon name="arrowr" size={14} /></button></div>
          <div style={{ padding: '4px 0' }}>
            {keyDialogues.map(o => {
              const c = D().NAMES[o.contact];
              const owner = D().TEAM[o.owner];
              return (
                <div key={o.id} className="row" style={{ padding: '13px var(--space-6)', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => store.openOpp(o.id)}>
                  <Avatar id={c ? c.id : o.owner} initials={c ? c.name.split(' ').map(n => n[0]).join('') : owner.initials} size={38} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--asr-navy)' }}>{o.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 2 }}>{c ? c.name + ' · ' + c.company : owner.name} · {relDate(o.updated)}</div>
                  </div>
                  <div style={{ textAlign: 'right', marginRight: 12 }}>
                    <div style={{ fontWeight: 700, color: 'var(--asr-navy)', fontSize: 14 }}>{fmtMoney(o.premium)}</div>
                  </div>
                  <StageBadge stageId={o.stage} />
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>By territory</h3><span className="sub">Top markets · click to view</span></div>
          <div className="card-pad" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <BarChart rows={terrRows} fmt={fmtMoney}
              onRowClick={r => openDrill(r.id, fmtMoney(r.value) + ' open GWP', open.filter(o => o.territory === r.id))} />
            <div>
              <div className="section-title" style={{ marginBottom: 10 }}>By underwriting platform</div>
              <div style={{ display: 'flex', height: 24, borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: 12 }}>
                {paperSplit.map(r => r.gwp > 0 && (
                  <div key={r.paper.id} className="clickable" title={r.paper.label + ' · ' + fmtMoney(r.gwp)}
                    onClick={() => openDrill(r.paper.label, fmtMoney(r.gwp) + ' open GWP · ' + r.n + ' opportunities', open.filter(o => (o.paper || 'syn2454') === r.paper.id))}
                    style={{ width: r.pct + '%', background: r.paper.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', minWidth: 36 }}>
                    {r.pct}%
                  </div>
                ))}
              </div>
              {paperSplit.map(r => (
                <div key={r.paper.id} className="row clickable" style={{ justifyContent: 'space-between', fontSize: 13, padding: '5px 6px', borderRadius: 'var(--radius-sm)' }}
                  onClick={() => openDrill(r.paper.label, fmtMoney(r.gwp) + ' open GWP · ' + r.n + ' opportunities', open.filter(o => (o.paper || 'syn2454') === r.paper.id))}>
                  <span className="row" style={{ gap: 8 }}><span className="sw" style={{ width: 12, height: 12, borderRadius: 3, background: r.paper.color, display: 'inline-block' }}></span>{r.paper.short}</span>
                  <span style={{ fontWeight: 700, color: 'var(--asr-navy)' }}>{r.pct}% <span style={{ color: 'var(--fg-muted)', fontWeight: 400 }}>· {fmtMoney(r.gwp)} · {r.n}</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {drill && <DrillModal drill={drill} store={store} onClose={() => setDrill(null)} />}
    </div>
  );
}

// ============ DRILL-DOWN MODAL (deeper dive from dashboard tiles/charts) ============
function DrillModal({ drill, store, onClose }) {
  const list = drill.list || [];
  const total = list.reduce((a, o) => a + (o.premium || 0), 0);
  const sorted = [...list].sort((a, b) => (b.premium || 0) - (a.premium || 0));
  const exportCsv = () => {
    downloadCSV('asr-' + drill.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.csv',
      ['Opportunity', 'Insured', 'Class', 'Paper', 'Territory', 'Stage', 'Score', 'Est. GWP (USD)', 'Win %', 'Owner'],
      sorted.map(o => [o.name, o.insured, o.class, paperOf(o.paper).label, o.territory,
        (D().STAGES.find(s => s.id === o.stage) || {}).label, oppScore(o).score, o.premium, o.prob, D().TEAM[o.owner].name]));
    store.notify('Exported ' + sorted.length + ' opportunities to CSV');
  };
  return (
    <Modal title={drill.title} icon="pipeline" wide onClose={onClose}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={exportCsv}><Icon name="download" size={16} /> Export</button>
        <button className="btn btn-primary" onClick={onClose}>Close</button>
      </React.Fragment>}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <span style={{ fontSize: 13, color: 'var(--fg-secondary)' }}>{drill.subtitle}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--asr-navy)' }}>{sorted.length} opportunities · {fmtMoney(total)} GWP</span>
      </div>
      {sorted.length ? (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Opportunity</th><th>Paper</th><th>Stage</th><th style={{ textAlign: 'center' }}>Score</th><th style={{ textAlign: 'right' }}>Est. GWP</th><th>Owner</th></tr></thead>
            <tbody>
              {sorted.map(o => (
                <tr key={o.id} onClick={() => { onClose(); store.openOpp(o.id); }}>
                  <td className="strong">{o.name}<div style={{ fontSize: 11, color: 'var(--fg-muted)', fontWeight: 400 }}>{o.insured} · {o.territory}</div></td>
                  <td><PaperBadge paperId={o.paper} /></td>
                  <td><StageBadge stageId={o.stage} /></td>
                  <td style={{ textAlign: 'center' }}><ScoreBadge o={o} /></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--asr-navy)' }}>{fmtMoney(o.premium)}</td>
                  <td><div className="row"><Avatar id={o.owner} initials={D().TEAM[o.owner].initials} size={26} /><span>{D().TEAM[o.owner].name.split(' ')[0]}</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <div className="empty">No opportunities in this view.</div>}
    </Modal>
  );
}

Object.assign(window, { UnderwriterDash, CuoDash, Donut, BarChart, Stat, DrillModal });
