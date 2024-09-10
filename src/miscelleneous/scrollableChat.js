import React from "react";
import { ChatState } from "../context/ChatProvider";
import ScrollableFeed from 'react-scrollable-feed';
import { Avatar, Tooltip, Box, Text } from "@chakra-ui/react";
import { isSamesSender } from "../config/isSamesSender";
import isSameSenderMargin from "../config/isSameSenderMargin";
import { isSameUser } from "../config/isSameUser";
import isLastMessage from "../config/isLastMessage";

function ScrollableChat({ messages }) {
  debugger;
  const { user } = ChatState();
 
  console.log("user", user);
console.log("messages",messages)
  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => (
        <Box
          key={m._id}
          display="flex"
          justifyContent={m.sender._id === user._id ? "flex-end" : "flex-start"}
          mb={2}
        >
          {/* Show Tooltip and Avatar if the message is from the same sender or it's the last message */}
          {(isSamesSender(messages, m, i, user._id) || isLastMessage(messages, m, i, user._id)) && (
            <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
              <Avatar mt="7px" ml={1} name={m.sender.name} src={m.sender.pic} />
            </Tooltip>
          )}
          <Box
            bg={m.sender._id === user._id ? "#BEE3F8" : "#B9FBC0"}
            color="black"
            borderRadius="20px"
            p={3}
            maxWidth="75%"
            ml={isSameSenderMargin(messages, i, user._id)}
            mt={isSameUser(messages, m, i, user._id) ? 3 : 10}
            alignSelf={m.sender._id === user._id ? "flex-end" : "flex-start"}
          >
            <Text>{m.content}</Text>
          </Box>
        </Box>
      ))}
    </ScrollableFeed>
  );
}

export default ScrollableChat;
