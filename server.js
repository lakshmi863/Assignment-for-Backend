const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const port = 5002;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/office-transactions', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const transactionSchema = new mongoose.Schema({
  date: String,
  description: String,
  type: String,
  amount: Number,
  balance: Number,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

app.post('/transactions', async (req, res) => {
  try {
    const { date, description, type, amount } = req.body;
    const lastTransaction = await Transaction.findOne().sort({ _id: -1 });
    let balance = lastTransaction ? lastTransaction.balance : 0;
    balance += type === 'Credit' ? amount : -amount;
    const newTransaction = new Transaction({ date, description, type, amount, balance });
    await newTransaction.save();
    res.json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
