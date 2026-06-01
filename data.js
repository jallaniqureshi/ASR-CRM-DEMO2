/* ASR CRM — sample data
   Plausible Africa Specialty Risks domain: Lloyd's Syndicate 2454,
   distribution via London brokers + service-company coverholders,
   classes incl. Political Risk & Trade Credit, Energy, Property, etc.
   All data is illustrative.
*/
(function () {
  // ---- ASR people (underwriters & leadership) ----
  const TEAM = {
    eric:    { id: 'eric',    name: 'Eric Malterre',     initials: 'EM', role: 'Chief Underwriting Officer', team: 'Executive',                 roleType: 'cuo' },
    martin:  { id: 'martin',  name: 'Martin Boreham',    initials: 'MB', role: 'Active Underwriter',          team: 'Underwriting',              roleType: 'underwriter' },
    gen:     { id: 'gen',     name: 'Genevieve Ahinful',  initials: 'GA', role: 'Head of PRT · Deputy AU',     team: 'Political Risk & Trade',    roleType: 'underwriter' },
    suzan:   { id: 'suzan',   name: 'Suzan Pardesi',      initials: 'SP', role: 'Head of Energy · Deputy AU',  team: 'Energy',                    roleType: 'underwriter' },
    david:   { id: 'david',   name: 'David Okonkwo',      initials: 'DO', role: 'Senior Underwriter',          team: 'Property & Engineering',    roleType: 'underwriter' },
    amara:   { id: 'amara',   name: 'Amara Diallo',       initials: 'AD', role: 'Underwriter',                 team: 'Political Risk & Trade',    roleType: 'underwriter' },
    leila:   { id: 'leila',   name: 'Leila Haddad',       initials: 'LH', role: 'Underwriter',                 team: 'Energy',                    roleType: 'underwriter' },
    james:   { id: 'james',   name: 'James Whitfield',    initials: 'JW', role: 'UW Assistant',                team: 'Underwriting Ops',          roleType: 'admin' },
    saverio: { id: 'saverio', name: 'Saverio Lo Giudice', initials: 'SL', role: 'System Administrator',         team: 'Operations & Technology',   roleType: 'sysadmin' },
  };

  // Role catalogue for user management & access
  const ROLE_TYPES = [
    { id: 'underwriter', label: 'Underwriter',                 desc: 'Create & manage opportunities, contacts, activity and actions.' },
    { id: 'cuo',         label: 'Chief Underwriting Officer',  desc: 'Full portfolio oversight and state-of-nation dashboards.' },
    { id: 'admin',       label: 'UW Assistant / Admin',        desc: 'Edit entries, archive records and run reports.' },
    { id: 'sysadmin',    label: 'System Admin',                desc: 'Manage users, delete records, and triage bugs & issues.' },
  ];

  const CLASSES = [
    'Political Risk & Trade Credit',
    'Energy',
    'Property',
    'Construction & Engineering',
    'Marine & Aviation',
    'Financial Lines',
    'Casualty',
  ];

  const STAGES = [
    { id: 'lead',      label: 'New Lead',   color: '#8B9FB7' },
    { id: 'qualified', label: 'Qualified',  color: '#3BA4C8' },
    { id: 'quoting',   label: 'Quoting',    color: '#4A4F8D' },
    { id: 'quoted',    label: 'Quoted',     color: '#E6AA00' },
    { id: 'bound',     label: 'Bound',      color: '#1F8A5B' },
  ];

  // ---- Underwriting platforms / paper (carrier the risk is written on) ----
  const PAPERS = [
    { id: 'syn2454', label: "Lloyd's Syndicate 2454", short: "Syndicate 2454", platform: "Lloyd's of London",   regulator: 'PRA / FCA · Lloyd\u2019s', rating: 'A (S&P) · A (AM Best)', color: '#240B60', icon: 'shield' },
    { id: 'bermuda', label: 'ASR Bermuda (Class 3B)',  short: 'ASR Bermuda',    platform: "Bermuda \u2014 non-Lloyd's", regulator: 'Bermuda Monetary Authority', rating: 'A- (AM Best)',          color: '#0E7C86', icon: 'globe' },
  ];
  const PAPER_OF = {}; PAPERS.forEach(p => PAPER_OF[p.id] = p);

  const TERRITORIES = ['Nigeria','Kenya','South Africa','Egypt','Morocco','Ghana',
    "Côte d'Ivoire",'Tanzania','Senegal','Mozambique','DRC','Angola','Zambia','UAE','Saudi Arabia'];

  // ---- Distribution contacts (brokers, clients, coverholders) ----
  const CONTACTS = [
    { id:'c1',  name:'Charlotte Beaumont', company:'Marsh Specialty',          type:'Broker',      title:'Divisional Director, Credit & Political Risk', location:'London, UK', email:'charlotte.beaumont@marsh.com', phone:'+44 20 7357 1000', owner:'gen',    last:'2026-05-22', tags:['Key broker','PRT'] },
    { id:'c2',  name:'Tunde Adeyemi',       company:'Aon Africa',               type:'Broker',      title:'Head of Energy, Sub-Saharan Africa',           location:'Lagos, NG', email:'tunde.adeyemi@aon.com',       phone:'+234 1 271 9000', owner:'suzan',  last:'2026-05-19', tags:['Key broker','Energy'] },
    { id:'c3',  name:'Sipho Ndlovu',        company:'Gallagher Re',             type:'Broker',      title:'Executive Director',                           location:'Johannesburg, ZA', email:'sipho.ndlovu@ajg.com', phone:'+27 11 833 4000', owner:'david', last:'2026-05-15', tags:['Property'] },
    { id:'c4',  name:'Fatima El Amrani',    company:'Howden Africa',            type:'Broker',      title:'Regional Manager, North Africa',               location:'Casablanca, MA', email:'fatima.elamrani@howdengroup.com', phone:'+212 522 000', owner:'gen', last:'2026-05-10', tags:['PRT','Construction'] },
    { id:'c5',  name:'Daniel Mwangi',       company:'Kenbright / ASR Coverholder', type:'Coverholder', title:'Coverholder Principal',                     location:'Nairobi, KE', email:'daniel.mwangi@asr-coverholder.com', phone:'+254 20 000', owner:'amara', last:'2026-05-21', tags:['Coverholder','East Africa'] },
    { id:'c6',  name:'Grace Osei',          company:'Volta Energy Holdings',    type:'Client',      title:'Group Risk Manager',                           location:'Accra, GH', email:'grace.osei@voltaenergy.com', phone:'+233 30 000', owner:'leila', last:'2026-05-18', tags:['Client','Energy'] },
    { id:'c7',  name:'Mohammed Hassan',     company:'Nile Infrastructure Co.',  type:'Client',      title:'CFO',                                          location:'Cairo, EG', email:'m.hassan@nileinfra.com', phone:'+20 2 0000', owner:'david', last:'2026-04-30', tags:['Client','Construction'] },
    { id:'c8',  name:'Olivia Carter',       company:'Price Forbes',             type:'Broker',      title:'Partner, Marine & Cargo',                      location:'London, UK', email:'olivia.carter@priceforbes.com', phone:'+44 20 7204 8400', owner:'martin', last:'2026-05-12', tags:['Marine'] },
    { id:'c9',  name:'Kwame Mensah',        company:'BMS Group',                type:'Broker',      title:'Account Executive',                            location:'London, UK', email:'kwame.mensah@bmsgroup.com', phone:'+44 20 7480 0000', owner:'amara', last:'2026-05-08', tags:['PRT','Trade Credit'] },
    { id:'c10', name:'Aisha Bello',         company:'Sahel Power Partners',     type:'Client',      title:'Director of Finance',                          location:'Dakar, SN', email:'aisha.bello@sahelpower.com', phone:'+221 33 000', owner:'leila', last:'2026-05-05', tags:['Client','Energy'] },
    { id:'c11', name:'Robert Nkosi',        company:'McGill and Partners',      type:'Broker',      title:'Partner',                                      location:'London, UK', email:'robert.nkosi@mcgillpartners.com', phone:'+44 20 3915 0000', owner:'martin', last:'2026-05-20', tags:['Key broker','Financial Lines'] },
    { id:'c12', name:'Nadia Toure',         company:'Lockton Cameroon',         type:'Broker',      title:'Senior Broker',                                location:'Douala, CM', email:'nadia.toure@lockton.com', phone:'+237 233 000', owner:'gen', last:'2026-04-28', tags:['PRT'] },
  ];

  const NAMES = {}; CONTACTS.forEach(c => NAMES[c.id] = c);

  // ---- Opportunities (pipeline) ----
  const OPPS = [
    { id:'o1',  name:'TransSahara Solar — Construction All Risks', insured:'TransSahara Solar Ltd', class:'Construction & Engineering', territory:'Morocco', stage:'quoted', premium:1850000, currency:'USD', limit:120000000, share:35, inception:'2026-07-01', owner:'david', contact:'c4', prob:65, created:'2026-03-12', updated:'2026-05-22', paper:'syn2454' },
    { id:'o2',  name:'Volta Energy — Offshore Operating Cover',    insured:'Volta Energy Holdings', class:'Energy', territory:'Ghana', stage:'quoting', premium:3200000, currency:'USD', limit:250000000, share:20, inception:'2026-08-01', owner:'suzan', contact:'c2', prob:50, created:'2026-04-02', updated:'2026-05-19', paper:'bermuda' },
    { id:'o3',  name:'Nigeria Sovereign — Trade Credit Facility',  insured:'Federal Trade Guarantee', class:'Political Risk & Trade Credit', territory:'Nigeria', stage:'qualified', premium:980000, currency:'USD', limit:60000000, share:50, inception:'2026-09-01', owner:'gen', contact:'c1', prob:35, created:'2026-04-21', updated:'2026-05-22', paper:'syn2454' },
    { id:'o4',  name:'Mombasa Port — Marine Liability',            insured:'Mombasa Port Authority', class:'Marine & Aviation', territory:'Kenya', stage:'lead', premium:540000, currency:'USD', limit:40000000, share:25, inception:'2026-10-01', owner:'martin', contact:'c8', prob:15, created:'2026-05-09', updated:'2026-05-12', paper:'syn2454' },
    { id:'o5',  name:'Sahel Power — Political Violence',           insured:'Sahel Power Partners', class:'Political Risk & Trade Credit', territory:'Senegal', stage:'quoting', premium:1420000, currency:'USD', limit:90000000, share:30, inception:'2026-07-15', owner:'leila', contact:'c10', prob:55, created:'2026-03-28', updated:'2026-05-18', paper:'syn2454' },
    { id:'o6',  name:'Nile Infrastructure — CAR / Bridge Project', insured:'Nile Infrastructure Co.', class:'Construction & Engineering', territory:'Egypt', stage:'bound', premium:2650000, currency:'USD', limit:180000000, share:40, inception:'2026-05-01', owner:'david', contact:'c7', prob:100, created:'2026-02-10', updated:'2026-05-02', paper:'bermuda' },
    { id:'o7',  name:'East Africa Telco — Financial Lines',        insured:'EA Communications Grp', class:'Financial Lines', territory:'Tanzania', stage:'qualified', premium:760000, currency:'USD', limit:50000000, share:45, inception:'2026-08-15', owner:'amara', contact:'c5', prob:40, created:'2026-04-18', updated:'2026-05-21', paper:'syn2454' },
    { id:'o8',  name:'Lagos Logistics Park — Property',           insured:'Lagos Logistics Ltd', class:'Property', territory:'Nigeria', stage:'lead', premium:430000, currency:'USD', limit:35000000, share:30, inception:'2026-11-01', owner:'david', contact:'c3', prob:20, created:'2026-05-14', updated:'2026-05-15', paper:'bermuda' },
    { id:'o9',  name:'Maghreb Trade Finance Programme',           insured:'Atlas Trading SA', class:'Political Risk & Trade Credit', territory:'Morocco', stage:'quoted', premium:1120000, currency:'USD', limit:75000000, share:50, inception:'2026-07-01', owner:'gen', contact:'c4', prob:60, created:'2026-03-30', updated:'2026-05-10', paper:'syn2454' },
    { id:'o10', name:'Cameroon Oilfield — Energy Package',         insured:'Douala Petroleum', class:'Energy', territory:'DRC', stage:'qualified', premium:2100000, currency:'USD', limit:150000000, share:25, inception:'2026-09-01', owner:'leila', contact:'c12', prob:45, created:'2026-04-25', updated:'2026-04-28', paper:'bermuda' },
    { id:'o11', name:'SA Mining Consortium — Casualty Tower',      insured:'Rand Mining Consortium', class:'Casualty', territory:'South Africa', stage:'quoting', premium:1680000, currency:'USD', limit:100000000, share:20, inception:'2026-08-01', owner:'martin', contact:'c3', prob:50, created:'2026-04-05', updated:'2026-05-15', paper:'bermuda' },
    { id:'o12', name:'GCC Petrochem — Open Market Energy',         insured:'Gulf Petrochem FZE', class:'Energy', territory:'UAE', stage:'bound', premium:3950000, currency:'USD', limit:300000000, share:15, inception:'2026-04-01', owner:'suzan', contact:'c2', prob:100, created:'2026-01-20', updated:'2026-03-28', paper:'bermuda' },
    { id:'o13', name:'Dakar Renewables — Trade Credit',           insured:'Sahel Power Partners', class:'Political Risk & Trade Credit', territory:'Senegal', stage:'lead', premium:620000, currency:'USD', limit:45000000, share:40, inception:'2026-12-01', owner:'amara', contact:'c10', prob:15, created:'2026-05-20', updated:'2026-05-20', paper:'syn2454' },
    { id:'o14', name:'McGill FI Tower — Financial Institutions',  insured:'Pan-African Bank Grp', class:'Financial Lines', territory:'Kenya', stage:'quoted', premium:1340000, currency:'USD', limit:80000000, share:30, inception:'2026-07-01', owner:'martin', contact:'c11', prob:70, created:'2026-03-15', updated:'2026-05-20', paper:'syn2454' },
  ];

  // ---- Activity feed (meeting notes / calls / emails) ----
  const ACTIVITIES = [
    { id:'a1',  type:'Meeting', title:'Renewal strategy — Marsh PRT book', contact:'c1', opp:'o3',  author:'gen',   date:'2026-05-22T10:30', body:'Met Charlotte to walk through the FY27 sovereign trade-credit pipeline. Marsh keen to broaden ASR line on the Federal Trade Guarantee facility. Pricing indication requested by 5 June; needs ExCo sponsor sign-off given size.' },
    { id:'a2',  type:'Call',    title:'Offshore operating cover — Volta', contact:'c2', opp:'o2',  author:'suzan', date:'2026-05-19T14:00', body:'Tunde confirmed Volta board approved the offshore expansion. Slip to follow next week. Competing quote from open-market lead at lower rate — ASR differentiating on local claims handling.' },
    { id:'a3',  type:'Email',   title:'CAR quote issued — TransSahara Solar', contact:'c4', opp:'o1', author:'david', date:'2026-05-22T09:05', body:'Issued quote: 35% line, USD 120m limit, premium USD 1.85m. Awaiting client decision. Howden expects bind within two weeks subject to survey.' },
    { id:'a4',  type:'Meeting', title:'Coverholder QBR — Kenbright Nairobi', contact:'c5', opp:'o7', author:'amara', date:'2026-05-21T11:00', body:'Quarterly business review with Daniel. Bordereaux up to date. New telco financial-lines opportunity flagged through the coverholder network; ASR to underwrite the lead line.' },
    { id:'a5',  type:'Note',    title:'Site survey scheduled — Nile bridge', contact:'c7', opp:'o6', author:'david', date:'2026-05-02T16:20', body:'Bound. Inception 1 May. Engineering survey scheduled for week of 12 May. Hand over to PAS (Navigator) — risk reference NAV-2026-0418.' },
    { id:'a6',  type:'Call',    title:'FI tower terms — McGill', contact:'c11', opp:'o14', author:'martin', date:'2026-05-20T15:30', body:'Robert pushing for an early quote on the Pan-African Bank FI tower. ASR comfortable at 30% line. Quote out; high probability given existing relationship.' },
    { id:'a7',  type:'Meeting', title:'Sahel political violence — placement', contact:'c10', opp:'o5', author:'leila', date:'2026-05-18T13:00', body:'Reviewed PV wording with Aisha. Territory aggregation within appetite. Need CUO sign-off on Senegal accumulation before quoting firm.' },
    { id:'a8',  type:'Email',   title:'Maghreb trade finance — follow-up', contact:'c4', opp:'o9', author:'gen', date:'2026-05-10T08:45', body:'Quote chased. Fatima to revert after client board meeting on 15 May.' },
  ];

  // ---- Assigned actions / tasks ----
  const TASKS = [
    { id:'t1', title:'Prepare pricing indication for Marsh sovereign facility', opp:'o3', assignee:'amara', assignedBy:'gen',   due:'2026-06-05', done:false, priority:'High' },
    { id:'t2', title:'Chase signed slip from Aon — Volta offshore', opp:'o2', assignee:'leila', assignedBy:'suzan', due:'2026-05-28', done:false, priority:'High' },
    { id:'t3', title:'Run Senegal accumulation check before firm quote', opp:'o5', assignee:'amara', assignedBy:'leila', due:'2026-05-26', done:false, priority:'Medium' },
    { id:'t4', title:'Collate FI tower MRC wording for McGill', opp:'o14', assignee:'james', assignedBy:'martin', due:'2026-05-30', done:false, priority:'Medium' },
    { id:'t5', title:'Update coverholder bordereaux log — Kenbright', opp:'o7', assignee:'james', assignedBy:'amara', due:'2026-05-24', done:true,  priority:'Low' },
    { id:'t6', title:'Confirm Senegal accumulation sign-off with CUO', opp:'o5', assignee:'gen', assignedBy:'eric', due:'2026-05-27', done:false, priority:'High' },
    { id:'t7', title:'Draft renewal terms for Maghreb trade finance', opp:'o9', assignee:'gen', assignedBy:'martin', due:'2026-05-30', done:false, priority:'Medium' },
  ];

  // ---- Bug & issue tracker (System Admin) ----
  const ISSUES = [
    { id:'i1', title:'Pipeline GWP total not refreshing after stage move', desc:'Weighted figure on the board header occasionally lags by one action when dragging cards quickly.', severity:'Medium', status:'In Progress', reporter:'gen',   assignee:'saverio', date:'2026-05-20', area:'Pipeline' },
    { id:'i2', title:'Convert-to-risk: expiry date not pre-populating', desc:'When converting, the period expiry field is blank rather than inception + 12 months.', severity:'Low', status:'Open', reporter:'david', assignee:'saverio', date:'2026-05-21', area:'Convert to risk' },
    { id:'i3', title:'Duplicate contact created from coverholder import', desc:'Daniel Mwangi appears twice after the last Navigator sync. Needs de-dup + archive of stale record.', severity:'High', status:'Open', reporter:'amara', assignee:'saverio', date:'2026-05-22', area:'Contacts' },
    { id:'i4', title:'Power BI launch opens wrong workspace on mobile', desc:'On tablet the report button deep-links to the group workspace rather than the syndicate one.', severity:'Low', status:'Resolved', reporter:'suzan', assignee:'saverio', date:'2026-05-12', area:'Reports' },
  ];

  window.ASR_DATA = { TEAM, ROLE_TYPES, CLASSES, STAGES, PAPERS, PAPER_OF, TERRITORIES, CONTACTS, NAMES, OPPS, ACTIVITIES, TASKS, ISSUES };
  window.D = function () { return window.ASR_DATA; };
  window.userOf = function (id) { return window.ASR_DATA.TEAM[id] || { id: id, name: 'Unassigned', initials: '—', role: '', team: '', roleType: 'underwriter' }; };

  // ---- Demo persistence (so shared visitors keep their edits; reset clears it) ----
  const LS_KEY = 'asr_crm_demo_v2';
  window.ASR_PERSIST = {
    load() { try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch (e) { return null; } },
    save(snap) { try { localStorage.setItem(LS_KEY, JSON.stringify(snap)); } catch (e) {} },
    clear() { try { localStorage.removeItem(LS_KEY); } catch (e) {} },
  };
})();
