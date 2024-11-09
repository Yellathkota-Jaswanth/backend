const User = require('../models/User');
const bcrypt = require('bcryptjs');


// Get the logged-in user's profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// Update the logged-in user's profile
exports.updateUserProfile = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.findOne({email:email});

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    res.json({ msg: 'Profile updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getcounselor=async (req,res) => {

  const counselor = await User.find({userType:"counselor"})
  //res.send(JSON.stringify(counselor))
  res.json(counselor)

  console.log(counselor)
}
