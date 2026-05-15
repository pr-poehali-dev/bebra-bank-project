import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { adminApi } from "@/lib/api";

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(n);

type Stats = {
  totalUsers: number; totalTransactions: number; totalBalance: number;
  activeCards: number; totalIncome: number; totalExpense: number;
  incomeCount: number; expenseCount: number;
};
type User = { id: number; name: string; email: string; phone: string; role: string; plan: string; sinceYear: number; isVerified: boolean; createdAt: string; accountsCount: number };
type Tx = { id: number; user: string; title: string; category: string; amount: number; icon: string; color: string; date: string; createdAt: string };

export default function Admin() {
  const [auth, setAuth] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [tab, setTab] = useState<"dashboard" | "users" | "transactions" | "broadcast">("dashboard");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [broadcastType, setBroadcastType] = useState("info");
  const [editUser, setEditUser] = useState<User | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const tryLogin = () => {
    if (keyInput === "bebrabank-admin-2026") {
      setAuth(true);
      localStorage.setItem("bb_admin_key", keyInput);
    } else {
      showToast("Неверный ключ");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("bb_admin_key");
    if (saved === "bebrabank-admin-2026") setAuth(true);
  }, []);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const s = await adminApi.getStats();
      setStats(s);
    } catch (e: unknown) {
      showToast("Ошибка загрузки: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await adminApi.getUsers());
    } catch (e: unknown) {
      showToast("Ошибка: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(await adminApi.getTransactions(30));
    } catch (e: unknown) {
      showToast("Ошибка: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!auth) return;
    if (tab === "dashboard") loadStats();
    else if (tab === "users") loadUsers();
    else if (tab === "transactions") loadTransactions();
  }, [auth, tab, loadStats, loadUsers, loadTransactions]);

  const deleteUser = async (id: number) => {
    if (id === 1) return showToast("Нельзя удалить основного пользователя");
    if (!confirm("Удалить пользователя?")) return;
    await adminApi.deleteUser(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    showToast("Пользователь удалён");
  };

  const saveUser = async () => {
    if (!editUser) return;
    await adminApi.updateUser({ id: editUser.id, name: editUser.name, role: editUser.role, plan: editUser.plan });
    setUsers((prev) => prev.map((u) => u.id === editUser.id ? editUser : u));
    setEditUser(null);
    showToast("Сохранено");
  };

  const deleteTx = async (id: number) => {
    await adminApi.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast("Транзакция удалена");
  };

  const sendBroadcast = async () => {
    if (!broadcastTitle || !broadcastText) return showToast("Заполните все поля");
    const r = await adminApi.broadcast(broadcastTitle, broadcastText, broadcastType);
    showToast(`Отправлено ${r.sent} пользователям`);
    setBroadcastTitle(""); setBroadcastText("");
  };

  // ── Login screen ────────────────────────────────────────────────────────────
  if (!auth) {
    return (
      <div className="min-h-screen bg-[#070b12] bg-grid flex items-center justify-center p-4">
        <div className="orb w-96 h-96 bg-cyan-500/10 top-0 right-0" />
        <div className="orb w-96 h-96 bg-purple-500/10 bottom-0 left-0" />
        <div className="relative glass-strong rounded-2xl p-8 w-full max-w-sm border border-white/10 animate-fade-in">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center neon-glow-cyan">
              <Icon name="Shield" size={20} className="text-[#070b12]" />
            </div>
            <div>
              <div className="font-black gradient-text tracking-widest text-sm">ADMIN PANEL</div>
              <div className="text-[10px] text-white/30 font-mono">БЕБРА_bank · restricted</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Ключ доступа</label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && tryLogin()}
                placeholder="••••••••••••"
                autoFocus
                className="bg-transparent text-white text-lg font-mono w-full outline-none placeholder:text-white/20"
              />
            </div>
            <button
              onClick={tryLogin}
              className="w-full gradient-primary text-[#070b12] font-black py-3 rounded-xl neon-glow-cyan text-sm"
            >
              Войти в панель
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Пользователей", value: String(stats.totalUsers), icon: "Users", color: "#00e5ff", sub: "в системе" },
    { label: "Транзакций", value: String(stats.totalTransactions), icon: "ArrowLeftRight", color: "#a855f7", sub: `доходы: ${stats.incomeCount} / расходы: ${stats.expenseCount}` },
    { label: "Общий баланс", value: fmt(stats.totalBalance), icon: "Wallet", color: "#00ff88", sub: "по всем счетам RUB" },
    { label: "Активных карт", value: String(stats.activeCards), icon: "CreditCard", color: "#f59e0b", sub: "не заблокированных" },
    { label: "Доходы (всего)", value: fmt(stats.totalIncome), icon: "TrendingUp", color: "#00ff88", sub: "сумма всех поступлений" },
    { label: "Расходы (всего)", value: fmt(stats.totalExpense), icon: "TrendingDown", color: "#ff2d78", sub: "сумма всех списаний" },
  ] : [];

  const tabs = [
    { id: "dashboard" as const, icon: "LayoutDashboard", label: "Дашборд" },
    { id: "users" as const, icon: "Users", label: "Пользователи" },
    { id: "transactions" as const, icon: "Clock", label: "Операции" },
    { id: "broadcast" as const, icon: "Bell", label: "Рассылка" },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] bg-grid relative overflow-hidden font-sans">
      <div className="orb w-[500px] h-[500px] bg-cyan-500/5 top-[-100px] right-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-purple-500/5 bottom-0 left-0" />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 glass-strong border border-cyan-500/30 rounded-xl px-4 py-3 text-sm text-white animate-slide-up shadow-xl">
          {toast}
        </div>
      )}

      {/* Edit user modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setEditUser(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass-strong rounded-2xl p-6 w-full max-w-sm border border-white/10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-5">Редактировать пользователя</h3>
            <div className="space-y-3">
              {[
                { label: "Имя", key: "name" as const, type: "text" },
                { label: "Email", key: "email" as const, type: "email" },
              ].map(({ label, key, type }) => (
                <div key={key} className="glass rounded-xl p-3 border border-white/8">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-1">{label}</label>
                  <input type={type} value={editUser[key]}
                    onChange={(e) => setEditUser({ ...editUser, [key]: e.target.value })}
                    className="bg-transparent text-white text-sm w-full outline-none" />
                </div>
              ))}
              <div className="glass rounded-xl p-3 border border-white/8">
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Роль</label>
                <div className="flex gap-2">
                  {["user", "admin"].map((r) => (
                    <button key={r} onClick={() => setEditUser({ ...editUser, role: r })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${editUser.role === r ? "bg-cyan-500/20 text-[#00e5ff]" : "text-white/40 hover:bg-white/5"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div className="glass rounded-xl p-3 border border-white/8">
                <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Тариф</label>
                <div className="flex gap-2 flex-wrap">
                  {["Free", "Standard", "Premium", "Admin"].map((p) => (
                    <button key={p} onClick={() => setEditUser({ ...editUser, plan: p })}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${editUser.plan === p ? "bg-purple-500/20 text-purple-400" : "text-white/40 hover:bg-white/5"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditUser(null)} className="flex-1 glass rounded-xl py-2.5 text-white/50 text-sm hover:bg-white/5 transition-colors">Отмена</button>
              <button onClick={saveUser} className="flex-1 gradient-primary text-[#070b12] font-bold py-2.5 rounded-xl text-sm neon-glow-cyan">Сохранить</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex h-screen max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 h-full glass border-r border-white/5 p-5 gap-1 shrink-0">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={14} className="text-[#070b12]" />
              </div>
              <div>
                <div className="font-black text-xs tracking-widest gradient-text">ADMIN</div>
                <div className="text-[9px] text-white/30 font-mono">БЕБРА_bank</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 flex flex-col gap-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? "bg-cyan-500/10 text-[#00e5ff] border border-cyan-500/20" : "text-white/50 hover:text-white/80 hover:bg-white/5"}`}>
                <Icon name={t.icon} size={16} />{t.label}
              </button>
            ))}
          </nav>
          <button onClick={() => { localStorage.removeItem("bb_admin_key"); setAuth(false); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-colors">
            <Icon name="LogOut" size={14} />Выйти
          </button>
          <a href="/" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-white/40 hover:bg-white/5 transition-colors mt-1">
            <Icon name="ArrowLeft" size={14} />В приложение
          </a>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Mobile tabs */}
          <div className="md:hidden flex gap-2 overflow-x-auto mb-5 pb-1">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all ${tab === t.id ? "bg-cyan-500/20 text-[#00e5ff]" : "glass text-white/50"}`}>
                <Icon name={t.icon} size={13} />{t.label}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-[#00e5ff] rounded-full animate-spin" />
            </div>
          )}

          {/* ── Dashboard ─────────────────────────────────────── */}
          {tab === "dashboard" && !loading && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Панель управления</h1>
                  <p className="text-white/40 text-sm">Общая статистика системы</p>
                </div>
                <button onClick={loadStats} className="glass border border-white/10 px-3 py-2 rounded-xl text-xs text-white/60 flex items-center gap-2 hover:bg-white/5 transition-colors">
                  <Icon name="RefreshCw" size={13} />Обновить
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5 border border-white/5 card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                        <Icon name={s.icon} size={18} style={{ color: s.color }} />
                      </div>
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color, boxShadow: `0 0 8px ${s.color}` }} />
                    </div>
                    <div className="text-xl font-black text-white mb-0.5">{s.value}</div>
                    <div className="text-xs font-semibold text-white/60">{s.label}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>
              {stats && (
                <div className="glass rounded-2xl p-5 border border-white/5">
                  <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Финансовый баланс</h2>
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500"
                        style={{ width: `${Math.round(stats.totalIncome / (stats.totalIncome + stats.totalExpense) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-white/40 font-mono w-12 text-right">
                      {Math.round(stats.totalIncome / (stats.totalIncome + stats.totalExpense) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">Доходы: {fmt(stats.totalIncome)}</span>
                    <span className="text-red-400">Расходы: {fmt(stats.totalExpense)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Users ─────────────────────────────────────────── */}
          {tab === "users" && !loading && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Пользователи</h1>
                  <p className="text-white/40 text-sm">{users.length} зарегистрированных</p>
                </div>
                <button onClick={loadUsers} className="glass border border-white/10 px-3 py-2 rounded-xl text-xs text-white/60 flex items-center gap-2 hover:bg-white/5 transition-colors">
                  <Icon name="RefreshCw" size={13} />Обновить
                </button>
              </div>
              <div className="glass rounded-2xl overflow-hidden border border-white/5">
                {users.map((u, i) => (
                  <div key={u.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/3 transition-colors ${i < users.length - 1 ? "border-b border-white/5" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-[#070b12] shrink-0 ${u.role === "admin" ? "gradient-primary" : "bg-white/10"}`}>
                      {u.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white/90">{u.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${u.role === "admin" ? "bg-cyan-500/20 text-[#00e5ff]" : "bg-white/10 text-white/40"}`}>{u.role}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-400 font-mono">{u.plan}</span>
                      </div>
                      <div className="text-xs text-white/30">{u.email} · {u.accountsCount} счетов</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => setEditUser(u)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/40 hover:text-[#00e5ff] transition-colors">
                        <Icon name="Edit" size={13} />
                      </button>
                      <button onClick={() => deleteUser(u.id)} disabled={u.id === 1}
                        className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/40 hover:text-red-400 transition-colors disabled:opacity-20">
                        <Icon name="Trash2" size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Transactions ───────────────────────────────────── */}
          {tab === "transactions" && !loading && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Операции</h1>
                  <p className="text-white/40 text-sm">Последние {transactions.length} транзакций</p>
                </div>
                <button onClick={loadTransactions} className="glass border border-white/10 px-3 py-2 rounded-xl text-xs text-white/60 flex items-center gap-2 hover:bg-white/5 transition-colors">
                  <Icon name="RefreshCw" size={13} />Обновить
                </button>
              </div>
              <div className="glass rounded-2xl overflow-hidden border border-white/5">
                {transactions.map((tx, i) => (
                  <div key={tx.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-white/3 transition-colors ${i < transactions.length - 1 ? "border-b border-white/5" : ""}`}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tx.color}15` }}>
                      <Icon name={tx.icon} size={16} style={{ color: tx.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/90 truncate">{tx.title}</div>
                      <div className="text-xs text-white/30">{tx.user} · {tx.category}</div>
                    </div>
                    <div className={`text-sm font-bold font-mono ${tx.amount > 0 ? "text-green-400" : "text-white/70"}`}>
                      {tx.amount > 0 ? "+" : ""}{new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(Math.abs(tx.amount))} ₽
                    </div>
                    <button onClick={() => deleteTx(tx.id)} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white/30 hover:text-red-400 transition-colors shrink-0">
                      <Icon name="Trash2" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Broadcast ──────────────────────────────────────── */}
          {tab === "broadcast" && (
            <div className="space-y-5 animate-fade-in max-w-lg">
              <div>
                <h1 className="text-2xl font-bold text-white">Рассылка</h1>
                <p className="text-white/40 text-sm">Отправить уведомление всем пользователям</p>
              </div>
              <div className="glass rounded-2xl p-5 border border-white/8 space-y-4">
                <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Заголовок</label>
                  <input type="text" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="Системное уведомление" className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/20" />
                </div>
                <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Текст</label>
                  <textarea value={broadcastText} onChange={(e) => setBroadcastText(e.target.value)}
                    placeholder="Текст уведомления для всех пользователей..."
                    rows={3} className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/20 resize-none" />
                </div>
                <div>
                  <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Тип</label>
                  <div className="flex gap-2">
                    {[
                      { id: "info", label: "Инфо", color: "#00e5ff" },
                      { id: "success", label: "Успех", color: "#00ff88" },
                      { id: "warning", label: "Важно", color: "#f59e0b" },
                    ].map((t) => (
                      <button key={t.id} onClick={() => setBroadcastType(t.id)}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all border ${broadcastType === t.id ? "border-current" : "border-transparent glass"}`}
                        style={broadcastType === t.id ? { color: t.color, background: `${t.color}15` } : { color: "rgba(255,255,255,0.4)" }}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={sendBroadcast}
                  disabled={!broadcastTitle || !broadcastText}
                  className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan disabled:opacity-30 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2">
                  <Icon name="Send" size={15} />Отправить всем
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
