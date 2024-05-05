import { NextRequest, NextResponse } from "next/server";
import { ConnectDB } from "../../../../lib/ConnectDB/connection";
import { conversationModel } from "../../../../models/conversationModel";
import { roomModel } from "../../../../models/roomModel";

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
    const roomMessaging = await roomModel.findById(receiverId);
    const newConversationWithPopulate = await conversationModel
      .findById(newConversation._id)
      .populate("senderId")
      .populate("receiverId");
    //adding conversation id to room if its room conversation
    if (roomMessaging) {
      const room = await roomModel.findByIdAndUpdate(receiverId, {
        $push: { messages: newConversation._id },
      });
      if (!room)
        return NextResponse.json(
          {
            success: false,
            message:
              "New Conversation dosn't Added to room since room Id doesn't exists !",
            response: newConversationWithPopulate,
          },
          { status: 403 }
        );
    }

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
