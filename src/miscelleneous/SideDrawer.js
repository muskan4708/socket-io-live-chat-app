import React, { useState } from "react";
import {
  Box,
  Button,
  Tooltip,
  Text,
  Menu,
  MenuButton,
  Avatar,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import NotificationBadge, { Effect } from "react-notification-badge"
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import getSender from "../config/getSender";
import { ChatState } from "../context/ChatProvider";
import ProfileModel from "./ProfileModel";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Chatloading from "./Chatloading";
import UserList from "./UserList";

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();

  const logoutUser = () => {
    localStorage.removeItem("userInfo");
    navigate("/homePage");
  };

  // Search user API
  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in the search bar",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/user/allUser?search=${search}`,
        config
      );
      setSearchResults(data);
    } catch (error) {
      toast({
        title: "Failed to load the data",
        description: error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Access chat API
  const accessChat = async (userId) => {
    try {
      if (!user || !user.token) {
        throw new Error("User token is missing");
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/chat",
        { userId },
        config
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats([data, ...chats]);
      }

      setSelectedChat(data);
    } catch (error) {
      console.error("Error accessing chat:", error);
      toast({
        title: "Error accessing chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Box
        position="relative"
        bg="white"
        w="100%"
        h="60px"
        p="5px 10px 10px 15px"
        borderWidth="5px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" position="absolute" left="15px" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "inline" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="2xl" fontFamily="Work sans" textAlign="center">
          Talk-A-Tive
        </Text>

        <Box position="absolute" top="0" right="0" mt={2} mr={4}>
          <Menu>
            <MenuButton p={1}>
            <NotificationBadge 
            count={notification.length}
              effect={Effect.Scale}
            />
              <BellIcon fontSize="2xl" />
            </MenuButton>
            <MenuList p={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((item) => item._id !== notif._id));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Messages in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.user)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>

              <MenuDivider />
              <MenuItem onClick={logoutUser}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr="2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>

            {loading ? (
              <Spinner display="flex" ml="auto" />
            ) : (
              searchResults.map((user) => (
                <UserList key={user._id} handleFunc={() => accessChat(user._id)} user={user} />
              ))
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
