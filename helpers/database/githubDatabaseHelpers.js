const { fetchOrgRepos, fetchAllCommits, fetchAllIssuesAndPullRequests, fetchAllChangeLogs, fetchOrgUsers } = require('../../helpers/requests/githubRequestHelpers');
const Organization = require('../../models/organization');
const Repository = require('../../models/repository');
const ChangeLog = require('../../models/changelog');
const Commit = require('../../models/commit');
const Issue = require('../../models/issue');
const PullRequest = require('../../models/pullrequest');
const GitHubIntegration = require('../../models/githubIntegration');
const User = require('../../models/User');

const createGitHubIntegration = async (githubUsername, accessToken) => {
  try {
    return GitHubIntegration.create({
      accessToken,
      githubUsername,
    });
  }
  catch(error) {
    console.error('Error creating github integration:', error)
  }
};

const createOrganization = async (org, gitHubIntegrationId) => {
  try {
    return Organization.create({
      login: org.login,
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
      created_at: repo.created_at,
      updated_at: repo.updated_at,
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
      user: changeLog.author.login,
      message: changeLog.body,
      published_at: changeLog.published_at,
      created_at: changeLog.created_at,
      repository: repoId,
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
      },
      date: commit.commit.author.date,
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
      number: issue.number,
      user: issue.user.login,
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

const storePullRequests = async (pullRequests, repoId) => {
  try {
    const documents = pullRequests.map((pullRequest) => ({
      title: pullRequest.title,
      number: pullRequest.number,
      body: pullRequest.body,
      user: pullRequest.user.login,
      state: pullRequest.state,
      created_at: pullRequest.created_at,
      updated_at: pullRequest.updated_at,
      repository: repoId,
    }));
    await PullRequest.insertMany(documents);
  }
  catch(error) {
    console.error('Error storing pull requests', error)
    throw error
  }
};

const processRepository = async (repo, orgId, orgLogin, accessToken) => {
  try {
    const repoStored = await createRepository(repo, orgId);

    const [changeLogs, commits, { issues, pullRequests }] = await Promise.all([
      fetchAllChangeLogs(orgLogin, repo.name, accessToken),
      fetchAllCommits(orgLogin, repo.name, accessToken),
      fetchAllIssuesAndPullRequests(orgLogin, repo.name, accessToken),
    ]);

    await Promise.all([
      storeChangeLogs(changeLogs, repoStored._id),
      storeCommits(commits, repoStored._id),
      storeIssues(issues, repoStored._id),
      storePullRequests(pullRequests, repoStored._id),
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
    organization: orgStored._id
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

const processDeletePullRequestsFromRepository = async (repository) => {
  await PullRequest.deleteMany({
    repository: repository._id,
  })
}

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
    repository: repository._id,
  })
}

const processDeleteRepository = async (repository) => {
  await processDeletePullRequestsFromRepository(repository);
  await processDeleteIssuesFromRepository(repository);
  await processDeleteChangeLogsFromRepository(repository);
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
  storePullRequests,
  processRepository,
  processOrganizations,
  processDeleteGithubIntegration,
}