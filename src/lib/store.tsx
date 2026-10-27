import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { DemoState, FoodPreferences } from './types';
import { initialState } from './data';
const KEY='nourish-demo-v2';
const defaultJourney:FoodPreferences={area:'11372',household:4,day:'Wednesday',period:'Afternoon',transport:'Public transit',maxMinutes:45,dietary:'No preference',accessible:false,noId:false};
const Context=createContext<{state:DemoState;update:(fn:(s:DemoState)=>DemoState)=>void;reset:()=>void;journey:FoodPreferences;setJourney:(p:FoodPreferences)=>void}>(null!);
export function DemoProvider({children}:{children:ReactNode}){
 const [state,setState]=useState<DemoState>(()=>{try{const raw=localStorage.getItem(KEY)||localStorage.getItem('nourish-demo-v1');const stored=raw?JSON.parse(raw):null;if(!stored||![1,2].includes(stored.version))return initialState;
 // Public listings always come from the current attributed snapshot. Preserve
 // only editable demo organizations and local plans across data upgrades.
 const demos=Array.isArray(stored.locations)?stored.locations.filter((l:{id:string})=>l.id.startsWith('food-')):initialState.locations.filter(l=>l.sourceKind==='demo');
 return {...initialState,...stored,version:2,locations:[...initialState.locations.filter(l=>l.sourceKind==='public'),...demos]};}catch{return initialState;}});
 const [journey,setJourney]=useState(defaultJourney);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({...state,locations:state.locations.filter(l=>l.sourceKind!=='public')}));}catch{/* Storage failures never prevent planning. */}},[state]);
 return <Context.Provider value={{state,update:setState,reset:()=>setState(initialState),journey,setJourney}}>{children}</Context.Provider>;
}
export function useDemo(){return useContext(Context);}
