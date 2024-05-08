"use client";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { Socket, io } from "socket.io-client";
import { setOnlineUsers } from "./store/socket/socketSlice";
import { cookieAutoLogin, getAllUsers } from "./store/user/userApi";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";
import { FaSearch } from "react-icons/fa";
import Image from "next/image";
import { BiCheck, BiCheckDouble, BiPlusCircle } from "react-icons/bi";
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
import { setUserOnlineStatus } from "./store/user/userSlice";
import { getUserFromId } from "../lib/getUserFromId";
import { useRouter } from "next/navigation";
import { addNewRoom, getUserRooms, joinRoom } from "./store/room/roomApi";
import { getUserLastActivity } from "./helper/getUserLastActivity";

const page = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { onlineUsers } = useSelector((state: RootState) => state.socket);
  const { user, allUsers, fetchAllUsersStatus, loginStatus } = useSelector(
    (state: RootState) => state.user
  );
  const { messages, privateMessagingPartner } = useSelector(
    (state: RootState) => state.conversation
  );
  const { rooms, roomsFetchedStatus, roomCreatedStatus } = useSelector(
    (state: RootState) => state.room
  );
  const [openMenu, setOpenMenu] = useState<{
    friendsDisplay: boolean;
    roomsDisplay: boolean;
    newRoom: boolean;
    roomMenu: boolean;
    addUsersToRoomMenu: boolean;
    roomMembersDisplay: boolean;
    mainMenu: boolean;
    actionMenu: boolean;
  }>({
    friendsDisplay: true,
    roomsDisplay: false,
    newRoom: false,
    roomMenu: false,
    addUsersToRoomMenu: false,
    roomMembersDisplay: false,
    mainMenu: false,
    actionMenu: false,
  });
  const roomIdref = useRef<string>("");
  const autoCheck = useRef<boolean>(false);
  const socket = useRef<Socket | null>(null);
  const socketId = useRef<string>();
  const [message, setMessage] = useState<string>("");
  const [newRoom, setNewRoom] = useState<string>("");
  const [searchFriends, setSearchFriends] = useState<string>("");
  const [searchRoom, setSearchRoom] = useState<string>("");
  const [friendOrRoom, setFriendOrRoom] = useState<string>("");
  const messageEndref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!autoCheck.current) {
      dispatch(cookieAutoLogin());
      autoCheck.current = true;
    }
    if (loginStatus !== "idle" && loginStatus !== "success") {
      router.push("/login");
    }
  }, []);
  // useEffect(() => {
  //   const socketObj = {
  //     socketId: socket.current?.id,
  //     user: user?._id,
  //   };
  //   socket.current?.emit("socketUser", socketObj);
  // }, [loginStatus, user, socket.current]);
  useEffect(() => {
    if (user && user._id) {
      dispatch(getAllUsers(user._id));
      dispatch(getUserRooms(user._id));
      dispatch(
        getUserConversation({
          userId: user._id,
          roomId: "123456789123456789123456",
        })
      );
    }
  }, [user]);

  useEffect(() => {
    if (!socket.current) {
      socket.current = io("https://chat-monorepo-niq2.onrender.com");

      socket.current.on("connect", () => {
        if (socket.current && user) {
          socketId.current = socket.current.id;
          const socketObj = {
            socketId: socket.current.id,
            user: user._id,
          };
          socket.current?.emit("socketUser", socketObj);
        }
      });
    }
    return () => {
      if (socket.current) {
        socket.current.disconnect();
        socket.current = null;
      }
    };
  }, [user]);
  useEffect(() => {
    // Listning chat rooms event
    // socket.current?.on("chat rooms", (chatRooms) => {
    //   console.log("cr", chatRooms);
    // });
    //Listning online users event
    socket.current?.on("online users", (ou) => {
      dispatch(setOnlineUsers(ou));
    });

    // socket.current?.on(
    //   "publicMessaging",
    //   (msgObj: { sender: string; message: string }) => {
    //     console.log("PUBlic listner Listned..");
    //     dispatch(messaging(msgObj));
    //   }
    // );
    const privateRoomMessagingListner = (obj: {
      senderId: string;
      receiverId: string;
      message: string;
      createdAt: string;
    }) => {
      const fullSenderObj = allUsers.find(
        (sender) => sender._id === obj.senderId
      );
      const fullReceiverObj = rooms.find((room) => room._id === obj.receiverId);
      dispatch(
        messaging({
          ...obj,
          senderId: fullSenderObj,
          receiverId: fullReceiverObj,
          _id: Math.floor(Math.random() * 1000000),
        })
      );
    };

    const privateMessagingListner = ({
      senderId,
      receiverId,
      read,
      message,
      createdAt,
    }: {
      senderId: string;
      receiverId: string;
      read: boolean;
      message: string;
      createdAt: string;
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
          createdAt,
        })
      );
    };
    if (allUsers.length > 0) {
      socket.current?.on("privateMessaging", privateMessagingListner);
      socket.current?.on("privateRoomMessaging", privateRoomMessagingListner);
    }
    return () => {
      if (allUsers.length > 0) {
        socket.current?.off("privateMessaging", privateMessagingListner);
        socket.current?.off(
          "privateRoomMessaging",
          privateRoomMessagingListner
        );
      }
    };
  }, [dispatch, allUsers, rooms]);
  useEffect(() => {
    // console.log("READCONFIRM USEEFFECT");
    const readConfirmListner = (
      arr: {
        yourId: string;
        myId: string;
      }[]
    ) => {
      // console.log("READCONFIRM LISTENED AT CLIENT", arr);
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
  }, [friendOrRoom]);

  useEffect(() => {
    // console.log("READSTATE USEEFFECT");
    const messagesWithUpdateReadState = messages.map(
      (msg) => {
        const matched = privateMessagingPartner.some(
          (el) =>
            el.myId === msg?.receiverId?._id && el.yourId === msg.senderId._id
        );
        // console.log("matchedmsg", matched);
        if (matched) {
          return { ...msg, read: true };
        }
        return msg;
      }
      // msg.senderId._id === yourId && msg.receiverId?._id === myId
      //   ? { ...msg, read: true }
      //   : msg
    );
    // console.log(privateMessagingPartner, "msgwrs", messagesWithUpdateReadState);
    if (messagesWithUpdateReadState.length > 0) {
      dispatch(updateMessagesReadState(messagesWithUpdateReadState));
    }
  }, [privateMessagingPartner]);

  useEffect(() => {
    // console.log("ONLINE");
    const messagesWithUpdateOnlineState = allUsers.map((user) => {
      const online = onlineUsers.some((usr) => usr.user === user._id);
      if (online) {
        return { ...user, online: true };
      }
      return user;
    });
    dispatch(setUserOnlineStatus(messagesWithUpdateOnlineState));
  }, [onlineUsers, friendOrRoom]);

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
    setOpenMenu((prev) => ({
      ...prev,
      newRoom: !prev.newRoom,
      mainMenu: !prev.mainMenu,
    }));
    if (newRoom.length > 2 && user?._id) {
      console.log(newRoom);
      dispatch(addNewRoom({ userId: user._id, roomName: newRoom }));
    }
  };
  useEffect(() => {
    if (
      (roomCreatedStatus === "success" ||
        loginStatus === "success" ||
        roomsFetchedStatus === "success") &&
      socket.current
    ) {
      console.log("insidelive", rooms);
      socket.current.emit("liveRooms", { roomsArr: rooms });
      socket.current.on("chat rooms", (chatRooms) => {
        console.log("cr", chatRooms);
      });
    }
    return () => {
      socket.current?.off("liveRooms", () => rooms);
    };
  }, [roomCreatedStatus, loginStatus, roomsFetchedStatus]);
  // const handleRoomJoin = (roomId: string) => {
  //   setCurrentRoom(roomId);
  //   // socket.current?.emit("joinRoom", { user: user?.name, roomId });
  // };

  const handleDualConversation = (
    e: React.FormEvent<HTMLFormElement>,
    msg: string
  ) => {
    e.preventDefault();
    if (user?._id && socket.current) {
      const conversation = {
        senderId: user._id,
        receiverId: friendOrRoom,
        message: msg,
        createdAt: new Date().toISOString(),
      };
      socket.current.emit("privateEvent", conversation);
      socket.current.emit("privateRoomEvent", conversation);
      dispatch(addNewConversation(conversation));
      setMessage("");
    }
  };
  const handleFriendOrRoomClick = (yourId: string | undefined) => {
    if (yourId && user?._id) {
      setFriendOrRoom(yourId);
      dispatch(getUserConversation({ userId: user._id, roomId: yourId }));
      // dispatch(setPrivateMessagingPartner({ myId: user._id, yourId }));
      // console.log("READ EMMITED FROM CLIENT..");
      socket.current?.emit("readMsg", { yourId, myId: user._id });
      const roomMembers = rooms
        .filter((room) => room._id === yourId)
        .map((members) => members.roomUsers);
      socket.current?.emit("joinRoom", {
        roomMembers: roomMembers,
        roomId: yourId,
      });
    }
  };

  console.log(messages, rooms, openMenu.roomMembersDisplay);

  return (
    <div className="w-full h-[calc(100vh-1rem)] flex justify-center items-center">
      <div className="w-[95%] h-[90%] bg-[#E5E5E5] border-2 shadow-2x flex  rounded-2xl">
        <div
          className={`${friendOrRoom.length > 0 ? "hidden md:flex" : "flex"} w-full h-full md:w-[35%] px-4 py-10  flex-col gap-3 bg-[#FBFDF6]`}
        >
          <div className="w-full flex flex-wrap justify-between relative ">
            <h2 className="font-semibold md:text-xl flex-1 flex items-center gap-4">
              <Image
                className="rounded-full"
                src={user?.photo ? user.photo : "/uploads/person.png"}
                alt={user?.name?.slice(0, 1) || "A"}
                width={32}
                height={32}
              />
              <span>{user?.name}</span>
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
              <div className="">
                <button
                  className={`${!openMenu.newRoom ? "block" : "hidden"} transition-all hover:scale-110 active:scale-95`}
                  onClick={() =>
                    setOpenMenu((prev) => ({ ...prev, newRoom: !prev.newRoom }))
                  }
                >
                  CreateNewRoom
                </button>
                <div
                  className={`${openMenu.newRoom ? "block" : "hidden"} flex justify-center items-center gap-2`}
                >
                  <input
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    type="text"
                    placeholder="Choose Room Name atleast 3 char..."
                    className="outline-none px-2 py-1 rounded-md"
                  />
                  <button
                    onClick={() => handleNewRoom()}
                    className="border px-3 py-1.5 rounded-md transition-all bg-green-300 hover:bg-green-600 active:scale-95"
                  >
                    Create
                  </button>
                </div>
              </div>

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
              value={openMenu.friendsDisplay ? searchFriends : searchRoom}
              onChange={
                openMenu.friendsDisplay
                  ? (e) => setSearchFriends(e.target.value)
                  : (e) => setSearchRoom(e.target.value)
              }
              className="w-full p-2 rounded-2xl outline-none bg-[#E1ECE1]"
              type="text"
              placeholder="Popular conversa..."
            />
            <FaSearch className="absolute right-3 top-3 text-gray-500" />
          </div>
          <div className="w-full h-full">
            <div className="flex ">
              <div
                onClick={() => {
                  setSearchRoom("");
                  setOpenMenu((prev) => ({
                    ...prev,
                    friendsDisplay: true,
                    roomsDisplay: false,
                  }));
                }}
                className={`${openMenu.friendsDisplay ? "border-t-2 border-l-2 border-r-2" : "border-b-2"} flex-1 px-2 p-2 cursor-pointer transition-all active:scale-95`}
              >
                Your Friends
              </div>
              <div
                onClick={() => {
                  setSearchFriends("");
                  setOpenMenu((prev) => ({
                    ...prev,
                    friendsDisplay: false,
                    roomsDisplay: true,
                  }));
                }}
                className={`${openMenu.roomsDisplay ? "border-l-2 border-r-2 border-t-2" : "border-b-2"} flex-1 px-2 p-2 cursor-pointer transition-all active:scale-95`}
              >
                Rooms
              </div>
            </div>
            {/* //all Users Display */}
            <div
              className={`${openMenu.friendsDisplay ? "flex" : "hidden"} w-full h-full`}
            >
              {fetchAllUsersStatus === "pending" && (
                <div className="w-full h-full flex justify-center items-center">
                  <div className=" animate-spin w-32 h-32 border-b-2 border-blue-600 rounded-full"></div>
                </div>
              )}
              <div className="w-full h-[98%] flex flex-col  gap-2 border-b-2 border-l-2 border-r-2">
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
                      onClick={() => handleFriendOrRoomClick(users._id)}
                      className={`${friendOrRoom === users._id ? "bg-white" : ""} transition-all hover:bg-white cursor-pointer flex gap-4 p-2 items-center  rounded-lg`}
                    >
                      <div className="relative">
                        <Image
                          className={`rounded-full `}
                          src={
                            users.photo ? users.photo : "/uploads/person.png"
                          }
                          alt={users?.name?.slice(0, 1)}
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
                        <div className="font-semibold ">{users.name}</div>
                        <div className="text-xs w-[65%]  text-nowrap">
                          {(() => {
                            const lastMsg = getUserLastActivity(
                              messages,
                              users._id
                            );
                            return lastMsg?.message
                              ? lastMsg.message.slice(0, 20) + "..."
                              : "";
                          })()}
                        </div>
                      </div>
                      <div className="text-sm ml-auto">
                        <div className="text-xs">
                          {(() => {
                            const time = getUserLastActivity(
                              messages,
                              users._id
                            );
                            return time
                              ? new Date(time.createdAt).toLocaleTimeString(
                                  "en-us",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false,
                                  }
                                )
                              : "";
                          })()}
                        </div>
                        <div className="flex justify-end ">
                          {(() => {
                            const checked = getUserLastActivity(
                              messages,
                              users._id
                            );
                            return checked ? (
                              checked.read ? (
                                <BiCheckDouble className="text-green-800" />
                              ) : (
                                <BiCheck />
                              )
                            ) : (
                              ""
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {/* //user room Display */}
            <div
              className={`${openMenu.roomsDisplay ? "flex" : "hidden"} w-full h-full flex flex-col items-center`}
            >
              {roomsFetchedStatus === "pending" && (
                <div className="w-full h-full flex justify-center items-center">
                  <div className=" animate-spin w-32 h-32 border-b-2 border-blue-600 rounded-full"></div>
                </div>
              )}
              <div className="w-full h-full flex flex-col  gap-2 border-b-2 border-l-2 border-r-2 pt-2">
                {rooms
                  .filter((room) =>
                    room.roomName
                      .toLowerCase()
                      .includes(searchRoom.toLowerCase())
                  )
                  .map((room) => (
                    <div
                      key={room._id}
                      onClick={() => handleFriendOrRoomClick(room._id)}
                      className="w-full flex justify-center font-semibold"
                    >
                      <div
                        className={`${friendOrRoom === room._id ? "bg-white" : ""} transition-all hover:bg-white w-full  p-2  rounded-lg`}
                      >
                        <div className="relative  cursor-pointer w-full flex justify-between">
                          <span>{room.roomName}</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              roomIdref.current = room._id || "";
                              setOpenMenu((prev) => ({
                                ...prev,
                                roomMenu: !prev.roomMenu,
                              }));
                            }}
                            className="w-12 text-center"
                          >
                            <BsThreeDotsVertical className="w-full text-center" />
                          </span>
                          <div
                            className={`${openMenu.roomMenu && roomIdref.current === room._id ? "flex" : "hidden"} w-full h-80 absolute top-6 rounded-xl pl-3 z-40 bg-[#f6f8f6] border-2 py-4 flex-col gap-3`}
                          >
                            <div className="w-full">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenu((prev) => ({
                                    ...prev,
                                    addUsersToRoomMenu:
                                      !prev.addUsersToRoomMenu,
                                  }));
                                }}
                                className=" cursor-pointer"
                              >
                                Add To Group
                              </div>
                              <div
                                className={`${openMenu.addUsersToRoomMenu ? "flex" : "hidden"} w-full py-2 bg-white flex-col gap-2 items-center overflow-y-auto `}
                              >
                                {allUsers
                                  .filter(
                                    (users) =>
                                      !room.roomUsers.some(
                                        (el) => el._id === users._id
                                      )
                                  )
                                  .map((users) => (
                                    <div
                                      key={users._id}
                                      className="w-full text-center transition-all hover:bg-slate-100 active:scale-95 flex justify-center items-center py-1"
                                    >
                                      <div className="w-[40%] flex justify-start gap-5">
                                        <div className="relative">
                                          <div className="w-6 h-6 text-center">
                                            <Image
                                              className="rounded-full object-cover"
                                              src={
                                                users.photo ||
                                                "/uploads/person.png"
                                              }
                                              alt={users.name.slice(0, 1)}
                                              width={24}
                                              height={24}
                                            />
                                          </div>
                                          {onlineUsers.some(
                                            (online) =>
                                              online.user === users._id
                                          ) && (
                                            <div className="w-2.5 h-2.5 bg-green-800 rounded-full border-2 border-white absolute top-0 -right-2"></div>
                                          )}
                                        </div>
                                        <span className="">{users.name}</span>
                                      </div>
                                      <span
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (room._id && users._id)
                                            dispatch(
                                              joinRoom({
                                                roomId: room._id,
                                                userId: users._id,
                                              })
                                            );
                                        }}
                                      >
                                        <BiPlusCircle className="rounded-full cursor-pointer text-white bg-green-600 transition-all hover:bg-green-800 active:scale-95" />
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu((prev) => ({
                                  ...prev,
                                  roomMembersDisplay: !prev.roomMembersDisplay,
                                }));
                              }}
                              className="cursor-pointer"
                            >
                              See Group Members
                            </div>
                            <div
                              className={`${openMenu.roomMembersDisplay ? "flex" : "hidden"} flex-col justify-center items-center gap-4 w-full h-36 overflow-y-auto`}
                            >
                              {room.roomUsers.length > 0 &&
                                room.roomUsers.map((roomuser) => (
                                  <div
                                    key={roomuser._id}
                                    className="w-[50%] flex justify-start gap-5"
                                  >
                                    <div className="relative">
                                      <div className=" w-6 h-6 text-center">
                                        <Image
                                          className="rounded-full object-cover"
                                          src={
                                            roomuser?.photo ||
                                            "/uploads/person.png"
                                          }
                                          alt={roomuser?.name?.slice(0, 1)}
                                          width={24}
                                          height={24}
                                        />
                                      </div>

                                      {onlineUsers.some(
                                        (online) => online.user === roomuser._id
                                      ) && (
                                        <div className="  w-2.5 h-2.5 bg-green-800 rounded-full border-2 border-white absolute top-0 -right-2"></div>
                                      )}
                                    </div>
                                    <span>{roomuser?.name}</span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${friendOrRoom.length > 0 ? "w-full" : "hidden"} md:flex md:w-[65%] h-full bg-[#fefbfb]  px-4 py-10 flex-col gap-3`}
        >
          {friendOrRoom.length > 0 ? (
            <div className="w-full h-full flex flex-col gap-3">
              <h2 className=" w-full h-[20%] flex items-center gap-3 ">
                {(() => {
                  const receiver = allUsers.find(
                    (usr) => usr._id === friendOrRoom
                  );
                  if (receiver) {
                    return (
                      <>
                        <div className="text-center">
                          <Image
                            className="rounded-full"
                            src={receiver.photo}
                            alt={receiver.name.slice(0, 1)}
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="flex flex-col">
                          <div className="">{receiver.name}</div>
                          <div className="text-xs">
                            {onlineUsers.some(
                              (online) => online.user === receiver._id
                            )
                              ? "online"
                              : `offline`}
                          </div>
                        </div>
                      </>
                    );
                  } else {
                    return (
                      <div className=" font-sans">
                        <span>Room :- </span>
                        {
                          rooms.find(
                            (currentRoom) => currentRoom._id === friendOrRoom
                          )?.roomName
                        }
                      </div>
                    );
                  }
                })()}
              </h2>
              <div className="w-full h-[75%] flex flex-col gap-4 border-2 overflow-y-auto p-2">
                {messages
                  .filter(
                    (msg) =>
                      msg?.receiverId?._id === friendOrRoom ||
                      msg?.senderId?._id === friendOrRoom
                  )
                  .map((msg) => (
                    <div
                      key={msg._id}
                      ref={messageEndref}
                      className={`${msg.senderId._id === user?._id ? "ml-auto rounded-tl-2xl rounded-bl-2xl" : " mr-auto rounded-tr-2xl rounded-bl-2xl"} bg-[#EBF3E9] flex gap-3 items-center  min-w-[10%] max-w-[60%] p-2 rounded-br-2xl `}
                    >
                      <Image
                        className="rounded-full object-cover"
                        src={msg.senderId.photo || "/uploads/person.png"}
                        alt={msg?.senderId?.name?.slice(0, 1) || "A"}
                        width={32}
                        height={32}
                      />
                      <div className="flex flex-col gap-3">
                        <div className="">{msg.message}</div>
                        <div className="text-xs text-right flex items-center justify-end gap-1">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "en-us",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                          </span>
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
