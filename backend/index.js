import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

// Configurations
import connectDb from "./config/db.js";

// Eagerly load all Mongoose models to prevent MissingSchemaError during populates
import "./model/userModel.js";
import "./model/workspaceModel.js";
import "./model/projectModel.js";
import "./model/taskModel.js";
import "./model/labelModel.js";
import "./model/commentModel.js";
import "./model/messageModel.js";
import "./model/activityLogModel.js";
import "./model/notificationModel.js";
import "./model/documentModel.js";
import "./model/templateModel.js";
import Project from "./model/projectModel.js";

import "./config/passport.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import workspaceRoutes from "./routes/workspaceRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const server = http.createServer(app);

// Socket.io
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
).split(",").map(url => url.trim().replace(/\/$/, ""));

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: missing token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
    socket.userId = decoded.id;
    return next();
  } catch (error) {
    return next(new Error("Authentication error: invalid token"));
  }
});

io.on("connection", (socket) => {
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
  }

  socket.on("project:join", async (projectId) => {
    try {
      const project = await Project.findById(projectId);
      if (!project) return;

      const isOwner = project.owner.toString() === socket.userId;
      const isActiveMember = project.members.some(
        (m) => m.user.toString() === socket.userId && m.status === "active",
      );

      if (!isOwner && !isActiveMember) return;

      socket.join(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit("project:user-joined", {
        projectId,
        userId: socket.userId,
      });
    } catch (error) {
      console.error("project:join error", error.message);
    }
  });

  socket.on("project:leave", (projectId) => {
    socket.leave(`project:${projectId}`);
    socket.to(`project:${projectId}`).emit("project:user-left", {
      projectId,
      userId: socket.userId,
    });
  });

  socket.on("workspace:join", (workspaceId) => {
    socket.join(`workspace:${workspaceId}`);
  });

  socket.on("workspace:leave", (workspaceId) => {
    socket.leave(`workspace:${workspaceId}`);
  });

  socket.on("task:viewing", ({ taskId, projectId }) => {
    socket.to(`project:${projectId}`).emit("task:user-viewing", {
      taskId,
      projectId,
      userId: socket.userId,
    });
  });

  socket.on("task:stop-viewing", ({ taskId, projectId }) => {
    socket.to(`project:${projectId}`).emit("task:user-stop-viewing", {
      taskId,
      projectId,
      userId: socket.userId,
    });
  });

  socket.on("chat:typing", ({ projectId, isTyping }) => {
    socket.to(`project:${projectId}`).emit("chat:typing", {
      projectId,
      userId: socket.userId,
      isTyping: !!isTyping,
    });
  });
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Socket.io injection
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/templates", templateRoutes);

// Basic Route
app.get("/", (req, res) => {
  res.json({ message: "Task Management API is running" });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  connectDb();
});
