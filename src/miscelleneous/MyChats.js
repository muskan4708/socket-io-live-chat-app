import React, { useState, useEffect } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box, Button, useToast, Text, Stack } from "@chakra-ui/react";
import axios from "axios";
import { AddIcon } from "@chakra-ui/icons";
import Chatloading from "./Chatloading";
import getSender from "../config/getSender";
import GroupChatModel from "./GroupChatModel";
import { useDisclosure } from "@chakra-ui/react";

function MyChats({fetchAgain}) {
  const [loggedUser, setLoggedUser] = useState(null);
  const toast = useToast();
  const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure(); // Manage modal state

  // Function to fetch chats
  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`http://localhost:5000/api/chat`, config);
      setChats(data);
      console.log("chats********", data);
    } catch (error) {
      toast({
        title: "Error fetching chats",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  return (
    <>
      <Box
        display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
        flexDir="column"
        alignItems="center"
        p={3}
        bg="white"
        width={{ base: "100%", md: "31%" }}
        borderRadius="lg"
        borderWidth="1px"
        height="calc(100vh - 60px)"
        overflowY="auto"
        position="relative" 
      >
        <Box
          pb={3}
          px={3}
          d="flex"
          justifyContent="space-between"
          alignItems="center"
          w="100%"
          fontSize={{ base: "28px", md: "30px" }}
          fontFamily="work sans"
        >
          <Text>My Chats</Text>
          <GroupChatModel>
          <Button
            onClick={onOpen}  
            d="flex"
            ml="4px"
            gap="5px"
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
            position="absolute"
            top="10px"
            right="10px"
          >
            New Group
          </Button>
          </GroupChatModel>
         
        </Box>
        <Box
          d="flex"
          flexDir="column"
          overflowY="auto"
          w="100%"
          gap={3}  
        >
          {chats ? (
            <Stack spacing={3} w="100%">
              {chats.map((chat) => (
                <Box
                  key={chat._id}  
                  p={3}
                  cursor="pointer"
                  borderWidth="1px"
                  borderRadius="lg"
                  bg={selectedChat === chat ? "#38B2AC" : "E8E8E8"}
                  _hover={{ bg: "gray.200" }}
                  onClick={() => setSelectedChat(chat)}
                >
                  <Text color={selectedChat === chat ? "white" : "black"}>
                    {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                  </Text>
                </Box>
              ))}
            </Stack>
          ) : (
            <Chatloading />
          )}
        </Box>
      </Box>

{/*  
      <GroupChatModel isOpen={isOpen} onClose={onClose} /> */}
    </>
  );
}

export default MyChats;
