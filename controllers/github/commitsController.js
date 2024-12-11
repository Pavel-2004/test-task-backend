const {buildFilterQuery, buildSortQuery, getPaginationParams} = require("../../helpers/database/agGridQueryHelpers");
const Commit = require("../../models/Commit");
const Repository = require('../../models/Repository');
const User = require("../../models/User")

const fetchCommits = async (req, res) => {
  try {
    const { startRow, endRow, sortModel, filterModel, repositoryId, globalSearch, userId } = req.query;

    const query = buildFilterQuery(filterModel ? JSON.parse(filterModel) : {});

    if (repositoryId) {
      const repository = await Repository.findById(repositoryId);
      
      query.repository = repository._id;
    }

    if (globalSearch) {
      query.$text = { $search: globalSearch  }
    }

    if (userId) {
      const user = await User.findById(userId)

      query['author.login'] = user.login
    }

    const sortQuery = buildSortQuery(sortModel ? JSON.parse(sortModel) : []);
    const { skip, limit } = getPaginationParams(startRow, endRow);

    const commits = await Commit.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);

    const totalRecords = await Commit.countDocuments(query);

    return res.status(200).json({
      success: true,
      rows: commits,
      totalRecords,
      schema: Commit.schema
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching commits',
      error: error.message
    });
  }
}

module.exports = {
  fetchCommits
}