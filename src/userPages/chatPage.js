import React, { useState } from "react";
import { ChatState } from "../context/ChatProvider";
import { Box, Flex } from "@chakra-ui/react";
import ChatBox from "../miscelleneous/ChatBox";
import MyChats from "../miscelleneous/MyChats";
import SideDrawer from "../miscelleneous/SideDrawer";

const ChatPage = () => {
  const { user } = ChatState();
const [fetchAgain,setfetchAgain] =useState()
  return (
    <div style={{ width: "100%", height: "100vh", position: "relative" }}>
      {user && <SideDrawer />}

      <Flex
        direction={{ base: 'column', md: 'row' }}
        w="100%"
        h="91.5vh"
        p="15px"
        gap={{ base: '0', md: '15px' }}
        overflow="hidden"
      >
        {user && <MyChats  fetchAgain={fetchAgain}/>}

        {user && <ChatBox fetchAgain={fetchAgain} setfetchAgain={setfetchAgain} />}
        </Flex>
    </div>
  );
};

export default ChatPage;
