const express = require('express');
const {handleAsyncErrors} = require("../helpers/utils/errorHelpers.js");
const githubAuthController = require("../controllers/github/authController.js");
const githubDataFetchingController = require('../controllers/github/dataFetchingController.js');
const router = express.Router();

router.get('/connect', handleAsyncErrors(githubAuthController.connectGitHub));

router.get('/callback', handleAsyncErrors(githubAuthController.handleCallBack))

router.get('/status', handleAsyncErrors(githubAuthController.getIntegrationStatus))

router.get('/remove', handleAsyncErrors(githubAuthController.removeIntegration))

router.get('/data/organizations', handleAsyncErrors(githubDataFetchingController.fetchOrganizations))

router.get('/data/repos', handleAsyncErrors(githubDataFetchingController.fetchRepositories))

router.get('/data/commits', handleAsyncErrors(githubDataFetchingController.fetchCommits))

router.get('/data/pulls', handleAsyncErrors(githubDataFetchingController.fetchPullRequests))

router.get('/data/issues', handleAsyncErrors(githubDataFetchingController.fetchIssues))

router.get('/data/users', handleAsyncErrors(githubDataFetchingController.fetchUsers))

router.get('/data/changelogs', handleAsyncErrors(githubDataFetchingController.fetchChangeLogs))

module.exports = router