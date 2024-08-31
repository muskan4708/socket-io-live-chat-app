import React from 'react'
import { ChatState } from '../context/ChatProvider'
import { Avatar, Box,Text } from '@chakra-ui/react'

const UserList = ({user,handleFunc}) => {
    //const {user} = ChatState()

  return (
<Box 
    cursor='pointer'
    onClick={handleFunc}
    bg='#E8E8E8' 
     _hover={{
        background:"#3882AC",
        color:"white"
     }}
     w="100%"
     d="flex"
     alignItems='center'
     px={3}
     py={3}
     borderRadius="lg"
     mb="2"
     > 
    
    <Avatar size="sm" mr={2} cursor="pointer" src={user.pic}></Avatar>
    <Text fontSize="sm"> 
        {user.name}
    </Text>
    <Text>
        <b>Email:</b>
        {user.email}
    </Text>

</Box>
  )
}
export default UserList
