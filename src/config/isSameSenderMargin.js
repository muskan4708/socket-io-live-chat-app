import React from 'react';

const isSameSenderMargin = (messages, i, userId) => {
  if (i < messages.length - 1) {
    return messages[i + 1].sender._id === messages[i].sender._id && messages[i].sender._id !== userId ? 0 : 33;
  } else {
    return messages[i].sender._id === userId ? 0 : 33;
  }
};

export default isSameSenderMargin;
