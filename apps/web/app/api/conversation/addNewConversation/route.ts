import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../lib/ConnectDB/connection";
import { conversationModel } from "../../../../models/conversationModel";

ConnectDB();
export const POST = async (req: NextRequest) => {
  try {
    const { senderId, receiverId, message } = await req.json();
    console.log(senderId, receiverId, message);
    if (!senderId || !receiverId || !message)
      return NextResponse.json(
        { success: false, message: "Provide all details !" },
        { status: 403 }
      );
    const newConversation = await conversationModel.create({
      senderId,
      receiverId,
      message,
    });
    if (!newConversation)
      return NextResponse.json(
        { success: false, message: "New Conversation dosn't created !" },
        { status: 403 }
      );
    const newConversationWithPopulate = await conversationModel
      .findById(newConversation._id)
      .populate("senderId")
      .populate("receiverId");

    return NextResponse.json(
      {
        success: true,
        message: "New Conve.. Created Successfully !",
        response: newConversationWithPopulate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Conversation creation failed !" },
      { status: 500 }
    );
  }
};
