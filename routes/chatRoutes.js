// routes/chatRoutes.js
const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const router = express.Router();

//module.exports = (io) => {
  
  // Route to fetch chat messages by appointment ID
  // router.get('/:appointmentId', async (req, res) => {
  //   try {
  //     const messages = await ChatMessage.find({ appointmentId: req.params.appointmentId });
  //     res.json(messages);
  //   } catch (error) {
  //     res.status(500).json({ message: 'Error fetching chat messages', error });
  //   }
  // });

  // Route to save a new message and emit it to clients
  router.post('/', async (req, res) => {
    const {  sender, recipient, message } = req.body;
    console.log(req.body);
    try {
      const newMessage = new ChatMessage({  sender, recipient, message });
      await newMessage.save();
      
      // Emit the new message to all connected clients for real-time updates
      //io.emit('message', newMessage);
      
      res.status(201).json(newMessage);
    } catch (error) {
      res.status(500).json({ message: 'Error saving message', error });
    }
  });

  //return router;
//};
module.exports=router;
