import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── DATA ──────────────────────────────────────────────────────────

const SETUPS = ["Dr. Arash", "Dr. Roberts", "Dr. Maya", "Grand Smiles Chicago", "Grand Smiles Rockford", "Esha/CDC"];

const AUTO_ITEMS = [
  { id: "pedsCircuit",   label: "Peds Circuit",    tag: "1",   calc: () => 1 },
  { id: "circuitFilter", label: "Circuit Filter",  tag: "n−1", calc: n => Math.max(0, n - 1) },
  { id: "redRubber",     label: "12 Fr Red Rubber", tag: "n",  calc: n => n },
  { id: "tubeExt",       label: "Tube Extension",  tag: "n",   calc: n => n },
  { id: "iv22g",         label: "22g IV",           tag: "n",  calc: n => n },
  { id: "ivTubing",      label: "IV Tubing",        tag: "n",  calc: n => n },
  { id: "ivHub",         label: "IV Hub",           tag: "n",  calc: n => n },
  { id: "ivFluids",      label: "IV Fluids",        tag: "n",  calc: n => n },
  { id: "propofol",      label: "Propofol",         tag: "n",  calc: n => n },
  { id: "syr20",         label: "20cc Syringes",    tag: "n",  calc: n => n },
  { id: "syr5",          label: "5cc Syringes",     tag: "autofill = tubes + routine meds", calc: n => n + 4 },
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

const EMERGENCY_MEDS = [
  { id: "sodiumBicarb",    label: "Sodium Bicarbonate" },
  { id: "nitro",           label: "Nitroglycerin 0.4mg/tablet" },
  { id: "flumazenil",      label: "Flumazenil .1mg/mL" },
  { id: "furosemide",      label: "Furosemide 10mg/mL" },
  { id: "esmolol",         label: "Esmolol 10mg/mL" },
  { id: "d50",             label: "D50" },
  { id: "metoprolol",      label: "Metoprolol" },
  { id: "labetalol",       label: "Labetalol HCl 5mg/mL" },
  { id: "tranexamic",      label: "Tranexamic Acid 100mg/mL" },
  { id: "neostigmine",     label: "Neostigmine 1mg/mL" },
  { id: "cefazolin",       label: "Cefazolin" },
  { id: "ampicillin",      label: "Ampicillin 1g/vial" },
  { id: "hydrocortisone",  label: "Hydrocortisone 100mg" },
  { id: "magnesium",       label: "Magnesium 500mg/mL" },
  { id: "calciumGluc",     label: "Calcium Gluconate 100mg/mL" },
  { id: "hydralazine",     label: "Hydralazine 20mg/mL" },
  { id: "phenylephrine",   label: "Phenylephrine 10mg/mL" },
  { id: "ephedrine",       label: "Ephedrine 5mL/mL" },
  { id: "amiodarone",      label: "Amiodarone 50mg/mL" },
  { id: "adenosine",       label: "Adenosine 3mg/mL" },
  { id: "diphenhydramine", label: "Diphenhydramine 50mg/mL" },
  { id: "naloxone",        label: "Naloxone HCl 0.4mg/mL" },
  { id: "rocuronium",      label: "Rocuronium 10mg/mL" },
  { id: "ryanodex",        label: "Ryanodex" },
  { id: "dantrolene",      label: "Dantrolene" },
  { id: "sterileWater",    label: "Sterile Water 50cc" },
];

const LOW_ITEMS = [
  { id: "ekgStickers",  label: "EKG Stickers",   hint: "<2 full packs", restock: "2 packs" },
  { id: "syr1cc",       label: "1cc Syringes",    hint: "<10",           restock: "25" },
  { id: "glyco",        label: "Glyco",           hint: "<15",           restock: "1 box" },
  { id: "zofran",       label: "Zofran",          hint: "<15",           restock: "1 box" },
  { id: "toradol",      label: "Toradol",         hint: "<10",           restock: "1 box" },
  { id: "dex",          label: "Dexamethasone",   hint: "<3",            restock: "2 bottles" },
  { id: "lido",         label: "Lidocaine",       hint: "<2",            restock: "1 bottle" },
  { id: "sevo",         label: "Sevo",            hint: "<4",            restock: "2 bottles" },
  { id: "tourniquets",  label: "Tourniquets",     hint: "",              restock: "1 roll" },
  { id: "alcoholWipes", label: "Alcohol Wipes",   hint: "<50ish",        restock: "1 box" },
  { id: "tegaderm",     label: "Tegaderm",        hint: "<30",           restock: "1 box" },
  { id: "gauze4x4",     label: "4x4 Gauze",       hint: "<1 full pack",  restock: "1 pack" },
  { id: "needles18g",   label: "18g Needles",     hint: "<50",           restock: "1 box" },
  { id: "afrin",        label: "Afrin",           hint: "<2",            restock: "1 bottle" },
  { id: "lube",         label: "Lube",            hint: "<3",            restock: "1 bottle" },
  { id: "clearTape",    label: "Clear Tape",      hint: "<3",            restock: "3 rolls" },
  { id: "thickSilk",    label: "Thick Silk Tape", hint: "<2",            restock: "2 rolls" },
  { id: "thinSilk",     label: "Thin Silk Tape",  hint: "<2",            restock: "2 rolls" },
];

const DC_FIELDS = [
  { id: "morphine",  label: "Morphine" },
  { id: "versed",    label: "Versed" },
  { id: "ketamine",  label: "Ketamine" },
  { id: "fentanyl",  label: "Fentanyl" },
  { id: "oxygenPSI", label: "Oxygen PSI" },
];

// ── HELPERS ───────────────────────────────────────────────────────

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function fmtDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function initRare() {
  return Object.fromEntries(
    RARE_ITEMS.map(item => [
      item.id,
      { checked: false, qty: 0, sizeQtys: item.sizes ? Object.fromEntries(item.sizes.map(s => [s, 0])) : null }
    ])
  );
}

function initEmergencyMeds() {
  return Object.fromEntries(EMERGENCY_MEDS.map(m => [m.id, false]));
}

// ── STEPPER ───────────────────────────────────────────────────────

function Stepper({ value, onChange, max = Infinity }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button onClick={() => onChange(Math.max(0, value - 1))} style={C.stepBtn}>−</button>
      <span style={C.stepVal}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} style={C.stepBtn}>+</button>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("home");

  // Supply Log state
  const [slStep,        setSLStep]        = useState(0);
  const [slSetup,       setSLSetup]       = useState("");
  const [slPatients,    setSLPatients]    = useState(0);
  const [slDate,        setSLDate]        = useState(() => fmtDate(new Date()));
  const [autoQtys,      setAutoQtys]      = useState(() => Object.fromEntries(AUTO_ITEMS.map(i => [i.id, 0])));
  const [manualQtys,    setManualQtys]    = useState(() => Object.fromEntries(MANUAL_ITEMS.map(i => [i.id, 0])));
  const [rare,          setRare]          = useState(initRare);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyMeds, setEmergencyMeds] = useState(initEmergencyMeds);
  const [lowChecked,    setLowChecked]    = useState(() => Object.fromEntries(LOW_ITEMS.map(i => [i.id, false])));
  const [slInitials,    setSLInitials]    = useState("");
  const [slComments,    setSLComments]    = useState("");

  // Daily Check state
  const [dcSetup,    setDCSetup]    = useState("");
  const [dcDate,     setDCDate]     = useState(() => fmtDate(new Date()));
  const [dcValues,   setDCValues]   = useState(() => Object.fromEntries(DC_FIELDS.map(f => [f.id, ""])));
  const [dcAED,      setDCAED]      = useState("");
  const [dcScope,    setDCScope]    = useState(0);
  const [dcInitials, setDCInitials] = useState("");

  // Admin state
  const [supplySubs,    setSupplySubs]    = useState([]);
  const [dailySubs,     setDailySubs]     = useState([]);
  const [loadingAdmin,  setLoadingAdmin]  = useState(false);
  const [weekStart,     setWeekStart]     = useState(() => getMondayOfWeek(new Date()));
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [dcAdminSetup,  setDCAdminSetup]  = useState("");
  const [dcMonthStart,  setDCMonthStart]  = useState(() => getMonthStart(new Date()));

  // Supply Log helpers
  const applyPatients = (n) => {
    setSLPatients(n);
    setAutoQtys(Object.fromEntries(AUTO_ITEMS.map(i => [i.id, i.calc(n)])));
  };

  const resetSL = () => {
    setSLStep(0); setSLSetup(""); setSLPatients(0); setSLDate(fmtDate(new Date()));
    setAutoQtys(Object.fromEntries(AUTO_ITEMS.map(i => [i.id, 0])));
    setManualQtys(Object.fromEntries(MANUAL_ITEMS.map(i => [i.id, 0])));
    setRare(initRare()); setEmergencyOpen(false); setEmergencyMeds(initEmergencyMeds());
    setLowChecked(Object.fromEntries(LOW_ITEMS.map(i => [i.id, false])));
    setSLInitials(""); setSLComments("");
    setScreen("home");
  };

  const submitSL = async () => {
    const entry = {
      id: Date.now().toString(), timestamp: new Date().toISOString(), date: slDate,
      setup: slSetup, patients: slPatients, autoQtys, manualQtys, rare,
      emergencyOpen, emergencyMeds, lowChecked,
      initials: slInitials.toUpperCase().trim(), comments: slComments.trim()
    };
    try { await supabase.from("submissions").insert({ id: entry.id, data: entry }); } catch {}
    setScreen("supply-success");
  };

  // Daily Check helpers
  const resetDC = () => {
    setDCSetup(""); setDCDate(fmtDate(new Date()));
    setDCValues(Object.fromEntries(DC_FIELDS.map(f => [f.id, ""])));
    setDCAED(""); setDCScope(0); setDCInitials("");
    setScreen("home");
  };

  const submitDC = async () => {
    const entry = {
      id: Date.now().toString(), timestamp: new Date().toISOString(), date: dcDate,
      setup: dcSetup, ...dcValues, aed: dcAED, scopeBatteries: dcScope,
      initials: dcInitials.toUpperCase().trim()
    };
    try { await supabase.from("daily_checks").insert({ id: entry.id, data: entry }); } catch {}
    setScreen("daily-success");
  };

  // Admin loaders
  const loadSupplySubs = async () => {
    setLoadingAdmin(true);
    try {
      const { data, error } = await supabase.from("submissions").select("data").order("created_at", { ascending: false });
      if (!error && data) setSupplySubs(data.map(r => r.data));
    } catch {}
    setLoadingAdmin(false);
  };

  const loadDailySubs = async () => {
    setLoadingAdmin(true);
    try {
      const { data, error } = await supabase.from("daily_checks").select("data").order("created_at", { ascending: false });
      if (!error && data) setDailySubs(data.map(r => r.data));
    } catch {}
    setLoadingAdmin(false);
  };

  useEffect(() => {
    if (screen === "supply-admin") loadSupplySubs();
    if (screen === "daily-admin") loadDailySubs();
  }, [screen]);

  // Delete
  const deleteSub = async (id, table) => {
    try {
      await supabase.from(table).delete().eq("id", id);
      if (table === "submissions") setSupplySubs(prev => prev.filter(s => s.id !== id));
      else setDailySubs(prev => prev.filter(s => s.id !== id));
    } catch {}
    setConfirmDelete(null);
  };

  // CSV helpers
  const toCSV = rows => rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

  const downloadCSV = (csv, filename) => {
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(new Blob([csv], { type: "text/csv" })),
      download: filename
    });
    a.click();
  };

  // Supply Log CSV
  const buildSetupCSV = (setupName, setupSubs) => {
    setupSubs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const dates = [...new Set(setupSubs.map(s => s.date))];
    const byDate = Object.fromEntries(dates.map(d => [d, setupSubs.filter(s => s.date === d)]));
    const fmtHeader = date => new Date(date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const daySum  = (date, fn) => byDate[date].reduce((a, s) => a + (fn(s) || 0), 0);
    const dayFlag = (date, fn) => byDate[date].some(fn) ? "LOW" : "";
    const blank   = dates.map(() => "");
    const rows = [];
    rows.push(["Supply", ...dates.map(fmtHeader), "Supply", "Weekly Total"]);
    const submitters = [...new Set(setupSubs.map(s => s.initials).filter(Boolean))].join(", ");
    rows.push(["Submitted by", ...dates.map(d => [...new Set(byDate[d].map(s => s.initials).filter(Boolean))].join(",")), "", submitters]);
    const patientCounts = dates.map(d => daySum(d, s => s.patients || 0));
    rows.push(["Patients", ...patientCounts, "Patients", patientCounts.reduce((a, b) => a + b, 0)]);
    rows.push(["", ...blank, "", ""]);
    rows.push(["AUTO-POPULATED ITEMS", ...blank, "", ""]);
    AUTO_ITEMS.forEach(item => {
      const counts = dates.map(d => daySum(d, s => s.autoQtys?.[item.id] || 0));
      rows.push([item.label, ...counts, item.label, counts.reduce((a, b) => a + b, 0)]);
    });
    rows.push(["", ...blank, "", ""]);
    rows.push(["MANUAL COUNT ITEMS", ...blank, "", ""]);
    MANUAL_ITEMS.forEach(item => {
      const counts = dates.map(d => daySum(d, s => s.manualQtys?.[item.id] || 0));
      rows.push([item.label, ...counts, item.label, counts.reduce((a, b) => a + b, 0)]);
    });
    rows.push(["", ...blank, "", ""]);
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
    EMERGENCY_MEDS.forEach(med => {
      const counts = dates.map(d => byDate[d].some(s => s.emergencyMeds?.[med.id]) ? 1 : 0);
      if (counts.some(c => c > 0)) rareRows.push([med.label, ...counts, med.label, counts.reduce((a, b) => a + b, 0)]);
    });
    if (rareRows.length > 0) {
      rows.push(["RARE / EMERGENCY ITEMS USED", ...blank, "", ""]);
      rareRows.forEach(r => rows.push(r));
      rows.push(["", ...blank, "", ""]);
    }
    const lowRows = LOW_ITEMS.map(item => {
      const flags = dates.map(d => dayFlag(d, s => s.lowChecked?.[item.id]));
      const count = flags.filter(f => f === "LOW").length;
      return count > 0 ? [item.label, ...flags, item.label, `${count}x flagged`] : null;
    }).filter(Boolean);
    if (lowRows.length > 0) {
      rows.push(["LOW STOCK FLAGS", ...blank, "", ""]);
      lowRows.forEach(r => rows.push(r));
    }
    const safeName = setupName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    return { csv: toCSV(rows), filename: `${safeName}-${fmtDate(weekStart)}.csv` };
  };

  const exportOne = (setupName) => {
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    const setupSubs = supplySubs.filter(s => s.setup === setupName && new Date(s.timestamp) >= weekStart && new Date(s.timestamp) < end);
    if (!setupSubs.length) { alert("No submissions for this setup this week."); return; }
    const { csv, filename } = buildSetupCSV(setupName, setupSubs);
    downloadCSV(csv, filename);
  };

  const exportAll = () => {
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    const filtered = supplySubs.filter(s => { const d = new Date(s.timestamp); return d >= weekStart && d < end; });
    if (!filtered.length) { alert("No submissions this week."); return; }
    const bySetup = {};
    filtered.forEach(s => { if (!bySetup[s.setup]) bySetup[s.setup] = []; bySetup[s.setup].push(s); });
    Object.entries(bySetup).forEach(([setupName, subs], idx) => {
      const { csv, filename } = buildSetupCSV(setupName, subs);
      setTimeout(() => downloadCSV(csv, filename), idx * 600);
    });
  };

  // Daily Check CSV
  const exportDailyCSV = (setupName) => {
    const end = new Date(dcMonthStart); end.setMonth(end.getMonth() + 1);
    const subs = dailySubs.filter(s => s.setup === setupName && new Date(s.timestamp) >= dcMonthStart && new Date(s.timestamp) < end);
    if (!subs.length) { alert("No entries for this setup this month."); return; }
    subs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const headers = ["Date", "Time", "Initials", ...DC_FIELDS.map(f => f.label), "AED", "Scope Batteries"];
    const rows = [headers, ...subs.map(s => [
      s.date, fmtTime(s.timestamp), s.initials || "—",
      ...DC_FIELDS.map(f => s[f.id] ?? ""),
      s.aed || "", s.scopeBatteries ?? ""
    ])];
    const safeName = setupName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    const monthLabel = dcMonthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }).replace(" ", "-").toLowerCase();
    downloadCSV(toCSV(rows), `daily-check-${safeName}-${monthLabel}.csv`);
  };

  // Delete modal
  const DeleteModal = () => !confirmDelete ? null : (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, maxWidth: 340, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>🗑</div>
        <h3 style={{ fontSize: 17, fontWeight: 700, textAlign: "center", margin: "0 0 8px", color: "#0f172a" }}>Delete this entry?</h3>
        <p style={{ fontSize: 14, color: "#64748b", textAlign: "center", margin: "0 0 4px" }}>
          {confirmDelete.setup} · {new Date(confirmDelete.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", margin: "0 0 20px" }}>
          {fmtTime(confirmDelete.timestamp)} · {confirmDelete.initials || "—"}
        </p>
        <p style={{ fontSize: 12, color: "#dc2626", textAlign: "center", fontWeight: 600, margin: "0 0 20px" }}>This cannot be undone.</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setConfirmDelete(null)} style={{ ...C.ghostBtn, flex: 1, padding: "11px 0", borderRadius: 10, textAlign: "center" }}>Cancel</button>
          <button onClick={() => deleteSub(confirmDelete.id, confirmDelete._table)}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: "#dc2626", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );

  // ── HOME ──────────────────────────────────────────────────────────

  if (screen === "home") return (
    <div style={C.page}>
      <div style={C.card}>
        <h1 style={{ ...C.title, fontSize: 22, marginBottom: 4 }}>Anesthesia Supply Tracker</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 28 }}>Select a section to continue</p>

        <button onClick={() => setScreen("daily-form")} style={C.homeBtn}>
          <div style={{ ...C.homeBtnIcon, background: "#e0f2fe" }}>🩺</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={C.homeBtnTitle}>Daily Check</div>
            <div style={C.homeBtnSub}>Beginning of day</div>
          </div>
          <span style={C.homeBtnArrow}>→</span>
        </button>

        <button onClick={() => setScreen("supply-form")} style={{ ...C.homeBtn, marginTop: 12 }}>
          <div style={{ ...C.homeBtnIcon, background: "#dcfce7" }}>📦</div>
          <div style={{ flex: 1, textAlign: "left" }}>
            <div style={C.homeBtnTitle}>Supply Log</div>
            <div style={C.homeBtnSub}>End of day</div>
          </div>
          <span style={C.homeBtnArrow}>→</span>
        </button>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button onClick={() => setScreen("daily-admin")} style={{ ...C.ghostBtn, flex: 1, textAlign: "center" }}>Daily Check Admin</button>
          <button onClick={() => setScreen("supply-admin")} style={{ ...C.ghostBtn, flex: 1, textAlign: "center" }}>Supply Log Admin</button>
        </div>
      </div>
    </div>
  );

  // ── DAILY CHECK FORM ──────────────────────────────────────────────

  if (screen === "daily-form") {
    const canSubmit = dcSetup && dcInitials.trim();
    return (
      <div style={C.page}>
        <div style={C.card}>
          <div style={C.topBar}>
            <div>
              <h1 style={C.title}>Daily Check</h1>
              <div style={C.stepIndicatorLabel}>Beginning of day</div>
            </div>
            <button onClick={() => setScreen("home")} style={C.ghostBtn}>← Back</button>
          </div>

          <div style={C.label}>Date</div>
          <input type="date" value={dcDate} onChange={e => setDCDate(e.target.value)}
            style={{ ...C.initialsInput, fontSize: 15, letterSpacing: 0, fontWeight: 500, marginBottom: 20 }} />

          <div style={C.label}>Which setup?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {SETUPS.map(opt => (
              <button key={opt} style={{ ...C.chip, ...(dcSetup === opt ? C.chipOn : {}) }} onClick={() => setDCSetup(opt)}>{opt}</button>
            ))}
          </div>

          <div style={C.label}>Controlled Substances / Gases</div>
          <p style={C.hint}>Amount on hand at start of day.</p>
          {DC_FIELDS.map(field => (
            <div key={field.id} style={C.row}>
              <label style={{ fontSize: 15, color: "#1e293b" }}>{field.label}</label>
              <input
                type="number" inputMode="numeric" pattern="[0-9]*"
                value={dcValues[field.id]}
                onChange={e => setDCValues(p => ({ ...p, [field.id]: e.target.value }))}
                style={{ width: 80, padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e2e8f0", fontSize: 16, fontWeight: 600, textAlign: "center", outline: "none" }}
                placeholder="—"
              />
            </div>
          ))}

          <div style={{ ...C.row, flexDirection: "column", alignItems: "flex-start", gap: 10, paddingTop: 12 }}>
            <span style={{ fontSize: 15, color: "#1e293b" }}>AED</span>
            <div style={{ display: "flex", gap: 10 }}>
              {["Pass", "Fail"].map(opt => (
                <button key={opt}
                  onClick={() => setDCAED(dcAED === opt.toLowerCase() ? "" : opt.toLowerCase())}
                  style={{
                    padding: "8px 28px", borderRadius: 8, border: "2px solid",
                    borderColor: dcAED === opt.toLowerCase() ? (opt === "Pass" ? "#16a34a" : "#dc2626") : "#e2e8f0",
                    background: dcAED === opt.toLowerCase() ? (opt === "Pass" ? "#f0fdf4" : "#fff5f5") : "#fff",
                    color: dcAED === opt.toLowerCase() ? (opt === "Pass" ? "#16a34a" : "#dc2626") : "#475569",
                    fontWeight: 600, fontSize: 14, cursor: "pointer"
                  }}>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div style={C.row}>
            <span style={{ fontSize: 15, color: "#1e293b" }}>Scope Rechargeable Batteries</span>
            <Stepper value={dcScope} onChange={setDCScope} max={2} />
          </div>

          <div style={{ ...C.label, marginTop: 20 }}>Your initials</div>
          <input type="text" maxLength={9} placeholder="e.g. JD or JD,MK"
            value={dcInitials} onChange={e => setDCInitials(e.target.value)}
            style={C.initialsInput} />

          <button onClick={submitDC}
            style={{ ...C.primaryBtn, background: "#0891b2", ...(!canSubmit ? C.disabledBtn : {}) }}
            disabled={!canSubmit}>
            Submit ✓
          </button>
        </div>
      </div>
    );
  }

  // ── DAILY CHECK SUCCESS ───────────────────────────────────────────

  if (screen === "daily-success") return (
    <div style={C.page}>
      <div style={{ ...C.card, textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Logged!</h2>
        <p style={{ color: "#718096", marginBottom: 32 }}>Daily check submitted for {dcSetup}</p>
        <button onClick={resetDC} style={{ ...C.primaryBtn, background: "#0891b2" }}>Back to Home</button>
      </div>
    </div>
  );

  // ── DAILY CHECK ADMIN ─────────────────────────────────────────────

  if (screen === "daily-admin") {
    const monthEnd = new Date(dcMonthStart); monthEnd.setMonth(monthEnd.getMonth() + 1);
    const monthSubs = dailySubs
      .filter(s => dcAdminSetup && s.setup === dcAdminSetup && new Date(s.timestamp) >= dcMonthStart && new Date(s.timestamp) < monthEnd)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const monthLabel = dcMonthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    return (
      <div style={C.page}>
        <div style={C.card}>
          <div style={C.topBar}>
            <h1 style={C.title}>Daily Check Admin</h1>
            <button onClick={() => setScreen("home")} style={C.ghostBtn}>← Back</button>
          </div>

          <div style={C.label}>Select Setup</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {SETUPS.map(opt => (
              <button key={opt} style={{ ...C.chip, ...(dcAdminSetup === opt ? C.chipOn : {}) }}
                onClick={() => setDCAdminSetup(opt)}>{opt}</button>
            ))}
          </div>

          {dcAdminSetup && <>
            <div style={C.weekNav}>
              <button onClick={() => { const d = new Date(dcMonthStart); d.setMonth(d.getMonth() - 1); setDCMonthStart(d); }} style={C.navArrow}>‹</button>
              <span style={C.weekLabel}>{monthLabel}</span>
              <button onClick={() => { const d = new Date(dcMonthStart); d.setMonth(d.getMonth() + 1); setDCMonthStart(d); }} style={C.navArrow}>›</button>
            </div>

            {loadingAdmin ? <p style={C.muted}>Loading…</p>
              : monthSubs.length === 0 ? (
                <div style={C.emptyState}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                  <p style={C.muted}>No entries for {dcAdminSetup} in {monthLabel}.</p>
                </div>
              ) : monthSubs.map(sub => (
                <div key={sub.id} style={{ ...C.setupCard, marginBottom: 12 }}>
                  <div style={{ ...C.setupHeader, background: "#0891b2" }}>
                    <span style={{ fontWeight: 700 }}>
                      {new Date(sub.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span style={C.setupMeta}>{new Date(sub.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {fmtTime(sub.timestamp)} · {sub.initials || "—"}</span>
                  </div>
                  <div style={{ padding: "10px 16px" }}>
                    {DC_FIELDS.map(f => sub[f.id] !== "" && sub[f.id] !== undefined && (
                      <div key={f.id} style={C.adminRow}>
                        <span>{f.label}</span><span style={C.blueBadge}>{sub[f.id]}</span>
                      </div>
                    ))}
                    {sub.aed && (
                      <div style={C.adminRow}>
                        <span>AED</span>
                        <span style={sub.aed === "pass" ? C.greenBadge : C.redBadge}>{sub.aed === "pass" ? "Pass ✓" : "Fail ✗"}</span>
                      </div>
                    )}
                    <div style={C.adminRow}>
                      <span>Scope Batteries</span><span style={C.blueBadge}>{sub.scopeBatteries}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 6 }}>
                      <button onClick={() => setConfirmDelete({ ...sub, _table: "daily_checks" })}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#cbd5e1" }}>🗑</button>
                    </div>
                  </div>
                </div>
              ))
            }

            {monthSubs.length > 0 && (
              <button onClick={() => exportDailyCSV(dcAdminSetup)}
                style={{ ...C.primaryBtn, background: "#0891b2", marginTop: 8 }}>
                Export CSV — {dcAdminSetup} ↓
              </button>
            )}
          </>}

          <DeleteModal />
        </div>
      </div>
    );
  }

  // ── SUPPLY LOG ADMIN ──────────────────────────────────────────────

  if (screen === "supply-admin") {
    const end = new Date(weekStart); end.setDate(end.getDate() + 7);
    const weekSubs = supplySubs.filter(s => { const d = new Date(s.timestamp); return d >= weekStart && d < end; });
    const bySetup = Object.fromEntries(SETUPS.map(s => [s, []]));
    weekSubs.forEach(s => { if (bySetup[s.setup]) bySetup[s.setup].push(s); });
    const activeSetups = SETUPS.filter(s => bySetup[s].length > 0);
    const wkLabel = `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${new Date(end - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

    return (
      <div style={C.page}>
        <div style={C.card}>
          <div style={C.topBar}>
            <h1 style={C.title}>Supply Log Admin</h1>
            <button onClick={() => setScreen("home")} style={C.ghostBtn}>← Back</button>
          </div>

          <div style={C.weekNav}>
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} style={C.navArrow}>‹</button>
            <span style={C.weekLabel}>{wkLabel}</span>
            <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} style={C.navArrow}>›</button>
          </div>

          {loadingAdmin ? <p style={C.muted}>Loading…</p>
            : activeSetups.length === 0 ? (
              <div style={C.emptyState}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📋</div>
                <p style={C.muted}>No submissions this week.</p>
              </div>
            ) : activeSetups.map(setupName => {
              const ss = bySetup[setupName];
              const totalPts = ss.reduce((a, s) => a + (s.patients || 0), 0);
              const autoTotals = Object.fromEntries(AUTO_ITEMS.map(i => [i.id, ss.reduce((a, s) => a + (s.autoQtys?.[i.id] || 0), 0)]));
              const manTotals  = Object.fromEntries(MANUAL_ITEMS.map(i => [i.id, ss.reduce((a, s) => a + (s.manualQtys?.[i.id] || 0), 0)]));
              const lowCounts  = Object.fromEntries(LOW_ITEMS.map(i => [i.id, ss.filter(s => s.lowChecked?.[i.id]).length]));
              const flaggedLow = LOW_ITEMS.filter(i => lowCounts[i.id] > 0);
              const rareLines  = RARE_ITEMS.flatMap(item => ss.flatMap(s => {
                const r = s.rare?.[item.id];
                if (!r?.checked) return [];
                if (item.sizes) return item.sizes.filter(sz => r.sizeQtys?.[sz] > 0).map(sz => `${item.label} ${sz} ×${r.sizeQtys[sz]}`);
                return r.qty > 0 ? [`${item.label} ×${r.qty}`] : [];
              }));
              const emergencyLines = EMERGENCY_MEDS.flatMap(med =>
                ss.some(s => s.emergencyMeds?.[med.id]) ? [med.label] : []
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
                    {(rareLines.length > 0 || emergencyLines.length > 0) && <>
                      <div style={{ ...C.adminSection, marginTop: 10 }}>Rare / Emergency Items</div>
                      {rareLines.map((l, i) => <div key={i} style={C.adminRow}><span>{l}</span></div>)}
                      {emergencyLines.map((l, i) => <div key={"em" + i} style={C.adminRow}><span style={{ color: "#dc2626" }}>{l}</span></div>)}
                    </>}
                    {flaggedLow.length > 0 && <>
                      <div style={{ ...C.adminSection, marginTop: 10, color: "#c53030" }}>Needs Restocking</div>
                      {flaggedLow.map(i => (
                        <div key={i.id} style={C.adminRow}>
                          <span>{i.label}{i.hint ? <span style={{ color: "#a0aec0", fontSize: 11, marginLeft: 6 }}>{i.hint}</span> : null}</span>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                            <span style={C.redBadge}>flagged {lowCounts[i.id]}×</span>
                            {i.restock && <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 600 }}>Bring {i.restock}</span>}
                          </div>
                        </div>
                      ))}
                    </>}
                    <div style={{ ...C.adminSection, marginTop: 14, borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>Individual Submissions</div>
                    {ss.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)).map(sub => (
                      <div key={sub.id} style={{ ...C.adminRow, alignItems: "flex-start" }}>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {new Date(sub.date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                          </span>
                          <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>
                            submitted {new Date(sub.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })} at {fmtTime(sub.timestamp)} · {sub.patients} patients · {sub.initials || "—"}
                          </span>
                          {sub.comments && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2, fontStyle: "italic" }}>"{sub.comments}"</div>}
                        </div>
                        <button onClick={() => setConfirmDelete({ ...sub, _table: "submissions" })}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#cbd5e1", padding: "2px 4px", flexShrink: 0 }}>🗑</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          }

          <div style={{ marginTop: 16 }}>
            <div style={C.adminSection}>Export CSV</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeSetups.map(setupName => (
                <button key={setupName} onClick={() => exportOne(setupName)}
                  style={{ ...C.ghostBtn, width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{setupName}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Download ↓</span>
                </button>
              ))}
              {activeSetups.length > 1 && (
                <button onClick={exportAll} style={{ ...C.primaryBtn, marginTop: 4 }}>
                  Download All ({activeSetups.length} files) ↓
                </button>
              )}
            </div>
          </div>

          <DeleteModal />
        </div>
      </div>
    );
  }

  // ── SUPPLY LOG SUCCESS ────────────────────────────────────────────

  if (screen === "supply-success") return (
    <div style={C.page}>
      <div style={{ ...C.card, textAlign: "center", paddingTop: 48, paddingBottom: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Logged!</h2>
        <p style={{ color: "#718096", marginBottom: 32 }}>Submitted for {slSetup}</p>
        <button onClick={resetSL} style={C.primaryBtn}>Back to Home</button>
        <button onClick={() => setScreen("supply-admin")} style={{ ...C.ghostBtn, marginTop: 12, width: "100%", padding: "11px 0", borderRadius: 10 }}>
          View Weekly Summary →
        </button>
      </div>
    </div>
  );

  // ── SUPPLY LOG FORM ───────────────────────────────────────────────

  const STEPS = ["Setup", "Items", "Rare Items", "Low Stock", "Review"];

  return (
    <div style={C.page}>
      <div style={C.card}>
        <div style={C.topBar}>
          <div>
            <h1 style={C.title}>Supply Log</h1>
            <div style={C.stepIndicatorLabel}>End of day · {STEPS[slStep]}</div>
          </div>
          <button onClick={() => setScreen("home")} style={{ ...C.ghostBtn, fontSize: 12 }}>← Home</button>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= slStep ? "#2563eb" : "#e2e8f0", transition: "background 0.25s" }} />
          ))}
        </div>

        {/* STEP 0 */}
        {slStep === 0 && <>
          <div style={C.label}>Date</div>
          <input type="date" value={slDate} onChange={e => setSLDate(e.target.value)}
            style={{ ...C.initialsInput, fontSize: 15, letterSpacing: 0, fontWeight: 500, marginBottom: 20 }} />
          <div style={C.label}>Which setup?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
            {SETUPS.map(opt => (
              <button key={opt} style={{ ...C.chip, ...(slSetup === opt ? C.chipOn : {}) }} onClick={() => setSLSetup(opt)}>{opt}</button>
            ))}
          </div>
          <div style={C.label}>Number of patients today</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
            <Stepper value={slPatients} onChange={applyPatients} />
            <span style={{ color: "#94a3b8", fontSize: 14 }}>patients</span>
          </div>
          <button style={{ ...C.primaryBtn, ...(!slSetup ? C.disabledBtn : {}) }} onClick={() => slSetup && setSLStep(1)}>Next →</button>
        </>}

        {/* STEP 1 */}
        {slStep === 1 && <>
          <div style={C.label}>Auto-populated items</div>
          <p style={C.hint}>Based on {slPatients} patient{slPatients !== 1 ? "s" : ""}. Adjust if today was different.</p>
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
            <button onClick={() => setSLStep(0)} style={C.ghostBtn}>← Back</button>
            <button onClick={() => setSLStep(2)} style={{ ...C.primaryBtn, flex: 1 }}>Next →</button>
          </div>
        </>}

        {/* STEP 2 */}
        {slStep === 2 && <>
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

          {/* Emergency Meds */}
          <div style={{ marginTop: 4 }}>
            <label style={C.checkRow}>
              <input type="checkbox" checked={emergencyOpen} onChange={e => setEmergencyOpen(e.target.checked)}
                style={{ width: 17, height: 17, accentColor: "#dc2626", cursor: "pointer", flexShrink: 0 }} />
              <span style={{ fontSize: 15, color: emergencyOpen ? "#dc2626" : "#1e293b", fontWeight: 700 }}>
                OTHER EMERGENCY MEDS
              </span>
            </label>
            {emergencyOpen && (
              <div style={{ paddingLeft: 31, marginTop: 4 }}>
                {EMERGENCY_MEDS.map(med => (
                  <label key={med.id} style={{ ...C.checkRow, padding: "7px 0" }}>
                    <input type="checkbox" checked={emergencyMeds[med.id]}
                      onChange={e => setEmergencyMeds(p => ({ ...p, [med.id]: e.target.checked }))}
                      style={{ width: 16, height: 16, accentColor: "#dc2626", cursor: "pointer", flexShrink: 0 }} />
                    <span style={{ fontSize: 14, color: emergencyMeds[med.id] ? "#dc2626" : "#1e293b", fontWeight: emergencyMeds[med.id] ? 600 : 400 }}>
                      {med.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div style={C.navRow}>
            <button onClick={() => setSLStep(1)} style={C.ghostBtn}>← Back</button>
            <button onClick={() => setSLStep(3)} style={{ ...C.primaryBtn, flex: 1 }}>Next →</button>
          </div>
        </>}

        {/* STEP 3 */}
        {slStep === 3 && <>
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
            <button onClick={() => setSLStep(2)} style={C.ghostBtn}>← Back</button>
            <button onClick={() => setSLStep(4)} style={{ ...C.primaryBtn, flex: 1 }}>Review →</button>
          </div>
        </>}

        {/* STEP 4 */}
        {slStep === 4 && <>
          <div style={C.label}>Review & Submit</div>

          <div style={C.reviewBlock}>
            <div style={C.reviewTitle}>Setup & Date</div>
            <div style={C.reviewRow}>
              <span>{slSetup}</span>
              <span style={C.blueBadge}>{slPatients} patients</span>
            </div>
            <div style={{ ...C.reviewRow, color: "#94a3b8", fontSize: 13 }}>
              <span>{new Date(slDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</span>
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

          {(RARE_ITEMS.some(i => rare[i.id].checked) || (emergencyOpen && EMERGENCY_MEDS.some(m => emergencyMeds[m.id]))) && (
            <div style={C.reviewBlock}>
              <div style={C.reviewTitle}>Rare / Emergency Items</div>
              {RARE_ITEMS.filter(i => rare[i.id].checked).map(item => {
                const r = rare[item.id];
                const lines = item.sizes
                  ? item.sizes.filter(sz => r.sizeQtys[sz] > 0).map(sz => `${item.label} ${sz} ×${r.sizeQtys[sz]}`)
                  : r.qty > 0 ? [`${item.label} ×${r.qty}`] : [item.label];
                return lines.map((l, i) => <div key={i} style={C.reviewRow}><span style={{ fontSize: 14 }}>{l}</span></div>);
              })}
              {emergencyOpen && EMERGENCY_MEDS.filter(m => emergencyMeds[m.id]).map(m => (
                <div key={m.id} style={C.reviewRow}><span style={{ fontSize: 14, color: "#dc2626" }}>{m.label}</span></div>
              ))}
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

          <div style={C.label}>Comments (optional)</div>
          <textarea
            placeholder="Any notes for the stocking person..."
            value={slComments} onChange={e => setSLComments(e.target.value)}
            style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box", color: "#0f172a", resize: "vertical", minHeight: 80, fontFamily: "inherit" }}
          />

          <div style={C.label}>Your initials</div>
          <input type="text" maxLength={9} placeholder="e.g. JD or JD,MK"
            value={slInitials} onChange={e => setSLInitials(e.target.value)}
            style={C.initialsInput} />

          <div style={C.navRow}>
            <button onClick={() => setSLStep(3)} style={C.ghostBtn}>← Back</button>
            <button onClick={submitSL}
              style={{ ...C.primaryBtn, flex: 1, background: "#16a34a", ...(!slInitials.trim() ? C.disabledBtn : {}) }}
              disabled={!slInitials.trim()}>
              Submit ✓
            </button>
          </div>
        </>}
      </div>
    </div>
  );
}

// ── STYLES ────────────────────────────────────────────────────────

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
  blueBadge:  { background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 99 },
  greenBadge: { background: "#f0fdf4", color: "#16a34a", fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 99 },
  redBadge:   { background: "#fff5f5", color: "#dc2626", fontWeight: 700, fontSize: 12, padding: "2px 10px", borderRadius: 99 },
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
  homeBtn: { width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 14, border: "2px solid #e2e8f0", background: "#fff", cursor: "pointer" },
  homeBtnIcon: { fontSize: 26, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 10, flexShrink: 0 },
  homeBtnTitle: { fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 2 },
  homeBtnSub: { fontSize: 12, color: "#94a3b8" },
  homeBtnArrow: { fontSize: 18, color: "#cbd5e1" },
};
