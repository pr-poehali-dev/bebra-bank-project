"""
БЕБРА_bank — Admin API: управление пользователями, статистика, операции.
Доступно только с role=admin.
"""
import json
import os
import psycopg2

SCHEMA = "t_p78879300_bebra_bank_project"
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Admin-Key",
    "Content-Type": "application/json",
}
ADMIN_KEY = "bebrabank-admin-2026"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS_HEADERS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    # Check admin key
    headers = event.get("headers") or {}
    key = headers.get("X-Admin-Key") or headers.get("x-admin-key") or (event.get("queryStringParameters") or {}).get("key", "")
    if key != ADMIN_KEY:
        return err("Unauthorized", 401)

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SET search_path TO {SCHEMA}")

    try:
        # ── GET /stats ─────────────────────────────────────────────────
        if path.endswith("/stats") or path.endswith("/admin"):
            cur.execute("SELECT COUNT(*) FROM bb_users")
            total_users = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM bb_transactions")
            total_tx = cur.fetchone()[0]

            cur.execute("SELECT COALESCE(SUM(balance),0) FROM bb_accounts WHERE currency='RUB'")
            total_balance = float(cur.fetchone()[0])

            cur.execute("SELECT COUNT(*) FROM bb_cards WHERE locked=false")
            active_cards = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM bb_transactions WHERE amount > 0")
            income_count = cur.fetchone()[0]

            cur.execute("SELECT COUNT(*) FROM bb_transactions WHERE amount < 0")
            expense_count = cur.fetchone()[0]

            cur.execute("SELECT COALESCE(SUM(amount),0) FROM bb_transactions WHERE amount > 0")
            total_income = float(cur.fetchone()[0])

            cur.execute("SELECT COALESCE(SUM(ABS(amount)),0) FROM bb_transactions WHERE amount < 0")
            total_expense = float(cur.fetchone()[0])

            return ok({
                "totalUsers": total_users,
                "totalTransactions": total_tx,
                "totalBalance": total_balance,
                "activeCards": active_cards,
                "incomeCount": income_count,
                "expenseCount": expense_count,
                "totalIncome": total_income,
                "totalExpense": total_expense,
            })

        # ── GET /users ─────────────────────────────────────────────────
        if path.endswith("/users") and method == "GET":
            cur.execute("SELECT u.id, u.name, u.email, u.phone, u.role, u.plan, u.since_year, u.is_verified, u.created_at, COUNT(a.id) as acc_count FROM bb_users u LEFT JOIN bb_accounts a ON a.user_id=u.id GROUP BY u.id ORDER BY u.id")
            rows = cur.fetchall()
            result = []
            for r in rows:
                result.append({
                    "id": r[0], "name": r[1], "email": r[2], "phone": r[3],
                    "role": r[4], "plan": r[5], "sinceYear": r[6],
                    "isVerified": r[7], "createdAt": str(r[8]), "accountsCount": r[9]
                })
            return ok(result)

        # ── PATCH /users ───────────────────────────────────────────────
        if path.endswith("/users") and method == "PATCH":
            uid = body.get("id")
            role = body.get("role")
            plan = body.get("plan")
            name = body.get("name")
            if uid and role:
                cur.execute("UPDATE bb_users SET role=%s WHERE id=%s", (role, uid))
            if uid and plan:
                cur.execute("UPDATE bb_users SET plan=%s WHERE id=%s", (plan, uid))
            if uid and name:
                cur.execute("UPDATE bb_users SET name=%s WHERE id=%s", (name, uid))
            conn.commit()
            return ok({"ok": True})

        # ── DELETE /users ──────────────────────────────────────────────
        if path.endswith("/users") and method == "DELETE":
            uid = body.get("id") or qs.get("id")
            if uid and int(uid) != 1:
                cur.execute("DELETE FROM bb_notifications WHERE user_id=%s", (uid,))
                cur.execute("DELETE FROM bb_transactions WHERE user_id=%s", (uid,))
                cur.execute("DELETE FROM bb_cards WHERE user_id=%s", (uid,))
                cur.execute("DELETE FROM bb_accounts WHERE user_id=%s", (uid,))
                cur.execute("DELETE FROM bb_users WHERE id=%s", (uid,))
                conn.commit()
            return ok({"ok": True})

        # ── GET /transactions (all) ────────────────────────────────────
        if path.endswith("/transactions") and method == "GET":
            limit = int(qs.get("limit", 20))
            cur.execute("""
                SELECT t.id, u.name, t.title, t.category, t.amount, t.icon, t.color, t.tx_date, t.created_at
                FROM bb_transactions t
                JOIN bb_users u ON u.id = t.user_id
                ORDER BY t.created_at DESC
                LIMIT %s
            """, (limit,))
            rows = cur.fetchall()
            result = [{"id": r[0], "user": r[1], "title": r[2], "category": r[3], "amount": float(r[4]), "icon": r[5], "color": r[6], "date": str(r[7]), "createdAt": str(r[8])} for r in rows]
            return ok(result)

        # ── POST /broadcast (send notification to all) ─────────────────
        if path.endswith("/broadcast") and method == "POST":
            title = body.get("title", "System notification")
            text = body.get("text", "")
            ntype = body.get("type", "info")
            cur.execute("SELECT id FROM bb_users")
            users = cur.fetchall()
            for (uid,) in users:
                cur.execute("INSERT INTO bb_notifications (user_id,title,body,type) VALUES (%s,%s,%s,%s)", (uid, title, text, ntype))
            conn.commit()
            return ok({"sent": len(users)})

        # ── DELETE /transaction ────────────────────────────────────────
        if "/transaction/" in path and method == "DELETE":
            parts = path.rstrip("/").split("/")
            tx_id = parts[-1]
            cur.execute("DELETE FROM bb_transactions WHERE id=%s", (tx_id,))
            conn.commit()
            return ok({"ok": True})

        return err("Not found", 404)

    except Exception as e:
        conn.rollback()
        return err(str(e), 500)
    finally:
        cur.close()
        conn.close()
