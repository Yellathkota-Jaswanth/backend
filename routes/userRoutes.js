const express = require('express');
const auth = require('../middleware/authMiddleware');
const { getUserProfile, updateUserProfile, getcounselor } = require('../controllers/userController');
const router = express.Router();

router.get('/profile', auth, getUserProfile);
// In user routes
router.get('/', auth, getUserProfile);


router.get('/getcounselor', auth, getcounselor);


router.put('/profile', auth, updateUserProfile);

module.exports = router;
