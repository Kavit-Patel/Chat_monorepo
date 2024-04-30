import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../lib/ConnectDB/connection";
import userModel from "../../../../models/userModel";
import { writeFile } from "fs/promises";

await ConnectDB();
export const POST = async (req: { formData: () => any } | NextRequest) => {
  try {
    const data = await req.formData();
    const img = data.get("photo");
    const name = data.get("name");
    const email = data.get("email");
    const password = data.get("password");
    if (!name || !email || !password)
      return NextResponse.json(
        { success: false, message: "Provide All details" },
        { status: 403 }
      );
    if (img) {
      const byteData = await img.arrayBuffer();
      const buffer = Buffer.from(byteData);
      const imgName = img.lastModified + "_" + img.name;
      const path = `./public/uploads/${imgName}`;
      await writeFile(path, buffer);
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      photo: img
        ? `./public/uploads/${img.lastModified + "_" + img.name}`
        : undefined,
    });
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || " "
    );

    return NextResponse.json(
      {
        success: true,
        message: "User Created Successfully !",
        response: newUser,
      },
      {
        status: 201,
        headers: {
          "Set-Cookie": `chat_next=${token};Path=/;Secure;HttpOnly:SameSite=Strickt;Max-Age=3600000`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Error Creating NewUser !" },
      { status: 500 }
    );
  }
};
