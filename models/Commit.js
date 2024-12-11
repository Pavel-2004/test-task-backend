
const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema({
  sha: {
    type: String,
    required: true,
  },
  message: {
    type: String,
  },
  author: {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    avatarUrl: {
      type: String
    },
    login: {
      type: String
    }
  },
  date: {
    type: Date,
  },
  repository: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
  },
});

CommitSchema.index({ 
  message: 'text', 
  'author.name': 'text', 
  'author.email': 'text',
  sha: 'text'
});

const Commit = mongoose.models.Commit || mongoose.model('Commit', CommitSchema);

module.exports = Commit;
