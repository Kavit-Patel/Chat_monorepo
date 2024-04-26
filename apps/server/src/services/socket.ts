import { Server, Socket } from "socket.io";
export interface Ionline {
  key: string;
  value: string;
}
export interface Imessages {
  socketId: string;
  message: string;
}
export interface Iroom {
  roomId: string;
  roomCreator: string;
  messages?: Imessages[];
}
const online: Ionline[] = [];
const rooms: Iroom[] = [];

const checkUserExists = (socket: string) =>
  online.find((socketId) => socketId.key === socket);
const checkRoomExists = (newRoomId: string) =>
  rooms.find((roomId) => roomId.roomId === newRoomId);
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
      online.push({ key: socket.id, value: "" });
    }
    socket.on("messaging", (msg: string) => {
      // console.log("msg", msg);
      // console.log(socket.id + " says " + msg);
      io.emit("msgCommunicate", { socketId: socket.id, message: msg });
    });
    socket.on("create private room", (roomId) => {
      if (!checkRoomExists(roomId)) {
        rooms.push({ roomId: roomId, roomCreator: socket.id });
      }
      socket.emit("chat rooms", rooms);
    });
    socket.on("private room message", (privateObject) => {
      socket.to(privateObject.currentRoom).emit("private messaging", {
        socketId: privateObject.socketId.current,
        message: privateObject.message,
      });
    });
    socket.on("disconnect", () => {
      const disconnectedSocketId = socket.id;
      const index = online.findIndex((idx) => idx.key === disconnectedSocketId);
      online.splice(index, 1);
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
