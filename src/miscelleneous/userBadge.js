import React from "react";
import { Box, Button } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
const UserBadge = ({ user, onDelete }) => {
  return (
    <Box
      pl={2}
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      backgroundColor="lightseagreen"
      color="white"
      d="flex"
      cursor="pointer"
    >
      {user.name}
      <CloseIcon
        ml={3}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(user);
        }}
      />
    </Box>
  );
};
export default UserBadge;
