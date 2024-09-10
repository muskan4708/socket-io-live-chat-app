import React, { useEffect, useState } from "react";
import { ChatState } from "../context/ChatProvider";
import {
  Text,
  Box,
  IconButton,
  FormControl,
  Input,
  Spinner,
  useToast,
  Button,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import getSender from "../config/getSender";
import getSenderFull from "../config/getSenderFull";
import ProfileModel from "./ProfileModel";
import UpdateGroupChatModel from "./UpdateGroupChatModel";
import axios from "axios";
import io from "socket.io-client";
import ScrollableChat from "./scrollableChat";
import animationData from "../animations/typing.json"
import Lottie from "react-lottie";

const ENDPOINT = "http://localhost:5000/";

var socket, selectedChatCompare;



const SingleChat = ({ fetchAgain, setfetchAgain }) => {
  const { user, setSelectedChat, selectedChat,notification,setNotification } = ChatState();
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();
 
//default optionns for typing handler abination

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  // Initialize socket connection
  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connection", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));
    // Cleanup on component unmount
    return () => {
      socket.disconnect();
      socket.off();
    };
  }, [ENDPOINT, user]);

  console.log("Notifcations********",notification)
  // Handle incoming messages
  useEffect(() => {
    socket.on("message received", (newMessageReceived) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageReceived.chat._id
      ) {
if(!notification.includes(newMessageReceived)){
  setNotification([...notification,newMessageReceived])
  setfetchAgain(!fetchAgain)
}
        // Optionally show a notification here
      } else {
        setMessages((prevMessages) => [...prevMessages, newMessageReceived]);
      }
    });

    // Cleanup on component unmount
    return () => {
      socket.off("message received");
    };
  }, [selectedChatCompare]);


  const typingHandler=(e)=>{
    //typing logic here
    setNewMessage(e.target.value)
    if(!setSocketConnected) return;

    if(!typing){
      setTyping(true)
      socket.emit("typing",selectedChat._id)
    }
//debouncing 
let lastTypingTime = new Date().getTime();
var timerlength =3000
setTimeout(()=>{

  var timenow =new Date().getTime()
  var timeDiff  =timenow -lastTypingTime;

  if(timeDiff>=timerlength && typing){
    socket.emit("stop typing",selectedChat._id)
    setTyping(false)
  }
},timerlength)
  }
  // Send a new message
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
        const { data } = await axios.post(
          `http://localhost:5000/api/message/sendMessage`,
          { chatId: selectedChat._id, content: newMessage },
          config
        );
        setNewMessage("");
        socket.emit("new message", data);
        setMessages([...messages, data]);

        toast({
          title: "Message sent successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      } catch (error) {
        toast({
          title: "Message not sent!",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        console.error("Error sending message:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Fetch chat messages
  const fetchChat = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(
        `http://localhost:5000/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      socket.emit("join chat", selectedChat._id);

      toast({
        title: "Chats fetched!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } catch (error) {
      toast({
        title: "Chats didn't fetch!",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch chat messages and set selected chat for comparison
  useEffect(() => {
    setMessages([]);
    fetchChat();
    selectedChatCompare = selectedChat;
  }, [selectedChat, fetchAgain]);

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
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <ScrollableChat messages={messages} />
            )}
            <FormControl
              display="flex"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendClick();
              }}
              mt={3}
            > {isTyping?(
            <> 
              <Lottie  
               options={defaultOptions}
               width="70"
               style={{marginBottom:15, }}
                />
               
                
                </>):(<></>)}
              <Input
                placeholder="Enter a new message"
                value={newMessage}
                onChange={typingHandler}
                flex="1"
                mr={2}
              />
              <Button
                colorScheme="teal"
                onClick={handleSendClick}
                isLoading={loading}
              >
                Send
              </Button>
            </FormControl>
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
