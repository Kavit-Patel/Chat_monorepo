import { NextRequest, NextResponse } from "next/server";
import userModel from "../../../../../models/userModel";

export const GET = async (
  req: NextRequest,
  { params }: { params: { userId: string } }
) => {
  try {
    const { userId } = params;
    if (!userId)
      return NextResponse.json(
        { success: false, message: "Provide UserId to fetch All Users" },
        { status: 403 }
      );
    const match = await userModel.findById(userId);
    if (!match)
      return NextResponse.json(
        { success: false, message: "User is invalid !" },
        { status: 403 }
      );
    const users = await userModel.find({});
    console.log(users);
    return NextResponse.json(
      {
        success: true,
        message:
          users.length > 0
            ? "Users fetched successfully !"
            : "Users Fetched but empty",
        response: users,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Fetching All Users Failed",
      },
      { status: 500 }
    );
  }
};
