import { pool } from './db';
import {
    getBalance,
    insertPayment,
    lockUser,
    updateBalance,
} from './users.repository';

export async function withdraw(
    userId: number,
    amount: number,
) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await lockUser(client, userId);

        const balance = await getBalance(client, userId);
        const newBalance = balance - amount;

        if (newBalance < 0) {
            throw new Error('Insufficient funds');
        }

        await insertPayment(client, userId, amount);
        await updateBalance(client, userId, newBalance);

        await client.query('COMMIT');

        return {
            success: true,
            balance: newBalance,
        };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}