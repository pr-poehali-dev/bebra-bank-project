import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Page = "dashboard" | "accounts" | "transfers" | "cards" | "history" | "notifications" | "settings";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);

// ─── Toast system ─────────────────────────────────────────────────────────────
type Toast = { id: number; message: string; type: "success" | "error" | "info" };
let toastId = 0;
let addToastGlobal: ((t: Omit<Toast, "id">) => void) | null = null;
const toast = {
  success: (message: string) => addToastGlobal?.({ message, type: "success" }),
  error: (message: string) => addToastGlobal?.({ message, type: "error" }),
  info: (message: string) => addToastGlobal?.({ message, type: "info" }),
};

function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  addToastGlobal = (t) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  };
  return (
    <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`glass-strong rounded-xl px-4 py-3 flex items-center gap-3 min-w-[240px] shadow-lg border pointer-events-auto animate-slide-up
          ${t.type === "success" ? "border-green-500/30" : t.type === "error" ? "border-red-500/30" : "border-cyan-500/30"}`}>
          <Icon name={t.type === "success" ? "CheckCircle" : t.type === "error" ? "XCircle" : "Info"} size={16}
            className={t.type === "success" ? "text-green-400" : t.type === "error" ? "text-red-400" : "text-[#00e5ff]"} />
          <span className="text-sm text-white/90">{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative glass-strong rounded-2xl p-6 w-full max-w-md border border-white/10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const initialAccounts = [
  { id: "1", name: "Основной счёт", number: "•••• 4521", fullNumber: "4081 7810 0001 4521", balance: 284750, currency: "₽", color: "#00e5ff", change: +12.4 },
  { id: "2", name: "Накопительный", number: "•••• 8834", fullNumber: "4081 7810 0008 8834", balance: 1250000, currency: "₽", color: "#a855f7", change: +5.1 },
  { id: "3", name: "Долларовый", number: "•••• 2219", fullNumber: "4081 7810 0002 2219", balance: 3480, currency: "$", color: "#00ff88", change: -1.2 },
];

const initialCards = [
  { id: "1", number: "•••• •••• •••• 4521", fullNumber: "4521 8800 1234 4521", holder: "ALEKSEI PETROV", expires: "12/27", type: "VISA", balance: 284750, color: "from-cyan-500 to-blue-600", locked: false },
  { id: "2", number: "•••• •••• •••• 8834", fullNumber: "5334 9900 5678 8834", holder: "ALEKSEI PETROV", expires: "08/26", type: "MasterCard", balance: 156300, color: "from-purple-500 to-pink-600", locked: false },
];

const mockTransactions = [
  { id: "1", title: "Супермаркет Лента", category: "Продукты", amount: -3240, date: "Сег., 14:32", icon: "ShoppingCart", color: "#00e5ff" },
  { id: "2", title: "Перевод от Марии К.", category: "Входящий", amount: +25000, date: "Сег., 11:15", icon: "ArrowDownLeft", color: "#00ff88" },
  { id: "3", title: "Netflix", category: "Подписки", amount: -890, date: "Вчера, 23:00", icon: "Play", color: "#a855f7" },
  { id: "4", title: "Такси Яндекс", category: "Транспорт", amount: -540, date: "Вчера, 18:44", icon: "Car", color: "#ff2d78" },
  { id: "5", title: "Зарплата", category: "Доход", amount: +180000, date: "13 мая", icon: "Briefcase", color: "#00ff88" },
  { id: "6", title: "Аренда квартиры", category: "ЖКХ", amount: -45000, date: "10 мая", icon: "Home", color: "#f59e0b" },
  { id: "7", title: "DNS Техника", category: "Электроника", amount: -12990, date: "8 мая", icon: "Laptop", color: "#00e5ff" },
  { id: "8", title: "Кофейня Surf", category: "Кафе", amount: -480, date: "7 мая", icon: "Coffee", color: "#f59e0b" },
];

const initialNotifications = [
  { id: "1", title: "Перевод получен", text: "Мария К. перевела вам 25 000 ₽", time: "14 мин назад", type: "success", read: false },
  { id: "2", title: "Подозрительная операция", text: "Попытка входа с нового устройства заблокирована", time: "2 ч назад", type: "warning", read: false },
  { id: "3", title: "Кэшбэк начислен", text: "Вам начислено 640 ₽ кэшбэка за май", time: "5 ч назад", type: "info", read: true },
  { id: "4", title: "Платёж выполнен", text: "Netflix — 890 ₽ успешно списано", time: "Вчера", type: "info", read: true },
  { id: "5", title: "Ставка изменена", text: "Ставка по накопительному счёту: 18% годовых", time: "2 дня назад", type: "success", read: true },
];

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function Index() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [transferStep, setTransferStep] = useState<"form" | "confirm" | "done">("form");
  const [transferPhone, setTransferPhone] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferComment, setTransferComment] = useState("");
  const [notifications, setNotifications] = useState(initialNotifications);
  const [accounts, setAccounts] = useState(initialAccounts);
  const [cards, setCards] = useState(initialCards);
  const [qrMode, setQrMode] = useState(false);
  const [transactions, setTransactions] = useState(mockTransactions);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: Page; icon: string; label: string }[] = [
    { id: "dashboard", icon: "LayoutDashboard", label: "Главная" },
    { id: "accounts", icon: "Wallet", label: "Счета" },
    { id: "transfers", icon: "ArrowLeftRight", label: "Переводы" },
    { id: "cards", icon: "CreditCard", label: "Карты" },
    { id: "history", icon: "Clock", label: "История" },
    { id: "notifications", icon: "Bell", label: "Уведомления" },
    { id: "settings", icon: "Settings", label: "Настройки" },
  ];

  const handleTransferDone = (phone: string, amount: string) => {
    const num = Number(amount);
    setAccounts((prev) => prev.map((a) => a.id === "1" ? { ...a, balance: a.balance - num } : a));
    const newTx = {
      id: String(Date.now()),
      title: `Перевод: ${phone}`,
      category: "Перевод",
      amount: -num,
      date: "Только что",
      icon: "Send",
      color: "#00e5ff",
    };
    setTransactions((prev) => [newTx, ...prev]);
    const newNotif = {
      id: String(Date.now()),
      title: "Перевод отправлен",
      text: `${formatMoney(num)} на ${phone}`,
      time: "Только что",
      type: "success" as const,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#070b12] bg-grid relative overflow-hidden font-sans">
      <ToastContainer />
      <div className="orb w-[600px] h-[600px] bg-cyan-500/8 top-[-200px] right-[-200px]" />
      <div className="orb w-[500px] h-[500px] bg-purple-500/8 bottom-[-100px] left-[-200px]" />
      <div className="orb w-[300px] h-[300px] bg-pink-500/5 top-[40%] left-[40%]" />

      <div className="relative z-10 flex h-screen max-w-[1440px] mx-auto">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 h-full glass border-r border-white/5 p-6 gap-2 shrink-0">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center neon-glow-cyan">
                <Icon name="Zap" size={16} className="text-[#070b12]" />
              </div>
              <div>
                <div className="font-black text-sm tracking-widest gradient-text">БЕБРА_bank</div>
                <div className="text-[10px] text-white/30 font-mono tracking-wider">v2.0 QUANTUM</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  activePage === item.id
                    ? "bg-cyan-500/10 text-[#00e5ff] neon-glow-cyan border border-cyan-500/20"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="ml-auto bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={() => { setActivePage("settings"); toast.info("Открыт профиль"); }}
            className="glass rounded-xl p-3 flex items-center gap-3 hover:bg-white/5 transition-colors text-left w-full"
          >
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center text-[#070b12] font-bold text-sm shrink-0">АП</div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/90 truncate">Алексей П.</div>
              <div className="text-xs text-white/40 font-mono">Premium</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-white/30 ml-auto shrink-0" />
          </button>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden glass border-b border-white/5 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 gradient-primary rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={14} className="text-[#070b12]" />
              </div>
              <span className="font-black text-sm tracking-widest gradient-text">БЕБРА_bank</span>
            </div>
            <button className="relative" onClick={() => setActivePage("notifications")}>
              <Icon name="Bell" size={20} className="text-white/60" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activePage === "dashboard" && (
              <DashboardPage accounts={accounts} transactions={transactions} setActivePage={setActivePage} />
            )}
            {activePage === "accounts" && (
              <AccountsPage accounts={accounts} setAccounts={setAccounts} setActivePage={setActivePage} />
            )}
            {activePage === "transfers" && (
              <TransfersPage
                step={transferStep} setStep={setTransferStep}
                phone={transferPhone} setPhone={setTransferPhone}
                amount={transferAmount} setAmount={setTransferAmount}
                comment={transferComment} setComment={setTransferComment}
                qrMode={qrMode} setQrMode={setQrMode}
                onDone={handleTransferDone}
              />
            )}
            {activePage === "cards" && (
              <CardsPage cards={cards} setCards={setCards} />
            )}
            {activePage === "history" && <HistoryPage transactions={transactions} />}
            {activePage === "notifications" && (
              <NotificationsPage
                notifications={notifications}
                onRead={(id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))}
                onReadAll={() => { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); toast.success("Все уведомления прочитаны"); }}
                onDelete={(id) => { setNotifications((prev) => prev.filter((n) => n.id !== id)); toast.info("Уведомление удалено"); }}
              />
            )}
            {activePage === "settings" && <SettingsPage />}
          </div>

          <nav className="md:hidden glass border-t border-white/5 flex shrink-0">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all relative ${
                  activePage === item.id ? "text-[#00e5ff]" : "text-white/40"
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
                {item.id === "notifications" && unreadCount > 0 && (
                  <span className="absolute top-2 left-1/2 translate-x-1 w-1.5 h-1.5 bg-pink-500 rounded-full" />
                )}
              </button>
            ))}
          </nav>
        </main>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
function DashboardPage({ accounts, transactions, setActivePage }: {
  accounts: typeof initialAccounts;
  transactions: typeof mockTransactions;
  setActivePage: (p: Page) => void;
}) {
  const totalBalance = accounts.reduce((sum, a) => sum + (a.currency === "₽" ? a.balance : a.balance * 90), 0);
  const [txDetail, setTxDetail] = useState<(typeof mockTransactions)[0] | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      {txDetail && (
        <Modal title="Детали операции" onClose={() => setTxDetail(null)}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${txDetail.color}20` }}>
                <Icon name={txDetail.icon} size={22} style={{ color: txDetail.color }} />
              </div>
              <div>
                <div className="font-semibold text-white">{txDetail.title}</div>
                <div className="text-sm text-white/40">{txDetail.category} · {txDetail.date}</div>
              </div>
            </div>
            {[
              ["Сумма", <span className={`font-bold font-mono ${txDetail.amount > 0 ? "text-green-400" : "text-white"}`}>{txDetail.amount > 0 ? "+" : ""}{formatMoney(Math.abs(txDetail.amount))}</span>],
              ["Статус", <span className="text-green-400 text-sm">Выполнено</span>],
              ["Счёт", <span className="text-white/70 text-sm font-mono">•••• 4521</span>],
              ["ID операции", <span className="text-white/40 text-xs font-mono">TXN{txDetail.id.padStart(10, "0")}</span>],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-white/50">{label}</span>
                {value}
              </div>
            ))}
            <button onClick={() => { toast.info("Квитанция сохранена в PDF"); setTxDetail(null); }} className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl mt-2 text-sm neon-glow-cyan">
              Скачать квитанцию
            </button>
          </div>
        </Modal>
      )}

      <div>
        <p className="text-white/40 text-sm mb-1">Добро пожаловать,</p>
        <h1 className="text-2xl font-bold text-white">Алексей <span className="gradient-text">Петров</span></h1>
      </div>

      <div className="glass-strong rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 gradient-card opacity-50" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="relative">
          <p className="text-white/50 text-sm mb-2 font-mono tracking-wider uppercase">Общий баланс</p>
          <div className="text-4xl font-black text-white mb-1">{formatMoney(totalBalance)}</div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400 flex items-center gap-1 font-mono">
              <Icon name="TrendingUp" size={14} />+8.3%
            </span>
            <span className="text-white/30">за последние 30 дней</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mt-6">
          {[
            { icon: "Send", label: "Перевод", page: "transfers" as Page, tip: "Открываю переводы" },
            { icon: "Plus", label: "Пополнить", page: "accounts" as Page, tip: "Открываю счета" },
            { icon: "ArrowDownLeft", label: "Получить", page: "accounts" as Page, tip: "Открываю счета" },
            { icon: "MoreHorizontal", label: "Ещё", page: "settings" as Page, tip: "Открываю настройки" },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => { setActivePage(action.page); toast.info(action.tip); }}
              className="flex flex-col items-center gap-2 glass rounded-xl p-3 hover:bg-white/8 transition-all card-hover group"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <Icon name={action.icon} size={18} className="text-[#00e5ff]" />
              </div>
              <span className="text-[11px] text-white/60 font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Мои счета</h2>
          <button onClick={() => setActivePage("accounts")} className="text-xs text-[#00e5ff] hover:opacity-80">Все счета</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {accounts.map((acc, i) => (
            <button
              key={acc.id}
              onClick={() => { setActivePage("accounts"); toast.info(`Открыт счёт ${acc.name}`); }}
              className="glass rounded-xl p-4 card-hover border border-white/5 cursor-pointer text-left"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/40 font-mono">{acc.number}</span>
                <div className="w-2 h-2 rounded-full" style={{ background: acc.color, boxShadow: `0 0 8px ${acc.color}` }} />
              </div>
              <div className="text-lg font-bold text-white">
                {acc.currency === "₽" ? formatMoney(acc.balance) : `$${acc.balance.toLocaleString("ru-RU")}`}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-white/40">{acc.name}</span>
                <span className={`text-xs font-mono ${acc.change > 0 ? "text-green-400" : "text-red-400"}`}>
                  {acc.change > 0 ? "+" : ""}{acc.change}%
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Последние операции</h2>
          <button onClick={() => setActivePage("history")} className="text-xs text-[#00e5ff] hover:opacity-80">История</button>
        </div>
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          {transactions.slice(0, 5).map((tx, i) => (
            <button
              key={tx.id}
              onClick={() => setTxDetail(tx)}
              className={`flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors w-full text-left ${i < 4 ? "border-b border-white/5" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tx.color}15` }}>
                <Icon name={tx.icon} size={18} style={{ color: tx.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white/90 truncate">{tx.title}</div>
                <div className="text-xs text-white/40">{tx.category} · {tx.date}</div>
              </div>
              <div className={`text-sm font-bold font-mono shrink-0 ${tx.amount > 0 ? "text-green-400" : "text-white/80"}`}>
                {tx.amount > 0 ? "+" : ""}{formatMoney(Math.abs(tx.amount))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
function AccountsPage({ accounts, setAccounts, setActivePage }: {
  accounts: typeof initialAccounts;
  setAccounts: React.Dispatch<React.SetStateAction<typeof initialAccounts>>;
  setActivePage: (p: Page) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showTopup, setShowTopup] = useState<string | null>(null);
  const [topupAmount, setTopupAmount] = useState("");
  const [showRequisites, setShowRequisites] = useState<string | null>(null);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccName, setNewAccName] = useState("");

  const selectedAcc = accounts.find((a) => a.id === showTopup);
  const reqAcc = accounts.find((a) => a.id === showRequisites);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Topup modal */}
      {showTopup && selectedAcc && (
        <Modal title={`Пополнить: ${selectedAcc.name}`} onClose={() => { setShowTopup(null); setTopupAmount(""); }}>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Сумма пополнения</label>
              <div className="flex items-baseline gap-2">
                <input type="number" value={topupAmount} onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="0" className="bg-transparent text-white text-3xl font-black w-full outline-none placeholder:text-white/20" autoFocus />
                <span className="text-white/40 text-xl">₽</span>
              </div>
              <div className="flex gap-2 mt-3">
                {[1000, 5000, 10000, 50000].map((v) => (
                  <button key={v} onClick={() => setTopupAmount(String(v))} className="glass rounded-lg px-3 py-1 text-xs text-[#00e5ff] hover:bg-cyan-500/10 transition-colors">
                    {v.toLocaleString("ru-RU")}
                  </button>
                ))}
              </div>
            </div>
            <button
              disabled={!topupAmount || Number(topupAmount) <= 0}
              onClick={() => {
                setAccounts((prev) => prev.map((a) => a.id === showTopup ? { ...a, balance: a.balance + Number(topupAmount) } : a));
                toast.success(`Счёт пополнен на ${formatMoney(Number(topupAmount))}`);
                setShowTopup(null); setTopupAmount("");
              }}
              className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Пополнить
            </button>
          </div>
        </Modal>
      )}

      {/* Requisites modal */}
      {showRequisites && reqAcc && (
        <Modal title="Реквизиты счёта" onClose={() => setShowRequisites(null)}>
          <div className="space-y-3">
            {[
              ["Номер счёта", reqAcc.fullNumber],
              ["Владелец", "Алексей Петров"],
              ["Банк", "БЕБРА_bank"],
              ["БИК", "044525225"],
              ["ИНН банка", "7710140679"],
              ["Кор. счёт", "30101810400000000225"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-white/40">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-mono">{value}</span>
                  <button onClick={() => { navigator.clipboard?.writeText(value); toast.success("Скопировано!"); }}
                    className="text-[#00e5ff] hover:opacity-70 transition-opacity">
                    <Icon name="Copy" size={13} />
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => { toast.info("Реквизиты отправлены на email"); setShowRequisites(null); }}
              className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl mt-2 text-sm neon-glow-cyan">
              Отправить на email
            </button>
          </div>
        </Modal>
      )}

      {/* New account modal */}
      {showNewAccount && (
        <Modal title="Открыть новый счёт" onClose={() => setShowNewAccount(false)}>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-white/8">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Название счёта</label>
              <input type="text" value={newAccName} onChange={(e) => setNewAccName(e.target.value)}
                placeholder="Например: Отпуск" autoFocus
                className="bg-transparent text-white text-lg font-medium w-full outline-none placeholder:text-white/20" />
            </div>
            <button
              disabled={!newAccName.trim()}
              onClick={() => {
                const colors = ["#f59e0b", "#ff2d78", "#00e5ff"];
                const newAcc = {
                  id: String(Date.now()),
                  name: newAccName.trim(),
                  number: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
                  fullNumber: `4081 7810 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
                  balance: 0,
                  currency: "₽",
                  color: colors[Math.floor(Math.random() * colors.length)],
                  change: 0,
                };
                setAccounts((prev) => [...prev, newAcc]);
                toast.success(`Счёт «${newAccName}» открыт!`);
                setShowNewAccount(false); setNewAccName("");
              }}
              className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan disabled:opacity-30 disabled:cursor-not-allowed text-sm"
            >
              Открыть счёт
            </button>
          </div>
        </Modal>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Мои счета</h1>
        <p className="text-white/40 text-sm">Управление и просмотр счетов</p>
      </div>

      <div className="grid gap-4">
        {accounts.map((acc, i) => (
          <div
            key={acc.id}
            onClick={() => setSelected(selected === acc.id ? null : acc.id)}
            className={`glass rounded-2xl p-5 cursor-pointer transition-all duration-300 border ${
              selected === acc.id ? "border-cyan-500/40 neon-glow-cyan" : "border-white/5 hover:border-white/15"
            }`}
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ background: acc.color, boxShadow: `0 0 10px ${acc.color}` }} />
                  <span className="text-sm text-white/50 font-medium">{acc.name}</span>
                </div>
                <div className="text-2xl font-black text-white">
                  {acc.currency === "₽" ? formatMoney(acc.balance) : `${acc.currency}${acc.balance.toLocaleString("ru-RU")}`}
                </div>
                <div className="text-xs text-white/30 font-mono mt-1">{acc.number}</div>
              </div>
              <div className={`flex items-center gap-1 text-sm font-mono px-2 py-1 rounded-lg ${acc.change > 0 ? "bg-green-500/10 text-green-400" : acc.change < 0 ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/40"}`}>
                {acc.change !== 0 && <Icon name={acc.change > 0 ? "TrendingUp" : "TrendingDown"} size={12} />}
                {acc.change > 0 ? "+" : ""}{acc.change}%
              </div>
            </div>

            {selected === acc.id && (
              <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-3 gap-3 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowTopup(acc.id)} className="glass rounded-xl py-2 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors">Пополнить</button>
                <button onClick={() => { setActivePage("transfers"); toast.info("Открываю переводы"); }} className="glass rounded-xl py-2 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors">Перевести</button>
                <button onClick={() => setShowRequisites(acc.id)} className="glass rounded-xl py-2 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors">Реквизиты</button>
                <div className="col-span-3 grid grid-cols-2 gap-3 mt-1">
                  <div className="glass rounded-xl p-3">
                    <div className="text-xs text-white/40 mb-1">Приход (месяц)</div>
                    <div className="text-sm font-bold text-green-400">+{formatMoney(205000)}</div>
                  </div>
                  <div className="glass rounded-xl p-3">
                    <div className="text-xs text-white/40 mb-1">Расход (месяц)</div>
                    <div className="text-sm font-bold text-white/80">−{formatMoney(63140)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowNewAccount(true)}
        className="w-full glass rounded-2xl p-4 border border-dashed border-white/15 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 hover:border-white/30 transition-all"
      >
        <Icon name="Plus" size={18} />
        <span className="text-sm">Открыть новый счёт</span>
      </button>
    </div>
  );
}

// ─── Transfers ────────────────────────────────────────────────────────────────
function TransfersPage({ step, setStep, phone, setPhone, amount, setAmount, comment, setComment, qrMode, setQrMode, onDone }: {
  step: "form" | "confirm" | "done";
  setStep: (s: "form" | "confirm" | "done") => void;
  phone: string; setPhone: (v: string) => void;
  amount: string; setAmount: (v: string) => void;
  comment: string; setComment: (v: string) => void;
  qrMode: boolean; setQrMode: (v: boolean) => void;
  onDone: (phone: string, amount: string) => void;
}) {
  const contacts = [
    { name: "Мария К.", phone: "+7 916 234-56-78", initials: "МК", color: "#a855f7" },
    { name: "Сергей В.", phone: "+7 903 876-54-32", initials: "СВ", color: "#00e5ff" },
    { name: "Анна Л.", phone: "+7 925 111-22-33", initials: "АЛ", color: "#00ff88" },
    { name: "Дима Р.", phone: "+7 929 444-55-66", initials: "ДР", color: "#ff2d78" },
  ];

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
          <Icon name="CheckCircle" size={48} className="text-green-400" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Перевод отправлен!</h2>
          <p className="text-white/50">{formatMoney(Number(amount))} на {phone}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { setStep("form"); setPhone(""); setAmount(""); setComment(""); }}
            className="gradient-primary text-[#070b12] font-bold px-8 py-3 rounded-xl neon-glow-cyan hover:opacity-90 transition-opacity"
          >
            Новый перевод
          </button>
          <button
            onClick={() => toast.info("Квитанция сохранена")}
            className="glass border border-white/10 text-white/70 font-medium px-6 py-3 rounded-xl hover:bg-white/5 transition-colors"
          >
            Квитанция
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="max-w-md mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Подтверждение</h1>
          <p className="text-white/40 text-sm">Проверьте данные перевода</p>
        </div>
        <div className="glass-strong rounded-2xl p-6 space-y-4 border border-white/8">
          <div className="flex justify-between">
            <span className="text-white/50 text-sm">Получатель</span>
            <span className="text-white font-medium text-sm">{phone}</span>
          </div>
          <div className="flex justify-between border-t border-white/8 pt-4">
            <span className="text-white/50 text-sm">Сумма</span>
            <span className="text-2xl font-black gradient-text">{formatMoney(Number(amount))}</span>
          </div>
          {comment && (
            <div className="flex justify-between border-t border-white/8 pt-4">
              <span className="text-white/50 text-sm">Комментарий</span>
              <span className="text-white/80 text-sm">{comment}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-white/8 pt-4">
            <span className="text-white/50 text-sm">Комиссия</span>
            <span className="text-green-400 text-sm font-mono">Бесплатно</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="flex-1 glass rounded-xl py-3 text-white/70 font-medium hover:bg-white/8 transition-colors">
            Назад
          </button>
          <button
            onClick={() => { onDone(phone, amount); setStep("done"); }}
            className="flex-1 gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan hover:opacity-90 transition-opacity"
          >
            Подтвердить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Перевод</h1>
        <p className="text-white/40 text-sm">Быстрый перевод по телефону или QR</p>
      </div>

      <div className="glass rounded-xl p-1 flex gap-1">
        <button
          onClick={() => setQrMode(false)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${!qrMode ? "bg-cyan-500/20 text-[#00e5ff]" : "text-white/50"}`}
        >
          <Icon name="Phone" size={15} /> По телефону
        </button>
        <button
          onClick={() => setQrMode(true)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${qrMode ? "bg-purple-500/20 text-purple-400" : "text-white/50"}`}
        >
          <Icon name="QrCode" size={15} /> QR-код
        </button>
      </div>

      {qrMode ? (
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4 border border-white/8">
          <div className="w-48 h-48 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative">
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-[#00e5ff] rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-[#00e5ff] rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-[#00e5ff] rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-[#00e5ff] rounded-br" />
            <Icon name="QrCode" size={80} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm text-center">Покажите QR-код получателю<br />или отсканируйте чужой</p>
          <div className="flex gap-3">
            <button
              onClick={() => toast.info("Открываю камеру...")}
              className="gradient-primary text-[#070b12] font-bold px-6 py-2.5 rounded-xl neon-glow-cyan text-sm flex items-center gap-2"
            >
              <Icon name="Camera" size={16} /> Сканировать
            </button>
            <button
              onClick={() => { navigator.clipboard?.writeText("https://bebrabank.ru/pay/aleksei"); toast.success("Ссылка скопирована!"); }}
              className="glass border border-white/10 text-white/70 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-white/5 transition-colors"
            >
              <Icon name="Copy" size={15} /> Скопировать
            </button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Недавние</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {contacts.map((c) => (
                <button key={c.name} onClick={() => { setPhone(c.phone); toast.info(`Выбран: ${c.name}`); }} className="flex flex-col items-center gap-2 shrink-0 group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-[#070b12] transition-transform group-hover:scale-105"
                    style={{ background: c.color, boxShadow: `0 4px 15px ${c.color}40` }}
                  >
                    {c.initials}
                  </div>
                  <span className="text-[11px] text-white/50 font-medium">{c.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Номер телефона</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 000 000-00-00"
                className="bg-transparent text-white text-lg font-medium w-full outline-none placeholder:text-white/20 font-mono" />
            </div>
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Сумма</label>
              <div className="flex items-baseline gap-2">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-white text-3xl font-black w-full outline-none placeholder:text-white/20" />
                <span className="text-white/40 text-xl font-medium">₽</span>
              </div>
              <div className="flex gap-2 mt-3">
                {[1000, 5000, 10000, 25000].map((v) => (
                  <button key={v} onClick={() => setAmount(String(v))} className="glass rounded-lg px-3 py-1 text-xs text-[#00e5ff] hover:bg-cyan-500/10 transition-colors">
                    {v.toLocaleString("ru-RU")}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Комментарий (необязательно)</label>
              <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                placeholder="За что перевод..."
                className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/20" />
            </div>
          </div>

          <button
            onClick={() => phone && amount ? setStep("confirm") : toast.error("Заполните телефон и сумму")}
            className="w-full gradient-primary text-[#070b12] font-bold py-4 rounded-xl neon-glow-cyan hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed text-sm"
          >
            Продолжить
          </button>
        </>
      )}
    </div>
  );
}

// ─── Cards ────────────────────────────────────────────────────────────────────
function CardsPage({ cards, setCards }: {
  cards: typeof initialCards;
  setCards: React.Dispatch<React.SetStateAction<typeof initialCards>>;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCvv, setShowCvv] = useState<string | null>(null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [confirmLock, setConfirmLock] = useState<string | null>(null);

  const lockCard = (id: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card) return;
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, locked: !c.locked } : c));
    toast.success(card.locked ? "Карта разблокирована" : "Карта заблокирована");
    setConfirmLock(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Lock confirm */}
      {confirmLock && (
        <Modal title={cards.find((c) => c.id === confirmLock)?.locked ? "Разблокировать карту?" : "Заблокировать карту?"}
          onClose={() => setConfirmLock(null)}>
          <p className="text-white/50 text-sm mb-5">
            {cards.find((c) => c.id === confirmLock)?.locked
              ? "Карта снова станет активной и доступной для оплаты."
              : "Все операции по карте будут приостановлены."}
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmLock(null)} className="flex-1 glass rounded-xl py-3 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors">Отмена</button>
            <button onClick={() => lockCard(confirmLock!)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-opacity hover:opacity-90 ${cards.find((c) => c.id === confirmLock)?.locked ? "gradient-primary text-[#070b12] neon-glow-cyan" : "bg-red-500/20 border border-red-500/30 text-red-400"}`}>
              {cards.find((c) => c.id === confirmLock)?.locked ? "Разблокировать" : "Заблокировать"}
            </button>
          </div>
        </Modal>
      )}

      {/* CVV modal */}
      {showCvv && (
        <Modal title="CVV код" onClose={() => setShowCvv(null)}>
          <div className="text-center py-4">
            <div className="text-5xl font-black font-mono text-[#00e5ff] neon-text-cyan mb-3">•••</div>
            <button onClick={() => setShowCvv("shown")} className="text-sm text-white/50 hover:text-white/80 transition-colors flex items-center gap-1 mx-auto">
              <Icon name="Eye" size={14} /> Показать CVV
            </button>
            {showCvv === "shown" && <div className="text-5xl font-black font-mono text-[#00e5ff] mt-3">417</div>}
            <p className="text-xs text-white/30 mt-4">Никогда не передавайте CVV третьим лицам</p>
          </div>
        </Modal>
      )}

      {/* New card modal */}
      {showNewCard && (
        <Modal title="Выпустить карту" onClose={() => setShowNewCard(false)}>
          <div className="space-y-3">
            {[
              { type: "Виртуальная", desc: "Для онлайн-покупок, бесплатно", icon: "Globe" },
              { type: "Физическая", desc: "Пластиковая карта, доставка 3-5 дней", icon: "CreditCard" },
            ].map((opt) => (
              <button key={opt.type}
                onClick={() => { toast.success(`Заявка на ${opt.type.toLowerCase()} карту отправлена`); setShowNewCard(false); }}
                className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors border border-white/8 text-left group">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <Icon name={opt.icon} size={18} className="text-[#00e5ff]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{opt.type} карта</div>
                  <div className="text-xs text-white/40">{opt.desc}</div>
                </div>
                <Icon name="ChevronRight" size={16} className="text-white/30 ml-auto" />
              </button>
            ))}
          </div>
        </Modal>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Карты</h1>
        <p className="text-white/40 text-sm">Управление банковскими картами</p>
      </div>

      <div className="grid gap-6">
        {cards.map((card, i) => (
          <div key={card.id} style={{ animationDelay: `${i * 0.15}s` }}>
            <div
              onClick={() => setExpanded(expanded === card.id ? null : card.id)}
              className={`relative h-48 rounded-2xl bg-gradient-to-br ${card.color} p-6 cursor-pointer overflow-hidden transition-transform hover:scale-[1.02] ${card.locked ? "brightness-50" : ""}`}
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            >
              {card.locked && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="glass-strong rounded-xl px-4 py-2 flex items-center gap-2 border border-white/20">
                    <Icon name="Lock" size={16} className="text-white" />
                    <span className="text-white font-semibold text-sm">Заблокирована</span>
                  </div>
                </div>
              )}
              <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute bottom-[-30px] right-[20%] w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute top-6 left-6">
                <div className="text-[10px] text-white/60 font-mono uppercase tracking-widest mb-4">БЕБРА_bank</div>
                <div className="flex gap-1"><div className="w-7 h-5 rounded bg-yellow-400/90" /><div className="w-7 h-5 rounded bg-yellow-500/70 -ml-3" /></div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="font-mono text-white/90 text-lg tracking-widest mb-2">{card.number}</div>
                <div className="flex justify-between items-end">
                  <div><div className="text-[9px] text-white/50 uppercase tracking-wider">Владелец</div><div className="text-xs text-white font-medium">{card.holder}</div></div>
                  <div><div className="text-[9px] text-white/50 uppercase tracking-wider">До</div><div className="text-xs text-white font-mono">{card.expires}</div></div>
                  <div className="text-sm font-bold text-white">{card.type}</div>
                </div>
              </div>
            </div>

            {expanded === card.id && (
              <div className="mt-3 glass rounded-xl p-4 animate-fade-in border border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-3" onClick={(e) => e.stopPropagation()}>
                <div className="glass rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Баланс</div>
                  <div className="text-sm font-bold text-white">{formatMoney(card.balance)}</div>
                </div>
                <button onClick={() => setConfirmLock(card.id)}
                  className={`glass rounded-lg p-3 text-xs font-medium transition-colors text-left ${card.locked ? "text-green-400 hover:bg-green-500/10" : "text-red-400 hover:bg-red-500/10"}`}>
                  {card.locked ? "Разблокировать" : "Заблокировать"}
                </button>
                <button onClick={() => { navigator.clipboard?.writeText(card.fullNumber); toast.success("Номер карты скопирован"); }}
                  className="glass rounded-lg p-3 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors text-left">
                  Реквизиты
                </button>
                <button onClick={() => setShowCvv("blur")}
                  className="glass rounded-lg p-3 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors text-left">
                  CVV
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowNewCard(true)}
        className="w-full glass rounded-2xl p-4 border border-dashed border-white/15 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 hover:border-white/30 transition-all"
      >
        <Icon name="Plus" size={18} />
        <span className="text-sm">Выпустить новую карту</span>
      </button>
    </div>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
function HistoryPage({ transactions }: { transactions: typeof mockTransactions }) {
  const [filter, setFilter] = useState("all");
  const [txDetail, setTxDetail] = useState<(typeof mockTransactions)[0] | null>(null);
  const filters = [{ id: "all", label: "Все" }, { id: "income", label: "Доходы" }, { id: "expense", label: "Расходы" }];
  const filtered = transactions.filter((tx) =>
    filter === "all" ? true : filter === "income" ? tx.amount > 0 : tx.amount < 0
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {txDetail && (
        <Modal title="Детали операции" onClose={() => setTxDetail(null)}>
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${txDetail.color}20` }}>
                <Icon name={txDetail.icon} size={22} style={{ color: txDetail.color }} />
              </div>
              <div>
                <div className="font-semibold text-white">{txDetail.title}</div>
                <div className="text-sm text-white/40">{txDetail.category} · {txDetail.date}</div>
              </div>
            </div>
            {[
              ["Сумма", <span className={`font-bold font-mono ${txDetail.amount > 0 ? "text-green-400" : "text-white"}`}>{txDetail.amount > 0 ? "+" : ""}{formatMoney(Math.abs(txDetail.amount))}</span>],
              ["Статус", <span className="text-green-400 text-sm">Выполнено</span>],
              ["Счёт", <span className="text-white/70 text-sm font-mono">•••• 4521</span>],
              ["ID", <span className="text-white/40 text-xs font-mono">TXN{txDetail.id.padStart(10, "0")}</span>],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-sm text-white/50">{label}</span>
                {value}
              </div>
            ))}
            <button onClick={() => { toast.info("Квитанция сохранена"); setTxDetail(null); }}
              className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl mt-2 text-sm neon-glow-cyan">
              Скачать квитанцию
            </button>
          </div>
        </Modal>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">История</h1>
        <p className="text-white/40 text-sm">Все операции по счетам</p>
      </div>

      <div className="glass rounded-xl p-1 flex gap-1 w-fit">
        {filters.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id ? "bg-cyan-500/20 text-[#00e5ff]" : "text-white/50 hover:text-white/70"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-xl p-4 border border-green-500/15">
          <div className="text-xs text-white/40 mb-1">Приход за май</div>
          <div className="text-lg font-bold text-green-400">+{formatMoney(205000)}</div>
        </div>
        <div className="glass rounded-xl p-4 border border-red-500/10">
          <div className="text-xs text-white/40 mb-1">Расход за май</div>
          <div className="text-lg font-bold text-white/80">−{formatMoney(63140)}</div>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        {filtered.map((tx, i) => (
          <button key={tx.id} onClick={() => setTxDetail(tx)}
            className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/5 transition-colors cursor-pointer w-full text-left ${i < filtered.length - 1 ? "border-b border-white/5" : ""}`}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${tx.color}15` }}>
              <Icon name={tx.icon} size={18} style={{ color: tx.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white/90 truncate">{tx.title}</div>
              <div className="text-xs text-white/40">{tx.date}</div>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold font-mono ${tx.amount > 0 ? "text-green-400" : "text-white/80"}`}>
                {tx.amount > 0 ? "+" : ""}{formatMoney(Math.abs(tx.amount))}
              </div>
              <div className="text-[10px] text-white/30">{tx.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function NotificationsPage({ notifications, onRead, onReadAll, onDelete }: {
  notifications: typeof initialNotifications;
  onRead: (id: string) => void;
  onReadAll: () => void;
  onDelete: (id: string) => void;
}) {
  const typeStyles: Record<string, { bg: string; icon: string; color: string }> = {
    success: { bg: "bg-green-500/10 border-green-500/20", icon: "CheckCircle", color: "#00ff88" },
    warning: { bg: "bg-yellow-500/10 border-yellow-500/20", icon: "AlertTriangle", color: "#f59e0b" },
    info: { bg: "bg-cyan-500/10 border-cyan-500/20", icon: "Info", color: "#00e5ff" },
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Уведомления</h1>
          <p className="text-white/40 text-sm">{notifications.filter((n) => !n.read).length} непрочитанных</p>
        </div>
        <button onClick={onReadAll} className="text-xs text-[#00e5ff] hover:opacity-80 transition-opacity">
          Прочитать все
        </button>
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-white/30">
          <Icon name="BellOff" size={40} />
          <p className="text-sm">Нет уведомлений</p>
        </div>
      )}

      <div className="space-y-2">
        {notifications.map((n, i) => {
          const style = typeStyles[n.type];
          return (
            <div key={n.id} onClick={() => onRead(n.id)}
              className={`glass rounded-xl p-4 border cursor-pointer transition-all hover:bg-white/4 ${style.bg} ${!n.read ? "opacity-100" : "opacity-60"}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="flex items-start gap-3">
                <Icon name={style.icon} size={18} style={{ color: style.color }} className="shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white/90">{n.title}</span>
                    {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-[#00e5ff]" />}
                  </div>
                  <p className="text-xs text-white/50 mt-0.5">{n.text}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-white/30">{n.time}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                    className="w-6 h-6 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors text-white/30 hover:text-red-400">
                    <Icon name="X" size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Settings ────────────────────────────────────────────────────────────────
function SettingsPage() {
  const [twoFa, setTwoFa] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [biometry, setBiometry] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [name, setName] = useState("Алексей Петров");
  const [email, setEmail] = useState("a.petrov@mail.ru");
  const [editName, setEditName] = useState(name);
  const [editEmail, setEditEmail] = useState(email);
  const [showLogout, setShowLogout] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const sections = [
    {
      title: "Профиль",
      items: [
        { icon: "User", label: "Личные данные", sub: name, toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined, onClick: () => setShowProfile(true) },
        { icon: "Phone", label: "Номер телефона", sub: "+7 •••• ••45 78", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined, onClick: () => toast.info("Смена телефона требует SMS-подтверждения") },
        { icon: "Mail", label: "Электронная почта", sub: email, toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined, onClick: () => setShowProfile(true) },
      ],
    },
    {
      title: "Безопасность",
      items: [
        { icon: "Lock", label: "Сменить пароль", sub: "Последнее изменение: 3 мес. назад", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined, onClick: () => setShowPassword(true) },
        { icon: "Shield", label: "Двухфакторная аутентификация", sub: twoFa ? "Включена" : "Выключена", toggle: twoFa, onToggle: () => { setTwoFa(!twoFa); toast.success(!twoFa ? "2FA включена" : "2FA выключена"); }, onClick: undefined as (() => void) | undefined },
        { icon: "Fingerprint", label: "Вход по биометрии", sub: biometry ? "Включена" : "Выключена", toggle: biometry, onToggle: () => { setBiometry(!biometry); toast.success(!biometry ? "Биометрия включена" : "Биометрия выключена"); }, onClick: undefined as (() => void) | undefined },
        { icon: "Smartphone", label: "Активные сессии", sub: "2 устройства", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined, onClick: () => setShowSessions(true) },
      ],
    },
    {
      title: "Уведомления",
      items: [
        { icon: "Bell", label: "Push-уведомления", sub: pushNotifs ? "Включены" : "Выключены", toggle: pushNotifs, onToggle: () => { setPushNotifs(!pushNotifs); toast.success(!pushNotifs ? "Push-уведомления включены" : "Push-уведомления выключены"); }, onClick: undefined as (() => void) | undefined },
        { icon: "MessageSquare", label: "SMS-уведомления", sub: "Только важные", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined, onClick: () => toast.info("Настройки SMS пока в разработке") },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      {/* Modals */}
      {showProfile && (
        <Modal title="Личные данные" onClose={() => setShowProfile(false)}>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Имя</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
                className="bg-transparent text-white text-lg font-medium w-full outline-none" />
            </div>
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Email</label>
              <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                className="bg-transparent text-white text-lg font-medium w-full outline-none" />
            </div>
            <button onClick={() => { setName(editName); setEmail(editEmail); toast.success("Данные сохранены"); setShowProfile(false); }}
              className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan text-sm">
              Сохранить
            </button>
          </div>
        </Modal>
      )}

      {showPassword && (
        <Modal title="Сменить пароль" onClose={() => { setShowPassword(false); setOldPassword(""); setNewPassword(""); }}>
          <div className="space-y-4">
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Текущий пароль</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} autoFocus
                placeholder="••••••••" className="bg-transparent text-white text-lg w-full outline-none placeholder:text-white/20" />
            </div>
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Новый пароль</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••" className="bg-transparent text-white text-lg w-full outline-none placeholder:text-white/20" />
            </div>
            <button
              disabled={!oldPassword || newPassword.length < 6}
              onClick={() => { toast.success("Пароль изменён"); setShowPassword(false); setOldPassword(""); setNewPassword(""); }}
              className="w-full gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan disabled:opacity-30 disabled:cursor-not-allowed text-sm">
              Сменить пароль
            </button>
          </div>
        </Modal>
      )}

      {showSessions && (
        <Modal title="Активные сессии" onClose={() => setShowSessions(false)}>
          <div className="space-y-3">
            {[
              { device: "iPhone 15 Pro", os: "iOS 17.4", location: "Москва", active: true },
              { device: "MacBook Pro", os: "macOS Sonoma", location: "Москва", active: false },
            ].map((s) => (
              <div key={s.device} className="glass rounded-xl p-4 border border-white/8 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Icon name={s.device.includes("iPhone") ? "Smartphone" : "Laptop"} size={18} className="text-white/50 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-white/90">{s.device}</div>
                    <div className="text-xs text-white/40">{s.os} · {s.location}</div>
                  </div>
                </div>
                {s.active
                  ? <span className="text-[11px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full shrink-0">Текущее</span>
                  : <button onClick={() => { toast.success(`Сессия ${s.device} завершена`); setShowSessions(false); }}
                      className="text-[11px] text-red-400 hover:text-red-300 transition-colors shrink-0">Завершить</button>
                }
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showLogout && (
        <Modal title="Выйти из аккаунта?" onClose={() => setShowLogout(false)}>
          <p className="text-white/50 text-sm mb-5">Вы будете перенаправлены на страницу входа.</p>
          <div className="flex gap-3">
            <button onClick={() => setShowLogout(false)} className="flex-1 glass rounded-xl py-3 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors">Остаться</button>
            <button onClick={() => { toast.info("До свидания! 👋"); setShowLogout(false); }}
              className="flex-1 bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl text-sm hover:bg-red-500/30 transition-colors">
              Выйти
            </button>
          </div>
        </Modal>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Настройки</h1>
        <p className="text-white/40 text-sm">Профиль и безопасность</p>
      </div>

      <div className="glass rounded-2xl p-5 flex items-center gap-4 border border-white/8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-[#070b12] text-xl font-black neon-glow-cyan">
          АП
        </div>
        <div>
          <div className="text-lg font-bold text-white">{name}</div>
          <div className="text-sm text-white/40">Premium клиент с 2022</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
            <span className="text-xs text-green-400">Аккаунт верифицирован</span>
          </div>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.title}>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3 px-1">{section.title}</p>
          <div className="glass rounded-2xl overflow-hidden border border-white/5">
            {section.items.map((item, i) => (
              <div key={item.label}
                onClick={() => item.onClick?.()}
                className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/3 transition-colors ${item.onClick || item.onToggle ? "cursor-pointer" : ""} ${i < section.items.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={17} className="text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/90">{item.label}</div>
                  <div className="text-xs text-white/40">{item.sub}</div>
                </div>
                {item.toggle !== undefined ? (
                  <button onClick={(e) => { e.stopPropagation(); item.onToggle?.(); }}
                    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${item.toggle ? "bg-cyan-500/70" : "bg-white/10"}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.toggle ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                ) : (
                  <Icon name="ChevronRight" size={16} className="text-white/30 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={() => setShowLogout(true)}
        className="w-full glass rounded-xl p-3.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/15 flex items-center justify-center gap-2">
        <Icon name="LogOut" size={16} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
