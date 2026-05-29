Тестовое для демонстрации транзакций и row-level locks в PostgreSQL.
Баланс пользователя хранится в таблице users и используется как основной источник истины.
Все операции изменения баланса записываются в payment_history, которая служит журналом (audit log) для хранения истории транзакций.
Реализован endpoint списания средств с проверкой баланса и атомарным обновлением данных в рамках транзакции.

### Компромисы 

Подход 1: balance хранится в users

Плюсы:
- быстрый доступ к балансу
- меньше нагрузки на БД (нет SUM)

Минусы:
- нужно следить за консистентностью данных
- возможен рассинхрон с history при ошибках

Подход 2: баланс считается из payment_history

Плюсы:
- единственный источник истины (история)
- проще логика (не нужно обновлять balance)
- полный аудит операций

Минусы:
- медленный SUM() при большом количестве операций
- нужна оптимизация (индексы, партиции, кэш)

---
схема
```sql
CREATE TABLE users (
  id BIGINT PRIMARY KEY
  balance NUMERIC NOT NULL DEFAULT 0
);

CREATE TABLE payment_history (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id)
  action TEXT NOT NULL,
  delta NUMERIC NOT NULL,
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