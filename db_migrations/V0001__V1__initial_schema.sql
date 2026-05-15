CREATE TABLE IF NOT EXISTS bb_users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user',
  is_verified BOOLEAN DEFAULT TRUE,
  plan TEXT NOT NULL DEFAULT 'Premium',
  since_year INT DEFAULT 2022,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bb_accounts (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  number_last4 TEXT NOT NULL,
  balance NUMERIC(15,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'RUB',
  color TEXT NOT NULL DEFAULT '#00e5ff',
  change_pct NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bb_cards (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL DEFAULT 1,
  account_id INT REFERENCES bb_accounts(id),
  number_masked TEXT NOT NULL,
  full_number TEXT NOT NULL,
  holder TEXT NOT NULL DEFAULT 'ALEKSEI PETROV',
  expires TEXT NOT NULL,
  card_type TEXT NOT NULL DEFAULT 'VISA',
  balance NUMERIC(15,2) DEFAULT 0,
  color_class TEXT NOT NULL DEFAULT 'from-cyan-500 to-blue-600',
  locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bb_transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL DEFAULT 1,
  account_id INT REFERENCES bb_accounts(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(15,2) NOT NULL,
  icon TEXT NOT NULL DEFAULT 'ArrowLeftRight',
  color TEXT NOT NULL DEFAULT '#00e5ff',
  tx_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bb_notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
