const API_URL = "https://functions.poehali.dev/161183a9-44ed-4989-be81-72fb39889ab2";
const ADMIN_URL = "https://functions.poehali.dev/89ce7b3d-19e3-4344-906b-e2a3d5d51d10";
const ADMIN_KEY = "bebrabank-admin-2026";
const USER_ID = 1;

async function req(url: string, method = "GET", body?: object, extraHeaders?: Record<string, string>) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── User API ─────────────────────────────────────────────────────────────────
const u = (path: string) => `${API_URL}${path}?user_id=${USER_ID}`;

export const api = {
  // Profile
  getProfile: () => req(u("/profile")),
  updateProfile: (data: { name?: string; email?: string }) =>
    req(u("/profile"), "PATCH", data),

  // Accounts
  getAccounts: () => req(u("/accounts")),
  createAccount: (name: string) =>
    req(u("/accounts"), "POST", { name }),
  topupAccount: (account_id: number, amount: number) =>
    req(u("/accounts/topup"), "PATCH", { account_id, amount }),

  // Cards
  getCards: () => req(u("/cards")),
  lockCard: (card_id: number, locked: boolean) =>
    req(u("/cards/lock"), "PATCH", { card_id, locked }),
  createCard: (type: string) =>
    req(u("/cards"), "POST", { type }),

  // Transactions
  getTransactions: () => req(u("/transactions")),
  addTransaction: (data: {
    title: string; category: string; amount: number;
    icon?: string; color?: string; account_id?: number;
  }) => req(u("/transactions"), "POST", data),

  // Transfer
  transfer: (phone: string, amount: number, comment: string, account_id = 1) =>
    req(u("/transfer"), "POST", { phone, amount, comment, account_id }),

  // Notifications
  getNotifications: () => req(u("/notifications")),
  markRead: (id?: string, all = false) =>
    req(u("/notifications/read"), "PATCH", { id, all }),
  deleteNotification: (id: string) =>
    req(u("/notifications"), "DELETE", { id }),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
const a = (path: string) => `${ADMIN_URL}${path}`;
const adminHeaders = { "X-Admin-Key": ADMIN_KEY };

export const adminApi = {
  getStats: () => req(a("/stats"), "GET", undefined, adminHeaders),
  getUsers: () => req(a("/users"), "GET", undefined, adminHeaders),
  updateUser: (data: { id: number; role?: string; plan?: string; name?: string }) =>
    req(a("/users"), "PATCH", data, adminHeaders),
  deleteUser: (id: number) =>
    req(a("/users"), "DELETE", { id }, adminHeaders),
  getTransactions: (limit = 20) =>
    req(`${a("/transactions")}?limit=${limit}`, "GET", undefined, adminHeaders),
  broadcast: (title: string, text: string, type = "info") =>
    req(a("/broadcast"), "POST", { title, text, type }, adminHeaders),
  deleteTransaction: (id: number) =>
    req(a(`/transaction/${id}`), "DELETE", undefined, adminHeaders),
};
