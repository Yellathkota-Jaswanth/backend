const express = require('express');
const router = express.Router();
const { zoomAuthorize, zoomCallback, createZoomMeeting, getMeetLink } = require('../controllers/zoomController');

// Route to authorize with Zoom
router.get('/authorize', zoomAuthorize);
router.get('/get-meeting-link/:client/:counselor', getMeetLink);

// OAuth callback after Zoom redirects back to your app
router.get('/callback', zoomCallback);

// Route to create a Zoom meeting (used after appointment acceptance)
router.post('/create-meeting', createZoomMeeting);

module.exports = router;
