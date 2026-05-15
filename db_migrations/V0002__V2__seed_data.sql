INSERT INTO bb_users (id, name, email, phone, role, plan, since_year) VALUES
(1, 'Aleksej Petrov', 'a.petrov@mail.ru', '+7 916 000-45-78', 'user', 'Premium', 2022),
(2, 'Administrator', 'admin@bebrabank.ru', '+7 000 000-00-00', 'admin', 'Admin', 2020);

INSERT INTO bb_accounts (user_id, name, number_last4, balance, currency, color, change_pct) VALUES
(1, 'Main account',   '4521', 284750.00,  'RUB', '#00e5ff', 12.4),
(1, 'Savings',        '8834', 1250000.00, 'RUB', '#a855f7', 5.1),
(1, 'Dollar account', '2219', 3480.00,    'USD', '#00ff88', -1.2);

INSERT INTO bb_cards (user_id, account_id, number_masked, full_number, holder, expires, card_type, balance, color_class, locked) VALUES
(1, 1, '**** **** **** 4521', '4521 8800 1234 4521', 'ALEKSEI PETROV', '12/27', 'VISA',       284750.00, 'from-cyan-500 to-blue-600',   false),
(1, 2, '**** **** **** 8834', '5334 9900 5678 8834', 'ALEKSEI PETROV', '08/26', 'MasterCard', 156300.00, 'from-purple-500 to-pink-600', false);

INSERT INTO bb_transactions (user_id, account_id, title, category, amount, icon, color, tx_date) VALUES
(1, 1, 'Supermarket Lenta',  'Products',    -3240.00,  'ShoppingCart',  '#00e5ff', '2026-05-15 14:32:00'),
(1, 1, 'Transfer from Maria','Incoming',    25000.00,  'ArrowDownLeft', '#00ff88', '2026-05-15 11:15:00'),
(1, 1, 'Netflix',            'Subscriptions',-890.00, 'Play',          '#a855f7', '2026-05-14 23:00:00'),
(1, 1, 'Yandex Taxi',        'Transport',   -540.00,   'Car',           '#ff2d78', '2026-05-14 18:44:00'),
(1, 1, 'Salary',             'Income',      180000.00, 'Briefcase',     '#00ff88', '2026-05-13 09:00:00'),
(1, 1, 'Apartment rent',     'Housing',     -45000.00, 'Home',          '#f59e0b', '2026-05-10 10:00:00'),
(1, 1, 'DNS Electronics',    'Electronics', -12990.00, 'Laptop',        '#00e5ff', '2026-05-08 15:00:00'),
(1, 1, 'Surf Coffee',        'Cafe',        -480.00,   'Coffee',        '#f59e0b', '2026-05-07 09:30:00');

INSERT INTO bb_notifications (user_id, title, body, type, read) VALUES
(1, 'Transfer received',      'Maria K. transferred 25000 RUB to you',       'success', false),
(1, 'Suspicious activity',    'Login attempt from new device was blocked',    'warning', false),
(1, 'Cashback credited',      'You received 640 RUB cashback for May',        'info',    true),
(1, 'Payment completed',      'Netflix 890 RUB successfully charged',         'info',    true),
(1, 'Rate changed',           'Savings account rate: 18% per year',           'success', true);
