import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  Text,
  Box,
  IconButton,
  FormControl,
  Input,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import getSender from "../config/getSender";
import getSenderFull from "../config/getSenderFull";
import ProfileModel from "./ProfileModel";
import UpdateGroupChatModel from "./UpdateGroupChatModel";
import axios from "axios";
import ScrollableChat from "./scrollableChat";

const SingleChat = ({ fetchAgain, setfetchAgain }) => {
  const { user, setSelectedChat, selectedChat } = ChatState();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const handleSendClick = async () => {
    if (newMessage.trim()) {
      try {
        setLoading(true);
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        console.log("newMessage", newMessage);
        const { data } = await axios.post(
          `http://localhost:5000/api/message/sendMessage`,
          { chatId: selectedChat._id, content: newMessage },
          config
        );
        console.log("sent Message", data);
        // setNewMessage("");
        // setLoading(false);
      } catch (error) {
        console.error("Error sending message:", error);
        setLoading(false);
      }
    }
  };

  const fetchChat = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
    console.log("newMessage", newMessage);
    const { data } = await axios.get(
      `http://localhost:5000/api/message/${selectedChat._id}`,

      config
    );
    console.log("chats******** of the user", data);
    // setNewMessage(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchChat();
  }, [selectedChat]);
  return (
    <Box display="flex" flexDirection="column" h="100vh" w="100%">
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "18px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            fontFamily="Work Sans"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat(null)}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModel user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModel
                  fetchAgain={fetchAgain}
                  setfetchAgain={setfetchAgain}
                  fetchChat={fetchChat}
                />
              </>
            )}
          </Text>
          <Box
            flex="1"
            display="flex"
            flexDirection="column"
            p={5}
            bg="#E8E8E8"
            position="relative"
            w="100%"
            borderRadius="lg"
            overflowY="auto"
          >
            <Box
              p={1}
              bg="white"
              borderRadius="lg"
              display="flex"
              position="absoulte"
              alignItems="center"
              boxShadow="md"
              marginTop="654"
            >
              {loading ? (
                <Spinner
                  size="xl"
                  w={20}
                  h={20}
                  alignSelf="center"
                  margin="auto"
                />
              ) : (
                <div>
                  <ScrollableChat messages={messages} />
                </div>
              )}
              <FormControl display="flex" onKeyDown={handleSendClick}>
                <Input
                  placeholder="Enter a new message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  flex="1"
                  mr={2}
                />
              </FormControl>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="100vh"
        >
          <Text fontSize="3xl" pb={3} fontFamily="Work Sans">
            Click on a user to start chat
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default SingleChat;
