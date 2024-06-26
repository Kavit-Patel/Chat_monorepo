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
  roomUsers: { userId: string }[];
  roomName: string;
  creator: string;
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
  // const onlineWithUserName = online.filter((user) => user.user.length > 0);
  io.emit("online users", online);
};
const broadcastChatRooms = (io: Server) => {
  io.emit("chat rooms", rooms);
};

const checkUserExists = (socket: string) =>
  online.find((socketId) => socketId.socketId === socket);
const checkRoomExists = (userId: string, roomName: string) =>
  rooms.find((room) => room.creator === userId && room.roomName === roomName);
const getUserNameBySocketId = (socket: string) => {
  return online.find((user) => user.socketId === socket)?.user;
};
export const SocketService = () => {
  const io = new Server({
    cors: {
      allowedHeaders: ["*"],
      origin: [
        "https://chat-monorepo-web-six.vercel.app",
        "http://localhost:3000",
      ],
      credentials: true,
    },
  });
  io.on("connect", (socket: Socket) => {
    console.log(`Init Socket Listner, New Socket Connected at ${socket.id}`);
    if (!checkUserExists(socket.id)) {
      online.push({ socketId: socket.id, user: "" });
    }
    //seeting username with socket id whenever user log in
    socket.on("socketUser", ({ socketId, user }) => {
      if (user && socketId) {
        online = online.map((element) => {
          const matchSocketId = element.socketId === socketId;
          if (matchSocketId) {
            return { ...element, user };
          }
          return element;
        });
      }
      broadcastOnlineUsers(io);
    });

    //listening to private messaging event
    socket.on(
      "privateEvent",
      ({ senderId, receiverId, message, createdAt }) => {
        const receiverSocket = online.find(
          (user) => user.user === receiverId
        )?.socketId;
        const partnerListening = privateMessagingPartner.some(
          (el) => el.myId === receiverId && el.yourId === senderId
        );

        socket.emit("privateMessaging", {
          senderId,
          receiverId,
          read: partnerListening ? true : false,
          message,
          createdAt,
        });
        if (receiverSocket) {
          io.to(receiverSocket).emit("privateMessaging", {
            senderId,
            receiverId,
            read: partnerListening ? true : false,
            message,
            createdAt,
          });
        }
      }
    );
    // message read event
    socket.on("readMsg", ({ yourId, myId }) => {
      const matchExists = privateMessagingPartner.find(
        (obj) => obj.myId === myId && obj.yourId === yourId
      );

      if (!matchExists) {
        privateMessagingPartner.push({ yourId, myId });
      }
      privateMessagingPartner = privateMessagingPartner.map((el) =>
        el.myId === myId ? { ...el, yourId } : el
      );

      io.emit("readConfirm", privateMessagingPartner);
    });

    socket.on("liveRooms", ({ roomsArr }) => {
      // roomsArr?.roomUsers?.forEach((el: any) => console.log("ru", el));
      rooms = [...roomsArr];
      broadcastChatRooms(io);
    });

    socket.on("joinRoom", ({ roomMembers, roomId }) => {
      // socket.join(roomId);
      socket.join(roomId);
    });
    //broadcasting online users
    broadcastOnlineUsers(io);
    //broadcasting chat rooms
    broadcastChatRooms(io);
    socket.on("privateRoomEvent", (privateObject) => {
      io.to(privateObject.receiverId).emit("privateRoomMessaging", {
        senderId: privateObject.senderId,
        message: privateObject.message,
        receiverId: privateObject.receiverId,
        createdAt: privateObject.createdAt,
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
    });
  });
  return io;
};
