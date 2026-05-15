import Icon from "@/components/ui/icon";

export type ReceiptData = {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  icon: string;
  color: string;
  from?: string;
  to?: string;
  account?: string;
  commission?: number;
  status?: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 2 }).format(amount);
}

function formatDate(raw: string) {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function generateReceiptNumber(id: string) {
  return `BB-${new Date().getFullYear()}-${id.slice(-6).toUpperCase().padStart(6, "0")}`;
}

interface ReceiptProps {
  data: ReceiptData;
  onClose: () => void;
}

export default function Receipt({ data, onClose }: ReceiptProps) {
  const receiptNumber = generateReceiptNumber(data.id);
  const dateStr = formatDate(data.date);
  const isIncome = data.amount > 0;

  const handlePrint = () => {
    const printContent = document.getElementById("receipt-printable");
    if (!printContent) return;

    const win = window.open("", "_blank", "width=480,height=700");
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Квитанция ${receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Arial', sans-serif;
            background: #fff;
            color: #111;
            padding: 0;
          }
          .receipt {
            max-width: 420px;
            margin: 0 auto;
            padding: 32px 24px;
          }
          .header {
            text-align: center;
            padding-bottom: 24px;
            border-bottom: 2px dashed #e5e7eb;
            margin-bottom: 24px;
          }
          .bank-name {
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #0891b2;
            margin-bottom: 4px;
          }
          .bank-sub {
            font-size: 10px;
            color: #9ca3af;
            letter-spacing: 3px;
            text-transform: uppercase;
          }
          .amount-block {
            text-align: center;
            padding: 20px 0;
            margin-bottom: 24px;
            background: #f8fafc;
            border-radius: 12px;
          }
          .amount-label {
            font-size: 11px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 6px;
          }
          .amount {
            font-size: 36px;
            font-weight: 900;
            color: ${isIncome ? "#16a34a" : "#111"};
          }
          .status-badge {
            display: inline-block;
            margin-top: 8px;
            background: #dcfce7;
            color: #16a34a;
            font-size: 11px;
            font-weight: 700;
            padding: 3px 10px;
            border-radius: 999px;
            letter-spacing: 0.5px;
          }
          .section-title {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #9ca3af;
            margin-bottom: 12px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            gap: 16px;
          }
          .row:last-child { border-bottom: none; }
          .row-label { font-size: 13px; color: #6b7280; flex-shrink: 0; }
          .row-value { font-size: 13px; color: #111; font-weight: 500; text-align: right; word-break: break-all; }
          .row-value.mono { font-family: monospace; font-size: 12px; }
          .divider {
            border: none;
            border-top: 2px dashed #e5e7eb;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
          }
          .footer p {
            font-size: 11px;
            color: #9ca3af;
            line-height: 1.6;
          }
          .qr-placeholder {
            width: 80px;
            height: 80px;
            margin: 0 auto 12px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #d1d5db;
            font-size: 10px;
            text-align: center;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="bank-name">БЕБРА_bank</div>
            <div class="bank-sub">Подтверждение операции</div>
          </div>

          <div class="amount-block">
            <div class="amount-label">Сумма операции</div>
            <div class="amount">${isIncome ? "+" : "−"}${formatMoney(Math.abs(data.amount))}</div>
            <div class="status-badge">✓ Выполнено</div>
          </div>

          <div class="section-title">Детали операции</div>
          <div class="row">
            <span class="row-label">Операция</span>
            <span class="row-value">${data.title}</span>
          </div>
          <div class="row">
            <span class="row-label">Категория</span>
            <span class="row-value">${data.category}</span>
          </div>
          <div class="row">
            <span class="row-label">Дата и время</span>
            <span class="row-value">${dateStr}</span>
          </div>
          <div class="row">
            <span class="row-label">Счёт</span>
            <span class="row-value mono">${data.account ?? "•••• 4521"}</span>
          </div>
          ${data.from ? `<div class="row"><span class="row-label">Отправитель</span><span class="row-value">${data.from}</span></div>` : ""}
          ${data.to ? `<div class="row"><span class="row-label">Получатель</span><span class="row-value">${data.to}</span></div>` : ""}

          <hr class="divider"/>

          <div class="section-title">Платёжные данные</div>
          <div class="row">
            <span class="row-label">Номер квитанции</span>
            <span class="row-value mono">${receiptNumber}</span>
          </div>
          <div class="row">
            <span class="row-label">Комиссия</span>
            <span class="row-value" style="color:#16a34a;">${data.commission ? formatMoney(data.commission) : "Бесплатно"}</span>
          </div>
          <div class="row">
            <span class="row-label">Итого списано</span>
            <span class="row-value" style="font-weight:700;font-size:15px;">${formatMoney(Math.abs(data.amount) + (data.commission ?? 0))}</span>
          </div>

          <hr class="divider"/>

          <div class="footer">
            <div class="qr-placeholder">QR</div>
            <p>БЕБРА_bank · ООО «Финансы Будущего»<br/>
            ИНН 7710140679 · БИК 044525225<br/>
            Лицензия ЦБ РФ № 2673 от 01.01.2020<br/><br/>
            Документ сформирован автоматически<br/>
            и является официальным подтверждением операции</p>
          </div>
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative glass-strong rounded-2xl w-full max-w-sm border border-white/10 animate-slide-up overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-primary rounded-md flex items-center justify-center">
              <Icon name="Zap" size={12} className="text-[#070b12]" />
            </div>
            <span className="font-black text-xs tracking-widest gradient-text">БЕБРА_bank</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg glass flex items-center justify-center text-white/40 hover:text-white transition-colors">
            <Icon name="X" size={14} />
          </button>
        </div>

        {/* Receipt body */}
        <div id="receipt-printable" className="px-5 py-5 space-y-4">
          {/* Status */}
          <div className="flex flex-col items-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mb-3">
              <Icon name="CheckCircle" size={28} className="text-green-400" />
            </div>
            <div className="text-xs text-white/40 uppercase tracking-widest mb-1">Операция выполнена</div>
            <div className={`text-3xl font-black ${isIncome ? "text-green-400" : "text-white"}`}>
              {isIncome ? "+" : "−"}{formatMoney(Math.abs(data.amount))}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-green-400 font-medium">Подтверждено</span>
            </div>
          </div>

          {/* Dashed separator */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#070b12] border border-white/10 -ml-5 shrink-0" />
            <div className="flex-1 border-t border-dashed border-white/15" />
            <div className="w-3 h-3 rounded-full bg-[#070b12] border border-white/10 -mr-5 shrink-0" />
          </div>

          {/* Details */}
          <div className="space-y-0">
            {[
              ["Операция", data.title],
              ["Категория", data.category],
              ["Дата", dateStr],
              ["Счёт", data.account ?? "•••• 4521"],
              ...(data.from ? [["Отправитель", data.from]] : []),
              ...(data.to ? [["Получатель", data.to]] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5 last:border-0">
                <span className="text-xs text-white/40">{label}</span>
                <span className={`text-xs text-white/80 font-medium text-right max-w-[55%] truncate ${label === "Счёт" || label === "Дата" ? "font-mono" : ""}`}>{value}</span>
              </div>
            ))}
          </div>

          {/* Dashed separator */}
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-[#070b12] border border-white/10 -ml-5 shrink-0" />
            <div className="flex-1 border-t border-dashed border-white/15" />
            <div className="w-3 h-3 rounded-full bg-[#070b12] border border-white/10 -mr-5 shrink-0" />
          </div>

          {/* Payment summary */}
          <div className="space-y-0">
            {[
              ["Номер квитанции", receiptNumber],
              ["Комиссия", data.commission ? formatMoney(data.commission) : "Бесплатно"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-white/5">
                <span className="text-xs text-white/40">{label}</span>
                <span className={`text-xs font-mono ${label === "Комиссия" ? "text-green-400" : "text-white/60"}`}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-3">
              <span className="text-sm text-white/60 font-medium">Итого</span>
              <span className="text-base font-black text-white">{formatMoney(Math.abs(data.amount) + (data.commission ?? 0))}</span>
            </div>
          </div>

          {/* Footer note */}
          <p className="text-[10px] text-white/20 text-center leading-relaxed">
            Документ является официальным подтверждением операции.<br />
            БЕБРА_bank · Лицензия ЦБ РФ №2673
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 glass rounded-xl py-3 text-white/60 text-sm font-medium hover:bg-white/5 transition-colors border border-white/8"
          >
            Закрыть
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 gradient-primary text-[#070b12] font-bold py-3 rounded-xl neon-glow-cyan hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
          >
            <Icon name="Download" size={15} />
            Скачать PDF
          </button>
        </div>
      </div>
    </div>
  );
}
