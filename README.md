Тестовое для демонстрации транзакций и row-level locks в PostgreSQL.

---
схема
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY,
  balance NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE payment_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id)
  action TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---
SQL код транзакции 
```sql
BEGIN;

SELECT balance
FROM users
WHERE id = $1
FOR UPDATE;

UPDATE users
SET balance = balance - $2
WHERE id = $1;

INSERT INTO payment_history(...);

COMMIT;
```