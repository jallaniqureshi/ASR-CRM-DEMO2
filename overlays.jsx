/* ASR CRM — overlay shells (drawer + modal) */

function Drawer({ title, subtitle, headExtra, children, footer, onClose }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}></div>
      <div className="drawer" role="dialog">
        <div className="drawer-head">
          <button className="close" onClick={onClose}><Icon name="close" size={17} /></button>
          {subtitle && <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.6)', fontWeight: 600, marginBottom: 6 }}>{subtitle}</div>}
          <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.2, paddingRight: 40 }}>{title}</div>
          {headExtra}
        </div>
        <div className="drawer-body">{children}</div>
        {footer && <div className="drawer-foot">{footer}</div>}
      </div>
    </React.Fragment>
  );
}

function Modal({ title, icon, children, footer, onClose, wide }) {
  React.useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);
  return (
    <React.Fragment>
      <div className="scrim" onClick={onClose}></div>
      <div className="modal" style={wide ? { width: 860 } : null} role="dialog">
        <div className="modal-head">
          {icon && <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--asr-navy-10)', display: 'grid', placeItems: 'center', color: 'var(--asr-navy)' }}><Icon name={icon} /></div>}
          <h2>{title}</h2>
          <button className="close" onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </React.Fragment>
  );
}

// Toast
function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 60,
      background: 'var(--asr-navy)', color: '#fff', padding: '13px 22px', borderRadius: 'var(--radius-full)',
      boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600,
      animation: 'pop .25s' }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#1F8A5B', display: 'grid', placeItems: 'center' }}>
        <Icon name="check" size={14} />
      </span>
      {msg}
    </div>
  );
}

// ---------- Dropdown menu (Quick add) ----------
function QuickAdd({ store, open, setOpen }) {
  const items = [
    { icon: 'target', label: 'New opportunity', fn: () => store.openNewOpp() },
    { icon: 'contacts', label: 'New contact', fn: () => store.openNewContact() },
    { icon: 'note', label: 'Log activity', fn: () => store.openActivityFor(null) },
    { icon: 'userplus', label: 'Assign action', fn: () => store.openNewAction() },
    { icon: 'bug', label: 'Report an issue', fn: () => store.openReportIssue() },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <button className="btn btn-primary" onClick={() => setOpen(o => !o)}><Icon name="plus" size={17} /> Quick add</button>
      {open && <React.Fragment>
        <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setOpen(false)}></div>
        <div className="popover" style={{ right: 0, width: 232 }}>
          {items.map(it => (
            <button key={it.label} className="pop-item" onClick={() => { setOpen(false); it.fn(); }}>
              <span className="pop-ic"><Icon name={it.icon} size={16} /></span>{it.label}
            </button>
          ))}
        </div>
      </React.Fragment>}
    </div>
  );
}

// ---------- Notifications bell ----------
function NotificationsBell({ store, open, setOpen }) {
  const today = new Date('2026-05-23');
  const myTasks = store.tasks.filter(t => t.assignee === store.meId && !t.done)
    .sort((a, b) => new Date(a.due || '2100') - new Date(b.due || '2100'));
  const recent = store.activities.slice(0, 3);
  const count = myTasks.length;
  return (
    <div style={{ position: 'relative' }}>
      <button className="icon-btn" onClick={() => setOpen(o => !o)} style={{ position: 'relative' }}>
        <Icon name="bell" />
        {count > 0 && <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, padding: '0 4px', borderRadius: 9, background: '#C0392B', color: '#fff', fontSize: 11, fontWeight: 700, display: 'grid', placeItems: 'center', border: '2px solid #fff' }}>{count}</span>}
      </button>
      {open && <React.Fragment>
        <div style={{ position: 'fixed', inset: 0, zIndex: 30 }} onClick={() => setOpen(false)}></div>
        <div className="popover" style={{ right: 0, width: 340, padding: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--asr-navy)' }}>Notifications</div>
          <div style={{ maxHeight: 420, overflowY: 'auto' }}>
            {myTasks.length > 0 && <div className="pop-sec">Actions assigned to you</div>}
            {myTasks.map(t => {
              const by = window.userOf(t.assignedBy);
              const overdue = t.due && new Date(t.due) < today;
              return (
                <button key={t.id} className="pop-row" onClick={() => { setOpen(false); store.go('actions'); }}>
                  <span className="pop-ic" style={{ background: overdue ? '#FBE9E7' : 'var(--asr-navy-10)', color: overdue ? '#C0392B' : 'var(--asr-navy)' }}><Icon name="check" size={15} /></span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--asr-navy)' }}>{t.title}</span>
                    <span style={{ display: 'block', fontSize: 11, color: overdue ? '#C0392B' : 'var(--fg-muted)' }}>from {by.name.split(' ')[0]} · {overdue ? 'overdue ' : 'due '}{fmtDate(t.due)}</span>
                  </span>
                </button>
              );
            })}
            <div className="pop-sec">Recent activity</div>
            {recent.map(a => (
              <button key={a.id} className="pop-row" onClick={() => { setOpen(false); store.go('activity'); }}>
                <span className="pop-ic"><Icon name="activity" size={15} /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--asr-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</span>
                  <span style={{ display: 'block', fontSize: 11, color: 'var(--fg-muted)' }}>{a.type} · {relDate(a.date)}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </React.Fragment>}
    </div>
  );
}

// ---------- Global relevance search ----------
function GlobalSearch({ store, query, setQuery }) {
  const [focus, setFocus] = React.useState(false);
  const wrap = React.useRef(null);
  const q = (query || '').trim().toLowerCase();

  let oppHits = [], contactHits = [];
  if (q) {
    oppHits = store.opps.filter(o => !o.archived && (o.name + ' ' + o.insured + ' ' + o.territory + ' ' + o.class).toLowerCase().includes(q)).slice(0, 5);
    contactHits = store.contacts.filter(c => !c.archived && (c.name + ' ' + c.company + ' ' + c.location).toLowerCase().includes(q)).slice(0, 4);
  }
  const hasHits = oppHits.length || contactHits.length;

  React.useEffect(() => {
    const h = e => { if (wrap.current && !wrap.current.contains(e.target)) setFocus(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="search" ref={wrap} style={{ position: 'relative' }}>
      <Icon name="search" />
      <input value={query} onFocus={() => setFocus(true)} onChange={e => { setQuery(e.target.value); setFocus(true); }}
        placeholder="Search opportunities, contacts, territories…" />
      {focus && q && (
        <div className="popover" style={{ left: 0, right: 0, top: 'calc(100% + 8px)', maxHeight: 460, overflowY: 'auto', padding: 0 }}>
          {!hasHits && <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--fg-muted)', textAlign: 'center' }}>No matches for “{query}”.</div>}
          {oppHits.length > 0 && <div className="pop-sec">Opportunities</div>}
          {oppHits.map(o => (
            <button key={o.id} className="pop-row" onClick={() => { setFocus(false); store.openOpp(o.id); }}>
              <span className="pop-ic"><Icon name="target" size={15} /></span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--asr-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--fg-muted)' }}>{o.insured} · {o.territory} · {fmtMoney(o.premium)}</span>
              </span>
              <StageBadge stageId={o.stage} />
            </button>
          ))}
          {contactHits.length > 0 && <div className="pop-sec">Contacts & accounts</div>}
          {contactHits.map(c => (
            <button key={c.id} className="pop-row" onClick={() => { setFocus(false); store.openContact(c.id); }}>
              <Avatar id={c.id} initials={c.name.split(' ').map(n => n[0]).join('')} size={30} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--asr-navy)' }}>{c.name}</span>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--fg-muted)' }}>{c.title} · {c.company}</span>
              </span>
              <span className="tag">{c.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- About this demo ----------
function AboutModal({ store, onClose }) {
  const dismiss = () => { try { localStorage.setItem('asr_crm_seen_v2', '1'); } catch (e) {} onClose(); };
  const roles = [
    ['Underwriter', 'Day-to-day pipeline, contacts, activity & actions'],
    ['Chief Underwriting Officer', 'Portfolio “state of nation” dashboards'],
    ['UW Assistant / Admin', 'Edit, archive & run reports'],
    ['System Admin', 'Users, deletions, bug & issue triage'],
  ];
  return (
    <Modal title="Welcome to the ASR CRM demo" icon="shield" onClose={dismiss}
      footer={<React.Fragment>
        <button className="btn btn-ghost" onClick={() => { store.resetDemo(); }}><Icon name="refresh" size={15} /> Reset demo data</button>
        <button className="btn btn-primary" onClick={dismiss}>Explore the demo</button>
      </React.Fragment>}>
      <p style={{ margin: '0 0 16px', color: 'var(--fg-secondary)', fontSize: 14, lineHeight: 1.6 }}>
        A working prototype of a relationship & pipeline management system for <strong>Africa Specialty Risks</strong> — built around Lloyd’s Syndicate 2454 and ASR’s Bermuda paper. Everything here is interactive and uses illustrative sample data.
      </p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--asr-navy-10)', borderRadius: 10, padding: '12px 16px', marginBottom: 18 }}>
        <Icon name="info" size={18} color="var(--asr-navy)" style={{ flex: 'none', marginTop: 1 }} />
        <span style={{ fontSize: 13, color: 'var(--fg-secondary)', lineHeight: 1.5 }}>
          Use <strong>Viewing as</strong> in the bottom-left to switch between roles and see how the experience changes. Your edits are saved in this browser — reset any time from here.
        </span>
      </div>
      <div className="section-title">The four roles</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {roles.map(([r, d]) => (
          <div key={r} className="card card-pad" style={{ padding: '12px 14px' }}>
            <div style={{ fontWeight: 700, color: 'var(--asr-navy)', fontSize: 13 }}>{r}</div>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)', marginTop: 3, lineHeight: 1.45 }}>{d}</div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

Object.assign(window, { Drawer, Modal, Toast, QuickAdd, NotificationsBell, GlobalSearch, AboutModal });
