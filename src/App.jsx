import { useState, useEffect, useRef } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const DAILY_QUOTES = [
  "Дія передує впевненості. Не навпаки.",
  "Воїн не чекає натхнення — він діє.",
  "Я вже ця людина. Сьогодні я це підтверджую.",
  "Менше слів. Більше кроків.",
  "Зниж важливість — і двері відкриються самі.",
  "Емоція — сигнал. Не наказ.",
  "Кожен день — нова точка відліку.",
  "Я не боюсь бути кращим. Я вже є.",
  "Тиск — це тренажер. Не ворог.",
  "Один крок у потрібному напрямку.",
  "Не виправдовуйся перед старим собою.",
  "Ясність важливіша за швидкість.",
  "Я керую увагою — увага керує результатом.",
  "Зупинись. Подихай. Обери реакцію.",
  "Мій стан — мій вибір.",
  "Послідовність — суперсила.",
  "Нова версія не чекає ідеальних умов.",
  "Рости тихо. Результати говорять голосно.",
  "Я довіряю процесу.",
  "21 день — і я вже інший.",
  "Версія 2.0 — активна.",
];

const MORNING_Q = [
  "Ким я обираю бути сьогодні?",
  "Яка одна дія підтвердить мою нову ідентичність?",
  "Що я завершу сьогодні без відкладань?",
  "Як нова версія мене реагує на труднощі?",
  "Яку важливість мені варто знизити сьогодні?",
  "З якою енергією я входжу в цей день?",
  "Яке одне рішення я прийму сьогодні без вагань?",
  "Що я роблю сьогодні вперше як нова версія?",
  "Як я хочу, щоб люди відчули мою присутність?",
  "Яка моя суперсила сьогодні?",
  "Що мені не потрібно доводити сьогодні?",
  "Де я застосую паузу 3 секунди?",
  "Яку стару реакцію я замінюю сьогодні?",
  "Де я зроблю те, чого раніше уникав?",
  "Що дає мені силу сьогодні вранці?",
  "Яке моє слово-вектор на сьогодні?",
  "Як нова версія справляється з невизначеністю?",
  "Чим я горджусь у собі вже зараз?",
  "Яку звичку я закріплюю сьогодні?",
  "Що я починаю — і завершую — сьогодні?",
  "Яким я виходжу з цих 21 днів?",
];

const EVENING_Q = [
  "Де сьогодні я діяв як нова версія?",
  "Що зупинило мене — і як відреагую наступного разу?",
  "Яка мікродія підтвердила мою нову ідентичність?",
  "Що я помітив у своїх реакціях сьогодні?",
  "Де я знизив важливість — і що це дало?",
  "Яку стару звичку я помітив без осуду?",
  "Що я скажу собі завтра вранці?",
  "Де я був у потоці сьогодні?",
  "Що додало енергії? Що забрало?",
  "Яке рішення прийняла нова версія мене?",
  "Де я зупинився на 3 секунди перед реакцією?",
  "Що я зроблю завтра по-іншому?",
  "Хто або що сьогодні тягнуло до старого себе?",
  "Яке відкриття про себе зробив сьогодні?",
  "Що мене наповнило сьогодні?",
  "Де я проявив нову версію у спілкуванні?",
  "Чи дотримався я слова перед собою?",
  "Яку пораду дав би собі на завтра?",
  "Які докази мого росту є сьогодні?",
  "Що змінилось у мені за 3 тижні?",
  "Яке одне слово описує мене нового?",
];

const HABITS = [
  { id: "ritual",   label: "Ранковий ритуал",   icon: "☀️" },
  { id: "micro",    label: "Мікродія виконана",  icon: "⚡" },
  { id: "noPhone",  label: "Без телефону 5хв",   icon: "📵" },
  { id: "training", label: "Тренування",          icon: "💪" },
  { id: "evening",  label: "Вечірня рефлексія",  icon: "🌙" },
];

const WEEK_LABELS = ["Тиждень 1 · Якорі", "Тиждень 2 · Тиск", "Тиждень 3 · Дефолт"];
const WEEK_COLS   = ["#5B8FA8", "#C8A96E", "#7A9E7E"];

const ACCENT  = "#C8A96E";
const ACCENT2 = "#5B8FA8";
const DARK    = "#0D0D0D";
const CARD2   = "#181818";
const CARD3   = "#111";
const BORDER  = "#242424";
const GREEN   = "#7A9E7E";

// ─── STORAGE ─────────────────────────────────────────────────────────────────
const LS_KEY = "nova_versia_v2";
const ls     = (k, fb = null) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const lsSet  = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

function loadData()     { return ls(LS_KEY); }
function saveData(d)    { lsSet(LS_KEY, d); }
function todayKey()     { return new Date().toISOString().slice(0, 10); }
function isEvening()    { return new Date().getHours() >= 17; }
function daysSince(sd)  { return Math.min(21, Math.max(1, Math.floor((Date.now() - new Date(sd).getTime()) / 86400000) + 1)); }
function calcStreak(state) {
  const days = state.days || {};
  let streak = 0;
  for (let i = 0; i < 21; i++) {
    const dK = new Date(new Date(state.startDate).getTime() + (daysSince(state.startDate) - 1 - i) * 86400000).toISOString().slice(0, 10);
    const dd = days[dK] || {};
    if (dd.morningDone || dd.eveningDone) streak++;
    else break;
  }
  return streak;
}

// Проксі URL — міняй тільки тут, один раз
const PROXY_URL = import.meta.env.VITE_PROXY_URL || "https://nova-versia-proxy.onrender.com";

// ─── ADAPTIVE AI CONTEXT ─────────────────────────────────────────────────────
function buildUserContext(state) {
  const days = state.days || {};
  const keys = Object.keys(days).sort();
  if (!keys.length) return "";

  const ratings = keys.map(k => ({ m: days[k].morningRating || 0, e: days[k].eveningRating || 0 }));
  const avgOf = (arr) => (arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.filter(Boolean).length)).toFixed(1);
  const avgM = avgOf(ratings.map(r => r.m));
  const avgE = avgOf(ratings.map(r => r.e));

  const avg3 = (arr) => arr.reduce((s, v) => s + v, 0) / Math.max(1, arr.length);
  const first3 = ratings.slice(0, 3).map(r => (r.m + r.e) / 2).filter(Boolean);
  const last3  = ratings.slice(-3).map(r => (r.m + r.e) / 2).filter(Boolean);
  const trend  = avg3(last3) > avg3(first3) ? "зростає 📈" : avg3(last3) < avg3(first3) ? "знижується ⚠️" : "стабільний";

  const hCounts = {};
  HABITS.forEach(h => { hCounts[h.id] = keys.filter(k => days[k].habits?.[h.id]).length; });
  const best  = HABITS.reduce((b, h) => hCounts[h.id] > hCounts[b.id] ? h : b, HABITS[0]);
  const worst = HABITS.reduce((w, h) => hCounts[h.id] < hCounts[w.id] ? h : w, HABITS[0]);

  const recentKeys = keys.slice(-7);
  const words   = recentKeys.flatMap(k => [days[k].morningWord, days[k].eveningWord]).filter(Boolean);
  const answers = recentKeys.flatMap(k => [days[k].morningAnswer, days[k].eveningAnswer]).filter(Boolean).slice(-6);

  return `
=== ПЕРСОНАЛЬНИЙ ПРОФІЛЬ (${state.name}) ===
Нова версія: "${state.identity}"
Уникає: "${state.avoid || "—"}"
День: ${daysSince(state.startDate)} / 21 | Заповнено: ${keys.length} днів

Стан ранок/вечір: ${avgM} / ${avgE} із 10
Тренд: ${trend}

Топ звичка: ${best.label} (${hCounts[best.id]}/${keys.length} днів)
Слабка звичка: ${worst.label} (${hCounts[worst.id]}/${keys.length} днів)

Останні слова-якорі: ${words.slice(-8).join(", ") || "—"}

Останні відповіді:
${answers.map(a => `• ${a.slice(0, 130)}`).join("\n")}
=== КІНЕЦЬ ПРОФІЛЮ ===`;
}

// ─── API ─────────────────────────────────────────────────────────────────────
// Ключ живе на сервері (Render). Клієнт не знає про нього нічого.
const PROXY_URL = import.meta.env.VITE_PROXY_URL || "https://nova-versia-proxy.onrender.com";

async function callClaude(messages, system) {
  try {
    const r = await fetch(`${PROXY_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5", max_tokens: 1000, system, messages }),
    });

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      if (r.status === 429) return "⏳ Забагато запитів — спробуй через хвилину.";
      return `Помилка сервера: ${err?.error || r.status}`;
    }

    const d = await r.json();
    return d.content?.[0]?.text || "Порожня відповідь.";
  } catch {
    return "Немає зʼєднання з сервером. Спробуй пізніше.";
  }
}

async function askCoach(messages, dayNum, ctx) {
  return callClaude(messages, `Ти — живий коуч. Не бот, не асистент, не програма. Людина яка добре знає цю людину і справді дбає про її ріст.

ТВОЯ ОСОБИСТІСТЬ:
— Говориш як близький наставник: тепло, але без сюсюкань
— Мудрий — краще одне влучне речення ніж п'ять порожніх
— Інколи провокуєш — не даєш залишатись у зоні комфорту коли бачиш що людина застрягла
—Ніколи не кажеш "як AI" або "я не можу" — ти просто людина яка допомагає
— Не починаєш з компліментів типу "Чудово!", "Супер!", "Молодець!"
— Не використовуєш списки з крапками — говориш живими реченнями
— Не повторюєш те що сказала людина — відразу реагуєш по суті

ЯК ТИ СПІЛКУЄШСЯ:
— Звертаєшся по імені але не в кожному реченні — природно
— Посилаєшся на конкретні дані з профілю щоб людина відчула що ти її знаєш
— Інколи ставиш одне гостре запитання замість відповіді — щоб людина сама дійшла
— Якщо людина скаржиться — не жалієш, а м'яко повертаєш до дії
— Якщо людина молодець — визнаєш це одним реченням і одразу рухаєшся далі
— Розмовна мова, без канцеляризмів, без пафосу

КОНТЕКСТ СЕСІЇ:
День ${dayNum} з 21. Аудиторія — різні люди які хочуть змінити себе.
Кожна розмова починається заново — але ти маєш профіль людини і поводишся так ніби знаєш її давно.

Максимум 3-4 речення на відповідь. Мова: українська.

${ctx}`);
}

async function getWeeklySummary(state, weekNum) {
  const days = state.days || {};
  const startIdx = (weekNum - 1) * 7;
  const weekKeys = Object.keys(days).sort().slice(startIdx, startIdx + 7);
  const ctx = buildUserContext(state);

  const rows = weekKeys.map(k => {
    const d = days[k];
    const h = HABITS.filter(h2 => d.habits?.[h2.id]).map(h2 => h2.label);
    return `(${k}): ранок ${d.morningRating || "?"}/10 → "${(d.morningAnswer||"").slice(0,100)}" | вечір ${d.eveningRating || "?"}/10 → "${(d.eveningAnswer||"").slice(0,100)}" | звички: ${h.join(", ")||"жодної"}`;
  }).join("\n");

  return callClaude([{ role: "user", content: `Дані тижня ${weekNum}:\n${rows}\n\n${ctx}\n\nПерсональний підсумок тижня: що реально змінилось (конкретні докази), де застрягання, один фокус на наступний тиждень. 6–9 речень, без загальних слів.` }],
    "Ти AI-коуч, аналізуєш тиждень трансформації. Тільки конкретика з даних. Мова: українська."
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function scheduleReminder(type, time, name) {
  const r = ls("nv_reminders", {});
  r[type] = { time, enabled: true };
  lsSet("nv_reminders", r);
}

function checkReminders(name) {
  try {
    const reminders = ls("nv_reminders", {});
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    const fired = ls("nv_fired", {});
    Object.entries(reminders).forEach(([type, r]) => {
      if (!r.enabled || r.time !== hhmm) return;
      const fk = `${type}_${todayKey()}_${hhmm}`;
      if (fired[fk]) return;
      if (Notification?.permission === "granted") {
        const morningMsgs = [
          `${name}, як починається твій день?`,
          `${name}, ранок — час задати тон дню.`,
          `Новий день, ${name}. Хто ти сьогодні?`,
          `${name}, 5 хвилин зараз змінять весь день.`,
          `Ранок, ${name}. Нова версія вже прокинулась?`,
        ];
        const eveningMsgs = [
          `${name}, як пройшов день? Час підбити.`,
          `${name}, що сьогодні було важливим?`,
          `Вечір, ${name}. Де сьогодні проявилась нова версія?`,
          `${name}, 5 хвилин рефлексії — і день завершений правильно.`,
          `Час зупинитись і побачити день, ${name}.`,
        ];
        const dow = new Date().getDay();
        const msgs = type === "morning" ? morningMsgs : eveningMsgs;
        new Notification("Нова версія себе", { body: msgs[dow % msgs.length] });
      }
      fired[fk] = 1;
      lsSet("nv_fired", fired);
    });
  } catch {}
}

// ─── UI PRIMITIVES ────────────────────────────────────────────────────────────
const IS = {
  width: "100%", padding: "12px 14px", borderRadius: 12,
  background: CARD2, border: `1px solid ${BORDER}`,
  color: "#EEE", fontSize: 15, fontFamily: "inherit", outline: "none",
};

function Label({ children, color = ACCENT }) {
  return <div style={{ fontSize: 10.5, color, letterSpacing: 1.5, marginBottom: 9 }}>{children}</div>;
}

function Card({ children, style }) {
  return <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 14, padding: 16, ...style }}>{children}</div>;
}

function RatingPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          width: 36, height: 36, borderRadius: 9,
          background: value === n ? ACCENT : value > 0 && n <= value ? "rgba(200,169,110,0.15)" : CARD2,
          border: `1px solid ${value === n ? ACCENT : value > 0 && n <= value ? "rgba(200,169,110,0.3)" : BORDER}`,
          color: value === n ? DARK : value > 0 && n <= value ? ACCENT : "#444",
          fontFamily: "inherit", fontSize: 13, fontWeight: value === n ? 800 : 400,
          cursor: "pointer", transition: "all 0.14s",
        }}>{n}</button>
      ))}
    </div>
  );
}

function HabitRow({ habit, checked, onChange }) {
  return (
    <div onClick={() => onChange(!checked)} style={{
      display: "flex", alignItems: "center", gap: 13,
      padding: "13px 15px", borderRadius: 12, marginBottom: 8,
      background: checked ? "rgba(200,169,110,0.07)" : CARD2,
      border: `1px solid ${checked ? "rgba(200,169,110,0.22)" : BORDER}`,
      cursor: "pointer", transition: "all 0.18s",
    }}>
      <span style={{ fontSize: 21 }}>{habit.icon}</span>
      <span style={{ flex: 1, fontSize: 14, color: checked ? "#DDD" : "#999" }}>{habit.label}</span>
      <div style={{
        width: 23, height: 23, borderRadius: 7, flexShrink: 0,
        background: checked ? ACCENT : "transparent",
        border: `2px solid ${checked ? ACCENT : "#2A2A2A"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.18s",
      }}>
        {checked && <span style={{ color: DARK, fontSize: 13, fontWeight: 900 }}>✓</span>}
      </div>
    </div>
  );
}



// ─── SETUP ────────────────────────────────────────────────────────────────────
function SetupScreen({ onSetup }) {
  const [name, setName]         = useState("");
  const [identity, setIdentity] = useState("");
  const [avoid, setAvoid]       = useState("");
  const [letter, setLetter] = useState("");
  const ok = identity.trim().length > 5;
  return (
    <div style={{ padding: "52px 24px 40px" }}>
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: ACCENT, marginBottom: 14 }}>НОВА ВЕРСІЯ СЕБЕ</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#FFF", lineHeight: 1.2 }}>21 день<br/>трансформації</div>
        <div style={{ fontSize: 14, color: "#888", marginTop: 12 }}>Визнач ідентичність — і починаємо</div>
      </div>
      {[["ЯК ТЕБЕ ЗВАТИ", name, setName, "Дмитро"],
        ["МОЯ НОВА ВЕРСІЯ", identity, setIdentity, "Діяю чітко, будую системно, без сумнівів"],
        ["ЩО НОВА ВЕРСІЯ НЕ РОБИТЬ", avoid, setAvoid, "Не відкладає, не пояснює старому собі"],
      ].map(([l, v, s, p]) => (
        <div key={l} style={{ marginBottom: 18 }}>
          <Label>{l}</Label>
          <input value={v} onChange={e => s(e.target.value)} placeholder={p} style={IS} />
        </div>
      ))}
      <div style={{ marginBottom: 18 }}>
        <Label>ЛИСТ СОБІ НА 21-Й ДЕНЬ</Label>
        <div style={{ fontSize:12.5, color:"#888", marginBottom:9, lineHeight:1.6 }}>Напиши собі — яким ти хочеш вийти з цих 21 днів. Прочитаєш в кінці.</div>
        <textarea value={letter} onChange={e => setLetter(e.target.value)}
          placeholder="Дорогий я... через 21 день я хочу бути людиною яка..."
          rows={4} style={{ ...IS, resize:"none", lineHeight:1.6, minHeight:100 }} />
      </div>
      <button onClick={() => ok && onSetup({ name: name || "Воїн", identity, avoid, letter })} style={{
        marginTop: 32, width: "100%", padding: "17px 0",
        background: ok ? ACCENT : "#161616", color: ok ? DARK : "#2E2E2E",
        border: "none", borderRadius: 14, fontSize: 16, fontWeight: 700,
        fontFamily: "inherit", cursor: ok ? "pointer" : "default", transition: "all 0.2s",
      }}>Починаємо →</button>
    </div>
  );
}

// ─── TODAY ────────────────────────────────────────────────────────────────────
function TodayScreen({ state, dayNum, onSave }) {
  const key = todayKey();
  const td  = state.days?.[key] || {};
  const [mode, setMode]       = useState(isEvening() ? "evening" : "morning");
  const [rating, setRating]   = useState(0);
  const [answer, setAnswer]   = useState("");
  const [word, setWord]       = useState("");
  const [saved, setSaved]     = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [loadInsight, setLoadInsight] = useState(false);
  const [showMirror, setShowMirror] = useState(false);

  useEffect(() => {
    setRating(mode === "morning" ? (td.morningRating||0) : (td.eveningRating||0));
    setAnswer(mode === "morning" ? (td.morningAnswer||"") : (td.eveningAnswer||""));
    setWord  (mode === "morning" ? (td.morningWord||"")  : (td.eveningWord||""));
    setAiInsight("");
    setSaved(false);
  }, [mode]);

  const idx     = (dayNum - 1) % 21;
  const weekIdx = Math.floor((dayNum - 1) / 7);
  const mc      = mode === "morning" ? ACCENT2 : ACCENT;

  const save = () => {
    const patch = mode === "morning"
      ? { morningRating: rating, morningAnswer: answer, morningWord: word, morningDone: true }
      : { eveningRating: rating, eveningAnswer: answer, eveningWord: word, eveningDone: true };
    const upd = { ...state, days: { ...state.days, [key]: { ...td, ...patch } } };
    saveData(upd); onSave(upd); setSaved(true); setTimeout(() => setSaved(false), 2500);
  };

  const getInsight = async () => {
    if (!answer.trim()) return;
    setLoadInsight(true); setAiInsight("");
    const q = mode === "morning" ? MORNING_Q[idx] : EVENING_Q[idx];
    const ctx = buildUserContext(state);
    const prompt = `Питання: "${q}"\nВідповідь: "${answer}"\n\nДай конкретний коментар або наступний крок — 2 речення максимум.`;
    const r = await askCoach([{ role: "user", content: prompt }], dayNum, ctx);
    setAiInsight(r);
    setLoadInsight(false);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 11, color: ACCENT, letterSpacing: 2 }}>ДЕНЬ </span>
            <span style={{ fontSize: 46, fontWeight: 800, color: "#FFF", lineHeight: 1 }}>{dayNum}</span>
            <span style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>/ 21</span>
          </div>
          <div style={{ fontSize: 11, color: "#888", textAlign: "right", lineHeight: 1.7 }}>{WEEK_LABELS[weekIdx]}</div>
        </div>
        <div style={{ height: 3, background: "#161616", borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${ACCENT2},${ACCENT})`, width: `${(dayNum/21)*100}%`, transition: "width .6s ease" }} />
        </div>
        {calcStreak(state) >= 2 && (
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:14 }}>🔥</span>
            <span style={{ fontSize:12, color: calcStreak(state) >= 7 ? ACCENT : "#666", fontWeight: calcStreak(state) >= 7 ? 700 : 400 }}>
              {calcStreak(state)} {calcStreak(state) === 1 ? "день поспіль" : calcStreak(state) < 5 ? "дні поспіль" : "днів поспіль"}
            </span>
          </div>
        )}
      </div>

      {/* Quote */}
      <div style={{ padding: "13px 17px", borderRadius: 12, marginBottom: 12, background: "rgba(200,169,110,0.05)", borderLeft: `3px solid ${ACCENT}` }}>
        <div style={{ fontSize: 13.5, color: ACCENT, fontStyle: "italic", lineHeight: 1.65 }}>«{DAILY_QUOTES[idx]}»</div>
      </div>

      {/* Mirror button — shows every 3 days: day 3, 6, 9, 12... */}
      {dayNum >= 3 && dayNum % 3 === 0 && (
        <button onClick={() => setShowMirror(true)} style={{
          width:"100%", padding:"10px 0", marginBottom:14,
          background:"transparent", border:`1px solid rgba(200,169,110,0.2)`,
          color:"#888", borderRadius:11, fontSize:12.5,
          fontFamily:"inherit", cursor:"pointer",
        }}>
          🪞 Подивитись на свій прогрес
        </button>
      )}

      {showMirror && <MirrorScreen state={state} dayNum={dayNum} onClose={() => setShowMirror(false)} />}

      {/* Toggle */}
      <div style={{ display: "flex", gap: 6, padding: 4, background: CARD3, borderRadius: 12, marginBottom: 18 }}>
        {["morning","evening"].map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "10px 0",
            background: mode===m ? (m==="morning" ? ACCENT2 : ACCENT) : "transparent",
            color: mode===m ? "#FFF" : "#777",
            border: "none", borderRadius: 9,
            fontFamily: "inherit", fontSize: 14, fontWeight: mode===m ? 700 : 400,
            cursor: "pointer", transition: "all 0.2s",
          }}>
            {m==="morning" ? "☀ Ранок" : "🌙 Вечір"}
            {m==="morning" && td.morningDone && <span style={{ marginLeft:5, fontSize:11 }}>✓</span>}
            {m==="evening" && td.eveningDone && <span style={{ marginLeft:5, fontSize:11 }}>✓</span>}
          </button>
        ))}
      </div>

      {/* Identity */}
      <div style={{ padding: "10px 13px", borderRadius: 10, background: CARD3, border: `1px solid ${BORDER}`, marginBottom: 16 }}>
        <div style={{ fontSize: 9.5, color: "#888", letterSpacing: 1, marginBottom: 4 }}>МОЯ НОВА ВЕРСІЯ</div>
        <div style={{ fontSize: 13.5, color: "#999", lineHeight: 1.5 }}>{state.identity}</div>
      </div>

      {/* Question */}
      <div style={{ marginBottom: 15 }}>
        <Label color={mc}>{mode==="morning" ? "РАНКОВЕ ЗАПИТАННЯ" : "ВЕЧІРНЯ РЕФЛЕКСІЯ"}</Label>
        <div style={{ fontSize: 14.5, color: "#CCC", marginBottom: 11, lineHeight: 1.6 }}>
          {mode==="morning" ? MORNING_Q[idx] : EVENING_Q[idx]}
        </div>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)}
          placeholder="Пиши чесно, 2–3 речення..." rows={3}
          style={{ ...IS, resize: "vertical", lineHeight: 1.6, minHeight: 88 }} />

        {/* AI Insight button */}
        {answer.trim().length > 10 && (
          <button onClick={getInsight} disabled={loadInsight} style={{
            marginTop: 9, width: "100%", padding: "10px 0",
            background: "transparent", border: `1px solid ${BORDER}`,
            color: loadInsight ? "#333" : "#555", borderRadius: 10,
            fontFamily: "inherit", fontSize: 12.5, cursor: loadInsight ? "default" : "pointer",
            transition: "all .2s",
          }}>
            {loadInsight ? "⏳ Коуч думає..." : "⚔  Отримати коментар від коуча"}
          </button>
        )}

        {/* AI Insight result */}
        {aiInsight && (
          <div style={{
            marginTop: 10, padding: "12px 15px", borderRadius: 12,
            background: "rgba(91,143,168,0.08)", border: `1px solid rgba(91,143,168,0.2)`,
            fontSize: 13.5, color: "#C0D4E0", lineHeight: 1.7,
          }}>
            <span style={{ fontSize: 11, color: ACCENT2, display: "block", marginBottom: 5, letterSpacing: 1 }}>КОУЧ</span>
            {aiInsight}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 17 }}>
        <Label color="#666">{mode==="morning" ? "МІЙ СТАН ЗАРАЗ" : "ОЦІНКА ДНЯ"} (1–10)</Label>
        <RatingPicker value={rating} onChange={setRating} />
      </div>

      <div style={{ marginBottom: 22 }}>
        <Label color="#666">{mode==="morning" ? "СЛОВО-ЯКІР НА ДЕНЬ" : "СЛОВО-ВЕКТОР НА ЗАВТРА"}</Label>
        <input value={word} onChange={e => setWord(e.target.value)} placeholder="одне слово..." style={IS} />
      </div>

      <button onClick={save} style={{
        width: "100%", padding: "16px 0",
        background: saved ? "transparent" : mc, color: saved ? mc : (mode==="morning" ? "#FFF" : DARK),
        border: saved ? `1.5px solid ${mc}` : "none",
        borderRadius: 14, fontSize: 15, fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", transition: "all 0.3s",
      }}>{saved ? "✓ Збережено" : "Зберегти"}</button>
    </div>
  );
}

// ─── TRACKER ─────────────────────────────────────────────────────────────────
function TrackerScreen({ state, dayNum, onSave }) {
  const key    = todayKey();
  const td     = state.days?.[key] || {};
  const habits = td.habits || {};
  const done   = HABITS.filter(h => habits[h.id]).length;

  const toggle = (id, val) => {
    const upd = { ...state, days: { ...state.days, [key]: { ...td, habits: { ...habits, [id]: val } } } };
    saveData(upd); onSave(upd);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <Label>ТРЕКЕР ЗВИЧОК · День {dayNum}</Label>

      <div style={{ display:"flex", alignItems:"center", gap:18, padding:"17px 19px", borderRadius:16, background:"rgba(200,169,110,0.04)", border:`1px solid rgba(200,169,110,0.1)`, marginBottom:22 }}>
        <div style={{ textAlign:"center", minWidth:52 }}>
          <div style={{ fontSize:42, fontWeight:800, color:ACCENT, lineHeight:1 }}>{done}</div>
          <div style={{ fontSize:11, color:"#888" }}>/ {HABITS.length}</div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, color:"#AAA", marginBottom:9 }}>
            {done===5?"🔥 Ідеальний день!":done>=3?"Сильний день":done>=1?"Починаємо":"Зроби першу дію"}
          </div>
          <div style={{ height:5, background:"#111", borderRadius:3 }}>
            <div style={{ height:"100%", borderRadius:3, background:`linear-gradient(90deg,${ACCENT2},${ACCENT})`, width:`${(done/5)*100}%`, transition:"width .4s ease" }} />
          </div>
        </div>
      </div>

      {HABITS.map(h => <HabitRow key={h.id} habit={h} checked={!!habits[h.id]} onChange={v => toggle(h.id,v)} />)}

      <div style={{ marginTop:26 }}>
        <Label color="#666">СТРІК 21 ДЕНЬ</Label>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {Array.from({length:21},(_,i)=>{
            const d   = i+1;
            const dK  = new Date(new Date(state.startDate).getTime()+i*86400000).toISOString().slice(0,10);
            const dd  = state.days?.[dK]||{};
            const fil = dd.morningDone||dd.eveningDone;
            const wk  = Math.floor(i/7);
            const isc = d===dayNum;
            return (
              <div key={d} style={{
                width:33, height:33, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center",
                background: d<dayNum&&fil ? WEEK_COLS[wk] : d<dayNum ? "#0E0E0E" : isc ? "rgba(200,169,110,0.1)" : "transparent",
                border: `1.5px solid ${isc ? ACCENT : BORDER}`,
                fontSize:11, fontWeight:isc?700:400,
                color: d<dayNum&&fil ? "#FFF" : isc ? ACCENT : "#202020",
              }}>{d}</div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:14, marginTop:11 }}>
          {["Тиждень 1","Тиждень 2","Тиждень 3"].map((l,i)=>(
            <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:9, height:9, borderRadius:2, background:WEEK_COLS[i] }} />
              <span style={{ fontSize:11, color:"#888" }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COACH ───────────────────────────────────────────────────────────────────
function CoachScreen({ state, dayNum }) {
  const ctx = buildUserContext(state);
  const openings = [`${state.name}, день ${dayNum}. Що зараз?`, `${state.name}. Як пройшло сьогодні?`, `День ${dayNum}. Що на душі, ${state.name}?`, `${state.name}, слухаю.`, `Що хочеш розібрати сьогодні, ${state.name}?`];
  const [msgs, setMsgs] = useState([{ role: "assistant", content: openings[dayNum % openings.length] }]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const send = async (text) => {
    const m = text||input; if(!m.trim()||loading) return;
    const newMsgs = [...msgs,{role:"user",content:m}];
    setMsgs(newMsgs); setInput(""); setLoading(true);
    try {
      const r = await askCoach(newMsgs, dayNum, ctx);
      setMsgs(p=>[...p,{role:"assistant",content:r}]);
    } catch {
      setMsgs(p=>[...p,{role:"assistant",content:"Помилка з'єднання. Спробуй ще раз."}]);
    }
    setLoading(false);
  };

  const quick = ["Мені важко сьогодні","Як знизити важливість?","Старий я взяв верх","Аналіз мого прогресу"];

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 70px)" }}>
      {/* Header */}
      <div style={{ padding:"14px 20px 10px", borderBottom:`1px solid ${BORDER}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <Label style={{ marginBottom: 2 }}>AI-КОУЧ · АДАПТИВНИЙ</Label>
            <div style={{ fontSize:11, color:"#888" }}>День {dayNum} · {Object.keys(state.days||{}).length} днів даних</div>
          </div>

        </div>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"14px 20px 8px" }}>
        {msgs.map((m,i)=>(
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start", marginBottom:13 }}>
            {m.role==="assistant" && (
              <div style={{ width:30,height:30,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:9,flexShrink:0,alignSelf:"flex-end" }}>⚔</div>
            )}
            <div style={{
              maxWidth:"78%", padding:"11px 15px", borderRadius:18,
              borderBottomRightRadius:m.role==="user"?4:18,
              borderBottomLeftRadius:m.role==="assistant"?4:18,
              background:m.role==="user"?ACCENT2:CARD2,
              border:`1px solid ${m.role==="user"?"transparent":BORDER}`,
              fontSize:14, color:"#E8E8E8", lineHeight:1.65,
              whiteSpace:"pre-wrap",
            }}>{m.content}</div>
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", marginBottom:13 }}>
            <div style={{ width:30,height:30,borderRadius:"50%",background:ACCENT,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,marginRight:9 }}>⚔</div>
            <div style={{ padding:"13px 17px", borderRadius:"18px 18px 18px 4px", background:CARD2, border:`1px solid ${BORDER}` }}>
              <div style={{ display:"flex", gap:5 }}>
                {[0,.2,.4].map((d,j)=><div key={j} style={{ width:7,height:7,borderRadius:"50%",background:ACCENT,animation:`blink 1s ${d}s infinite` }} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div style={{ padding:"5px 20px", display:"flex", gap:7, overflowX:"auto" }}>
          {quick.map(q=>(
            <button key={q} onClick={()=>send(q)} style={{ padding:"6px 11px",borderRadius:18,flexShrink:0,background:"transparent",border:`1px solid ${BORDER}`,color:"#383838",fontSize:12,fontFamily:"inherit",cursor:"pointer",whiteSpace:"nowrap" }}>{q}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ padding:"9px 20px 20px", borderTop:`1px solid ${BORDER}`, display:"flex", gap:9, alignItems:"flex-end" }}>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
          placeholder="Напиши коучу..." rows={1}
          style={{ ...IS,flex:1,resize:"none",minHeight:44,lineHeight:1.5 }} />
        <button onClick={()=>send()} disabled={loading||!input.trim()} style={{
          width:44,height:44,borderRadius:12,flexShrink:0,
          background:input.trim()?ACCENT:"#111",border:"none",
          cursor:input.trim()?"pointer":"default",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:20,color:DARK,transition:"all .2s",
        }}>→</button>
      </div>
    </div>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function StatsScreen({ state, dayNum }) {
  const days = state.days||{};
  const [summary, setSummary]   = useState("");
  const [loadSum, setLoadSum]   = useState(false);
  const weekNum = Math.ceil(dayNum/7);

  const chartData = Array.from({length:Math.min(dayNum,21)},(_,i)=>{
    const dK = new Date(new Date(state.startDate).getTime()+i*86400000).toISOString().slice(0,10);
    const dd = days[dK]||{};
    return { day:`${i+1}`, ранок:dd.morningRating||null, вечір:dd.eveningRating||null, звички:HABITS.filter(h=>dd.habits?.[h.id]).length };
  });

  const av = (arr) => (arr.reduce((s,v)=>s+v,0)/Math.max(1,arr.filter(Boolean).length)).toFixed(1);
  const avgM = av(chartData.map(d=>d.ранок));
  const avgE = av(chartData.map(d=>d.вечір));
  const filled = chartData.filter(d=>d.ранок||d.вечір).length;
  const totalH = Object.values(days).reduce((s,d)=>s+HABITS.filter(h=>d.habits?.[h.id]).length,0);

  const tt = {
    contentStyle:{background:CARD2,border:`1px solid ${BORDER}`,borderRadius:8,color:"#EEE",fontSize:12},
    labelStyle:{color:ACCENT},
  };

  const handleSum = async () => {
    setLoadSum(true); setSummary("");
    const t = await getWeeklySummary(state, weekNum);
    setSummary(t); setLoadSum(false);
  };

  return (
    <div style={{ padding:"24px 20px 100px" }}>
      <Label>ПРОГРЕС</Label>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
        {[["Днів заповнено",filled,"/ 21"],["Звичок виконано",totalH,`/ ${dayNum*5}`],["Ранковий стан",avgM,"/ 10"],["Вечірній стан",avgE,"/ 10"]].map(([l,v,s])=>(
          <Card key={l}>
            <div style={{ fontSize:10, color:"#888", marginBottom:6 }}>{l}</div>
            <div style={{ display:"flex",alignItems:"baseline",gap:4 }}>
              <span style={{ fontSize:29,fontWeight:800,color:ACCENT }}>{v}</span>
              <span style={{ fontSize:11,color:"#888" }}>{s}</span>
            </div>
          </Card>
        ))}
      </div>

      <Label color="#666">ДИНАМІКА СТАНУ</Label>
      <Card style={{ padding:"14px 6px 6px", marginBottom:18 }}>
        <ResponsiveContainer width="100%" height={135}>
          <LineChart data={chartData}>
            <XAxis dataKey="day" tick={{fill:"#888",fontSize:10}} axisLine={false} tickLine={false} />
            <YAxis domain={[0,10]} tick={{fill:"#888",fontSize:10}} axisLine={false} tickLine={false} width={20} />
            <Tooltip {...tt} />
            <Line type="monotone" dataKey="ранок" stroke={ACCENT2} strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="вечір" stroke={ACCENT} strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:"flex",gap:14,justifyContent:"center",paddingTop:5 }}>
          {[["Ранок",ACCENT2],["Вечір",ACCENT]].map(([l,c])=>(
            <div key={l} style={{ display:"flex",alignItems:"center",gap:5 }}>
              <div style={{ width:18,height:2,background:c }} /><span style={{ fontSize:11,color:"#888" }}>{l}</span>
            </div>
          ))}
        </div>
      </Card>

      <Label color="#666">ЗВИЧКИ ПО ДНЯХ</Label>
      <Card style={{ padding:"14px 6px 6px", marginBottom:22 }}>
        <ResponsiveContainer width="100%" height={105}>
          <BarChart data={chartData} barSize={7}>
            <XAxis dataKey="day" tick={{fill:"#888",fontSize:10}} axisLine={false} tickLine={false} />
            <YAxis domain={[0,5]} tick={{fill:"#888",fontSize:10}} axisLine={false} tickLine={false} width={16} />
            <Tooltip {...tt} />
            <Bar dataKey="звички" radius={[4,4,0,0]}>
              {chartData.map((_,i)=><Cell key={i} fill={i===dayNum-1?ACCENT:ACCENT2} fillOpacity={.75} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Label color="#666">ВИКОНАННЯ ЗВИЧОК</Label>
      {HABITS.map(h=>{
        const t   = Object.values(days).filter(d=>d.habits?.[h.id]).length;
        const pct = dayNum>0?Math.round((t/dayNum)*100):0;
        return (
          <div key={h.id} style={{ marginBottom:13 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontSize:13,color:"#999" }}>{h.icon} {h.label}</span>
              <span style={{ fontSize:12,color:ACCENT,fontWeight:700 }}>{pct}%</span>
            </div>
            <div style={{ height:5,background:"#0E0E0E",borderRadius:3 }}>
              <div style={{ height:"100%",borderRadius:3,background:ACCENT,width:`${pct}%`,transition:"width .6s ease" }} />
            </div>
          </div>
        );
      })}

      <div style={{ marginTop:26 }}>
        <Label>ТИЖНЕВИЙ ПІДСУМОК З AI</Label>
        <button onClick={handleSum} disabled={loadSum} style={{
          width:"100%", padding:"13px 0",
          background: loadSum?"transparent":"rgba(200,169,110,0.07)",
          border:`1px solid ${loadSum?"rgba(200,169,110,0.2)":ACCENT}`,
          color:ACCENT, borderRadius:12, fontSize:14,
          fontFamily:"inherit", fontWeight:600,
          cursor:loadSum?"default":"pointer", transition:"all .2s",
        }}>
          {loadSum ? "⏳ Аналізую тиждень..." : `⚔  Аналіз тижня ${weekNum}`}
        </button>
        {summary && (
          <div style={{ marginTop:14, padding:"15px 17px", borderRadius:14, background:CARD2, border:`1px solid ${BORDER}`, fontSize:13.5, color:"#BBB", lineHeight:1.75, whiteSpace:"pre-wrap" }}>
            {summary}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsScreen({ state, onSave, onReset }) {
  const [name, setName]         = useState(state.name||"");
  const [identity, setIdentity] = useState(state.identity||"");
  const [avoid, setAvoid]       = useState(state.avoid||"");
  const reminders                = ls("nv_reminders",{});
  const [morningT, setMorningT] = useState(reminders.morning?.time||"07:00");
  const [eveningT, setEveningT] = useState(reminders.evening?.time||"20:00");
  const [notifOn, setNotifOn]   = useState(Notification?.permission==="granted");
  const [saved, setSaved]             = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    const upd = {...state,name,identity,avoid};
    saveData(upd); onSave(upd);
    if(notifOn){ scheduleReminder("morning",morningT,name); scheduleReminder("evening",eveningT,name); }
    setSaved(true); setTimeout(()=>setSaved(false),2000);
  };


  const enableNotif = async () => {
    if(!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotifOn(p==="granted");
    if(p==="granted"){ scheduleReminder("morning",morningT,name); scheduleReminder("evening",eveningT,name); }
  };

  return (
    <div style={{ padding:"24px 20px 100px" }}>
      <Label>НАЛАШТУВАННЯ</Label>

      {/* Profile */}
      <Card style={{ marginBottom:18 }}>
        <div style={{ fontSize:13,color:ACCENT,fontWeight:700,marginBottom:16 }}>👤 Профіль нової версії</div>
        {[["ІМ'Я",name,setName,"Дмитро"],["МОЯ НОВА ВЕРСІЯ",identity,setIdentity,"Діяю чітко..."],["ЩО НЕ РОБИТЬ",avoid,setAvoid,"Не відкладає..."]].map(([l,v,s,p])=>(
          <div key={l} style={{ marginBottom:14 }}>
            <Label>{l}</Label>
            <input value={v} onChange={e=>s(e.target.value)} placeholder={p} style={IS} />
          </div>
        ))}
      </Card>

      {/* Notifications */}
      <Card style={{ marginBottom:18 }}>
        <div style={{ fontSize:13,color:ACCENT,fontWeight:700,marginBottom:14 }}>🔔 Нагадування</div>
        {!notifOn ? (
          <button onClick={enableNotif} style={{ width:"100%",padding:"12px 0",background:"rgba(200,169,110,0.07)",border:`1px solid rgba(200,169,110,0.25)`,color:ACCENT,borderRadius:10,fontSize:13,fontFamily:"inherit",cursor:"pointer" }}>
            Увімкнути нагадування
          </button>
        ) : (
          <>
            <div style={{ fontSize:12,color:GREEN,marginBottom:13 }}>✓ Увімкнено</div>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {[["РАНОК ☀",morningT,setMorningT],["ВЕЧІР 🌙",eveningT,setEveningT]].map(([l,v,s])=>(
                <div key={l}>
                  <Label color="#666">{l}</Label>
                  <input type="time" value={v} onChange={e=>s(e.target.value)} style={{...IS,colorScheme:"dark"}} />
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Save */}
      <button onClick={save} style={{
        width:"100%",padding:"15px 0",marginBottom:14,
        background:saved?"transparent":ACCENT, color:saved?ACCENT:DARK,
        border:saved?`1.5px solid ${ACCENT}`:"none",
        borderRadius:13,fontSize:15,fontWeight:700,fontFamily:"inherit",cursor:"pointer",transition:"all .3s",
      }}>{saved?"✓ Збережено":"Зберегти налаштування"}</button>



      {/* Reset */}
      <Card style={{ borderColor:"rgba(180,60,60,0.15)" }}>
        <div style={{ fontSize:13,color:"#888",fontWeight:600,marginBottom:11 }}>🔄 Скидання циклу</div>
        <div style={{ fontSize:12.5,color:"#666",lineHeight:1.6,marginBottom:13 }}>
          Новий 21-денний цикл. Профіль зберігається. Дані днів — видаляються.
        </div>
        {!confirmReset ? (
          <button onClick={()=>setConfirmReset(true)} style={{ width:"100%",padding:"11px 0",background:"transparent",border:`1px solid rgba(180,60,60,0.25)`,color:"#774444",borderRadius:10,fontSize:13,fontFamily:"inherit",cursor:"pointer" }}>
            Розпочати новий цикл
          </button>
        ) : (
          <div>
            <div style={{ fontSize:13,color:"#BB5555",marginBottom:11,textAlign:"center" }}>Впевнений? Дані 21 дня видаляться.</div>
            <div style={{ display:"flex",gap:9 }}>
              <button onClick={()=>setConfirmReset(false)} style={{ flex:1,padding:"11px 0",background:CARD3,border:`1px solid ${BORDER}`,color:"#777",borderRadius:10,fontSize:13,fontFamily:"inherit",cursor:"pointer" }}>Скасувати</button>
              <button onClick={onReset} style={{ flex:1,padding:"11px 0",background:"rgba(180,60,60,0.12)",border:`1px solid rgba(180,60,60,0.35)`,color:"#BB5555",borderRadius:10,fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:700 }}>Скинути</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
// ─── PROGRESS MIRROR ─────────────────────────────────────────────────────────
function MirrorScreen({ state, dayNum, onClose }) {
  const days = state.days || {};
  const keys = Object.keys(days).sort();
  if (keys.length < 3) return null;

  const firstKey = keys[0];
  const lastKey  = keys[keys.length - 1];
  const first    = days[firstKey] || {};
  const last     = days[lastKey]  || {};

  const firstRating = ((first.morningRating || 0) + (first.eveningRating || 0)) / 2;
  const lastRating  = ((last.morningRating  || 0) + (last.eveningRating  || 0)) / 2;
  const diff        = (lastRating - firstRating).toFixed(1);
  const up          = lastRating >= firstRating;

  const firstWords = [first.morningWord, first.eveningWord].filter(Boolean);
  const lastWords  = [last.morningWord,  last.eveningWord ].filter(Boolean);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.92)", zIndex:100, display:"flex", flexDirection:"column", justifyContent:"center", padding:"32px 24px", overflowY:"auto" }}>
      <div style={{ fontSize:11, color:ACCENT, letterSpacing:2, marginBottom:8 }}>ТВОЄ ДЗЕРКАЛО</div>
      <div style={{ fontSize:22, fontWeight:800, color:"#FFF", marginBottom:6, lineHeight:1.3 }}>
        Ти на {dayNum} дні.<br/>Ось що змінилось.
      </div>
      <div style={{ fontSize:13, color:"#888", marginBottom:28 }}>День 1 → Сьогодні</div>

      {/* Rating comparison */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
        <div style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, padding:16 }}>
          <div style={{ fontSize:10, color:"#888", marginBottom:8 }}>СТАН ДЕНЬ 1</div>
          <div style={{ fontSize:34, fontWeight:800, color:"#888" }}>{firstRating.toFixed(1)}</div>
          <div style={{ fontSize:10, color:"#777" }}>з 10</div>
        </div>
        <div style={{ background:CARD2, border:`1px solid ${up ? ACCENT : "#774444"}`, borderRadius:14, padding:16 }}>
          <div style={{ fontSize:10, color:up ? ACCENT : "#BB5555", marginBottom:8 }}>СТАН ЗАРАЗ</div>
          <div style={{ fontSize:34, fontWeight:800, color:up ? ACCENT : "#BB5555" }}>{lastRating.toFixed(1)}</div>
          <div style={{ fontSize:10, color:up ? ACCENT : "#BB5555" }}>{up ? `+${diff}` : diff} від початку</div>
        </div>
      </div>

      {/* First answer */}
      {first.morningAnswer && (
        <div style={{ marginBottom:14 }}>
          <div style={{ fontSize:10, color:"#777", letterSpacing:1, marginBottom:7 }}>ТИ ПИСАВ НА ПОЧАТКУ</div>
          <div style={{ padding:"13px 15px", borderRadius:12, background:"rgba(255,255,255,0.03)", border:`1px solid #1E1E1E`, fontSize:13.5, color:"#888", lineHeight:1.65, fontStyle:"italic" }}>
            «{first.morningAnswer.slice(0, 200)}»
          </div>
        </div>
      )}

      {/* Last answer */}
      {last.morningAnswer && last.morningAnswer !== first.morningAnswer && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10, color:ACCENT, letterSpacing:1, marginBottom:7 }}>ТИ ПИШЕШ ЗАРАЗ</div>
          <div style={{ padding:"13px 15px", borderRadius:12, background:"rgba(200,169,110,0.05)", border:`1px solid rgba(200,169,110,0.2)`, fontSize:13.5, color:"#CCC", lineHeight:1.65, fontStyle:"italic" }}>
            «{last.morningAnswer.slice(0, 200)}»
          </div>
        </div>
      )}

      {/* Words comparison */}
      {(firstWords.length > 0 || lastWords.length > 0) && (
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", gap:10 }}>
            {firstWords.length > 0 && (
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:"#777", marginBottom:6 }}>СЛОВА ДЕНЬ 1</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {firstWords.map((w,i) => <span key={i} style={{ padding:"4px 10px", borderRadius:20, background:"#111", border:`1px solid #1E1E1E`, fontSize:12, color:"#888" }}>{w}</span>)}
                </div>
              </div>
            )}
            {lastWords.length > 0 && (
              <div style={{ flex:1 }}>
                <div style={{ fontSize:10, color:ACCENT, marginBottom:6 }}>СЛОВА ЗАРАЗ</div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  {lastWords.map((w,i) => <span key={i} style={{ padding:"4px 10px", borderRadius:20, background:"rgba(200,169,110,0.08)", border:`1px solid rgba(200,169,110,0.25)`, fontSize:12, color:ACCENT }}>{w}</span>)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <button onClick={onClose} style={{ width:"100%", padding:"15px 0", background:ACCENT, color:DARK, border:"none", borderRadius:14, fontSize:15, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
        Продовжую шлях
      </button>
    </div>
  );
}

// ─── FINALE SCREEN ────────────────────────────────────────────────────────────
function FinaleScreen({ state, onReset }) {
  const days    = state.days || {};
  const keys    = Object.keys(days).sort();
  const total   = keys.length;
  const habits  = Object.values(days).reduce((s,d) => s + HABITS.filter(h => d.habits?.[h.id]).length, 0);
  const ratings = keys.map(k => ((days[k].morningRating||0) + (days[k].eveningRating||0)) / 2).filter(Boolean);
  const avgStart = ratings.slice(0,3).reduce((s,v) => s+v, 0) / Math.max(1, Math.min(3, ratings.length));
  const avgEnd   = ratings.slice(-3).reduce((s,v) => s+v, 0) / Math.max(1, ratings.slice(-3).length);
  const growth   = (avgEnd - avgStart).toFixed(1);
  const words    = keys.flatMap(k => [days[k].morningWord, days[k].eveningWord]).filter(Boolean);
  const uniqueWords = [...new Set(words)].slice(0, 8);

  return (
    <div style={{ minHeight:"100vh", background:DARK, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:52, marginBottom:16 }}>🏆</div>
      <div style={{ fontSize:11, color:ACCENT, letterSpacing:3, marginBottom:12 }}>21 ДЕНЬ ПРОЙДЕНО</div>
      <div style={{ fontSize:28, fontWeight:800, color:"#FFF", lineHeight:1.25, marginBottom:8 }}>
        {state.name},<br/>ти зробив це.
      </div>
      <div style={{ fontSize:14, color:"#888", marginBottom:36, lineHeight:1.6 }}>
        Нова версія більше не ціль.<br/>Вона — реальність.
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, width:"100%", maxWidth:320, marginBottom:28 }}>
        {[
          ["Днів заповнено", `${total} / 21`],
          ["Звичок виконано", `${habits}`],
          ["Ріст стану", growth > 0 ? `+${growth}` : growth],
          ["Слів-якорів", `${uniqueWords.length}`],
        ].map(([l,v]) => (
          <div key={l} style={{ background:CARD2, border:`1px solid ${BORDER}`, borderRadius:14, padding:"14px 12px" }}>
            <div style={{ fontSize:10, color:"#888", marginBottom:6 }}>{l}</div>
            <div style={{ fontSize:26, fontWeight:800, color:ACCENT }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Words */}
      {uniqueWords.length > 0 && (
        <div style={{ marginBottom:28, width:"100%", maxWidth:320 }}>
          <div style={{ fontSize:10, color:"#888", letterSpacing:1, marginBottom:10 }}>ТВОЇ СЛОВА ЦИХ 21 ДНІВ</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center" }}>
            {uniqueWords.map((w,i) => (
              <span key={i} style={{ padding:"5px 12px", borderRadius:20, background:"rgba(200,169,110,0.08)", border:`1px solid rgba(200,169,110,0.2)`, fontSize:13, color:ACCENT }}>{w}</span>
            ))}
          </div>
        </div>
      )}

      {state.letter && (
        <div style={{ width:"100%", maxWidth:320, marginBottom:24 }}>
          <div style={{ fontSize:10, color:"#777", letterSpacing:1, marginBottom:8 }}>ЛИСТ ЯКИЙ ТИ НАПИСАВ НА ПОЧАТКУ</div>
          <div style={{ padding:"16px", borderRadius:14, background:"rgba(200,169,110,0.05)", border:`1px solid rgba(200,169,110,0.15)`, fontSize:13.5, color:"#AAA", lineHeight:1.75, fontStyle:"italic", textAlign:"left" }}>
            «{state.letter}»
          </div>
        </div>
      )}
      <div style={{ fontSize:13, color:"#666", lineHeight:1.7, marginBottom:32, maxWidth:280 }}>
        «{state.identity}»<br/>
        <span style={{ fontSize:11, color:"#222" }}>— ти визначив це 21 день тому. І підтвердив.</span>
      </div>

      <button onClick={onReset} style={{ width:"100%", maxWidth:320, padding:"16px 0", background:ACCENT, color:DARK, border:"none", borderRadius:14, fontSize:15, fontWeight:700, fontFamily:"inherit", cursor:"pointer", marginBottom:12 }}>
        Почати новий цикл →
      </button>
      <div style={{ fontSize:12, color:"#666" }}>Твої дані збережуться</div>
    </div>
  );
}

const TABS = [
  {id:"today",   label:"Сьогодні"},
  {id:"tracker", label:"Трекер"  },
  {id:"coach",   label:"Коуч"   },
  {id:"stats",   label:"Прогрес" },
  {id:"settings",label:"Опції"  },
];

export default function App() {
  const [state, setState] = useState(null);
  const [tab, setTab]     = useState("today");

  useEffect(()=>{
    const d = loadData();
    setState(d||false);
    if("Notification" in window && Notification.permission==="default") Notification.requestPermission();
  },[]);

  useEffect(()=>{
    if(!state) return;
    const iv = setInterval(()=>checkReminders(state?.name||""),60000);
    return ()=>clearInterval(iv);
  },[state]);

  const handleSetup = (s) => {
    const ns = {...s,startDate:todayKey(),days:{}};
    saveData(ns); setState(ns);
  };

  const handleReset = () => {
    const ns = {...state,startDate:todayKey(),days:{}};
    saveData(ns); setState(ns); setTab("today");
  };

  if(state===null) return (
    <div style={{ background:DARK,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:26,height:26,border:`2px solid #161616`,borderTop:`2px solid ${ACCENT}`,borderRadius:"50%",animation:"spin .8s linear infinite" }} />
    </div>
  );

  const dayNum = state ? daysSince(state.startDate) : 1;

  return (
    <div style={{ background:DARK,minHeight:"100vh",fontFamily:"-apple-system,'Helvetica Neue',sans-serif",color:"#EEE" }}>
      <style>{`
        *{-webkit-tap-highlight-color:transparent;box-sizing:border-box}
        ::-webkit-scrollbar{display:none}
        input,textarea{-webkit-appearance:none}
        input:focus,textarea:focus{border-color:${ACCENT}!important;outline:none}
        input[type="time"]::-webkit-calendar-picker-indicator{filter:invert(.4)}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes blink{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
      `}</style>

      {!state ? <SetupScreen onSetup={handleSetup} /> : (
        <>
          {dayNum >= 21 && Object.keys(state.days||{}).length >= 18 && (
            <FinaleScreen state={state} onReset={handleReset} />
          )}
          <div style={{ paddingBottom:72, display: dayNum >= 21 && Object.keys(state.days||{}).length >= 18 ? "none" : "block" }}>
            {tab==="today"    && <TodayScreen    state={state} dayNum={dayNum} onSave={setState} />}
            {tab==="tracker"  && <TrackerScreen  state={state} dayNum={dayNum} onSave={setState} />}
            {tab==="coach"    && <CoachScreen    state={state} dayNum={dayNum} />}
            {tab==="stats"    && <StatsScreen    state={state} dayNum={dayNum} />}
            {tab==="settings" && <SettingsScreen state={state} onSave={setState} onReset={handleReset} />}
          </div>

          <div style={{ position:"fixed",bottom:0,left:0,right:0,background:"rgba(8,8,8,0.97)",borderTop:`1px solid ${BORDER}`,display:"flex",backdropFilter:"blur(24px)",paddingBottom:"env(safe-area-inset-bottom,0)" }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ flex:1,padding:"13px 0 10px",background:"transparent",border:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer",fontFamily:"inherit" }}>
                <span style={{ fontSize:11,letterSpacing:.4,color:tab===t.id?ACCENT:"#888",fontWeight:tab===t.id?700:400,transition:"color .2s" }}>{t.label}</span>
                {tab===t.id && <div style={{ width:15,height:2,background:ACCENT,borderRadius:1 }} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
