import React, { useEffect } from "react";
import {
  Box,
  Container,
  Text,
  Tab,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import Login from "../components/authentication/Login";
import SignUp from "../components/authentication/SignUp";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (!user) {
      navigate("/homePage");
    } 
  },[]);
  return (
    <Container maxW="xl" centerContent>
      <Box
        p={3}
        bg="white" // Use a visible color to test
        w="100%"
        borderRadius="lg"
        borderWidth="1px"
        // height="90px"
        display="flex"
        alignItems="center"
        m="40px 0 15px 0"
        justifyContent="center"
      >
        <Text fontSize="4xl" color="black">
          TALK-A-TIVE
        </Text>
      </Box>
      <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
        <Tabs variant="soft-rounded" colorScheme="green">
          <TabList mb="1em">
            <Tab width="50%">Sig-in</Tab>
            <Tab width="50%">Sign-Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <SignUp />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default HomePage;
