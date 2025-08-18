const fs = require('fs');
const express = require("express");
const router = express.Router();

const file = '../../realistic_jira_tickets.json';

router.get("/rooms", (req, res) => {
  const roomList = Object.keys(rooms).map(roomId => ({
    id: roomId,
    playerCount: Object.values(rooms[roomId].voters).length
  }));

  res.json(roomList);
});

router.get("/tickets/:projectId", (req, res) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON data:', jsonData);
      let resp = jsonData.hasOwnProperty(req.params.projectId) ? jsonData[req.params.projectId] : [];
      res.json(resp);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
});

router.get("/projects", (req, res) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON data:', jsonData);
      let resp = Object.keys(jsonData);
      res.json(resp);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
    }
  });
});

module.exports = router;