const GitHubIntegration = require('../../models/GitHubIntegration');
const {getAccessToken, getGitHubUsername, fetchGitHubOrgs, handleRemoveIntegration} = require("../../helpers/requests/githubRequestHelpers");
const {createGitHubIntegration, processOrganizations, processDeleteGithubIntegration} = require("../../helpers/database/githubDatabaseHelpers");
const {runWorker} = require("../../helpers/utils/runWorkerHelper");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = `${process.env.BACKEND_URL}/api/github/callback`;

const connectGitHub = async (req, res) => {
  try {
    if (!req.query.code) {
      const authUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=repo%20user%20read:org`;
      return res.status(200).json({authUrl});
    }
  }
  catch (error) {
    console.error('GitHub OAuth Error:', error);
  }
}

const handleCallBack = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send({ message: 'Missing authorization code' });
    }

    const accessToken = await getAccessToken(code);
    if (!accessToken) {
      return res.status(400).send({ message: 'Failed to get access token' });
    }

    const gitHubUsername = await getGitHubUsername(accessToken);

    const gitHubIntegration = await createGitHubIntegration(gitHubUsername, accessToken);

    const orgs = await fetchGitHubOrgs(accessToken);

    await runWorker('./workers/processOrganizationsWorker.js', {
      orgs,
      gitHubIntegrationId: gitHubIntegration._id.toString(),
      accessToken,
    })

    const frontend_redirect_url = process.env.FRONTEND_URL;
    return res.status(200).redirect(frontend_redirect_url);
  }
  catch (error) {
    console.error('GitHub OAuth Callback Error:', error);
    return res.status(500).json({ message: 'Error handling GitHub callback' });
  }
}

const getIntegrationStatus = async (req, res) => {
  try {
    const gitHubIntegration = await GitHubIntegration.findOne({});

    if (!gitHubIntegration) {
      return res.status(404).json({ message: "GitHub integration not found" });
    }

    const { githubUsername, createdAt } = gitHubIntegration;

    return res.status(200).json({ githubUsername, createdAt });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching GitHub integration status", error: error.message });
  }
};

const removeIntegration = async (req, res) => {
  try {
    const gitHubIntegration = await GitHubIntegration.findOne({})

    if (!gitHubIntegration) {
      return res.status(404).json({ message: "GitHub integration not found" });
    }


    await handleRemoveIntegration(gitHubIntegration.accessToken);

    await processDeleteGithubIntegration(gitHubIntegration);

    return res.sendStatus(204);
  }
  catch (error) {
    return res.status(500).json({ message: 'Error removing integration', error: error.message });
  }
}

module.exports = {
  connectGitHub,
  handleCallBack,
  getIntegrationStatus,
  removeIntegration
}