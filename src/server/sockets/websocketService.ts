import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { authenticate } from '@/server/middleware/auth';
import { logger } from '@/server/utils/logger';
import { aiService } from '@/server/services';

export class WebSocketService {
  private io: SocketIOServer;

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST'],
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware for WebSocket
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Here you would verify the token similar to HTTP middleware
        // For simplicity, we'll skip actual token verification in this example
        socket.data.userId = 'user-id'; // This would come from token verification
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id}`);

      // Join user-specific room
      const userId = socket.data.userId;
      socket.join(`user:${userId}`);

      // Handle interview-related events
      socket.on('join-interview', (interviewId) => {
        socket.join(`interview:${interviewId}`);
        logger.info(`User ${userId} joined interview ${interviewId}`);
      });

      socket.on('leave-interview', (interviewId) => {
        socket.leave(`interview:${interviewId}`);
        logger.info(`User ${userId} left interview ${interviewId}`);
      });

      // Handle voice/chat messages
      socket.on('voice-data', async (data) => {
        try {
          const { interviewId, audioData, language } = data;
          
          // Process voice data (speech-to-text)
          const transcript = await this.processVoiceData(audioData, language);
          
          // Generate AI response
          const aiResponse = await aiService.generateResponse({
            prompt: `As an interviewer, respond to this candidate answer: ${transcript}`,
            temperature: 0.7,
            maxTokens: 300,
          });

          // Send response back to the interview room
          this.io.to(`interview:${interviewId}`).emit('ai-response', {
            transcript,
            response: aiResponse.response,
            timestamp: Date.now(),
          });

        } catch (error) {
          logger.error('Voice data processing error:', error);
          socket.emit('error', { message: 'Failed to process voice data' });
        }
      });

      // Handle chat messages
      socket.on('chat-message', async (data) => {
        try {
          const { interviewId, message, type = 'text' } = data;
          
          // Broadcast message to interview room
          this.io.to(`interview:${interviewId}`).emit('chat-message', {
            userId,
            message,
            type,
            timestamp: Date.now(),
          });

          // Generate AI response if needed
          if (type === 'candidate-message') {
            const aiResponse = await aiService.generateResponse({
              prompt: `As an interviewer, respond to this candidate message: ${message}`,
              temperature: 0.7,
              maxTokens: 300,
            });

            setTimeout(() => {
              this.io.to(`interview:${interviewId}`).emit('ai-message', {
                message: aiResponse.response,
                timestamp: Date.now(),
              });
            }, 1000); // Simulate thinking time
          }

        } catch (error) {
          logger.error('Chat message processing error:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      // Handle code collaboration
      socket.on('code-change', (data) => {
        const { interviewId, code, language } = data;
        
        // Broadcast code changes to interview room
        socket.to(`interview:${interviewId}`).emit('code-change', {
          userId,
          code,
          language,
          timestamp: Date.now(),
        });
      });

      // Handle interview events
      socket.on('interview-event', (data) => {
        const { interviewId, event, payload } = data;
        
        // Broadcast interview events
        this.io.to(`interview:${interviewId}`).emit('interview-event', {
          userId,
          event,
          payload,
          timestamp: Date.now(),
        });
      });

      // Handle typing indicators
      socket.on('typing-start', (data) => {
        const { interviewId } = data;
        socket.to(`interview:${interviewId}`).emit('typing-start', { userId });
      });

      socket.on('typing-stop', (data) => {
        const { interviewId } = data;
        socket.to(`interview:${interviewId}`).emit('typing-stop', { userId });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`WebSocket client disconnected: ${socket.id}`);
        
        // Notify interview room if user was in an interview
        // This could be used to handle automatic interview pausing
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`WebSocket error for ${socket.id}:`, error);
      });
    });
  }

  private async processVoiceData(audioData: Buffer, language: string = 'zh-CN'): Promise<string> {
    try {
      // In a real implementation, you would use a speech-to-text service
      // like Google Cloud Speech-to-Text, Azure Speech Services, or OpenAI Whisper
      
      // For now, return a mock transcript
      logger.debug(`Processing voice data in ${language}, size: ${audioData.length} bytes`);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return "这是语音转文字的示例文本。"; // Mock transcript
      
      // Real implementation would be something like:
      // const transcription = await speechToTextService.transcribe(audioData, language);
      // return transcription.text;
      
    } catch (error) {
      logger.error('Voice processing error:', error);
      throw new Error('Failed to process voice data');
    }
  }

  // Public methods for external use
  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public sendToInterview(interviewId: string, event: string, data: any): void {
    this.io.to(`interview:${interviewId}`).emit(event, data);
  }

  public broadcast(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public getConnectedUsers(): number {
    return this.io.engine.clientsCount;
  }

  public getInterviewParticipants(interviewId: string): number {
    const room = this.io.sockets.adapter.rooms.get(`interview:${interviewId}`);
    return room ? room.size : 0;
  }
}

export let wsService: WebSocketService;

export const initializeWebSocket = (server: HTTPServer): WebSocketService => {
  wsService = new WebSocketService(server);
  return wsService;
};