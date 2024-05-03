"use client";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { Socket, io } from "socket.io-client";
import { creatRoom, setOnlineUsers } from "./store/socket/socketSlice";
import { cookieAutoLogin, getAllUsers } from "./store/user/userApi";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import { BiCheck, BiCheckDouble } from "react-icons/bi";
import { IoMdSend } from "react-icons/io";
import {
  messaging,
  setPrivateMessagingPartner,
  updateMessagesReadState,
} from "./store/conversation/conversationSlice";
import {
  addNewConversation,
  getUserConversation,
} from "./store/conversation/conversationApi";
import { Iuser, setUserOnlineStatus } from "./store/user/userSlice";
import { getUserFromId } from "../lib/getUserFromId";
import { Console } from "console";

const page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rooms, onlineUsers } = useSelector(
    (state: RootState) => state.socket
  );
  const { user, allUsers, fetchAllUsersStatus, loginStatus } = useSelector(
    (state: RootState) => state.user
  );
  const { messages, privateMessagingPartner } = useSelector(
    (state: RootState) => state.conversation
  );
  const [openMenu, setOpenMenu] = useState<{
    mainMenu: boolean;
    actionMenu: boolean;
  }>({ mainMenu: false, actionMenu: false });
  const autoCheck = useRef<boolean>(false);
  const socket = useRef<Socket | null>(null);
  const socketId = useRef<string>();
  const [message, setMessage] = useState<string>("");
  const [newRoom, setNewRoom] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const check = useRef<boolean>(false);
  const [searchFriends, setSearchFriends] = useState<string>("");
  const [friend, setFriend] = useState<string>("");
  const messageEndref = useRef<HTMLDivElement | null>(null);
  // useEffect(() => {
  //   if (user) {
  //     const conv = async () => {
  //       try {
  //         const req = await fetch(
  //           `/api/conversation/getUserConversation/${user._id}`
  //         );
  //         const data = await req.json();
  //         console.log(data);
  //       } catch (error) {
  //         console.log(error);
  //       }
  //     };
  //     conv();
  //   }
  // }, [user]);
  useEffect(() => {
    if (!autoCheck.current) {
      dispatch(cookieAutoLogin());
      autoCheck.current = true;
    }
  }, []);
  useEffect(() => {
    if (user && loginStatus === "success") {
      // console.log("clicked");
      //   //Emmiting event after Attach CurrentUser with socketId
      socket.current?.emit("socketUser", {
        socketId: socket.current.id,
        user: user._id,
      });
    }
  }, [loginStatus]);
  useEffect(() => {
    if (user && user._id) {
      dispatch(getAllUsers(user._id));
    }
  }, [user]);

  useEffect(() => {
    // socket.current = io("https://chat-monorepo-niq2.onrender.com");
    if (!socket.current) {
      socket.current = io(process.env.SOCKET_SERVER || "http://localhost:5000");
      // console.log(socket.current);
      //getting current socket id
      socket.current.on("connect", () => {
        if (socket.current) {
          socketId.current = socket.current.id;
        }
      });
    }

    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, []);
  useEffect(() => {
    //Listning chat rooms event
    socket.current?.on("chat rooms", (chatRooms) => {
      dispatch(creatRoom(chatRooms));
    });
    //Listning online users event
    socket.current?.on("online users", (ou) => {
      dispatch(setOnlineUsers(ou));
    });

    socket.current?.on(
      "publicMessaging",
      (msgObj: { sender: string; message: string }) => {
        dispatch(messaging(msgObj));
      }
    );
    socket.current?.on("privateRoomMessaging", (obj) => {
      dispatch(messaging(obj));
    });
    const privateMessagingListner = ({
      senderId,
      receiverId,
      read,
      message,
    }: {
      senderId: string;
      receiverId: string;
      read: boolean;
      message: string;
    }) => {
      const populatedSender = getUserFromId(senderId, allUsers);
      const populatedReceiver = getUserFromId(receiverId, allUsers);
      // console.log("Running Count DOWN");
      dispatch(
        messaging({
          _id: Math.floor(Math.random() * 100000),
          senderId: populatedSender,
          receiverId: populatedReceiver,
          read: read,
          message,
        })
      );
    };
    if (allUsers.length > 0) {
      socket.current?.on("privateMessaging", privateMessagingListner);
    }
    return () => {
      if (allUsers.length > 0) {
        socket.current?.off("privateMessaging", privateMessagingListner);
      }
    };
  }, [dispatch, allUsers]);
  useEffect(() => {
    console.log("READCONFIRM USEEFFECT");
    const readConfirmListner = (
      arr: {
        yourId: string;
        myId: string;
      }[]
    ) => {
      console.log("READCONFIRM LISTENED AT CLIENT", arr);
      if (arr.length > 0) {
        dispatch(setPrivateMessagingPartner(arr));
      }
      // const messagesWithUpdateReadState = messages.map(
      //   (msg) => {
      //     console.log(msg.senderId._id, yourId, msg.receiverId?._id, myId);
      //     if (msg.senderId._id === yourId && msg.receiverId?._id === myId) {
      //       return { ...msg, read: true };
      //     }
      //     return msg;
      //   }
      //   // msg.senderId._id === yourId && msg.receiverId?._id === myId
      //   //   ? { ...msg, read: true }
      //   //   : msg
      // );
      // console.log(
      //   privateMessagingPartner,
      //   "msgwrs",
      //   messagesWithUpdateReadState
      // );
      // if (messagesWithUpdateReadState.length > 0) {
      //   dispatch(updateMessagesReadState(messagesWithUpdateReadState));
      // }
    };
    socket.current?.on("readConfirm", readConfirmListner);
    return () => {
      socket.current?.off("readConfirm", readConfirmListner);
    };
  }, [friend]);

  useEffect(() => {
    console.log("READSTATE USEEFFECT");
    const messagesWithUpdateReadState = messages.map(
      (msg) => {
        const matched = privateMessagingPartner.some(
          (el) =>
            el.myId === msg.receiverId?._id && el.yourId === msg.senderId._id
        );
        console.log("matchedmsg", matched);
        if (matched) {
          return { ...msg, read: true };
        }
        return msg;
      }
      // msg.senderId._id === yourId && msg.receiverId?._id === myId
      //   ? { ...msg, read: true }
      //   : msg
    );
    console.log(privateMessagingPartner, "msgwrs", messagesWithUpdateReadState);
    if (messagesWithUpdateReadState.length > 0) {
      dispatch(updateMessagesReadState(messagesWithUpdateReadState));
    }
  }, [privateMessagingPartner]);

  useEffect(() => {
    console.log("ONLINE");
    const messagesWithUpdateOnlineState = allUsers.map((user) => {
      const online = onlineUsers.some((usr) => usr.user === user._id);
      if (online) {
        return { ...user, online: true };
      }
      return user;
    });
    dispatch(setUserOnlineStatus(messagesWithUpdateOnlineState));
  }, [onlineUsers, friend]);

  useEffect(() => {
    messageEndref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  // const handleMessageSend = () => {
  //   if (socket.current && user) {
  //     if (currentRoom) {
  //       socket.current?.emit("privateRoomEvent", {
  //         message,
  //         sender: user.name,
  //         room: currentRoom,
  //       });
  //     } else {
  //       socket.current.emit("publicEvent", { user: user.name, message });
  //     }
  //     setMessage("");
  //   }
  // };
  const handleNewRoom = () => {
    if (socket.current) {
      socket.current.emit("createPrivateRoom", newRoom);
    }
  };
  const handleRoomJoin = (roomId: string) => {
    setCurrentRoom(roomId);
    socket.current?.emit("joinRoom", { user: user?.name, roomId });
  };

  const handleDualConversation = (
    e: React.FormEvent<HTMLFormElement>,
    msg: string
  ) => {
    e.preventDefault();
    if (user?._id && socket.current) {
      const conversation = {
        senderId: user._id,
        receiverId: friend,
        message: msg,
      };
      socket.current.emit("privateEvent", conversation);
      dispatch(addNewConversation(conversation));
      setMessage("");
    }
  };
  const handleFriendClick = (yourId: string | undefined) => {
    if (yourId && user?._id) {
      setFriend(yourId);
      dispatch(getUserConversation(user._id));
      // dispatch(setPrivateMessagingPartner({ myId: user._id, yourId }));
      // console.log("READ EMMITED FROM CLIENT..");
      socket.current?.emit("readMsg", { yourId, myId: user._id });
    }
  };

  // console.log(messages, onlineUsers, user);

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="w-[95%] h-[90%] bg-[#E5E5E5] border-2 shadow-2x flex  rounded-2xl">
        <div
          className={`${friend.length > 0 ? "hidden md:flex" : "flex"} w-full h-full md:w-[35%] px-4 py-10  flex-col gap-3 bg-[#FBFDF6]`}
        >
          <div className="w-full flex flex-wrap justify-between relative ">
            <h2 className="font-semibold md:text-xl flex-1 flex items-center gap-4">
              <Image
                className="rounded-full"
                src={user?.photo ? user.photo : ""}
                alt={user?.photo ? user?.name : ""}
                width={32}
                height={32}
              />
              <span>{user?.name}</span>
              <span>{user?._id}</span>
            </h2>
            <div className="flex-1 flex justify-end">
              <BsThreeDotsVertical
                onClick={() =>
                  setOpenMenu((prev) => ({ ...prev, mainMenu: !prev.mainMenu }))
                }
                className="md:text-xl cursor-pointer transition-all  active:scale-90"
              />
            </div>
            <div
              className={` ${openMenu.mainMenu ? "block" : "hidden"} absolute top-5 z-20 w-full h-96 flex flex-col items-center py-10 md:text-xl rounded-lg bg-teal-50 mt-3`}
            >
              <Link
                href="/login"
                className="transition-all hover:scale-110 active:scale-95"
                onClick={() =>
                  setOpenMenu((prev) => ({ ...prev, mainMenu: !prev.mainMenu }))
                }
              >
                LogOut
              </Link>
            </div>
          </div>
          <div className="w-full relative text-xs md:text-lg">
            <input
              value={searchFriends}
              onChange={(e) => setSearchFriends(e.target.value)}
              className="w-full p-2 rounded-2xl outline-none bg-[#E1ECE1]"
              type="text"
              placeholder="Popular conversa..."
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
          <div className="w-full h-full flex">
            {fetchAllUsersStatus === "pending" && (
              <div className="w-full h-full flex justify-center items-center">
                <div className=" animate-spin w-32 h-32 border-b-2 border-blue-600 rounded-full"></div>
              </div>
            )}
            <div className="w-full flex flex-col  gap-2">
              {allUsers
                .filter(
                  (users) =>
                    users.name !== user?.name &&
                    users.name
                      .toLowerCase()
                      .includes(searchFriends.toLowerCase())
                )
                .map((users) => (
                  <div
                    key={users._id}
                    onClick={() => handleFriendClick(users._id)}
                    className={`${friend === users._id ? "bg-white" : ""} transition-all hover:bg-white cursor-pointer flex gap-4 p-2 items-center  rounded-lg`}
                  >
                    <div className="relative">
                      <Image
                        className={`rounded-full `}
                        src={users.photo ? users.photo : ""}
                        alt={users.name}
                        width={32}
                        height={32}
                      />
                      {onlineUsers.some(
                        (onlineuser) => onlineuser.user === users._id
                      ) && (
                        <div className="w-3 h-3 bg-green-700 rounded-full border-2 border-white absolute -top-1 -right-1"></div>
                      )}
                    </div>
                    <div className=" flex flex-col" key={users._id}>
                      <div className="font-semibold">{users.name}</div>
                      <div className="text-xs">last conversation........</div>
                    </div>
                    <div className="text-sm ml-auto">
                      <div className="">08:39</div>
                      <div className="flex justify-end ">
                        {check ? <BiCheckDouble /> : <BiCheck />}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <div
          className={`${friend.length > 0 ? "w-full" : "hidden"} md:flex md:w-[65%] h-full bg-[#fefbfb]  px-4 py-10 flex-col gap-3`}
        >
          {friend.length > 0 ? (
            <div className="w-full h-full flex flex-col gap-3">
              <h2 className=" w-full h-[15%]">MessageBox</h2>
              <div className="w-full h-[80%] flex flex-col gap-4 border-2 overflow-y-auto p-2">
                {messages
                  .filter(
                    (msg) =>
                      msg?.receiverId?._id === friend ||
                      msg?.senderId?._id === friend
                  )
                  .map((msg) => (
                    <div
                      key={msg._id}
                      ref={messageEndref}
                      className={`${msg.senderId._id === user?._id ? "ml-auto rounded-tl-2xl rounded-bl-2xl" : " mr-auto rounded-tr-2xl rounded-bl-2xl"} bg-[#EBF3E9] flex gap-3 items-center  min-w-[10%] max-w-[60%] p-2 rounded-br-2xl `}
                    >
                      <Image
                        className="rounded-full"
                        src={msg.senderId.photo}
                        alt="{msg.sender.name}"
                        width={32}
                        height={32}
                      />
                      <div className="flex flex-col gap-3">
                        <div className="">{msg.message}</div>
                        <div className="text-xs text-right flex items-center justify-end gap-1">
                          <span>8:99</span>
                          <span>
                            {msg.senderId._id === user?._id ? (
                              msg.read ? (
                                <span className="text-green-800">
                                  <BiCheckDouble />
                                </span>
                              ) : (
                                <BiCheck />
                              )
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="w-full h-[5%] relative">
                <form onSubmit={(e) => handleDualConversation(e, message)}>
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#E1ECE1]"
                    type="text"
                    placeholder="Enter message...."
                  />
                  <button type="submit" className="absolute top-2.5 right-4">
                    <IoMdSend />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              Start Chatting....
            </div>
          )}
        </div>
      </div>
    </div>
    // <div className="flex flex-col gap-2 items-center m-10">
    //   <div className="">
    //     <input
    //       ref={userName}
    //       type="text"
    //       placeholder="Choose your username..."
    //     />
    //     <button
    //       className="border px-2 py-1 transition-all active:scale-95"
    //       onClick={() => {
    //         handleUser();
    //       }}
    //     >
    //       Save
    //     </button>
    //   </div>
    //   <div className="w-full border-2 ">
    //     {user ? (
    //       <div className="flex flex-col gap-2">
    //         <div className="text-center ">Hi, {user.name}</div>
    //         <div className="">
    //           <span className=" px-2">Chat Rooms:</span>
    //           {rooms.length > 0 ? (
    //             rooms?.map((room) => (
    //               <span className="px-1" key={room.roomId}>
    //                 <span
    //                   onClick={() => handleRoomJoin(room.roomId)}
    //                   className="cursor-pointer"
    //                 >
    //                   {room.roomId}
    //                 </span>
    //               </span>
    //             ))
    //           ) : (
    //             <span>No Rooms</span>
    //           )}
    //         </div>
    //         <div className="">
    //           <span className=" px-2">Online Users:</span>
    //           {onlineUsers.length > 0 ? (
    //             onlineUsers?.map((onlineUser) => (
    //               <span className="px-1" key={onlineUser.socketId}>
    //                 <span className="cursor-pointer">{onlineUser.user}</span>
    //               </span>
    //             ))
    //           ) : (
    //             <span>No Users Online</span>
    //           )}
    //         </div>
    //         <div className="">
    //           <input
    //             value={newRoom}
    //             onChange={(e) => setNewRoom(e.target.value)}
    //             type="text"
    //             placeholder="Create Chat Room..."
    //           />
    //           <button
    //             className="border px-2 py-1 transition-all active:scale-95"
    //             onClick={() => {
    //               handleNewRoom();
    //               setNewRoom("");
    //             }}
    //           >
    //             Create
    //           </button>
    //         </div>
    //         <div className="">
    //           <h2>Chat Box :</h2>
    //           <div className="w-full h-96 overflow-y-auto p-4">
    //             {messages.map((msg, i) => (
    //               <div
    //                 key={i}
    //                 className={`flex flex-col ${msg.sender === user.name ? "  " : ""}`}
    //               >
    //                 <div
    //                   className={`${msg.sender === user.name ? " ml-auto bg-slate-100" : "  "}  min-w-36 max-w-[50%] `}
    //                 >
    //                   {currentRoom
    //                     ? msg.room === currentRoom && msg.message
    //                     : msg.message}
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
    //           <div className="">
    //             <input
    //               value={message}
    //               onChange={(e) => setMessage(e.target.value)}
    //               type="text"
    //               placeholder="Enter message..."
    //             />
    //             <button
    //               onClick={() => handleMessageSend()}
    //               className="border px-2 py-1 transition-all active:scale-95"
    //             >
    //               Send
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     ) : (
    //       <div className="w-full h-full flex justify-center items-center">
    //         Choose User Name First :
    //       </div>
    //     )}
    //   </div>
    // </div>
  );
};

export default page;
