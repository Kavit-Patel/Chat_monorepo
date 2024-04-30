import { ConnectDB } from "../../../../lib/ConnectDB/connection";
import userModel from "../../../../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

await ConnectDB();
export const POST = async (req: NextRequest) => {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json(
        { success: false, message: "Please Provide all details !" },
        { status: 403 }
      );
    const user = await userModel.findOne({ email });
    if (!user)
      return NextResponse.json(
        { success: false, message: "User Doesn't exits !" },
        { status: 404 }
      );
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json(
        { success: false, message: "Password is incorrect !" },
        { status: 403 }
      );
    // const { password: userPassword, ...userDetailsWithoutPassword } = user;
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || " ");
    if (!token)
      return NextResponse.json(
        { success: false, message: "Token generation failed !" },
        { status: 404 }
      );

    return NextResponse.json(
      {
        success: true,
        message: "User Login Successfully !",
        response: user,
      },
      {
        status: 200,
        headers: {
          "Set-Cookie": `chat_next=${token};Path=/;Secure;HttpOnly:SameSite=Strick;Max-Age=3600000`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Login Failed !" },
      { status: 500 }
    );
  }
};
