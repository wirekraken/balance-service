import { PoolClient } from 'pg';

export async function lockUser(
    client: PoolClient,
    userId: number,
) {
    const result = await client.query(
        `
    SELECT *
    FROM users
    WHERE id = $1
    FOR UPDATE
    `,
        [userId],
    );

    if (result.rowCount === 0) {
        throw new Error('User not found');
    }

    return result.rows[0];
}

export async function getBalance(
    client: PoolClient,
    userId: number,
) {
    const result = await client.query(
        `
        SELECT COALESCE(SUM(amount), 0) AS balance
        FROM payment_history
        WHERE user_id = $1
    `,
        [userId],
    );

    return Number(result.rows[0].balance);
}

export async function insertPayment(
    client: PoolClient,
    userId: number,
    delta: number,
) {
    await client.query(
        `
    INSERT INTO payment_history (
      user_id,
      action,
      delta,
      ts
    )
    VALUES ($1, 'withdraw', $2, NOW())
    `,
        [userId, -delta],
    );
}

export async function updateBalance(
    client: PoolClient,
    userId: number,
    balance: number,
) {
    await client.query(
        `
    UPDATE users
    SET balance = $1
    WHERE id = $2
    `,
        [balance, userId],
    );
}