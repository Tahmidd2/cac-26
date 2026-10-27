import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoProvider } from './lib/store';
import Layout from './components/Layout';
import Home from './Home';
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><DemoProvider><BrowserRouter><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="*" element={<Home/>}/></Route></Routes></BrowserRouter></DemoProvider></React.StrictMode>);
