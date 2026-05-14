import { useState } from "react";
import Icon from "@/components/ui/icon";

type Page = "dashboard" | "accounts" | "transfers" | "cards" | "history" | "notifications" | "settings";

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(amount);

const mockAccounts = [
  { id: "1", name: "Основной счёт", number: "•••• 4521", balance: 284750, currency: "₽", color: "#00e5ff", change: +12.4 },
  { id: "2", name: "Накопительный", number: "•••• 8834", balance: 1250000, currency: "₽", color: "#a855f7", change: +5.1 },
  { id: "3", name: "Долларовый", number: "•••• 2219", balance: 3480, currency: "$", color: "#00ff88", change: -1.2 },
];

const mockCards = [
  { id: "1", number: "•••• •••• •••• 4521", holder: "ALEKSEI PETROV", expires: "12/27", type: "VISA", balance: 284750, color: "from-cyan-500 to-blue-600" },
  { id: "2", number: "•••• •••• •••• 8834", holder: "ALEKSEI PETROV", expires: "08/26", type: "MasterCard", balance: 156300, color: "from-purple-500 to-pink-600" },
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

const mockNotifications = [
  { id: "1", title: "Перевод получен", text: "Мария К. перевела вам 25 000 ₽", time: "14 мин назад", type: "success", read: false },
  { id: "2", title: "Подозрительная операция", text: "Попытка входа с нового устройства заблокирована", time: "2 ч назад", type: "warning", read: false },
  { id: "3", title: "Кэшбэк начислен", text: "Вам начислено 640 ₽ кэшбэка за май", time: "5 ч назад", type: "info", read: true },
  { id: "4", title: "Платёж выполнен", text: "Netflix — 890 ₽ успешно списано", time: "Вчера", type: "info", read: true },
  { id: "5", title: "Ставка изменена", text: "Ставка по накопительному счёту: 18% годовых", time: "2 дня назад", type: "success", read: true },
];

export default function Index() {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [transferStep, setTransferStep] = useState<"form" | "confirm" | "done">("form");
  const [transferPhone, setTransferPhone] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [transferComment, setTransferComment] = useState("");
  const [notifications, setNotifications] = useState(mockNotifications);
  const [qrMode, setQrMode] = useState(false);

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

  return (
    <div className="min-h-screen bg-[#070b12] bg-grid relative overflow-hidden font-sans">
      {/* Background orbs */}
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

          <div className="glass rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 gradient-primary rounded-lg flex items-center justify-center text-[#070b12] font-bold text-sm shrink-0">
              АП
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white/90 truncate">Алексей П.</div>
              <div className="text-xs text-white/40 font-mono">Premium</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-white/30 ml-auto shrink-0" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar mobile */}
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
            {activePage === "dashboard" && <DashboardPage accounts={mockAccounts} transactions={mockTransactions} setActivePage={setActivePage} />}
            {activePage === "accounts" && <AccountsPage accounts={mockAccounts} />}
            {activePage === "transfers" && (
              <TransfersPage
                step={transferStep} setStep={setTransferStep}
                phone={transferPhone} setPhone={setTransferPhone}
                amount={transferAmount} setAmount={setTransferAmount}
                comment={transferComment} setComment={setTransferComment}
                qrMode={qrMode} setQrMode={setQrMode}
              />
            )}
            {activePage === "cards" && <CardsPage cards={mockCards} />}
            {activePage === "history" && <HistoryPage transactions={mockTransactions} />}
            {activePage === "notifications" && (
              <NotificationsPage
                notifications={notifications}
                onRead={(id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))}
                onReadAll={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
              />
            )}
            {activePage === "settings" && <SettingsPage />}
          </div>

          {/* Bottom nav mobile */}
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
  accounts: typeof mockAccounts;
  transactions: typeof mockTransactions;
  setActivePage: (p: Page) => void;
}) {
  const totalBalance = accounts.reduce((sum, a) => sum + (a.currency === "₽" ? a.balance : a.balance * 90), 0);

  return (
    <div className="space-y-6 animate-fade-in">
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
            { icon: "Send", label: "Перевод", page: "transfers" as Page },
            { icon: "Plus", label: "Пополнить", page: "accounts" as Page },
            { icon: "ArrowDownLeft", label: "Получить", page: "accounts" as Page },
            { icon: "MoreHorizontal", label: "Ещё", page: "settings" as Page },
          ].map((action) => (
            <button
              key={action.label}
              onClick={() => setActivePage(action.page)}
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
            <div
              key={acc.id}
              className="glass rounded-xl p-4 card-hover border border-white/5 cursor-pointer"
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
            </div>
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
            <div key={tx.id} className={`flex items-center gap-4 px-4 py-3 hover:bg-white/3 transition-colors ${i < 4 ? "border-b border-white/5" : ""}`}>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Accounts ─────────────────────────────────────────────────────────────────
function AccountsPage({ accounts }: { accounts: typeof mockAccounts }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
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
              <div className={`flex items-center gap-1 text-sm font-mono px-2 py-1 rounded-lg ${acc.change > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                <Icon name={acc.change > 0 ? "TrendingUp" : "TrendingDown"} size={12} />
                {acc.change > 0 ? "+" : ""}{acc.change}%
              </div>
            </div>

            {selected === acc.id && (
              <div className="mt-4 pt-4 border-t border-white/8 grid grid-cols-3 gap-3 animate-fade-in">
                {["Пополнить", "Перевести", "Реквизиты"].map((action) => (
                  <button key={action} className="glass rounded-xl py-2 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors">
                    {action}
                  </button>
                ))}
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

      <button className="w-full glass rounded-2xl p-4 border border-dashed border-white/15 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 hover:border-white/30 transition-all">
        <Icon name="Plus" size={18} />
        <span className="text-sm">Открыть новый счёт</span>
      </button>
    </div>
  );
}

// ─── Transfers ────────────────────────────────────────────────────────────────
function TransfersPage({ step, setStep, phone, setPhone, amount, setAmount, comment, setComment, qrMode, setQrMode }: {
  step: "form" | "confirm" | "done";
  setStep: (s: "form" | "confirm" | "done") => void;
  phone: string; setPhone: (v: string) => void;
  amount: string; setAmount: (v: string) => void;
  comment: string; setComment: (v: string) => void;
  qrMode: boolean; setQrMode: (v: boolean) => void;
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
        <button
          onClick={() => { setStep("form"); setPhone(""); setAmount(""); setComment(""); }}
          className="gradient-primary text-[#070b12] font-bold px-8 py-3 rounded-xl neon-glow-cyan hover:opacity-90 transition-opacity"
        >
          Новый перевод
        </button>
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
            onClick={() => setStep("done")}
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
          <button className="gradient-primary text-[#070b12] font-bold px-6 py-2.5 rounded-xl neon-glow-cyan text-sm flex items-center gap-2">
            <Icon name="Camera" size={16} /> Сканировать
          </button>
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Недавние</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {contacts.map((c) => (
                <button key={c.name} onClick={() => setPhone(c.phone)} className="flex flex-col items-center gap-2 shrink-0 group">
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
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+7 000 000-00-00"
                className="bg-transparent text-white text-lg font-medium w-full outline-none placeholder:text-white/20 font-mono"
              />
            </div>
            <div className="glass rounded-xl p-4 border border-white/8 focus-within:border-cyan-500/40 transition-colors">
              <label className="text-[10px] text-white/40 uppercase tracking-wider block mb-2">Сумма</label>
              <div className="flex items-baseline gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="bg-transparent text-white text-3xl font-black w-full outline-none placeholder:text-white/20"
                />
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
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="За что перевод..."
                className="bg-transparent text-white text-sm w-full outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          <button
            onClick={() => phone && amount ? setStep("confirm") : undefined}
            disabled={!phone || !amount}
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
function CardsPage({ cards }: { cards: typeof mockCards }) {
  const [flipped, setFlipped] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Карты</h1>
        <p className="text-white/40 text-sm">Управление банковскими картами</p>
      </div>

      <div className="grid gap-6">
        {cards.map((card, i) => (
          <div key={card.id} style={{ animationDelay: `${i * 0.15}s` }}>
            <div
              onClick={() => setFlipped(flipped === card.id ? null : card.id)}
              className={`relative h-48 rounded-2xl bg-gradient-to-br ${card.color} p-6 cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]`}
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
            >
              <div className="absolute top-[-20px] right-[-20px] w-40 h-40 rounded-full bg-white/10" />
              <div className="absolute bottom-[-30px] right-[20%] w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute top-6 left-6">
                <div className="text-[10px] text-white/60 font-mono uppercase tracking-widest mb-4">БЕБРА_bank</div>
                <div className="flex gap-1 mb-6">
                  <div className="w-7 h-5 rounded bg-yellow-400/90" />
                  <div className="w-7 h-5 rounded bg-yellow-500/70 -ml-3" />
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="font-mono text-white/90 text-lg tracking-widest mb-2">{card.number}</div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-[9px] text-white/50 uppercase tracking-wider">Владелец</div>
                    <div className="text-xs text-white font-medium">{card.holder}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-white/50 uppercase tracking-wider">До</div>
                    <div className="text-xs text-white font-mono">{card.expires}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{card.type}</div>
                  </div>
                </div>
              </div>
            </div>

            {flipped === card.id && (
              <div className="mt-3 glass rounded-xl p-4 animate-fade-in border border-white/8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass rounded-lg p-3">
                  <div className="text-xs text-white/40 mb-1">Баланс</div>
                  <div className="text-sm font-bold text-white">{formatMoney(card.balance)}</div>
                </div>
                {["Заблокировать", "Реквизиты", "CVV"].map((a) => (
                  <button key={a} className="glass rounded-lg p-3 text-xs text-[#00e5ff] font-medium hover:bg-cyan-500/10 transition-colors text-left">
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="w-full glass rounded-2xl p-4 border border-dashed border-white/15 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 hover:border-white/30 transition-all">
        <Icon name="Plus" size={18} />
        <span className="text-sm">Выпустить новую карту</span>
      </button>
    </div>
  );
}

// ─── History ──────────────────────────────────────────────────────────────────
function HistoryPage({ transactions }: { transactions: typeof mockTransactions }) {
  const [filter, setFilter] = useState("all");
  const filters = [
    { id: "all", label: "Все" },
    { id: "income", label: "Доходы" },
    { id: "expense", label: "Расходы" },
  ];
  const filtered = transactions.filter((tx) =>
    filter === "all" ? true : filter === "income" ? tx.amount > 0 : tx.amount < 0
  );

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">История</h1>
        <p className="text-white/40 text-sm">Все операции по счетам</p>
      </div>

      <div className="glass rounded-xl p-1 flex gap-1 w-fit">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f.id ? "bg-cyan-500/20 text-[#00e5ff]" : "text-white/50 hover:text-white/70"}`}
          >
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
          <div key={tx.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/3 transition-colors cursor-pointer ${i < filtered.length - 1 ? "border-b border-white/5" : ""}`}>
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
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function NotificationsPage({ notifications, onRead, onReadAll }: {
  notifications: typeof mockNotifications;
  onRead: (id: string) => void;
  onReadAll: () => void;
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

      <div className="space-y-2">
        {notifications.map((n, i) => {
          const style = typeStyles[n.type];
          return (
            <div
              key={n.id}
              onClick={() => onRead(n.id)}
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
                <span className="text-[11px] text-white/30 shrink-0">{n.time}</span>
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

  const sections = [
    {
      title: "Профиль",
      items: [
        { icon: "User", label: "Личные данные", sub: "Имя, фото, контакты", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined },
        { icon: "Phone", label: "Номер телефона", sub: "+7 •••• ••45 78", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined },
        { icon: "Mail", label: "Электронная почта", sub: "a.petrov@mail.ru", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined },
      ],
    },
    {
      title: "Безопасность",
      items: [
        { icon: "Lock", label: "Сменить пароль", sub: "Последнее изменение: 3 мес. назад", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined },
        { icon: "Shield", label: "Двухфакторная аутентификация", sub: twoFa ? "Включена" : "Выключена", toggle: twoFa, onToggle: () => setTwoFa(!twoFa) },
        { icon: "Fingerprint", label: "Вход по биометрии", sub: biometry ? "Включена" : "Выключена", toggle: biometry, onToggle: () => setBiometry(!biometry) },
        { icon: "Smartphone", label: "Активные сессии", sub: "2 устройства", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined },
      ],
    },
    {
      title: "Уведомления",
      items: [
        { icon: "Bell", label: "Push-уведомления", sub: pushNotifs ? "Включены" : "Выключены", toggle: pushNotifs, onToggle: () => setPushNotifs(!pushNotifs) },
        { icon: "MessageSquare", label: "SMS-уведомления", sub: "Только важные", toggle: undefined as boolean | undefined, onToggle: undefined as (() => void) | undefined },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Настройки</h1>
        <p className="text-white/40 text-sm">Профиль и безопасность</p>
      </div>

      <div className="glass rounded-2xl p-5 flex items-center gap-4 border border-white/8">
        <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center text-[#070b12] text-xl font-black neon-glow-cyan">
          АП
        </div>
        <div>
          <div className="text-lg font-bold text-white">Алексей Петров</div>
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
              <div key={item.label} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-white/3 transition-colors cursor-pointer ${i < section.items.length - 1 ? "border-b border-white/5" : ""}`}>
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <Icon name={item.icon} size={17} className="text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white/90">{item.label}</div>
                  <div className="text-xs text-white/40">{item.sub}</div>
                </div>
                {item.toggle !== undefined ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); item.onToggle?.(); }}
                    className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${item.toggle ? "bg-cyan-500/70" : "bg-white/10"}`}
                  >
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

      <button className="w-full glass rounded-xl p-3.5 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors border border-red-500/15 flex items-center justify-center gap-2">
        <Icon name="LogOut" size={16} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
