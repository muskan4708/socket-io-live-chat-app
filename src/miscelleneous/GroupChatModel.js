import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { ChatState } from "../context/ChatProvider";
import axios from "axios";
import UserList from "./UserList";
import UserBadge from "./userBadge"; // Ensure correct import

const GroupChatModel = ({ children }) => {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);

  const { chats, setChats, user } = ChatState();
  const toast = useToast();

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

  const handleGroup = (userToAdd) => {
    if (selectedUsers.some((user) => user._id === userToAdd._id)) {
      toast({
        title: "User Already Added",
        position: "top",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  const handleDelete = (userToRemove) => {
    debugger;
    setSelectedUsers((prevSelectedUsers) =>
      prevSelectedUsers.filter((user) => user._id !== userToRemove._id)
    );
    toast({
      title: "User Removed",
      status: "success",
      isClosable: true,
      duration: 5000,
      position: "top-right",
    });
  };

  const handleSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a group chat name and select users.",
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
      const { data } = await axios.post(
        `http://localhost:5000/api/chat/group`,
        {
          name: groupChatName,
          users: selectedUsers.map((user) => user._id),
        },
        config
      );
      setChats((prevChats) => [data, ...prevChats]);
      onClose();
      toast({
        title: "Group Chat Created",
        description: "Your group chat has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Failed to create group chat",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb="4"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add a user e.g., John"
                mt="1"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box display="flex" flexWrap="wrap" gap="10px">
              {selectedUsers.map((user) => (
                <Box
                  key={user._id}
                  flex="1 1 calc(50% - 10px)"
                  maxWidth="calc(50% - 10px)"
                >
                  <UserBadge
                    key={user._id}
                    user={user}
                    onDelete={handleDelete}
                  />
                </Box>
              ))}
            </Box>

            {loading ? (
              <Spinner size="lg" mt="4" />
            ) : (
              <Box mt="4">
                {searchResult.length > 0 ? (
                  searchResult.map((user) => (
                    <UserList
                      key={user._id}
                      user={user}
                      handleFunc={() => handleGroup(user)}
                    />
                  ))
                ) : (
                  <Text>No users found</Text>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} py={2} onClick={handleSubmit}>
              Create Chat
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModel;
