import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DemoProvider } from './lib/store';
import Layout from './components/Layout';
import Home from './Home';
import FindFood from './FindFood';
import Matching from './Matching';
import FoodDetail from './FoodDetail';
import MyPlan from './Planning';
import Volunteer, {VolunteerDetail, VolunteerDashboard} from './Volunteer';
import Organizations, {OrganizationDashboard} from './Organizations';
import Resources, {Auth, NotFound} from './Resources';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
function ScrollReset(){const {pathname,hash}=useLocation();useEffect(()=>{if(hash){setTimeout(()=>document.getElementById(hash.slice(1))?.scrollIntoView(),100);}else{window.scrollTo(0,0);}},[pathname,hash]);return null;}
import './styles.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><DemoProvider><BrowserRouter><ScrollReset/><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="find-food" element={<FindFood/>}/><Route path="find-food/match" element={<Matching/>}/><Route path="food/:id" element={<FoodDetail/>}/><Route path="my-plan" element={<MyPlan/>}/><Route path="volunteer" element={<Volunteer/>}/><Route path="volunteer/match" element={<Matching volunteer/>}/><Route path="volunteer/dashboard" element={<VolunteerDashboard/>}/><Route path="volunteer/:id" element={<VolunteerDetail/>}/><Route path="organizations" element={<Organizations/>}/><Route path="organizations/dashboard" element={<OrganizationDashboard/>}/><Route path="resources" element={<Resources/>}/><Route path="auth" element={<Auth/>}/><Route path="*" element={<NotFound/>}/></Route></Routes></BrowserRouter></DemoProvider></React.StrictMode>);
