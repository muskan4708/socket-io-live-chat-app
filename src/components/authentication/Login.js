import {
  FormControl,
  Input,
  VStack,
  FormLabel,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
const navigate = useNavigate()
  const handleClick = () => setShow(!show);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const { data } = await axios.post(
        "http://localhost:5000/api/user/login", // Replace with your API endpoint
        { email, password },
        config
      );

      toast({
        title: "Sign In Successful!",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      // Store the token in localStorage for future use
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userInfo", JSON.stringify(data));
      navigate("/chatPage")
      // Optionally, redirect the user or perform other actions
      console.log("User signed in:", data);
    
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error occurred!",
        description: error.response?.data?.message || error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      setLoading(false);
    }
  };

  return (
    <VStack spacing="5px" color="black" as="form" onSubmit={submitHandler}>
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            console.log("Email changed");
          }}
        />
      </FormControl>

      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              console.log("Password changed");
            }}
          />
          <InputRightElement>
            <Button h="1.5rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button colorScheme="blue" mt={4} type="submit" isLoading={loading}>
        Sign In
      </Button>
    </VStack>
  );
}
