import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot from react-dom/client
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ChatProvider from './context/ChatProvider';

const container = document.getElementById('root');
const root = createRoot(container); // Create a root.

root.render(
  <BrowserRouter>
    <ChatProvider>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </ChatProvider>
  </BrowserRouter>
);
