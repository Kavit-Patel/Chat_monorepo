"use client";
import React, { useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./store/store";
import { Socket, io } from "socket.io-client";
import { creatRoom, messagingToAll } from "./store/socket/socketSlice";

const page = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, rooms } = useSelector((state: RootState) => state.socket);
  const socket = useRef<Socket>();
  const socketId = useRef<string>();
  const [message, setMessage] = useState<string>("");
  const [newRoom, setNewRoom] = useState<string>("");
  const [currentRoom, setCurrentRoom] = useState<string>("");

  useEffect(() => {
    socket.current = io("http://localhost:5000");
    socket.current.on("connect", () => {
      if (socket.current) {
        socketId.current = socket.current.id;
      }
    });
    socket.current.on("chat rooms", (chatRooms) => {
      console.log(chatRooms);
      dispatch(creatRoom(chatRooms));
    });

    socket.current.emit("private room message", {
      message,
      socketId,
      currentRoom,
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [dispatch]);
  useEffect(() => {
    socket.current?.on(
      "msgCommunicate",
      (msgObj: { socketId: string; message: string }) => {
        dispatch(messagingToAll(msgObj));
      }
    );
    socket.current?.on("private messaging", (obj) => {
      dispatch(messagingToAll(obj));
    });
  }, [dispatch]);
  const handleMessageSend = () => {
    if (socket.current) {
      socket.current.emit("messaging", message);
    }
  };
  const handleNewRoom = () => {
    if (socket.current) {
      console.log("first");
      socket.current.emit("create private room", newRoom);
    }
  };
  console.log(rooms);
  return <div className=""></div>;
};

export default page;
