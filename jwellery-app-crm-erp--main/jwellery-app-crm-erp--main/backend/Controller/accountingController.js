// controllers/accountingController.js
import Ledger from '../models/Ledger.js';
import LedgerEntry from '../models/LedgerEntry.js';

export const getLedgers = async (req, res) => {
  const ledgers = await Ledger.find().populate('account_id branch_id');
  res.json(ledgers);
};

export const getLedgerEntries = async (req, res) => {
  const entries = await LedgerEntry.find({ ledger_id: req.query.ledger_id });
  res.json(entries);
};
