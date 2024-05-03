import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../lib/ConnectDB/connection";
import userModel from "../../../../models/userModel";
import { writeFile } from "fs/promises";

await ConnectDB();
export const POST = async (req: NextRequest) => {
  try {
    console.log("called");
    const data = req instanceof Request ? await req.formData() : undefined;
    if (!data)
      return NextResponse.json(
        { success: false, message: "Provide All details" },
        { status: 403 }
      );
    // let img: File | null = null;
    const img = data.get("photo") as File | null;
    const name = data.get("name");
    const email = data.get("email");
    const password = data.get("password");
    // if (imgEntry instanceof File) {
    //   img = imgEntry;
    // }
    if (!name || !email || !password)
      return NextResponse.json(
        { success: false, message: "Provide All details" },
        { status: 403 }
      );
    console.log("first");
    if (img) {
      try {
        const byteData = await img.arrayBuffer();
        const buffer = Buffer.from(byteData);
        const imgName = img.lastModified + "_" + img.name;
        const path = `./public/uploads/${imgName}`;
        await writeFile(path, buffer);
      } catch (error) {
        console.log("imgError", error);
      }
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password.toString(), 10);
    console.log("second");
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      photo: img ? `/uploads/${img.lastModified + "_" + img.name}` : undefined,
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
          "Set-Cookie": `chat_next=${token};Path=/;Secure;HttpOnly:SameSite=Strick;Max-Age=3600000`,
        },
      }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Error Creating NewUser !" },
      { status: 500 }
    );
  }
};
