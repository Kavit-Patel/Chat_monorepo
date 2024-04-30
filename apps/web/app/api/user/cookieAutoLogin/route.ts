import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../lib/ConnectDB/connection";
import userModel from "../../../../models/userModel";

// };
await ConnectDB();
export const GET = async (req: NextRequest) => {
  try {
    const cookie = req.cookies.get("chat_next")?.value;
    if (!cookie)
      return NextResponse.json(
        { success: false, message: "Cookie Doesn't exists !" },
        { status: 403 }
      );
    const decode = jwt.verify(cookie, process.env.JWT_SECRET || "");
    let userId: string | undefined = undefined;
    if (typeof decode == "object" && "userId" in decode) {
      userId = decode.userId;
    } else {
      return NextResponse.json(
        { success: false, message: "JWT token invalid !" },
        { status: 403 }
      );
    }
    const user = await userModel.findById(userId).select("-password").lean();
    if (!user)
      return NextResponse.json(
        { success: false, message: "User Doesn't exits !" },
        { status: 404 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "Auto-Login Successfully !",
        response: user,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Cookie Login Failed !" },
      { status: 500 }
    );
  }
};
