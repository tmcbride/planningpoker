const fs = require('fs');
const express = require("express");
const router = express.Router();
const path = require("path");

const file = path.join(__dirname, "../../realistic_jira_tickets.json");
module.exports = (rooms) => {
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
        let resp = Object.keys(jsonData);
        res.json(resp);
      } catch (parseError) {
        console.error('Error parsing JSON:', parseError);
      }
    });
  });

  return router;
}