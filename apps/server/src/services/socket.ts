import { Server, Socket } from "socket.io";
export interface Ionline {
  socketId: string;
  user: string;
}
export interface Imessages {
  sender: string;
  receiver?: string;
  message: string;
}
export interface Iroom {
  roomId: string;
  roomCreator: string;
  messages?: Imessages[]; //optional
}
let online: Ionline[] = [];
const rooms: Iroom[] = [];

const broadcastOnlineUsers = (io: Server) => {
  const onlineWithUserName = online.filter((user) => user.user.length > 0);
  io.emit("online users", onlineWithUserName);
};
const broadcastChatRooms = (io: Server) => {
  io.emit("chat rooms", rooms);
};

const checkUserExists = (socket: string) =>
  online.find((socketId) => socketId.socketId === socket);
const checkRoomExists = (newRoomId: string) =>
  rooms.find((roomId) => roomId.roomId === newRoomId);
const getUserNameBySocketId = (socket: string) => {
  return online.find((user) => user.socketId === socket)?.user;
};
export const SocketService = () => {
  const io = new Server({
    cors: {
      allowedHeaders: ["*"],
      origin: "*",
    },
  });
  io.on("connect", (socket: Socket) => {
    console.log(`Init Socket Listner, New Socket Connected at ${socket.id}`);
    if (!checkUserExists(socket.id)) {
      online.push({ socketId: socket.id, user: "" });
    }
    //seeting username with socket id whenever user log in
    socket.on("socketUser", ({ socketId, user }) => {
      console.log("first", socketId, user);
      if (user && socketId) {
        online = online.map((element) => {
          const matchSocketId = element.socketId === socketId;
          if (matchSocketId) {
            console.log("m", matchSocketId);
            return { ...element, user };
          }
          return element;
        });
      }
      broadcastOnlineUsers(io);
    });
    //broadcasting online users
    broadcastOnlineUsers(io);
    //broadcasting chat rooms
    broadcastChatRooms(io);
    //listening to private messaging event
    socket.on("privateEvent", ({ senderId, receiverId, message }) => {
      const receiverSocket = online.find(
        (user) => user.user === receiverId
      )?.socketId;
      console.log(receiverSocket, senderId, receiverId, message);
      if (receiverSocket) {
        socket.emit("privateMessaging", {
          senderId,
          receiverId,
          message,
        });
        io.to(receiverSocket).emit("privateMessaging", {
          senderId,
          receiverId,
          message,
        });
      }
    });
    //listening to public messaging event
    socket.on("publicEvent", ({ user, message }) => {
      io.emit("publicMessaging", { sender: user, message });
    });
    socket.on("createPrivateRoom", (roomId) => {
      if (!checkRoomExists(roomId)) {
        rooms.push({ roomId: roomId, roomCreator: socket.id });
        broadcastChatRooms(io);
      }
    });
    socket.on("joinRoom", ({ user, roomId }) => {
      socket.join(roomId);
    });
    socket.on("privateRoomEvent", (privateObject) => {
      io.to(privateObject.room).emit("privateRoomMessaging", {
        sender: privateObject.sender,
        message: privateObject.message,
        room: privateObject.room,
      });
    });
    socket.on("disconnect", () => {
      const disconnectedSocketId = socket.id;
      const index = online.findIndex(
        (idx) => idx.socketId === disconnectedSocketId
      );
      if (index !== -1) {
        online.splice(index, 1);
        broadcastOnlineUsers(io);
      }
      console.log(`user ${disconnectedSocketId}  disconnected`);
      console.log(`After Disconnection Online Users`, online);
    });
    console.log("onlineUsers", online);
    console.log("rooms", rooms);
  });
  console.log("Init SocketService...");
  return io;
};
// export const initListners = () => {
//   SocketService().on("connect", (socket) => {
//     console.log(`New Socket Connected at ${socket.id}`);
//   });
// };
