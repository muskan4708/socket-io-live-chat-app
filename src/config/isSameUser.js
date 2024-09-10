export const isSameUser = (messages, m, i, userId) => {
  return i < messages.length - 1 && messages[i + 1].sender._id === m.sender._id && m.sender._id !== userId;
};
