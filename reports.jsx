/* ASR CRM — Reports & dashboards + Power BI handoff */

function Reports({ store }) {
  const opps = store.opps.filter(o => !o.archived);
  const bound = opps.filter(o => o.stage === 'bound');
  const lost = []; // illustrative
  const PALETTE = ['#240B60', '#4A4F8D', '#3BA4C8', '#E6AA00', '#7A60A0', '#1F8A5B', '#8B9FB7'];

  // GWP by class (all)
  const byClass = {};
  opps.forEach(o => byClass[o.class] = (byClass[o.class] || 0) + o.premium);
  const classRows = Object.entries(byClass).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({ label: label.replace(' & Trade Credit', '').replace(' & Engineering', ''), value, color: PALETTE[i % PALETTE.length] }));

  // conversion by stage (counts)
  const funnel = D().STAGES.map(s => ({ label: s.label, value: opps.filter(o => o.stage === s.id).length, color: s.color }));

  // broker activity
  const byBroker = {};
  opps.forEach(o => { const c = D().NAMES[o.contact]; if (!c) return; byBroker[c.company] = byBroker[c.company] || { gwp: 0, n: 0 }; byBroker[c.company].gwp += o.premium; byBroker[c.company].n++; });
  const brokerRows = Object.entries(byBroker).sort((a, b) => b[1].gwp - a[1].gwp).slice(0, 7);

  // underwriter leaderboard
  const byUw = {};
  opps.forEach(o => { byUw[o.owner] = byUw[o.owner] || { gwp: 0, n: 0, bound: 0 }; byUw[o.owner].gwp += o.premium; byUw[o.owner].n++; if (o.stage === 'bound') byUw[o.owner].bound += o.premium; });
  const uwRows = Object.entries(byUw).sort((a, b) => b[1].gwp - a[1].gwp);

  // GWP by underwriting platform / paper
  const totalGwp = opps.reduce((a, o) => a + o.premium, 0) || 1;
  const paperRows = D().PAPERS.map(p => {
    const list = opps.filter(o => (o.paper || 'syn2454') === p.id);
    return { paper: p, gwp: list.reduce((a, o) => a + o.premium, 0), n: list.length, bound: list.filter(o => o.stage === 'bound').reduce((a, o) => a + o.premium, 0) };
  });

  return (
    <div className="content">
      {/* Power BI banner */}
      <div className="card" style={{ background: 'linear-gradient(105deg, var(--asr-navy), #3a1d7a)', color: '#fff', marginBottom: 'var(--space-6)', border: 'none' }}>
        <div className="card-pad row" style={{ gap: 'var(--space-5)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 12, background: 'rgba(255,255,255,.12)', display: 'grid', placeItems: 'center', flex: 'none' }}>
            <Icon name="reports" size={26} color="var(--asr-gold)" />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.15rem' }}>Need deeper analysis?</h3>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,.75)', fontSize: 14 }}>These dashboards cover day-to-day reporting. Live exposure, accumulation and capital views run in Microsoft Power BI on the ASR data warehouse.</p>
          </div>
          <button className="btn btn-gold" onClick={() => store.notify('Opening ASR Power BI workspace…')}><Icon name="external" size={16} /> Open in Power BI</button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <Stat k="Total pipeline GWP" v={fmtMoney(opps.reduce((a, o) => a + o.premium, 0))} accent="var(--asr-navy)" />
        <Stat k="Bound GWP" v={fmtMoney(bound.reduce((a, o) => a + o.premium, 0))} accent="#1F8A5B" />
        <Stat k="Avg. line size" v={Math.round(opps.reduce((a, o) => a + o.share, 0) / opps.length) + '%'} accent="var(--asr-gold)" />
        <Stat k="Active opportunities" v={opps.length} accent="var(--asr-sky)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-head"><h3>GWP by class of business</h3></div>
          <div className="card-pad"><BarChart rows={classRows} fmt={fmtMoney} /></div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Conversion funnel</h3><span className="sub">Opportunities by stage</span></div>
          <div className="card-pad"><BarChart rows={funnel} fmt={v => v + ' opps'} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-head"><h3>GWP by underwriting platform</h3><span className="sub">Lloyd’s vs Bermudian paper</span></div>
        <div className="card-pad">
          <div className="row" style={{ height: 26, borderRadius: 'var(--radius-sm)', overflow: 'hidden', gap: 0, marginBottom: 18 }}>
            {paperRows.map(r => r.gwp > 0 && (
              <div key={r.paper.id} title={r.paper.label + ' · ' + fmtMoney(r.gwp)}
                style={{ width: (r.gwp / totalGwp * 100) + '%', background: r.paper.color, color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', minWidth: 40 }}>
                {Math.round(r.gwp / totalGwp * 100)}%
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + paperRows.length + ', 1fr)', gap: 'var(--space-5)' }}>
            {paperRows.map(r => (
              <div key={r.paper.id} style={{ borderLeft: '3px solid ' + r.paper.color, paddingLeft: 14 }}>
                <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                  <Icon name={r.paper.icon} size={16} color={r.paper.color} />
                  <span style={{ fontWeight: 700, color: 'var(--asr-navy)', fontSize: 14 }}>{r.paper.label}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--fg-muted)', marginBottom: 10 }}>{r.paper.platform} · {r.paper.rating}</div>
                <div className="row" style={{ gap: 24 }}>
                  <div><div style={{ fontSize: 22, fontWeight: 900, color: 'var(--asr-navy)', fontFamily: 'var(--font-display)' }}>{fmtMoney(r.gwp)}</div><div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>pipeline GWP</div></div>
                  <div><div style={{ fontSize: 22, fontWeight: 900, color: '#1F8A5B', fontFamily: 'var(--font-display)' }}>{r.bound ? fmtMoney(r.bound) : '—'}</div><div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>bound</div></div>
                  <div><div style={{ fontSize: 22, fontWeight: 900, color: 'var(--asr-purple-mid)', fontFamily: 'var(--font-display)' }}>{r.n}</div><div style={{ fontSize: 11, color: 'var(--fg-muted)' }}>opps</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-head"><h3>Top brokers & coverholders</h3><span className="sub">By pipeline GWP</span></div>
          <div className="tbl-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="tbl">
              <thead><tr><th>Distribution partner</th><th style={{ textAlign: 'right' }}>Opps</th><th style={{ textAlign: 'right' }}>GWP</th></tr></thead>
              <tbody>
                {brokerRows.map(([name, d]) => (
                  <tr key={name}><td className="strong">{name}</td><td style={{ textAlign: 'right' }}>{d.n}</td><td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--asr-navy)' }}>{fmtMoney(d.gwp)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head"><h3>Underwriter activity</h3><span className="sub">Pipeline ownership</span></div>
          <div className="tbl-wrap" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="tbl">
              <thead><tr><th>Underwriter</th><th style={{ textAlign: 'right' }}>Opps</th><th style={{ textAlign: 'right' }}>Pipeline</th><th style={{ textAlign: 'right' }}>Bound</th></tr></thead>
              <tbody>
                {uwRows.map(([id, d]) => {
                  const u = D().TEAM[id];
                  return (
                    <tr key={id}>
                      <td><div className="row"><Avatar id={id} initials={u.initials} size={28} /><span className="strong">{u.name}</span></div></td>
                      <td style={{ textAlign: 'right' }}>{d.n}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--asr-navy)' }}>{fmtMoney(d.gwp)}</td>
                      <td style={{ textAlign: 'right', color: '#1F8A5B', fontWeight: 700 }}>{d.bound ? fmtMoney(d.bound) : '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Reports });
