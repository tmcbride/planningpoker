const express = require("express");
const router = express.Router();
const axios = require('axios');

const BOARD_CACHE_TTL = 1000 * 60 * 1000;
let boardsCache = { data: null, timestamp: 0 };
let projectsCache = {};

module.exports = (rooms) => {
  router.get("/rooms", (req, res) => {
    const roomList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      playerCount: Object.values(rooms[roomId].voters).filter(voter => voter.removed !== true).length,
      dealerId: rooms[roomId].dealer?.userId,
    }));

    res.json(roomList);
  });

  router.get("/clearRooms", (req, res) => {
    Object.keys(rooms).forEach(roomId => {
      delete rooms[roomId];
    });
    res.json({ success: true });
  });

  router.get("/tickets/:projectId", async (req, res) => {
    const jiraUrl = `${process.env.BASE_JIRA_URL}/rest/agile/1.0/board/${req.params.projectId}/backlog?maxResults=100&expand=renderedFields`;
    let data = await makeJiraCall(jiraUrl);
    const mappedTickets = data.issues.map(issue => ({
      key: issue.key,
      title: issue.fields.summary,
      description: issue.renderedFields.description,
      storyPoints: issue.fields.customfield_10003,
      link: `${process.env.BASE_JIRA_URL}/browse/${issue.key}`
    }));
    res.json(mappedTickets);
  });

  router.get("/storyPoints/:projectId", async (req, res) => {
    let jiraUrl = `${process.env.BASE_JIRA_URL}/rest/agile/1.0/board/${req.params.projectId}/sprint?state=active`;
    let data = await makeJiraCall(jiraUrl);
    console.log("Sprint Data: ", JSON.stringify(data, null, 2));

    if (!data) {
      res.json({
        totalStoryPoints: -1,
        ticketCount: 0
      });
      return;
    }

    let sprintId = data?.values[0]?.id;
    if (!sprintId) {
      res.json({
        totalStoryPoints: -1,
        ticketCount: 0
      });
      return;
    }

    jiraUrl = `${process.env.BASE_JIRA_URL}/rest/agile/1.0/sprint/${sprintId}/issue`;

    data = await makeJiraCall(jiraUrl);

    const mappedTickets = data.issues.map(issue => ({
      storyPoints: issue.fields.customfield_10003,
    }));

    const totalStoryPoints = mappedTickets.reduce((sum, issue) => sum + (issue.storyPoints || 0), 0);
    res.json({
      totalStoryPoints: totalStoryPoints,
      ticketCount: mappedTickets.length
    });
  });

  async function makeJiraCall(jiraUrl) {
    try {
      const res = await axios.get(jiraUrl, {
        headers: {Authorization: process.env.JIRA_AUTH_TOKEN},
        httpsAgent: new (require('https').Agent)({rejectUnauthorized: false})
      });
      return res.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function getBoardsCached() {
    const now = Date.now();
    if (boardsCache.data && (now - boardsCache.timestamp < BOARD_CACHE_TTL)) {
      console.log("Got Board list from Cache");
      return boardsCache.data;
    }

    const jiraUrl = `${process.env.BASE_JIRA_URL}/rest/agile/1.0/board?type=scrum`;
    let data = await makeJiraCall(jiraUrl, now);
    boardsCache = {data: data, timestamp: now};
    return data;
  }

  router.get("/projects", async (req, res) => {
    const data = await getBoardsCached();
    res.json(data);
  });

  async function getProjectVersions(boardId) {
    console.log("Getting project versions for ", boardId);
    const now = Date.now();
    if (projectsCache[boardId] && projectsCache[boardId].data && (now - projectsCache[boardId].timestamp < BOARD_CACHE_TTL)) {
      console.log("Got Project list from Cache");
      return projectsCache[boardId].data;
    }

    let project = await makeJiraCall(`${process.env.BASE_JIRA_URL}/rest/agile/1.0/board/${boardId}/project`);
    if (!project) {
      console.log("Can't find project for board: " + boardId);
      return null;
    }
    console.log("Got Board: ", project);

    let projectKey = project.values[0].id;

    const versions = await makeJiraCall(`${process.env.BASE_JIRA_URL}/rest/api/2/project/${projectKey}/versions`);
    projectsCache[boardId] = {data: versions, timestamp: now};
    return versions;
  }

  router.get("/projectList/:boardId", async (req, res) => {
    const data = await getProjectVersions(req.params.boardId);
    res.json(data);
  });

  return router;
}