const { parentPort } = require('worker_threads');
const {processOrganizations} = require("../helpers/database/githubDatabaseHelpers");
const mongoose = require("mongoose");

parentPort.on('message', async ({ orgs, gitHubIntegrationId, accessToken }) => {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    const processedData = await processOrganizations(orgs, gitHubIntegrationId, accessToken);

    await mongoose.disconnect()

    parentPort.postMessage({ success: true, data: processedData });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
});
