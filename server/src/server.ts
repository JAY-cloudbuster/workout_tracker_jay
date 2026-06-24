import app from './app';
import config from './config';
import connectDB from './config/database';
import { createServer } from 'http';
import { Server } from 'socket.io';

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const httpServer = createServer(app);

    // Socket.io setup
    const io = new Server(httpServer, {
      cors: {
        origin: config.clientUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // Socket.io connection handling
    io.on('connection', (socket) => {
      console.log(`🔌 Socket connected: ${socket.id}`);

      // Join user-specific room for real-time updates
      socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      });

      // Workout timer sync
      socket.on('timer:start', (data) => {
        socket.to(`user:${data.userId}`).emit('timer:started', data);
      });

      socket.on('timer:stop', (data) => {
        socket.to(`user:${data.userId}`).emit('timer:stopped', data);
      });

      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    // Make io accessible to routes
    app.set('io', io);

    // Start server
    httpServer.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   💪 GymTracker Pro API Server                           ║
║                                                          ║
║   Environment: ${config.env.padEnd(41)}║
║   Port: ${String(config.port).padEnd(49)}║
║   API: /api/${config.apiVersion}${' '.repeat(44 - config.apiVersion.length)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (reason: Error) => {
  console.error('❌ Unhandled Rejection:', reason.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

startServer();
