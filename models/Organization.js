const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  login: {
    type: String,
    required: true,
  },
  id: {
    type: Number,
    required: true,
  },
  url: {
    type: String,
  },
  repos_url: {
    type: String,
  },
  description: {
    type: String,
  },
  avatar_url: {
    type: String,
  },
  members_url: {
    type: String,
  },
  created_at: {
    type: Date,
  },
  gitHubIntegration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GitHubIntegration',
    required: true
  }
});

const Organization = mongoose.models.Organization || mongoose.model('Organization', organizationSchema);

module.exports = Organization;