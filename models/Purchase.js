// models/Purchase.js
const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  purchaseDate: Date,
});

module.exports = mongoose.model('Purchase', purchaseSchema);