import React from "react";
import { ChatState } from "../context/ChatProvider";
import ScrollableFeed from 'react-scrollable-feed';
import { isSamesSender } from "../config/isSamesSender";
import { isLastMessage } from "../config/isLastMessage";
import { Avatar, Tooltip, Box, Text } from "@chakra-ui/react";

function ScrollableChat({ messages }) {
  
  const { user } = ChatState();
console.log("messages----------------",messages)
  return (
    <ScrollableFeed>
      {messages && messages.map((m, i) => (
        <div key={m._id} style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
          {/* Show Tooltip and Avatar if the message is from the same sender or it's the last message */}
          {(isSamesSender(messages, m, i, user._id) || isLastMessage(messages, i, user._id)) && (
            <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
              <Avatar name={m.sender.name} src={m.sender.avatar} />
            </Tooltip>
          )}
          <Box
            backgroundColor={m.sender._id === user._id ? "#BEE3F8" : "#F5F5F5"}
            color={m.sender._id === user._id ? "black" : "black"}
            p={3}
            borderRadius="md"
            maxWidth="75%"
            marginLeft={m.sender._id === user._id ? "auto" : "0"}
          >
            <Text>{m.content}</Text>
          </Box>
        </div>
      ))}
    </ScrollableFeed>
  );
}

export default ScrollableChat;
