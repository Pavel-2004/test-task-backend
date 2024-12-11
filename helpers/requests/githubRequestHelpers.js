const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const axios = require('axios');
const { Octokit } = require('@octokit/rest');


const getAccessToken = async (code) => {
  const response = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: process.env.REDIRECT_URI,
    },
    { headers: { Accept: 'application/json' } }
  );
  return response.data.access_token;
};

const getGitHubUsername = async (accessToken) => {
  const octokit = new Octokit({ auth: accessToken });

  try {
    const response = await octokit.rest.users.getAuthenticated();
    return response.data.login;
  } catch (error) {
    console.error('Error fetching GitHub username:', error.message);
    throw error;
  }
};  

const fetchGitHubOrgs = async (access_token) => {
  const octokit = new Octokit({ auth: access_token });

  try {
    const orgs = await octokit.paginate(
      octokit.orgs.listForAuthenticatedUser,
      {
        per_page: 100,
      }
    );
    
    return orgs;

  } catch (error) {
    console.error('Error fetching GitHub organizations:', error);
    throw error;
  }
};

const fetchOrgUsers = async (orgId, access_token) => {
  const octokit = new Octokit({ auth: access_token });

  try {
    const users = await octokit.paginate(
      octokit.orgs.listMembers,
      {
        org: orgId,
        per_page: 100,
      }
    );

    return users;

  } catch (error) {
    console.error('Error fetching organization members:', error);
    throw error;
  }
};

const fetchOrgRepos = async (orgId, access_token) => {
  const octokit = new Octokit({ auth: access_token });

  try {
    const repos = await octokit.paginate(
      octokit.repos.listForOrg,
      {
        org: orgId,
        per_page: 100,
      }
    );
    
    return repos;

  } catch (error) {
    console.error('Error fetching organization repositories:', error);
    throw error;
  }
};

const fetchAllCommits = async (orgId, repoName, access_token) => {
  const octokit = new Octokit({ auth: access_token });

  try {
    const commits = await octokit.paginate(
      octokit.repos.listCommits,
      {
        owner: orgId,
        repo: repoName,
        per_page: 100,
      }
    );
    
    return commits;

  } catch (error) {
    console.error('Error fetching commits:', error);
    throw error;
  }
};

const fetchAllIssues = async (orgId, repoName, access_token) => {
  const octokit = new Octokit({ auth: access_token });

  try {
    const issues = await octokit.paginate(
      octokit.issues.listForRepo,
      {
        owner: orgId,
        repo: repoName,
        state: 'all',
        per_page: 100,
      }
    );

    return issues;
  } catch (error) {
    console.error('Error fetching issues and pull requests:', error);
    throw error;
  }
};

const fetchAllChangeLogs = async (orgId, repoName, access_token) => {
  const octokit = new Octokit({ auth: access_token })
  
  try {
    const allEvents = await octokit.paginate(
      octokit.issues.listEventsForRepo,
      {
        owner: orgId,
        repo: repoName,
        per_page: 100
      }
    )

    console.log(allEvents, 'all events')

    return allEvents
  } catch (error) {
    console.error('Error fetching change logs:', error);
    throw error;
  }
};

const handleRemoveIntegration = async (access_token) => {
  const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
  const encodedCredentials = btoa(credentials);
  try {
    await axios.delete(
      `https://api.github.com/applications/${CLIENT_ID}/token`,
      {
        headers: {
          Authorization: `Basic ${encodedCredentials}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        data: { 
          access_token: access_token,
        }
      }

    );
  } catch (error) {
    console.error('Error deleting token:', error.message);
  }
};


module.exports = {
  getAccessToken,
  getGitHubUsername,
  fetchGitHubOrgs,
  fetchOrgRepos,
  fetchAllCommits,
  fetchAllIssues,
  fetchAllChangeLogs,
  fetchOrgUsers,
  handleRemoveIntegration,
}

