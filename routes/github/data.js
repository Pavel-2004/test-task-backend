const express = require('express');

const {handleAsyncErrors} = require("../../helpers/utils/errorHelpers.js");

const gitHubDataCommitsController = require('../../controllers/github/commitsController.js')
const gitHubDataOrganizationsController = require('../../controllers/github/organizationController.js')
const gitHubDataUsersController = require('../../controllers/github/usersController.js')
const gitHubDataIssuesController = require("../../controllers/github/issuesController.js")
const gitHubDataChangeLogsController = require("../../controllers/github/changeLogController.js")
const gitHubDataReposController = require('../../controllers/github/reposController.js');


const { 
  validateIssueRequestMiddleware, 
  validateRepositoryOrUserRequestMiddleware, 
  validateOrganizationRequestMiddleware } 
  = require("../../middleware/github/dataFetching.js")

const router = express.Router();

router.get('/organizations', handleAsyncErrors(gitHubDataOrganizationsController.fetchOrganizations))

router.get('/organizations/:id', handleAsyncErrors(gitHubDataOrganizationsController.fetchOrganization))

router.get('/repos', validateOrganizationRequestMiddleware, handleAsyncErrors(gitHubDataReposController.fetchRepositories))

router.get('/repos/:id', handleAsyncErrors(gitHubDataReposController.fetchRepository))

router.get('/commits', validateRepositoryOrUserRequestMiddleware, handleAsyncErrors(gitHubDataCommitsController.fetchCommits))

router.get('/issues', validateRepositoryOrUserRequestMiddleware, handleAsyncErrors(gitHubDataIssuesController.fetchIssues))

router.get('/issues/:id', handleAsyncErrors(gitHubDataIssuesController.fetchIssue))

router.get('/users', validateOrganizationRequestMiddleware, handleAsyncErrors(gitHubDataUsersController.fetchUsers))

router.get('/users/:id', handleAsyncErrors(gitHubDataUsersController.fetchUser))

router.get('/changelogs', validateIssueRequestMiddleware, handleAsyncErrors(gitHubDataChangeLogsController.fetchChangeLogs))

module.exports = router