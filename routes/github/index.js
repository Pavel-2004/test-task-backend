const express = require('express');
const gitHubDataRouter = require("./data.js")
const {handleAsyncErrors} = require("../../helpers/utils/errorHelpers.js");
const githubAuthController = require("../../controllers/github/authController.js");
const { authMiddleware } = require('../../middleware/authentication/index.js');
const router = express.Router();

router.get('/connect', handleAsyncErrors(githubAuthController.connectGitHub));

router.get('/callback', handleAsyncErrors(githubAuthController.handleCallBack))

router.get('/status', authMiddleware, handleAsyncErrors(githubAuthController.getIntegrationStatus))

router.get('/remove', authMiddleware, handleAsyncErrors(githubAuthController.removeIntegration))

router.use('/data', authMiddleware, gitHubDataRouter)

module.exports = router