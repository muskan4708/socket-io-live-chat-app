import React from 'react'
import { ChatState } from '../context/ChatProvider'
import { Box } from '@chakra-ui/react'
import SingleChat from './SingleChat'

function ChatBox({fetchAgain,setfetchAgain}) {
  const {selectedChat} = ChatState()
  return (
    <Box
    display={{ base: selectedChat ? 'block' : 'none', md: 'block' }}
    flexDir="column"
    p={3}
    bg="white"
    width={{ base: '100%', md: 'calc(100% - 300px)' }} // Adjust width based on `MyChats` width
    height="100vh"
    borderRadius="12px"
    margin="3px"
    justifyContent="center" // Aligns content vertically
      alignItems="center" 
         
    
  >
   <SingleChat setfetchAgain={setfetchAgain} fetchAgain={setfetchAgain} />
  </Box>
      
  )
}

export default ChatBox
