const axios = require('axios');
const querystring = require('querystring');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

exports.getMeetLink = async (req, res) => {
    const tokenUrl = 'https://zoom.us/oauth/token';
    const client_id = "CwzAmZE3S2q6_IpgoAYVhA"
    const client_secrect = "GN6a8ESrsPcmSDlMWyNMHkdWomMUQ2u2"
    const creds = Buffer.from(`${client_id}:${client_secrect}`).toString('base64');

    const client = req.params.client
    const counselor = req.params.counselor
    console.log(req.params.client,req.params.counselor)
    try{
        const tokenResponse = await axios.post(tokenUrl,querystring.stringify({grant_type:'account_credentials',account_id:'BvXePfRiTTSDXduPDuEoag'}),{
            headers: {
                'Authorization': `Basic ${creds}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        const meetingUrl = `https://api.zoom.us/v2/users/me/meetings`;
        const meetingResponse = await axios.post(meetingUrl, {
            topic: 'Counseling Session',
            type: 2,  // Scheduled meeting
            start_time: new Date().toISOString(),
            duration: 60,  // 60-minute session
            settings: {
                host_video: true,
                participant_video: true
            }
        }, {
            headers: {
                'Authorization': `Bearer ${tokenResponse.data.access_token}`,
                'Content-Type': 'application/json'
            }
        });

        const { join_url } = meetingResponse.data;
        const appointment = await Appointment.findOneAndUpdate({client:client,counselor:counselor},{status:'confirmed',link:join_url},{new:true,upsert:true})
        console.log('APPOINTMENT',appointment.status,appointment.link,appointment.sessionType)
        res.json({meet_url:join_url})
    }catch(err){
        console.log(err,'ERROR')
        res.send(err)
    }

    
};

// Step 1: Redirect to Zoom's OAuth page
exports.zoomAuthorize = (req, res) => {
    const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URI}`;
    res.redirect(authUrl);
};

// Step 2: Handle the OAuth callback and exchange the code for access tokens
exports.zoomCallback = async (req, res) => {
    const authorizationCode = req.query.code;
    const tokenUrl = 'https://zoom.us/oauth/token';
    const authHeader = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');

    try {
        const tokenResponse = await axios.post(tokenUrl, querystring.stringify({
            grant_type: 'authorization_code',
            code: authorizationCode,
            redirect_uri: process.env.ZOOM_REDIRECT_URI
        }), {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = tokenResponse.data;

        // Store tokens securely (in your DB)
        const userId = req.user._id; // Assuming the user is logged in
        const user = await User.findById(userId);
        user.zoomAccessToken = access_token;
        user.zoomRefreshToken = refresh_token;
        await user.save();

        res.redirect(`http://localhost:5173/?access_token=${access_token}`);    } catch (error) {
        console.error('Error during OAuth callback:', error.response.data);
        res.status(500).send('OAuth failed');
    }
};

// Step 3: Create a Zoom meeting when a counselor accepts an appointment
exports.createZoomMeeting = async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // if (!user.zoomAccessToken) {
    //     return res.status(400).send('Zoom authorization is required');
    // }

    const meetingUrl = `https://api.zoom.us/v2/users/me/meetings`;

    try {
        const meetingResponse = await axios.post(meetingUrl, {
            topic: 'Counseling Session',
            type: 2,  // Scheduled meeting
            start_time: new Date().toISOString(),
            duration: 60,  // 60-minute session
            settings: {
                host_video: true,
                participant_video: true
            }
        }, {
            headers: {
                'Authorization': `Bearer ${user.zoomAccessToken}`,
                'Content-Type': 'application/json'
            }
        });

        const { join_url } = meetingResponse.data;

        res.json({ meetingUrl: join_url });
    } catch (error) {
        console.error('Error creating Zoom meeting:', error.response.data);

        // Handle token expiration
        if (error.response.status === 401) {
            const newTokens = await refreshZoomToken(user.zoomRefreshToken);
            if (newTokens) {
                user.zoomAccessToken = newTokens.access_token;
                user.zoomRefreshToken = newTokens.refresh_token;
                await user.save();

                return exports.createZoomMeeting(req, res); // Retry meeting creation
            }
        }
        res.status(500).send('Failed to create Zoom meeting');
    }
};

// Function to refresh Zoom access token
async function refreshZoomToken(refreshToken) {
    const tokenUrl = 'https://zoom.us/oauth/token';
    const authHeader = Buffer.from(`${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`).toString('base64');

    try {
        const response = await axios.post(tokenUrl, querystring.stringify({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }), {
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        const { access_token, refresh_token } = response.data;
        return { access_token, refresh_token };
    } catch (error) {
        console.error('Error refreshing Zoom token:', error.response.data);
        return null;
    }
}
