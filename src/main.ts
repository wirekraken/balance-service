import express from 'express';
import { withdraw } from './users.service';

const app = express();

app.use(express.json());

app.post('/users/:id/withdraw', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        const amount = Number(req.body.amount);

        if (!amount || amount <= 0) {
            return res.status(400).json({
                error: 'Invalid amount',
            });
        }

        const result = await withdraw(userId, amount);

        res.json(result);
    } catch (err) {
        res.status(400).json({
            error: (err as Error).message,
        });
    }
});

app.listen(3000, () => {
    console.log('server started');
});