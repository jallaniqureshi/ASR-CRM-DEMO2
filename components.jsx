/* ASR CRM — shared UI components */

// ---------- Icons (stroke, 24 viewbox) ----------
const ICON_PATHS = {
  dashboard: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
  pipeline: 'M3 6h18M3 12h12M3 18h6',
  contacts: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  reports: 'M3 3v18h18M7 16l4-4 3 3 5-6',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.35-4.35',
  plus: 'M12 5v14M5 12h14',
  close: 'M18 6 6 18M6 6l12 12',
  chevron: 'M6 9l6 6 6-6',
  chevronr: 'M9 6l6 6-6 6',
  bell: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  pin: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0zM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  phone: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',
  note: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  meeting: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  arrowr: 'M5 12h14M12 5l7 7-7 7',
  check: 'M20 6 9 17l-5-5',
  edit: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  archive: 'M21 8v13H3V8M1 3h22v5H1zM10 12h4',
  convert: 'M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7',
  filter: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z',
  building: 'M3 21h18M5 21V7l8-4v18M19 21V11l-6-3M9 9v.01M9 12v.01M9 15v.01M9 18v.01',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  target: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  trophy: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z',
  layers: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  doc: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  external: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3',
  menu: 'M3 12h18M3 6h18M3 18h18',
  dots: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  flame: 'M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z',
  link: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  trash: 'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14M10 11v6M14 11v6',
  bug: 'M8 2l1.88 1.88M14.12 3.88 16 2M9 7.13v-1a3.003 3.003 0 1 1 6 0v1M12 20a6 6 0 0 0 6-6v-3a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v3a6 6 0 0 0 6 6zM12 20v-9M6.53 9C4.6 8.8 3 7.1 3 5M6 13H2M3 21c0-2.1 1.7-3.9 3.8-4M20.97 5c0 2.1-1.6 3.8-3.5 4M22 13h-4M17.2 17c2.1.1 3.8 1.9 3.8 4',
  userplus: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6',
  restore: 'M3 7v6h6M3 13a9 9 0 1 0 3-7.7L3 8',
  flag: 'M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7',
  download: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3',
  sort: 'M3 6h18M6 12h12M10 18h4',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  refresh: 'M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15',
  spark: 'M12 3l1.9 5.8L20 10.7l-5.1 3.5L16.2 20 12 16.3 7.8 20l1.3-5.8L4 10.7l6.1-1.9z',
  scale: 'M3 6h18M7 6l-3 7a3.5 3.5 0 0 0 6 0L7 6zm10 0l-3 7a3.5 3.5 0 0 0 6 0l-3-7zM12 3v18M8 21h8',
};
function Icon({ name, size = 20, color, style, strokeWidth = 2 }) {
  const d = ICON_PATHS[name] || '';
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none"
      stroke={color || 'currentColor'} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}

// ---------- Avatar ----------
const AV_COLORS = ['#240B60','#4A4F8D','#3BA4C8','#E6AA00','#7A60A0','#1F8A5B','#C0392B','#0E7C86'];
function Avatar({ id, initials, size = 34 }) {
  let h = 0; const s = id || initials || '?';
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % AV_COLORS.length;
  const bg = AV_COLORS[h];
  return (
    <div className="avatar" style={{ width: size, height: size, background: bg, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

// ---------- Stage badge ----------
function StageBadge({ stageId }) {
  const s = window.ASR_DATA.STAGES.find(x => x.id === stageId);
  if (!s) return null;
  return (
    <span className="badge" style={{ background: s.color + '1F', color: s.color }}>
      <span className="pip" style={{ background: s.color }}></span>{s.label}
    </span>
  );
}

// ---------- Underwriting paper / platform badge ----------
function paperOf(id) { return (window.ASR_DATA.PAPER_OF || {})[id] || window.ASR_DATA.PAPERS[0]; }
function PaperBadge({ paperId, size = 'sm' }) {
  const p = paperOf(paperId);
  if (!p) return null;
  return (
    <span className="badge" title={p.platform} style={{ background: p.color + '17', color: p.color, fontWeight: 700 }}>
      <Icon name={p.icon} size={size === 'lg' ? 14 : 12} /> {p.short}
    </span>
  );
}

// ---------- Opportunity score (Einstein / predictive-style grade) ----------
function oppScore(o) {
  const now = new Date('2026-05-23T12:00');
  let s = 0;
  s += (o.prob || 0) * 0.45;                                   // intent — up to 45
  s += Math.min((o.premium || 0) / 4e6, 1) * 22;              // deal size — up to 22
  const si = window.ASR_DATA.STAGES.findIndex(x => x.id === o.stage);
  s += (si / (window.ASR_DATA.STAGES.length - 1)) * 18;       // progression — up to 18
  const days = Math.max(0, (now - new Date(o.updated || o.created || now)) / 86400000);
  s += days < 7 ? 15 : days < 21 ? 8 : days < 45 ? 3 : 0;     // freshness — up to 15
  s = Math.round(Math.max(0, Math.min(100, s)));
  const grade = s >= 75 ? 'A' : s >= 58 ? 'B' : s >= 40 ? 'C' : 'D';
  const color = grade === 'A' ? '#1F8A5B' : grade === 'B' ? '#3BA4C8' : grade === 'C' ? '#E6AA00' : '#8B9FB7';
  const label = grade === 'A' ? 'Strong — prioritise' : grade === 'B' ? 'Promising' : grade === 'C' ? 'Developing' : 'Watch / nurture';
  return { score: s, grade, color, label };
}
function ScoreBadge({ o, withScore }) {
  const { grade, color, score } = oppScore(o);
  return (
    <span className="badge" title={'ASR opportunity score ' + score + '/100'} style={{ background: color + '1F', color, fontWeight: 800, paddingInline: 9 }}>
      <Icon name="spark" size={11} /> {grade}{withScore ? ' · ' + score : ''}
    </span>
  );
}

// ---------- CSV export ----------
function downloadCSV(filename, headers, rows) {
  const esc = v => { const s = (v == null ? '' : String(v)); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const csv = [headers.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ---------- Money formatting ----------
function fmtMoney(n, opts = {}) {
  if (n == null) return '—';
  const abs = Math.abs(n);
  if (opts.compact !== false && abs >= 1e6) return '$' + (n / 1e6).toFixed(abs >= 1e7 ? 0 : 2).replace(/\.00$/, '') + 'm';
  if (opts.compact !== false && abs >= 1e3) return '$' + Math.round(n / 1e3) + 'k';
  return '$' + n.toLocaleString('en-US');
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function relDate(iso) {
  const d = new Date(iso), now = new Date('2026-05-23T12:00');
  const days = Math.round((now - d) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 30) return Math.round(days / 7) + 'w ago';
  return Math.round(days / 30) + 'mo ago';
}

// ---------- Sidebar ----------
function Sidebar({ route, setRole, role, meUser, counts, onNavClick }) {
  const u = meUser;
  const nav = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'pipeline', label: 'Pipeline', icon: 'pipeline', count: counts.pipeline },
    { id: 'contacts', label: 'Contacts & Accounts', icon: 'contacts', count: counts.contacts },
    { id: 'activity', label: 'Activity', icon: 'activity' },
    { id: 'actions', label: 'Actions', icon: 'check', count: counts.actions },
  ];
  const tools = [
    { id: 'reports', label: 'Reports', icon: 'reports' },
  ];
  if (role === 'sysadmin') tools.push({ id: 'admin', label: 'Admin Console', icon: 'shield', count: counts.issues });
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <img src={window.ASR_LOGO} alt="Africa Specialty Risks" />
      </div>
      <div className="sb-syndicate">
        <span className="dot"></span>
        <div>
          <div className="label">Syndicate</div>
          <div className="val">2454 · Lloyd's</div>
        </div>
      </div>
      <nav className="sb-nav">
        <div className="group-label">Workspace</div>
        {nav.map(n => (
          <button key={n.id} className={'nav-item' + (route === n.id ? ' active' : '')} onClick={() => onNavClick(n.id)}>
            <Icon name={n.icon} /> {n.label}
            {n.count != null && <span className="count">{n.count}</span>}
          </button>
        ))}
        <div className="group-label">Insight</div>
        {tools.map(n => (
          <button key={n.id} className={'nav-item' + (route === n.id ? ' active' : '')} onClick={() => onNavClick(n.id)}>
            <Icon name={n.icon} /> {n.label}
          </button>
        ))}
      </nav>
      <div className="sb-foot">
        <div className="role-switch">
          <span className="rs-label">Viewing as</span>
          <select value={role} onChange={e => setRole(e.target.value)}
            style={{ background: 'rgba(255,255,255,.08)', color: '#fff', border: '1px solid rgba(255,255,255,.16)', borderRadius: 8, height: 38, padding: '0 10px', fontSize: 13, fontWeight: 600 }}>
            <option value="underwriter" style={{ color: '#240B60' }}>Underwriter</option>
            <option value="cuo" style={{ color: '#240B60' }}>Chief Underwriting Officer</option>
            <option value="admin" style={{ color: '#240B60' }}>UW Assistant / Admin</option>
            <option value="sysadmin" style={{ color: '#240B60' }}>System Admin</option>
          </select>
          <div className="user-chip" style={{ marginTop: 4 }}>
            <Avatar id={u.id} initials={u.initials} size={36} />
            <div className="meta">
              <div className="nm">{u.name}</div>
              <div className="rl">{u.role}</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Icon, Avatar, StageBadge, PaperBadge, paperOf, oppScore, ScoreBadge, downloadCSV, fmtMoney, fmtDate, relDate, Sidebar });
