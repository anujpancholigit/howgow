// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String, // Note: In a real-world application, never store passwords as plain text
  purchasedPlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }],
});

module.exports = mongoose.model('User', userSchema);