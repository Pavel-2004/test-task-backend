const { fetchOrgRepos, fetchAllCommits, fetchAllIssuesAndPullRequests, fetchAllChangeLogs, fetchOrgUsers, fetchAllIssues } = require('../../helpers/requests/githubRequestHelpers');
const Organization = require('../../models/Organization');
const Repository = require('../../models/Repository');
const ChangeLog = require('../../models/Changelog');
const Commit = require('../../models/Commit');
const Issue = require('../../models/Issue');
const GitHubIntegration = require('../../models/GithubIntegration');
const User = require('../../models/User');

const createGitHubIntegration = async (githubUsername, accessToken) => {
  try {
    return GitHubIntegration.create({
      accessToken,
      githubUserLogin: githubUsername,
    });
  }
  catch(error) {
    console.error('Error creating github integration:', error)
  }
};

const createOrganization = async (org, gitHubIntegrationId) => {
  try {
    return Organization.create({
      name: org.login,
      id: org.id,
      url: org.url,
      repos_url: org.repos_url,
      description: org.description,
      avatar_url: org.avatar_url,
      members_url: org.members_url,
      created_at: org.created_at,
      gitHubIntegration: gitHubIntegrationId,
    });
  }
  catch(error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

const createRepository = async (repo, orgId) => {
  try {
    return Repository.create({
      name: repo.name,
      fullName: repo.full_name,
      organization: orgId,
      private: repo.private,
      description: repo.description,
      url: repo.url,
      createdAt: repo.created_at,
      description: repo.description,
      createdAt: repo.createdAt,
      language: repo.language
    });
  }
  catch(error) {
    console.error('Error creating repository:', error)
    throw error;
  }
};

const storeChangeLogs = async (changeLogs, repoId) => {
  try {
    const documents = changeLogs.map((changeLog) => ({
      user: {
        login: changeLog.actor.login,
        avatarUrl: changeLog.actor.avatar_url
      },
      gitHubIssueId: changeLog.issue.id,
      gitHubIssueNumber: changeLog.issue.number,
      event: changeLog.event,
      created_at: changeLog.created_at,
      repository: repoId
    }));
    
    await ChangeLog.insertMany(documents);
  } 
  catch(error) {
    console.error('Error creating change logs:', error)
    throw error
  }
};

const storeCommits = async (commits, repoId) => {
  
  try {
    const documents = commits.map((commit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        avatarUrl: commit.author ? commit.author.avatar_url : "",
        login: commit.author ? commit.author.login : ""
      },
      date: commit.created_at,
      repository: repoId,
    }));
    await Commit.insertMany(documents);
  }
  catch(error) {
    console.error('Error creating commits:', error)
    throw error
  }
};

const storeIssues = async (issues, repoId) => {
  try {
    const documents = issues.map((issue) => ({
      title: issue.title,
      gitHubIssueNumber: issue.number,
      user: {
        login: issue.user.login,
        avatarUrl: issue.user.avatar_url,
      },
      gitHubIssueId: issue.id,
      body: issue.body,
      state: issue.state,
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      repository: repoId,
    }));
    await Issue.insertMany(documents);
  }
  catch(error) {
    console.error('Error creating issues:', error)
    throw error
  }
};

const processRepository = async (repo, orgId, orgLogin, accessToken) => {
  try {
    const repoStored = await createRepository(repo, orgId);

    const [changeLogs, commits, issues] = await Promise.all([
      fetchAllChangeLogs(orgLogin, repo.name, accessToken),
      fetchAllCommits(orgLogin, repo.name, accessToken),
      fetchAllIssues(orgLogin, repo.name, accessToken),
    ]);

    await Promise.all([
      storeChangeLogs(changeLogs, repoStored._id),
      storeCommits(commits, repoStored._id),
      storeIssues(issues, repoStored._id),
    ]);

    return { repoName: repo.name };
  }
  catch(error) {
    console.error('Error processing repositor:', error)
    throw error
  }
};

const storeUsers = async (users, orgStored) => {
  const documents = users.map(user => ({
    login: user.login,
    url: user.url,
    admin: user.site_admin,
    organization: orgStored._id,
    avatarUrl: user.avatar_url,
    url: user.url,
    reposUrl: user.repos_url
  }))

  await User.insertMany(documents)
}

const processOrganizations = async (orgs, gitHubIntegrationId, accessToken) => {
  const orgPromises = orgs.map(async (org) => {
    const orgStored = await createOrganization(org, gitHubIntegrationId);
    
    const repos = await fetchOrgRepos(org.login, accessToken);
    const users = await fetchOrgUsers(org.login, accessToken)
    await storeUsers(users, orgStored)

    const repoDataPromises = repos.map((repo) => processRepository(repo, orgStored._id, org.login, accessToken));
    return {
      orgId: org.login,
      reposData: await Promise.all(repoDataPromises),
    };
  });

  return Promise.all(orgPromises);
};

const processDeleteIssuesFromRepository = async (repository) => {
  await Issue.deleteMany({
    repository: repository._id,
  })
}

const processDeleteChangeLogsFromRepository = async (repository) => {
  await ChangeLog.deleteMany({
    repository: repository._id,
  })
}

const processDeleteCommitsFromRepository = async (repository) => {
  await Commit.deleteMany({
    repository: repository._id
  })
}

const processDeleteRepository = async (repository) => {
  await processDeleteIssuesFromRepository(repository);
  await processDeleteChangeLogsFromRepository(repository);
  await processDeleteCommitsFromRepository(repository);
  await repository.deleteOne()
}

const processDeleteOrganizationUsers = async (organization) => {
  await User.deleteMany({
    organization: organization._id
  })
}

const processDeleteOrganization = async (organization) => {
  const repositories = await Repository.find({organization: organization._id});
  await processDeleteOrganizationUsers(organization)

  for (const repository of repositories) {
    await processDeleteRepository(repository);
  }

  await organization.deleteOne()
}

const processDeleteGithubIntegration = async (gitHubIntegration) => {
  const organizations = await Organization.find({ gitHubIntegration: gitHubIntegration._id });

  for (const organization of organizations) {
    await processDeleteOrganization(organization);
  }

  await GitHubIntegration.deleteOne()
}

module.exports = {
  createGitHubIntegration,
  createOrganization,
  createRepository,
  storeChangeLogs,
  storeCommits,
  storeIssues,
  processRepository,
  processOrganizations,
  processDeleteGithubIntegration,
}