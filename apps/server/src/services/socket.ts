import { Server, Socket } from "socket.io";
export interface Ionline {
  socketId: string;
  user: string;
}
export interface Imessages {
  _id?: string;
  senderId: string;
  receiverId?: string;
  message: string;
  read: boolean;
  room?: string | null;
}
export interface Iroom {
  _id?: string;
  roomName: string;
  roomCreator: string;
  messages?: Imessages[]; //optional
}
export interface Iprivate {
  myId: string;
  yourId: string;
}
let online: Ionline[] = [];
let rooms: Iroom[] = [];
let privateMessagingPartner: Iprivate[] = [];

const broadcastOnlineUsers = (io: Server) => {
  const onlineWithUserName = online.filter((user) => user.user.length > 0);
  io.emit("online users", onlineWithUserName);
};
const broadcastChatRooms = (io: Server) => {
  io.emit("chat rooms", rooms);
};

const checkUserExists = (socket: string) =>
  online.find((socketId) => socketId.socketId === socket);
const checkRoomExists = (creator: string) =>
  rooms.find((room) => room.roomCreator === creator);
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
      // console.log("first", socketId, user);
      if (user && socketId) {
        online = online.map((element) => {
          const matchSocketId = element.socketId === socketId;
          if (matchSocketId) {
            // console.log("m", matchSocketId);
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
      const partnerListening = privateMessagingPartner.some(
        (el) => el.myId === receiverId && el.yourId === senderId
      );
      console.log(
        receiverSocket,
        senderId,
        receiverId,
        message,
        partnerListening
      );
      socket.emit("privateMessaging", {
        senderId,
        receiverId,
        read: partnerListening ? true : false,
        message,
      });
      if (receiverSocket) {
        io.to(receiverSocket).emit("privateMessaging", {
          senderId,
          receiverId,
          read: partnerListening ? true : false,
          message,
        });
      }
    });
    // message read event
    socket.on("readMsg", ({ yourId, myId }) => {
      const matchExists = privateMessagingPartner.find(
        (obj) => obj.myId === myId && obj.yourId === yourId
      );

      console.log(matchExists, "mexist");
      if (!matchExists) {
        privateMessagingPartner.push({ yourId, myId });
      }
      privateMessagingPartner = privateMessagingPartner.map((el) =>
        el.myId === myId ? { ...el, yourId } : el
      );

      console.log(privateMessagingPartner, "newprivatempadded");
      io.emit("readConfirm", privateMessagingPartner);
    });
    //listening to public messaging event
    socket.on("publicEvent", ({ user, message }) => {
      io.emit("publicMessaging", { sender: user, message });
    });
    socket.on("createPrivateRoom", ({ roomId, roomName, creator }) => {
      if (!checkRoomExists(creator)) {
        rooms.push({ _id: roomId, roomName: roomName, roomCreator: creator });
        broadcastChatRooms(io);
      }
    });
    socket.on("joinRoom", ({ user, roomId }) => {
      socket.join(roomId);
    });
    socket.on("privateRoomEvent", (privateObject) => {
      io.to(privateObject.room).emit("privateRoomMessaging", {
        senderId: privateObject.sender,
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
        const userId = online[index].user;
        const ppIndex = privateMessagingPartner.findIndex(
          (idx) => idx.myId === userId
        );
        privateMessagingPartner.splice(ppIndex, 1);
        online.splice(index, 1);
        broadcastOnlineUsers(io);
      }
      // console.log(`user ${disconnectedSocketId}  disconnected`);
      // console.log(`After Disconnection Online Users`, online);
    });
    console.log("onlineUsers", online);
    console.log("rooms", rooms);
    console.log("privateMessagingPartner", privateMessagingPartner);
  });
  console.log("Init SocketService...");
  return io;
};
// export const initListners = () => {
//   SocketService().on("connect", (socket) => {
//     console.log(`New Socket Connected at ${socket.id}`);
//   });
// };
