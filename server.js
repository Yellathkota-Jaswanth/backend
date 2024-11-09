// server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const zoomRoutes = require('./routes/zoomRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const http = require('http');
const { Server } = require('socket.io');
const ChatMessage = require('./models/ChatMessage'); // Import ChatMessage model

dotenv.config();

const app = express();
connectDB();

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://zoom.us/oauth/authorize'],
    credentials: true,
}));

// Route definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/zoom', zoomRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/chat', require('./routes/chatRoutes'));


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join room based on appointmentId for each connected user
    socket.on('joinRoom', (appointmentId) => {
        socket.join(appointmentId);
        console.log(`User with ID: ${socket.id} joined room: ${appointmentId}`);
    });

    // Handle incoming chat messages
    socket.on('sendMessage', async (msg) => {
        console.log('Message received:', msg);
        
        const { appointmentId, sender, recipient, message } = msg;

        // Save the message to the database
        const newMessage = new ChatMessage({ appointmentId, sender, recipient, message });
        try {
            await newMessage.save();

            // Emit message only to clients in the specific room (appointmentId)
            io.to(appointmentId).emit('message', newMessage);
        } catch (error) {
            console.error('Error saving chat message:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
