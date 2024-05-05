import { NextRequest, NextResponse } from "next/server";
import userModel from "../../../../../models/userModel";
import { roomModel } from "../../../../../models/roomModel";

export const POST = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const { userId } = params;
    const { roomName } = await req.json();
    console.log("rn", roomName);
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Provide userId !" },
        { status: 403 }
      );
    if (!roomName || roomName.length === 0)
      return NextResponse.json(
        { success: false, message: "Provide roomName !" },
        { status: 403 }
      );
    const user = await userModel.findById(userId);
    if (!user)
      return NextResponse.json(
        { success: false, message: "User Doesn't exists !" },
        { status: 404 }
      );
    const exists = await roomModel.findOne({
      creator: userId,
      roomName: roomName,
    });
    if (exists)
      return NextResponse.json(
        { success: false, message: "You have already created this room !" },
        { status: 400 }
      );
    const newRoom = await roomModel.create({
      roomName,
      creator: userId,
      roomUsers: [userId],
    });
    if (!newRoom)
      return NextResponse.json(
        { success: false, message: "room dosn't created !" },
        { status: 500 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "Room created Successfully !",
        response: newRoom,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "New Room Creation Failed !" },
      { status: 500 }
    );
  }
};
