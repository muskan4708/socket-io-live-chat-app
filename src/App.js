import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './userPages/HomePage'
import './App.css';
import ChatPage from './userPages/chatPage';

export default function App() {
  return (
   
      <div className='App'>
        <Routes>
          <Route path='/homePage' element={<HomePage />} />
          <Route path='/chatPage' element={<ChatPage />} />
        </Routes>
      </div>
   
  );
}
