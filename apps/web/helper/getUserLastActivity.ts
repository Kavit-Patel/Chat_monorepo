import { Imessages } from "../app/store/conversation/conversationSlice";

export const getUserLastActivity = (
  msgArr: Imessages[],
  userId: string | undefined
) => {
  return msgArr.filter((mseg) => mseg.senderId._id === userId).at(-1);
};
