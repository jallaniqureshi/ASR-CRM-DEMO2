/* ASR CRM — main application */
const { useState, useEffect, useCallback, useRef } = React;

const ROLE_DEFAULT = { underwriter: 'gen', cuo: 'eric', admin: 'james', sysadmin: 'saverio' };

const ROUTE_TITLES = {
  dashboard: 'Dashboard',
  pipeline: 'Pipeline',
  contacts: 'Contacts & Accounts',
  activity: 'Activity',
  actions: 'Actions',
  reports: 'Reports & Insight',
  admin: 'Admin Console',
};

function App() {
  const [route, setRoute] = useState('dashboard');
  const [role, setRole] = useState('underwriter'); // underwriter | cuo | admin
  const [query, setQuery] = useState('');
  const [navOpen, setNavOpen] = useState(false);

  // ---- store (hydrate from saved demo state if present) ----
  const persisted = (typeof window.ASR_PERSIST !== 'undefined') ? window.ASR_PERSIST.load() : null;
  if (persisted && persisted.team) { window.ASR_DATA.TEAM = persisted.team; }
  const seed = (key) => window.ASR_DATA[key].map(x => ({ ...x }));
  const [opps, setOpps] = useState(() => persisted && persisted.opps ? persisted.opps : seed('OPPS'));
  const [contacts, setContacts] = useState(() => persisted && persisted.contacts ? persisted.contacts : seed('CONTACTS'));
  const [activities, setActivities] = useState(() => persisted && persisted.activities ? persisted.activities : seed('ACTIVITIES'));
  const [tasks, setTasks] = useState(() => persisted && persisted.tasks ? persisted.tasks : seed('TASKS'));
  const [issues, setIssues] = useState(() => persisted && persisted.issues ? persisted.issues : seed('ISSUES'));

  // ---- overlays ----
  const [oppId, setOppId] = useState(null);
  const [contactId, setContactId] = useState(null);
  const [noteFor, setNoteFor] = useState(undefined); // undefined=closed, null/obj=open
  const [newContact, setNewContact] = useState(false);
  const [newOpp, setNewOpp] = useState(false);
  const [newAction, setNewAction] = useState(false);
  const [reportIssue, setReportIssue] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userTick, setUserTick] = useState(0);
  const [toast, setToast] = useState('');
  const [aboutOpen, setAboutOpen] = useState(() => {
    try { return !localStorage.getItem('asr_crm_seen_v2'); } catch (e) { return false; }
  });

  let meId = ROLE_DEFAULT[role];
  if (!window.ASR_DATA.TEAM[meId]) { const f = Object.values(window.ASR_DATA.TEAM).find(u => u.roleType === role); meId = f ? f.id : Object.keys(window.ASR_DATA.TEAM)[0]; }
  const meUser = window.userOf(meId);
  const canArchive = role === 'admin' || role === 'sysadmin';
  const canDelete = role === 'sysadmin';

  const notify = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); }, []);

  // Persist demo edits so shared visitors keep their changes across refreshes
  useEffect(() => {
    if (typeof window.ASR_PERSIST === 'undefined') return;
    window.ASR_PERSIST.save({ opps, contacts, activities, tasks, issues, team: window.ASR_DATA.TEAM });
  }, [opps, contacts, activities, tasks, issues, userTick]);

  const resetDemo = () => {
    if (!confirm('Reset the demo to its original sample data? Any changes you have made will be cleared.')) return;
    if (typeof window.ASR_PERSIST !== 'undefined') window.ASR_PERSIST.clear();
    try { localStorage.removeItem('asr_crm_seen_v2'); } catch (e) {}
    window.location.reload();
  };

  const moveOpp = (id, stage) => {
    setOpps(prev => prev.map(o => o.id === id ? { ...o, stage, updated: '2026-05-23', prob: stage === 'bound' ? 100 : o.prob } : o));
    const s = window.ASR_DATA.STAGES.find(x => x.id === stage);
    notify('Moved to ' + s.label);
  };
  const addOpp = (o) => { const id = 'o' + Date.now(); setOpps(prev => [{ ...o, id }, ...prev]); notify('Opportunity created'); };
  const convertOpp = (id, ref, paper) => {
    setOpps(prev => prev.map(o => o.id === id ? { ...o, stage: 'bound', prob: 100, converted: true, riskRef: ref, paper: paper || o.paper } : o));
    setActivities(prev => [{ id: 'a' + Date.now(), type: 'Note', title: 'Converted to risk · ' + ref, opp: id, contact: (opps.find(o => o.id === id) || {}).contact, author: meId, date: '2026-05-23T12:00', body: 'Opportunity bound and transferred to Navigator (NAV PAS). Risk reference ' + ref + ' queued for processing.' }, ...prev]);
    notify('Risk created · ' + ref);
  };
  const setPaper = (id, paper) => { setOpps(prev => prev.map(o => o.id === id ? { ...o, paper } : o)); notify('Paper set · ' + (window.ASR_DATA.PAPER_OF[paper] || {}).short); };
  const addContact = (c) => { const id = 'c' + Date.now(); setContacts(prev => [{ ...c, id }, ...prev]); notify('Contact added'); };
  const addActivity = (a) => { setActivities(prev => [{ ...a, id: 'a' + Date.now() }, ...prev]); notify('Activity logged'); };
  const reassignOpp = (id, owner) => { setOpps(prev => prev.map(o => o.id === id ? { ...o, owner } : o)); notify('Reassigned to ' + window.ASR_DATA.TEAM[owner].name.split(' ')[0]); };
  const archiveOpp = (id, val) => { setOpps(prev => prev.map(o => o.id === id ? { ...o, archived: val } : o)); notify(val ? 'Opportunity archived' : 'Opportunity restored'); };
  const deleteOpp = (id) => { setOpps(prev => prev.filter(o => o.id !== id)); notify('Opportunity deleted'); };
  const archiveContact = (id, val) => { setContacts(prev => prev.map(c => c.id === id ? { ...c, archived: val } : c)); notify(val ? 'Contact archived' : 'Contact restored'); };
  const deleteContact = (id) => { setContacts(prev => prev.filter(c => c.id !== id)); notify('Contact deleted'); };
  const addTask = (t) => { setTasks(prev => [{ ...t, id: 't' + Date.now() }, ...prev]); notify('Action assigned to ' + window.ASR_DATA.TEAM[t.assignee].name.split(' ')[0]); };
  const toggleTask = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addIssue = (i) => { setIssues(prev => [{ ...i, id: 'i' + Date.now() }, ...prev]); notify('Issue logged'); };
  const updateIssue = (id, patch) => setIssues(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
  const addUser = (u) => { const id = 'u' + Date.now(); window.ASR_DATA.TEAM[id] = { ...u, id }; setUserTick(t => t + 1); notify('User created · ' + u.name); };
  const updateUser = (id, patch) => { window.ASR_DATA.TEAM[id] = { ...window.ASR_DATA.TEAM[id], ...patch }; setUserTick(t => t + 1); notify('User updated'); };
  const removeUser = (id) => {
    const remaining = Object.values(window.ASR_DATA.TEAM).filter(u => u.id !== id);
    const fb = (remaining.find(u => u.roleType === 'cuo') || remaining[0] || {}).id;
    delete window.ASR_DATA.TEAM[id];
    if (fb) {
      setOpps(prev => prev.map(o => o.owner === id ? { ...o, owner: fb } : o));
      setContacts(prev => prev.map(c => c.owner === id ? { ...c, owner: fb } : c));
      setTasks(prev => prev.map(t => ({ ...t, assignee: t.assignee === id ? fb : t.assignee, assignedBy: t.assignedBy === id ? fb : t.assignedBy })));
      setIssues(prev => prev.map(i => ({ ...i, reporter: i.reporter === id ? fb : i.reporter, assignee: i.assignee === id ? fb : i.assignee })));
    }
    setUserTick(t => t + 1); notify('User removed');
  };

  const store = {
    opps, contacts, activities, tasks, issues, meId, meUser, role, query, canArchive, canDelete,
    moveOpp, addOpp, convertOpp, setPaper, addContact, addActivity, notify, resetDemo,
    reassignOpp, archiveOpp, deleteOpp, archiveContact, deleteContact,
    addTask, toggleTask, addIssue, updateIssue, addUser, updateUser, removeUser,
    go: (r) => { setRoute(r); setNavOpen(false); },
    openOpp: (id) => { setContactId(null); setOppId(id); },
    openContact: (id) => { setOppId(null); setContactId(id); },
    openActivityFor: (preset) => setNoteFor(preset),
    openNewContact: () => setNewContact(true),
    openNewOpp: () => setNewOpp(true),
    openNewAction: () => setNewAction(true),
    openReportIssue: () => setReportIssue(true),
    openAbout: () => setAboutOpen(true),
  };

  // counts for nav
  const counts = {
    pipeline: opps.filter(o => o.stage !== 'bound' && !o.archived).length,
    contacts: contacts.filter(c => !c.archived).length,
    actions: tasks.filter(t => t.assignee === meId && !t.done).length,
    issues: issues.filter(i => i.status !== 'Resolved').length,
  };

  useEffect(() => { setQuery(''); }, [route]);

  const ScreenMap = {
    dashboard: role === 'cuo' ? <CuoDash store={store} /> : <UnderwriterDash store={store} />,
    pipeline: <Pipeline store={store} />,
    contacts: <Contacts store={store} />,
    activity: <Activity store={store} />,
    actions: <Actions store={store} />,
    reports: <Reports store={store} />,
    admin: <AdminConsole store={store} />,
  };
  const activeRoute = (route === 'admin' && role !== 'sysadmin') ? 'dashboard' : route;

  return (
    <div className={'app' + (navOpen ? ' nav-open' : '')}>
      <Sidebar route={activeRoute} role={role} meUser={meUser} setRole={(r) => { setRole(r); if (r === 'cuo') setRoute('dashboard'); else if (r === 'sysadmin') setRoute('admin'); else if (route === 'admin') setRoute('dashboard'); }}
        counts={counts} onNavClick={store.go} />
      {navOpen && <div className="scrim" style={{ zIndex: 49 }} onClick={() => setNavOpen(false)}></div>}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setNavOpen(v => !v)}><Icon name="menu" /></button>
          <div>
            <div className="crumb">{role === 'cuo' ? 'Chief Underwriting Officer' : role === 'admin' ? 'Underwriting Operations' : role === 'sysadmin' ? 'System Administration' : 'Underwriting'}</div>
            <h1>{ROUTE_TITLES[activeRoute]}</h1>
          </div>
          <GlobalSearch store={store} query={query} setQuery={setQuery} />
          <button className="icon-btn" title="About this demo" onClick={() => setAboutOpen(true)}><Icon name="info" /></button>
          <button className="icon-btn" title="Report an issue" onClick={() => setReportIssue(true)}><Icon name="bug" /></button>
          <NotificationsBell store={store} open={notifOpen} setOpen={setNotifOpen} />
          <QuickAdd store={store} open={qaOpen} setOpen={setQaOpen} />
        </header>

        {ScreenMap[activeRoute]}
      </div>

      {oppId && <OpportunityDrawer id={oppId} store={store} onClose={() => setOppId(null)} />}
      {contactId && <ContactDrawer id={contactId} store={store} onClose={() => setContactId(null)} />}
      {noteFor !== undefined && <AddNoteModal store={store} preset={noteFor} onClose={() => setNoteFor(undefined)} />}
      {newContact && <NewContactModal store={store} onClose={() => setNewContact(false)} />}
      {newOpp && <NewOpportunityModal store={store} onClose={() => setNewOpp(false)} />}
      {newAction && <AssignActionModal store={store} onClose={() => setNewAction(false)} />}
      {reportIssue && <ReportIssueModal store={store} onClose={() => setReportIssue(false)} />}
      {aboutOpen && <AboutModal store={store} onClose={() => setAboutOpen(false)} />}
      <Toast msg={toast} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
