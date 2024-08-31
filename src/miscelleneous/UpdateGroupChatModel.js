import { useDisclosure } from "@chakra-ui/hooks";
import { ViewIcon } from "@chakra-ui/icons";
import {
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Box,
  Button,
  ModalCloseButton,
  useToast,
  FormControl,
  Input,
  Spinner,
  Text,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ChatState } from "../context/ChatProvider";
import UserBadge from "./userBadge";
import UserList from "./UserList";

const UpdateGroupChatModel = ({ fetchAgain, setFetchAgain, fetchChat }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { selectedChat, setSelectedChat, user } = ChatState();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const [renameLoading, setRenameLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (selectedChat) {
      setSelectedUsers(selectedChat.users || []);
      setGroupChatName(selectedChat.chatName || "");
    }
  }, [selectedChat]);

  // Handle remove user
  const handleRemove = async (userToRemove) => {
    if (selectedChat.groupAdmin._id == user._id && user._id != user._id) {
      toast({
        title: "Only admins can add users",
        status: "success",
        isClosable: true,
        duration: 5000,
        position: "top-right",
      });
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        "http://localhost:5000/api/chat/groupremove",
        {
          chatId: selectedChat._id, // Chat ID to remove user from
          userId: userToRemove._id, // User ID to be removed
        },
        config
      );

      //the user could not see the chat if he left the grp
      user._id === user._id ? setSelectedChat() : setSelectedChat(data);
      fetchChat();
      setFetchAgain(!fetchAgain);
      setLoading(false);
      // Update state after successful removal
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((user) => user._id !== userToRemove._id)
      );

      // Display success message
      toast({
        title: "User Removed",
        status: "success",
        isClosable: true,
        duration: 5000,
        position: "top-right",
      });
    } catch (error) {
      // Handle errors and display error message
      toast({
        title: "Failed to remove user",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle search user
  const handleSearch = async (query) => {
    setSearch(query);
    if (!query) {
      setSearchResult([]);
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
        `http://localhost:5000/api/user/allUser?search=${query}`,
        config
      );
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Failed to load the data",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle rename group
  const handleRename = async () => {
    if (!groupChatName.trim()) {
      toast({
        title: "Chat name cannot be empty",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setRenameLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/chat/rename`,
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data);
      toast({
        title: "Chat Renamed",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "Failed to rename chat",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setRenameLoading(false);
    }
  };

  const handleAddUser = async (userToAdd) => {
    // Ensure selectedChat and selectedChat.users are defined
    if (!selectedChat || !selectedChat.users) {
      console.error("selectedChat or selectedChat.users is not defined");
      return;
    }

    // Check if user is already in the group
    const isUserInGroup = selectedChat.users.some(
      (user) => user._id === userToAdd._id
    );

    if (isUserInGroup) {
      toast({
        title: "User already in the group",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
      console.log("selectedUsers", selectedChat.users);
      return;
    }

    // Check if the current user is the admin
    if (selectedChat.groupAdmin._id !== user._id) {
      toast({
        title: "Only the admin can add users",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/chat/groupadd`,
        {
          chatId: selectedChat._id,
          userId: userToAdd._id,
        },
        config
      );

      // Update the state with the new user added
      setSelectedUsers((prevSelectedUsers) => {
        const isUserAlreadyAdded = prevSelectedUsers.some(
          (user) => user._id === userToAdd._id
        );
        if (isUserAlreadyAdded) {
          return prevSelectedUsers;
        }
        return [...prevSelectedUsers, userToAdd];
      });

      toast({
        title: "User Added",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      console.log("Added User", data);
    } catch (error) {
      toast({
        title: "Failed to add user",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  const handleLeaveGroup = async () => {
    try {
      // Check if user and selectedChat are available
      if (!user || !selectedChat) {
        console.error("User or selectedChat is missing");
        return;
      }

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`, // Ensure token is correctly set
        },
      };

      // Log the chat ID being sent to the backend
      console.log(
        "Sending request to leave group with chatId:",
        selectedChat.id
      );

      const { data } = await axios.put(
        `http://localhost:5000/api/chat/leaveGroup`,
        { chatId: selectedChat._id },
        config
      );

      // Log the response from the backend
      console.log("User successfully removed from group:", data);

      // Check if the removed user was selected
      const userToRemove = selectedUsers.find((user) => user._id === user._id);

      // Update state after successful removal
      if (user._id === selectedChat._id) {
        setSelectedChat(null); // Clear selected chat if it was the current chat
      } else {
        setSelectedChat((prevChat) =>
          prevChat ? { ...prevChat, users: data.users } : null
        );
      }
      setFetchAgain((prev) => !prev); // Trigger a refetch or update UI
      setLoading(false);

      // Remove the user from the selected users list
      setSelectedUsers((prevSelectedUsers) =>
        prevSelectedUsers.filter((user) => user._id !== userToRemove?._id)
      );
    } catch (error) {
      // Handle error (e.g., display error message)
      console.error(
        "Error leaving group:",
        error.response ? error.response.data : error.message
      );
      setLoading(false); // Stop loading indicator in case of error
    }
  };

  return (
    <>
      <IconButton d={{ base: "flex" }} onClick={onOpen} icon={<ViewIcon />}>
        Open Modal
      </IconButton>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" justifyContent="center" d="flex">
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box display="flex" flexWrap="wrap" gap="10px">
              {selectedUsers.map((user) => (
                <UserBadge key={user._id} user={user} onDelete={handleRemove} />
              ))}
            </Box>

            <FormControl d="flex" alignItems="center" mb={4}>
              <Input
                pb={3}
                onChange={(e) => setGroupChatName(e.target.value)}
                placeholder="Chat Name"
                value={groupChatName}
              />
              <Button
                variant="solid"
                onClick={handleRename}
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
              >
                Update
              </Button>
            </FormControl>

            <FormControl d="flex" flexDirection="column">
              <Input
                pb={3}
                placeholder="Add User"
                onChange={(e) => handleSearch(e.target.value)}
                value={search}
              />
              {loading ? (
                <Spinner size="lg" mt="4" />
              ) : (
                <Box mt="4">
                  {searchResult.length > 0 ? (
                    searchResult.map((user) => (
                      <UserList
                        key={user._id}
                        user={user}
                        handleFunc={() => handleAddUser(user)}
                      />
                    ))
                  ) : (
                    <Text>No users found</Text>
                  )}
                </Box>
              )}
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme="red" onClick={handleLeaveGroup}>
              Leave group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModel;
