import {
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Avatar,
  IconButton,
} from "@chakra-ui/react";
import React from "react";
import { ChatState } from "../context/ChatProvider";
import { ViewIcon } from "@chakra-ui/icons";

const ProfileModel = ({ user, children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  //const { user } = ChatState();
  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="20px"
            fontFamily="work sans"
            d="flex"
            justifyContent="center"
            alignItems={"center"}
            textAlign="center"
          >
            {user?.name}'s Profile
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            d="flex"
            justifyContent="center"
            alignItems="center"
            textAlign="center"
          >
            <Avatar size="xl" src={user?.pic} alt={user.name} />
            <Text mt={4}>Email: {user?.email}</Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModel;
