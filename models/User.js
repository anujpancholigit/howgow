// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  purchasedPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
});

module.exports = mongoose.model('User', userSchema);