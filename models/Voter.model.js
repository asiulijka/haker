const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
  user: { type: String, required: true },
  votes: { type: Array, required: true },
});

module.exports = mongoose.model('voter', VoterSchema);
