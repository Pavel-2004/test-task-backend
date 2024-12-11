const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const Issue = require("../../models/Issue");
const ChangeLog = require("../../models/ChangeLog");

const fetchChangeLogs = async (req, res) => {
  try {
    const { startRow = 0, endRow = 10, sortModel, filterModel, issueId } = req.query;

    const issue = await Issue.findById(issueId)

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});
    query.gitHubIssueId = issue.gitHubIssueId;

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const changeLogs = await ChangeLog.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await ChangeLog.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: changeLogs,
      totalRecords,
      schema: ChangeLog.schema
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching change logs',
      error: error.message
    });
  }
}

module.exports = {
  fetchChangeLogs
}