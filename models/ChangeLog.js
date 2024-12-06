const mongoose = require('mongoose');

const ChangelogSchema = new mongoose.Schema({
  user: {
    type: String,
  },
  name: {
    type: String,
  },
  message: {
    type: String,
  },
  published_at: {
    type: Date,
    default: Date.now,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  }
});

ChangelogSchema.index({ 
  user: 'text', 
  name: 'text', 
  message: 'text',
});

const Changelog = mongoose.models.Changelog || mongoose.model('Changelog', ChangelogSchema);

module.exports = Changelog;