"""
БЕБРА_bank — главный API: счета, транзакции, карты, уведомления, профиль, переводы.
Поддерживает GET/POST/PATCH/DELETE. Данные персистентны в PostgreSQL.
"""
import json
import os
import psycopg2
from datetime import datetime

SCHEMA = "t_p78879300_bebra_bank_project"
CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data):
    return {"statusCode": 200, "headers": CORS_HEADERS, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg, code=400):
    return {"statusCode": code, "headers": CORS_HEADERS, "body": json.dumps({"error": msg})}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    path = event.get("path", "/")
    qs = event.get("queryStringParameters") or {}
    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    user_id = int(qs.get("user_id", 1))

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SET search_path TO {SCHEMA}")

    try:
        # ── GET /accounts ──────────────────────────────────────────────
        if path.endswith("/accounts") and method == "GET":
            cur.execute("SELECT id,name,number_last4,balance,currency,color,change_pct FROM bb_accounts WHERE user_id=%s ORDER BY id", (user_id,))
            rows = cur.fetchall()
            cols = ["id","name","number","balance","currency","color","change"]
            result = []
            for r in rows:
                d = dict(zip(cols, r))
                d["number"] = "•••• " + d["number"]
                d["balance"] = float(d["balance"])
                d["change"] = float(d["change"])
                result.append(d)
            return ok(result)

        # ── POST /accounts ─────────────────────────────────────────────
        if path.endswith("/accounts") and method == "POST":
            name = body.get("name", "New account")
            import random
            last4 = str(random.randint(1000, 9999))
            colors = ["#f59e0b", "#ff2d78", "#00e5ff"]
            color = random.choice(colors)
            cur.execute(
                "INSERT INTO bb_accounts (user_id,name,number_last4,balance,currency,color,change_pct) VALUES (%s,%s,%s,0,'RUB',%s,0) RETURNING id",
                (user_id, name, last4, color)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": new_id, "name": name, "number": "•••• " + last4, "balance": 0.0, "currency": "RUB", "color": color, "change": 0.0})

        # ── PATCH /accounts/topup ──────────────────────────────────────
        if "/accounts/topup" in path and method == "PATCH":
            acc_id = int(body.get("account_id", 0))
            amount = float(body.get("amount", 0))
            cur.execute("UPDATE bb_accounts SET balance=balance+%s WHERE id=%s AND user_id=%s RETURNING balance", (amount, acc_id, user_id))
            row = cur.fetchone()
            if not row:
                return err("Account not found", 404)
            conn.commit()
            return ok({"balance": float(row[0])})

        # ── GET /cards ──────────────────────────────────────────────────
        if path.endswith("/cards") and method == "GET":
            cur.execute("SELECT id,number_masked,full_number,holder,expires,card_type,balance,color_class,locked FROM bb_cards WHERE user_id=%s ORDER BY id", (user_id,))
            rows = cur.fetchall()
            cols = ["id","number","fullNumber","holder","expires","type","balance","color","locked"]
            result = [dict(zip(cols, r)) for r in rows]
            for r in result:
                r["balance"] = float(r["balance"])
            return ok(result)

        # ── PATCH /cards/lock ──────────────────────────────────────────
        if "/cards/lock" in path and method == "PATCH":
            card_id = int(body.get("card_id", 0))
            locked = bool(body.get("locked", False))
            cur.execute("UPDATE bb_cards SET locked=%s WHERE id=%s AND user_id=%s RETURNING id", (locked, card_id, user_id))
            if not cur.fetchone():
                return err("Card not found", 404)
            conn.commit()
            return ok({"locked": locked})

        # ── POST /cards ─────────────────────────────────────────────────
        if path.endswith("/cards") and method == "POST":
            card_type = body.get("type", "VISA")
            import random
            last4 = str(random.randint(1000, 9999))
            full = f"4521 {random.randint(1000,9999)} {random.randint(1000,9999)} {last4}"
            masked = f"**** **** **** {last4}"
            color = "from-cyan-500 to-blue-600" if card_type == "VISA" else "from-purple-500 to-pink-600"
            cur.execute(
                "INSERT INTO bb_cards (user_id,number_masked,full_number,holder,expires,card_type,balance,color_class) VALUES (%s,%s,%s,'ALEKSEI PETROV','12/28',%s,0,%s) RETURNING id",
                (user_id, masked, full, card_type, color)
            )
            new_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": new_id, "number": masked, "fullNumber": full, "type": card_type, "color": color, "balance": 0.0, "locked": False, "holder": "ALEKSEI PETROV", "expires": "12/28"})

        # ── GET /transactions ───────────────────────────────────────────
        if path.endswith("/transactions") and method == "GET":
            cur.execute("SELECT id,title,category,amount,icon,color,tx_date FROM bb_transactions WHERE user_id=%s ORDER BY created_at DESC LIMIT 50", (user_id,))
            rows = cur.fetchall()
            cols = ["id","title","category","amount","icon","color","date"]
            result = []
            for r in rows:
                d = dict(zip(cols, r))
                d["id"] = str(d["id"])
                d["amount"] = float(d["amount"])
                # format date nicely
                try:
                    dt = datetime.fromisoformat(str(d["date"]))
                    now = datetime.now()
                    diff = (now.date() - dt.date()).days
                    if diff == 0:
                        d["date"] = dt.strftime("Сег., %H:%M")
                    elif diff == 1:
                        d["date"] = dt.strftime("Вчера, %H:%M")
                    else:
                        d["date"] = dt.strftime("%d %b")
                except Exception:
                    pass
                result.append(d)
            return ok(result)

        # ── POST /transactions ──────────────────────────────────────────
        if path.endswith("/transactions") and method == "POST":
            title = body.get("title", "Transfer")
            category = body.get("category", "Transfer")
            amount = float(body.get("amount", 0))
            icon = body.get("icon", "Send")
            color = body.get("color", "#00e5ff")
            account_id = body.get("account_id", 1)
            now_str = datetime.now().isoformat()
            cur.execute(
                "INSERT INTO bb_transactions (user_id,account_id,title,category,amount,icon,color,tx_date) VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
                (user_id, account_id, title, category, amount, icon, color, now_str)
            )
            new_id = cur.fetchone()[0]
            # Update account balance
            cur.execute("UPDATE bb_accounts SET balance=balance+%s WHERE id=%s AND user_id=%s", (amount, account_id, user_id))
            conn.commit()
            return ok({"id": str(new_id), "title": title, "category": category, "amount": amount, "icon": icon, "color": color, "date": "Только что"})

        # ── GET /notifications ──────────────────────────────────────────
        if path.endswith("/notifications") and method == "GET":
            cur.execute("SELECT id,title,body,type,read,created_at FROM bb_notifications WHERE user_id=%s ORDER BY created_at DESC", (user_id,))
            rows = cur.fetchall()
            result = []
            for r in rows:
                dt = r[5]
                now = datetime.now(dt.tzinfo) if dt.tzinfo else datetime.now()
                diff_minutes = int((now - dt).total_seconds() / 60)
                if diff_minutes < 60:
                    time_str = f"{diff_minutes} мин назад" if diff_minutes > 1 else "только что"
                elif diff_minutes < 1440:
                    time_str = f"{diff_minutes // 60} ч назад"
                else:
                    time_str = f"{diff_minutes // 1440} д назад"
                result.append({"id": str(r[0]), "title": r[1], "text": r[2], "type": r[3], "read": r[4], "time": time_str})
            return ok(result)

        # ── PATCH /notifications/read ───────────────────────────────────
        if "/notifications/read" in path and method == "PATCH":
            notif_id = body.get("id")
            read_all = body.get("all", False)
            if read_all:
                cur.execute("UPDATE bb_notifications SET read=true WHERE user_id=%s", (user_id,))
            elif notif_id:
                cur.execute("UPDATE bb_notifications SET read=true WHERE id=%s AND user_id=%s", (int(notif_id), user_id))
            conn.commit()
            return ok({"ok": True})

        # ── DELETE /notifications ───────────────────────────────────────
        if path.endswith("/notifications") and method == "DELETE":
            notif_id = body.get("id") or qs.get("id")
            if notif_id:
                cur.execute("DELETE FROM bb_notifications WHERE id=%s AND user_id=%s", (int(notif_id), user_id))
                conn.commit()
            return ok({"ok": True})

        # ── GET /profile ────────────────────────────────────────────────
        if path.endswith("/profile") and method == "GET":
            cur.execute("SELECT id,name,email,phone,role,plan,since_year,is_verified FROM bb_users WHERE id=%s", (user_id,))
            row = cur.fetchone()
            if not row:
                return err("User not found", 404)
            cols = ["id","name","email","phone","role","plan","sinceYear","isVerified"]
            return ok(dict(zip(cols, row)))

        # ── PATCH /profile ──────────────────────────────────────────────
        if path.endswith("/profile") and method == "PATCH":
            name = body.get("name")
            email = body.get("email")
            if name:
                cur.execute("UPDATE bb_users SET name=%s WHERE id=%s", (name, user_id))
            if email:
                cur.execute("UPDATE bb_users SET email=%s WHERE id=%s", (email, user_id))
            conn.commit()
            return ok({"ok": True})

        # ── POST /transfer ──────────────────────────────────────────────
        if path.endswith("/transfer") and method == "POST":
            to_phone = body.get("phone", "")
            amount = float(body.get("amount", 0))
            comment = body.get("comment", "")
            account_id = int(body.get("account_id", 1))
            title = f"Transfer to {to_phone}"
            if comment:
                title = f"{comment} -> {to_phone}"
            now_str = datetime.now().isoformat()
            cur.execute("SELECT balance FROM bb_accounts WHERE id=%s AND user_id=%s", (account_id, user_id))
            row = cur.fetchone()
            if not row:
                return err("Account not found", 404)
            if float(row[0]) < amount:
                return err("Insufficient funds", 400)
            cur.execute("UPDATE bb_accounts SET balance=balance-%s WHERE id=%s", (amount, account_id))
            cur.execute(
                "INSERT INTO bb_transactions (user_id,account_id,title,category,amount,icon,color,tx_date) VALUES (%s,%s,%s,'Transfer',%s,'Send','#00e5ff',%s) RETURNING id",
                (user_id, account_id, title, -amount, now_str)
            )
            tx_id = cur.fetchone()[0]
            cur.execute(
                "INSERT INTO bb_notifications (user_id,title,body,type) VALUES (%s,'Transfer sent',%s,'success')",
                (user_id, f"Sent {amount:.0f} RUB to {to_phone}")
            )
            conn.commit()
            return ok({"id": str(tx_id), "title": title, "amount": -amount, "date": "Только что"})

        return err("Not found", 404)

    except Exception as e:
        conn.rollback()
        return err(str(e), 500)
    finally:
        cur.close()
        conn.close()
