import { NextRequest, NextResponse } from "next/server";
import userModel from "../../../../../models/userModel";
import { roomModel } from "../../../../../models/roomModel";

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const { userId } = params;
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Provide userId !" },
        { status: 403 }
      );
    const user = await userModel.findById(userId);
    if (!user)
      return NextResponse.json(
        { success: false, message: "User Doesn't exists !" },
        { status: 404 }
      );
    const userRooms = await roomModel
      .find({ roomUsers: userId })
      .populate("roomUsers");
    return NextResponse.json(
      {
        success: true,
        message:
          userRooms.length === 0
            ? "User's Rooms Fetched Successfully BUT Empty !"
            : "User's Rooms Fetched Successfully !",
        response: userRooms,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Fetching User Rooms Failed !" },
      { status: 500 }
    );
  }
};
