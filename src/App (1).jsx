import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────── SUPABASE ───────────────────────────

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─────────────────────────── DATA ───────────────────────────

const SETUPS = ["Dr. Arash", "Dr. Roberts", "Dr. Maya", "Grand Smiles Chicago", "Grand Smiles Rockford", "Esha/CDC"];

const AUTO_ITEMS = [
  { id: "pedsCircuit",   label: "Peds Circuit",                        tag: "1",   calc: n => 1 },
  { id: "circuitFilter", label: "Circuit Filter",                      tag: "n−1", calc: n => Math.max(0, n - 1) },
  { id: "redRubber",     label: "12 Fr Red Rubber",                    tag: "n",   calc: n => n },
  { id: "tubeExt",       label: "Tube Extension",                      tag: "n",   calc: n => n },
  { id: "iv22g",         label: "22g IV",                              tag: "n",   calc: n => n },
  { id: "ivTubing",      label: "IV Tubing",                           tag: "n",   calc: n => n },
  { id: "ivHub",         label: "IV Hub",                              tag: "n",   calc: n => n },
  { id: "ivFluids",      label: "IV Fluids",                           tag: "n",   calc: n => n },
  { id: "propofol",      label: "Propofol",                            tag: "n",   calc: n => n },
  { id: "syr20",         label: "20cc Syringes",                       tag: "n",   calc: n => n },
  { id: "syr5",          label: "5cc Syringes",                        tag: "autofill = tubes + routine meds", calc: n => n + 4 },
];

const MANUAL_ITEMS = [
  { id: "smallPedsMask", label: "Small Peds Mask" },
  { id: "largePedsMask", label: "Large Peds Mask" },
  { id: "tube40",        label: "4.0 Cuffed Tube" },
  { id: "tube45",        label: "4.5 Cuffed Tube" },
  { id: "tube50",        label: "5.0 Cuffed Tube" },
  { id: "tube55",        label: "5.5 Cuffed Tube" },
];

const RARE_ITEMS = [
  { id: "oralTubes",       label: "Oral Tubes",                    sizes: ["3.0","4.0","5.0","6.0","7.0"] },
  { id: "igel",            label: "I-Gel",                         sizes: ["1.5","2","2.5","3","4","5"] },
  { id: "opa",             label: "OPA",                           sizes: ["Black","White","Green","Yellow","Red"] },
  { id: "npa",             label: "NPA",                           sizes: ["18","20","22","24","26","28","30","32","34"] },
  { id: "softSuction",     label: "Soft Suction",                  sizes: ["10Fr","14Fr"] },
  { id: "duoNebMask",      label: "Duo Neb Mask",                  sizes: null },
  { id: "duoNebVial",      label: "Duo Neb Vial",                  sizes: null },
  { id: "adultCircuit",    label: "Adult Circuit",                 sizes: null },
  { id: "adultMask",       label: "Adult Mask",                    sizes: ["Medium","Large"] },
  { id: "adultTubes",      label: "Adult Tubes",                   sizes: ["6.0","6.5","7.0","7.5"] },
  { id: "co2Bag",          label: "CO2 Absorber (Dippin' Dots)",   sizes: null },
  { id: "samplingLine",    label: "Sampling Line",                 sizes: null },
  { id: "waterTrap",       label: "Water Trap",                    sizes: null },
  { id: "iv20g",           label: "20g IV",                        sizes: null },
  { id: "iv24g",           label: "24g IV",                        sizes: null },
  { id: "epi1",            label: "Epi (1mg/mL)",                  sizes: null },
  { id: "epi01",           label: "Epi (0.1mg/mL)",               sizes: null },
  { id: "atropine",        label: "Atropine",                      sizes: null },
  { id: "albuterol",       label: "Albuterol Inhaler (empty)",     sizes: null },
  { id: "succinylcholine", label: "Succinylcholine (vial empty)",  sizes: null },
];

const LOW_ITEMS = [
  { id: "ekgStickers",  label: "EKG Stickers",   hint: "<2 full packs" },
  { id: "syr1cc",       label: "1cc Syringes",    hint: "<10" },
  { id: "glyco",        label: "Glyco",           hint: "<10" },
  { id: "zofran",       label: "Zofran",          hint: "<10" },
  { id: "toradol",      label: "Toradol",         hint: "<10" },
  { id: "dex",          label: "Dexamethasone",   hint: "<3" },
  { id: "lido",         label: "Lidocaine",       hint: "<2" },
  { id: "sevo",         label: "Sevo",            hint: "<4" },
  { id: "tourniquets",  label: "Tourniquets",     hint: "" },
  { id: "alcoholWipes", label: "Alcohol Wipes",   hint: "<50ish" },
  { id: "tegaderm",     label: "Tegaderm",        hint: "<30" },
  { id: "gauze4x4",     label: "4x4 Gauze",       hint: "<1 full pack" },
  { id: "needles18g",   label: "18g Needles",     hint: "<50" },
  { id: "afrin",        label: "Afrin",           hint: "<2" },
  { id: "lube",         label: "Lube",            hint: "<3" },
  { id: "clearTape",    label: "Clear Tape",      hint: "<3" },
  { id: "thickSilk",    label: "Thick Silk Tape", hint: "<2" },
  { id: "thinSilk",     label: "Thin Silk Tape",  hint: "<2" },
];

// ─────────────────────────── HELPERS ───────────────────────────

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDate(d) {
  return d.toISOString().split("T")[0];
}

function initRare() {
  return Object.fromEntries(
    RARE_ITEMS.map(item => [
      item.id,
      { checked: false, qty: 0, sizeQtys: item.sizes ? Object.fromEntries(item.sizes.map(s => [s, 0])) : null }
    ])
  );
}

// ─────────────────────────── STEPPER ───────────────────────────

function Stepper({ value, onChange }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={C.stepBtn}>−</button>
      <span style={C.stepVal}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={C.stepBtn}>+</button>
    </div>
  );
}

// ─────────────────────────── APP ───────────────────────────

export default function App() {
  const [screen, setScreen] = useState("form");
  const [step, setStep]     = useState(0);

  const [setup,       setSetup]       = useState("");
  const [patients,    setPatients]    = useState(0);
  const [autoQtys,    setAutoQtys]    = useState(() => Object.fromEntries(AUTO_ITEMS.map(i => [i.id, 0])));
  const [manualQtys,  setManualQtys]  = useState(() => Object.fromEntries(MANUAL_ITEMS.map(i => [i.id, 0])));
  const [rare,        setRare]        = useState(initRare);
  const [lowChecked,  setLowChecked]  = useState(() => Object.fromEntries(LOW_ITEMS.map(i => [i.id, false])));
  const [initials,    setInitials]    = useState("");

  const [subs,         setSubs]        = useState([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [weekStart,    setWeekStart]   = useState(() => getMondayOfWeek(new Date()));

  const applyPatients = (n) => {
    setPatients(n);
    setAutoQtys(Object.fromEntries(AUTO_ITEMS.map(i => [i.id, i.calc(n)])));
  };

  const loadSubs = async () => {
    setLoadingAdmin(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .select("data")
        .order("created_at", { ascending: false });
      if (!error && data) setSubs(data.map(r => r.data));
    } catch {}
    setLoadingAdmin(false);
  };

  useEffect(() => { if (screen === "admin") loadSubs(); }, [screen]);

  const submit = async () => {
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      date: fmtDate(new Date()),
      setup, patients, autoQtys, manualQtys, rare, lowChecked,
      initials: initials.toUpperCase().trim()
    };
    try {
      await supabase.from("submissions").insert({ id: entry.id, data: entry });
    } catch {}
    setScreen("success");
  };

  const reset = () => {
    setStep(0); setSetup(""); setPatients(0); setInitials("");
    setAutoQtys(Object.fromEntries(AUTO_ITEMS.map(i => [i.id, 0])));
    setManualQtys(Object.fromEntries(MANUAL_ITEMS.map(i => [i.id, 0])));
    setRare(initRare());
    setLowChecked(Object.fromEntries(LOW_ITEMS.map(i => [i.id, false])));
    setScreen("form");
  };

  const exportCSV = () => {
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    const filtered = subs.filter(s => { const d = new Date(s.timestamp); return d >= weekStart && d < end; });
    if (!filtered.length) { alert("No submissions this week."); return; }

    // Group by setup
    const bySetup = {};
    filtered.forEach(s => { if (!bySetup[s.setup]) bySetup[s.setup] = []; bySetup[s.setup].push(s); });

    const fmtHeader = date => new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const toCSV = rows => rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

    Object.entries(bySetup).forEach(([setupName, setupSubs], idx) => {
      setupSubs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      const dates = [...new Set(setupSubs.map(s => s.date))];
      const byDate = Object.fromEntries(dates.map(d => [d, setupSubs.filter(s => s.date === d)]));

      const daySum  = (date, fn) => byDate[date].reduce((a, s) => a + (fn(s) || 0), 0);
      const dayFlag = (date, fn) => byDate[date].some(fn) ? "LOW" : "";
      const blank   = dates.map(() => "");

      const rows = [];

      // Header
      rows.push(["Supply", ...dates.map(fmtHeader), "Supply", "Weekly Total"]);

      // Submitted by
      const submitters = [...new Set(setupSubs.map(s => s.initials).filter(Boolean))].join(", ");
      rows.push(["Submitted by", ...dates.map(d => [...new Set(byDate[d].map(s => s.initials).filter(Boolean))].join(",")), "", submitters]);

      // Patients
      const patientCounts = dates.map(d => daySum(d, s => s.patients || 0));
      rows.push(["Patients", ...patientCounts, "Patients", patientCounts.reduce((a, b) => a + b, 0)]);
      rows.push(["", ...blank, "", ""]);

      // Auto items
      rows.push(["AUTO-POPULATED ITEMS", ...blank, "", ""]);
      AUTO_ITEMS.forEach(item => {
        const counts = dates.map(d => daySum(d, s => s.autoQtys?.[item.id] || 0));
        rows.push([item.label, ...counts, item.label, counts.reduce((a, b) => a + b, 0)]);
      });
      rows.push(["", ...blank, "", ""]);

      // Manual items
      rows.push(["MANUAL COUNT ITEMS", ...blank, "", ""]);
      MANUAL_ITEMS.forEach(item => {
        const counts = dates.map(d => daySum(d, s => s.manualQtys?.[item.id] || 0));
        rows.push([item.label, ...counts, item.label, counts.reduce((a, b) => a + b, 0)]);
      });
      rows.push(["", ...blank, "", ""]);

      // Rare items (only show if used at all that week)
      const rareRows = [];
      RARE_ITEMS.forEach(item => {
        if (item.sizes) {
          item.sizes.forEach(sz => {
            const counts = dates.map(d => daySum(d, s => s.rare?.[item.id]?.checked ? (s.rare[item.id].sizeQtys?.[sz] || 0) : 0));
            if (counts.some(c => c > 0)) rareRows.push([`${item.label} ${sz}`, ...counts, `${item.label} ${sz}`, counts.reduce((a, b) => a + b, 0)]);
          });
        } else {
          const counts = dates.map(d => daySum(d, s => s.rare?.[item.id]?.checked ? (s.rare[item.id].qty || 0) : 0));
          if (counts.some(c => c > 0)) rareRows.push([item.label, ...counts, item.label, counts.reduce((a, b) => a + b, 0)]);
        }
      });
      if (rareRows.length > 0) {
        rows.push(["RARE ITEMS USED", ...blank, "", ""]);
        rareRows.forEach(r => rows.push(r));
        rows.push(["", ...blank, "", ""]);
      }

      // Low stock (only show items flagged at least once)
      const lowRows = LOW_ITEMS.map(item => {
        const flags = dates.map(d => dayFlag(d, s => s.lowChecked?.[item.id]));
        const count = flags.filter(f => f === "LOW").length;
        return count > 0 ? [item.label, ...flags, item.label, `${count}x flagged`] : null;
      }).filter(Boolean);
      if (lowRows.length > 0) {
        rows.push(["LOW STOCK FLAGS", ...blank, "", ""]);
        lowRows.forEach(r => rows.push(r));
      }

      setTimeout(() => {
        const safeName = setupName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
        const a = Object.assign(document.createElement("a"), {
          href: URL.createObjectURL(new Blob([toCSV(rows)], { type: "text/csv" })),
          download: `${safeName}-${fmtDate(weekStart)}.csv`
        });
        a.click();
      }, idx * 600);
    });
  };

  // ─────────── ADMIN SCREEN ───────────

  if (screen === "admin") {
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    const weekSubs = subs.filter(s => { const d = new Date(s.timestamp); return d >= weekStart && d < end; });
    const bySetup = Object.fromEntries(SETUPS.map(s => [s, []]));
    weekSubs.forEach(s => { if (bySetup[s.setup]) bySetup[s.setup].push(s); });
    const activeSetups = SETUPS.filter(s => bySetup[s].length > 0);
    const wkLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(end - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    return (
      <div style={C.page}>
        <div style={C.card}>
          <div style={C.topBar}>
            <h1 style={C.title}>Weekly Summary</h1>
            <button onClick={() => setScreen("form")} style={C.ghostBtn}>← Back</button>
          </div>

          <div style={C.weekNav}>
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} style={C.navArrow}>‹</button>
            <span style={C.weekLabel}>{wkLabel}</span>
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} style={C.navArrow}>›</button>
          </div>

          {loadingAdmin ? (
            <p style={C.muted}>Loading…</p>
          ) : activeSetups.length === 0 ? (
            <div style={C.emptyState}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
              <p style={C.muted}>No submissions this week.</p>
            </div>
          ) : (
            activeSetups.map(setupName => {
              const ss = bySetup[setupName];
              const totalPts = ss.reduce((a, s) => a + (s.patients || 0), 0);
              const autoTotals = Object.fromEntries(AUTO_ITEMS.map(i => [i.id, ss.reduce((a, s) => a + (s.autoQtys?.[i.id] || 0), 0)]));
              const manTotals  = Object.fromEntries(MANUAL_ITEMS.map(i => [i.id, ss.reduce((a, s) => a + (s.manualQtys?.[i.id] || 0), 0)]));
              const lowCounts  = Object.fromEntries(LOW_ITEMS.map(i => [i.id, ss.filter(s => s.lowChecked?.[i.id]).length]));
              const flaggedLow = LOW_ITEMS.filter(i => lowCounts[i.id] > 0);
              const rareLines  = RARE_ITEMS.flatMap(item =>
                ss.flatMap(s => {
                  const r = s.rare?.[item.id];
                  if (!r?.checked) return [];
                  if (item.sizes) return item.sizes.filter(sz => r.sizeQtys?.[sz] > 0).map(sz => `${item.label} ${sz} ×${r.sizeQtys[sz]}`);
                  return r.qty > 0 ? [`${item.label} ×${r.qty}`] : [];
                })
              );
              const submitters = [...new Set(ss.map(s => s.initials).filter(Boolean))].join(", ");

              return (
                <div key={setupName} style={C.setupCard}>
                  <div style={C.setupHeader}>
                    <span style={{ fontWeight: 700 }}>{setupName}</span>
                    <span style={C.setupMeta}>{ss.length} day{ss.length !== 1 ? "s" : ""} · {totalPts} patients{submitters ? ` · ${submitters}` : ""}</span>
                  </div>
                  <div style={{ padding: "12px 16px" }}>
                    <div style={C.adminSection}>Per-Patient Items</div>
                    {AUTO_ITEMS.map(i => autoTotals[i.id] > 0 && (
                      <div key={i.id} style={C.adminRow}><span>{i.label}</span><span style={C.blueBadge}>{autoTotals[i.id]}</span></div>
                    ))}
                    {MANUAL_ITEMS.map(i => manTotals[i.id] > 0 && (
                      <div key={i.id} style={C.adminRow}><span>{i.label}</span><span style={C.blueBadge}>{manTotals[i.id]}</span></div>
                    ))}
                    {rareLines.length > 0 && <>
                      <div style={{ ...C.adminSection, marginTop: 10 }}>Rare Items</div>
                      {rareLines.map((l, i) => <div key={i} style={C.adminRow}><span>{l}</span></div>)}
                    </>}
                    {flaggedLow.length > 0 && <>
                      <div style={{ ...C.adminSection, marginTop: 10, color: "#c53030" }}>Needs Restocking</div>
                      {flaggedLow.map(i => (
                        <div key={i.id} style={C.adminRow}>
                          <span>{i.label}{i.hint ? <span style={{ color: "#a0aec0", fontSize: 11, marginLeft: 6 }}>{i.hint}</span> : null}</span>
                          <span style={C.redBadge}>flagged {lowCounts[i.id]}×</span>
                        </div>
                      ))}
                    </>}
                  </div>
                </div>
              );
            })
          )}

          <button onClick={exportCSV} style={{ ...C.primaryBtn, marginTop: 8 }}>Export CSV →</button>
        </div>
      </div>
    );
  }

  // ─────────── SUCCESS SCREEN ───────────

  if (screen === "success") {
    return (
      <div style={C.page}>
        <div style={{ ...C.card, textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Logged!</h2>
          <p style={{ color: "#718096", marginBottom: 32 }}>Submitted for {setup}</p>
          <button onClick={reset} style={C.primaryBtn}>Log Another Day</button>
          <button onClick={() => setScreen("admin")} style={{ ...C.ghostBtn, marginTop: 12, width: "100%", padding: "11px 0", borderRadius: 10 }}>
            View Weekly Summary →
          </button>
        </div>
      </div>
    );
  }

  // ─────────── FORM ───────────

  const STEPS = ["Setup", "Items", "Rare Items", "Low Stock", "Review"];

  return (
    <div style={C.page}>
      <div style={C.card}>
        <div style={C.topBar}>
          <div>
            <h1 style={C.title}>Daily Supply Log</h1>
            <div style={C.stepIndicatorLabel}>{STEPS[step]}</div>
          </div>
          <button onClick={() => setScreen("admin")} style={{ ...C.ghostBtn, fontSize: 12 }}>Admin →</button>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= step ? "#2563eb" : "#e2e8f0", transition: "background 0.25s" }} />
          ))}
        </div>

        {/* ── STEP 0 ── */}
        {step === 0 && <>
          <div style={C.label}>Which setup?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {SETUPS.map(opt => (
              <button key={opt} style={{ ...C.chip, ...(setup === opt ? C.chipOn : {}) }} onClick={() => setSetup(opt)}>{opt}</button>
            ))}
          </div>
          <div style={C.label}>Number of patients today</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <Stepper value={patients} onChange={applyPatients} />
            <span style={{ color: "#94a3b8", fontSize: 14 }}>patients</span>
          </div>
          <button style={{ ...C.primaryBtn, ...(!setup ? C.disabledBtn : {}) }} onClick={() => setup && setStep(1)}>Next →</button>
        </>}

        {/* ── STEP 1 ── */}
        {step === 1 && <>
          <div style={C.label}>Auto-populated items</div>
          <p style={C.hint}>Based on {patients} patient{patients !== 1 ? "s" : ""}. Adjust if today was different.</p>
          {AUTO_ITEMS.map(item => (
            <div key={item.id} style={C.row}>
              <div>
                <div style={{ fontSize: 15, color: "#1e293b" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>{item.tag}</div>
              </div>
              <Stepper value={autoQtys[item.id]} onChange={v => setAutoQtys(p => ({ ...p, [item.id]: v }))} />
            </div>
          ))}
          <div style={{ ...C.label, marginTop: 20 }}>Manual count items</div>
          <p style={C.hint}>Enter how many were used today.</p>
          {MANUAL_ITEMS.map(item => (
            <div key={item.id} style={C.row}>
              <span style={{ fontSize: 15, color: "#1e293b" }}>{item.label}</span>
              <Stepper value={manualQtys[item.id]} onChange={v => setManualQtys(p => ({ ...p, [item.id]: v }))} />
            </div>
          ))}
          <div style={C.navRow}>
            <button onClick={() => setStep(0)} style={C.ghostBtn}>← Back</button>
            <button onClick={() => setStep(2)} style={{ ...C.primaryBtn, flex: 1 }}>Next →</button>
          </div>
        </>}

        {/* ── STEP 2 ── */}
        {step === 2 && <>
          <div style={C.label}>Rare items used today</div>
          <p style={C.hint}>Check anything that was used. Skip if nothing rare today.</p>
          {RARE_ITEMS.map(item => {
            const r = rare[item.id];
            const upd = patch => setRare(p => ({ ...p, [item.id]: { ...p[item.id], ...patch } }));
            return (
              <div key={item.id} style={{ marginBottom: 2 }}>
                <label style={C.checkRow}>
                  <input type="checkbox" checked={r.checked} onChange={e => upd({ checked: e.target.checked })}
                    style={{ width: 17, height: 17, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }} />
                  <span style={{ fontSize: 15, color: r.checked ? "#1d4ed8" : "#1e293b", fontWeight: r.checked ? 600 : 400 }}>
                    {item.label}
                  </span>
                </label>
                {r.checked && (
                  <div style={{ paddingLeft: 31, marginBottom: 8, marginTop: 2 }}>
                    {item.sizes ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {item.sizes.map(sz => (
                          <div key={sz} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                            <span style={{ fontSize: 13, color: "#475569" }}>Size {sz}</span>
                            <Stepper value={r.sizeQtys[sz]} onChange={v => upd({ sizeQtys: { ...r.sizeQtys, [sz]: v } })} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 13, color: "#475569" }}>Quantity used</span>
                        <Stepper value={r.qty} onChange={v => upd({ qty: v })} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          <div style={C.navRow}>
            <button onClick={() => setStep(1)} style={C.ghostBtn}>← Back</button>
            <button onClick={() => setStep(3)} style={{ ...C.primaryBtn, flex: 1 }}>Next →</button>
          </div>
        </>}

        {/* ── STEP 3 ── */}
        {step === 3 && <>
          <div style={C.label}>Anything running low?</div>
          <p style={C.hint}>Check anything that needs restocking. Leave blank if everything's fine.</p>
          {LOW_ITEMS.map(item => (
            <label key={item.id} style={C.checkRow}>
              <input type="checkbox" checked={lowChecked[item.id]}
                onChange={e => setLowChecked(p => ({ ...p, [item.id]: e.target.checked }))}
                style={{ width: 17, height: 17, accentColor: "#dc2626", cursor: "pointer", flexShrink: 0 }} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1 }}>
                <span style={{ fontSize: 15, color: lowChecked[item.id] ? "#dc2626" : "#1e293b", fontWeight: lowChecked[item.id] ? 600 : 400 }}>
                  {item.label}
                </span>
                {item.hint && <span style={{ fontSize: 11, color: "#94a3b8" }}>{item.hint}</span>}
              </div>
            </label>
          ))}
          <div style={C.navRow}>
            <button onClick={() => setStep(2)} style={C.ghostBtn}>← Back</button>
            <button onClick={() => setStep(4)} style={{ ...C.primaryBtn, flex: 1 }}>Review →</button>
          </div>
        </>}

        {/* ── STEP 4 ── */}
        {step === 4 && <>
          <div style={C.label}>Review & Submit</div>

          <div style={C.reviewBlock}>
            <div style={C.reviewTitle}>Setup & Date</div>
            <div style={C.reviewRow}>
              <span>{setup}</span>
              <span style={C.blueBadge}>{patients} patients</span>
            </div>
            <div style={{ ...C.reviewRow, color: "#94a3b8", fontSize: 13 }}>
              <span>{new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
            </div>
          </div>

          <div style={C.reviewBlock}>
            <div style={C.reviewTitle}>Items Used</div>
            {AUTO_ITEMS.filter(i => autoQtys[i.id] > 0).map(i => (
              <div key={i.id} style={C.reviewRow}><span>{i.label}</span><span style={C.blueBadge}>{autoQtys[i.id]}</span></div>
            ))}
            {MANUAL_ITEMS.filter(i => manualQtys[i.id] > 0).map(i => (
              <div key={i.id} style={C.reviewRow}><span>{i.label}</span><span style={C.blueBadge}>{manualQtys[i.id]}</span></div>
            ))}
            {AUTO_ITEMS.every(i => !autoQtys[i.id]) && MANUAL_ITEMS.every(i => !manualQtys[i.id]) && (
              <p style={{ color: "#94a3b8", fontSize: 13, margin: "4px 0" }}>None recorded</p>
            )}
          </div>

          {RARE_ITEMS.some(i => rare[i.id].checked) && (
            <div style={C.reviewBlock}>
              <div style={C.reviewTitle}>Rare Items</div>
              {RARE_ITEMS.filter(i => rare[i.id].checked).map(item => {
                const r = rare[item.id];
                const lines = item.sizes
                  ? item.sizes.filter(sz => r.sizeQtys[sz] > 0).map(sz => `${item.label} ${sz} ×${r.sizeQtys[sz]}`)
                  : r.qty > 0 ? [`${item.label} ×${r.qty}`] : [item.label];
                return lines.map((l, i) => (
                  <div key={i} style={C.reviewRow}><span style={{ fontSize: 14 }}>{l}</span></div>
                ));
              })}
            </div>
          )}

          {LOW_ITEMS.some(i => lowChecked[i.id]) && (
            <div style={C.reviewBlock}>
              <div style={{ ...C.reviewTitle, color: "#dc2626" }}>Needs Restocking</div>
              {LOW_ITEMS.filter(i => lowChecked[i.id]).map(i => (
                <div key={i.id} style={C.reviewRow}>
                  <span>{i.label}</span>
                  <span style={C.redBadge}>Low</span>
                </div>
              ))}
            </div>
          )}

          <div style={C.label}>Your initials</div>
          <input
            type="text"
            maxLength={9}
            placeholder="e.g. JD or JD,MK"
            value={initials}
            onChange={e => setInitials(e.target.value)}
            style={C.initialsInput}
          />

          <div style={C.navRow}>
            <button onClick={() => setStep(3)} style={C.ghostBtn}>← Back</button>
            <button onClick={submit}
              style={{ ...C.primaryBtn, flex: 1, background: "#16a34a", ...(!initials.trim() ? C.disabledBtn : {}) }}
              disabled={!initials.trim()}>
              Submit ✓
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ─────────────────────────── STYLES ───────────────────────────

const C = {
  page: { minHeight: "100vh", background: "#f1f5f9", display: "flex", justifyContent: "center", padding: "20px 16px 40px", fontFamily: "'DM Sans', system-ui, sans-serif" },
  card: { background: "#fff", borderRadius: 18, padding: "22px 22px 28px", width: "100%", maxWidth: 460, alignSelf: "flex-start", boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 8px 24px rgba(0,0,0,0.06)" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  title: { fontSize: 19, fontWeight: 700, margin: 0, color: "#0f172a", letterSpacing: "-0.3px" },
  stepIndicatorLabel: { fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" },
  label: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#475569", marginBottom: 8 },
  hint: { fontSize: 12, color: "#94a3b8", margin: "0 0 10px" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f1f5f9" },
  checkRow: { display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #f1f5f9", cursor: "pointer" },
  navRow: { display: "flex", gap: 10, marginTop: 24 },
  reviewBlock: { background: "#f8fafc", borderRadius: 10, padding: "12px 14px", marginBottom: 12 },
  reviewTitle: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94a3b8", marginBottom: 8 },
  reviewRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 14, color: "#1e293b" },
  primaryBtn: { width: "100%", padding: "13px 0", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", letterSpacing: "-0.1px" },
  disabledBtn: { background: "#cbd5e1", cursor: "not-allowed" },
  ghostBtn: { padding: "8px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 500 },
  chip: { padding: "7px 14px", borderRadius: 99, border: "2px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#475569" },
  chipOn: { borderColor: "#2563eb", background: "#eff6ff", color: "#1d4ed8" },
  stepBtn: { width: 30, height: 30, borderRadius: 7, border: "1px solid #e2e8f0", background: "#f8fafc", fontSize: 17, cursor: "pointer", color: "#334155", display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 },
  stepVal: { minWidth: 26, textAlign: "center", fontWeight: 700, fontSize: 16, color: "#0f172a" },
  blueBadge: { background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 99 },
  redBadge: { background: "#fff5f5", color: "#dc2626", fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 99 },
  muted: { textAlign: "center", color: "#94a3b8", padding: "24px 0" },
  emptyState: { textAlign: "center", padding: "32px 0" },
  weekNav: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 20 },
  weekLabel: { fontWeight: 600, fontSize: 14, color: "#0f172a" },
  navArrow: { padding: "4px 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 18, color: "#475569" },
  setupCard: { border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden", marginBottom: 16 },
  setupHeader: { background: "#2563eb", color: "#fff", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  setupMeta: { fontSize: 12, opacity: 0.85 },
  adminSection: { fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94a3b8", marginBottom: 6 },
  adminRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #f1f5f9", fontSize: 13, color: "#1e293b" },
  initialsInput: { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 20, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", outline: "none", marginBottom: 16, boxSizing: "border-box", color: "#0f172a" },
};
