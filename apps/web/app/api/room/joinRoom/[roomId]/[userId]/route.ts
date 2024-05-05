import { NextRequest, NextResponse } from "next/server";
import { roomModel } from "../../../../../../models/roomModel";

export const GET = async (
  req: NextRequest,
  { params }: { params: { roomId: string; userId: string } }
) => {
  try {
    const { roomId, userId } = params;
    if (!roomId || !userId)
      return NextResponse.json(
        { success: false, message: "Provide all details !" },
        { status: 403 }
      );
    const updatedRoom = await roomModel
      .findByIdAndUpdate(
        roomId,
        { $push: { roomUsers: userId } },
        { new: true }
      )
      .populate("roomUsers");
    if (!updatedRoom)
      return NextResponse.json(
        { success: false, message: "room joining failed !" },
        { status: 500 }
      );
    return NextResponse.json(
      {
        success: true,
        message: "Room Joining Successfull !",
        response: updatedRoom,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Room Joining Failed !" },
      { status: 500 }
    );
  }
};
