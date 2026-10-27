import {Link} from 'react-router-dom';
import {Bookmark} from 'lucide-react';
import type {FoodLocation} from '../lib/types';
import {useDemo} from '../lib/store';
import {formatDate,time,today} from '../lib/data';
import {upcomingWindows,windowsForDate} from '../lib/schedules';
export default function FoodCard({location:l,index,selected,onSelect,onHover,miles,compact=false,distributionDate}:{location:FoodLocation;index?:number;selected?:boolean;onSelect?:()=>void;onHover?:(active:boolean)=>void;miles?:number;compact?:boolean;distributionDate?:string}){
 const {state,update}=useDemo();const saved=state.saved.includes(l.id);const next=distributionDate?{date:distributionDate,window:windowsForDate(l,distributionDate)[0]}:upcomingWindows(l,1)[0];const link=`/food/${l.id}${distributionDate?`?visit=${distributionDate}`:''}`;
 return <article id={`card-${l.id}`} className={`food-card ${selected?'selected':''} ${compact?'food-card-compact':''}`} onMouseEnter={()=>onHover?.(true)} onMouseLeave={()=>onHover?.(false)} onFocus={onSelect}>
 <div className="food-card-top"><span className="resource-type">{index!==undefined&&<span className="result-index">{index+1}</span>}{l.serviceTypes?.join(' & ')||l.type}</span><button className={`save-button ${saved?'is-saved':''}`} onClick={()=>update(s=>({...s,saved:s.saved.includes(l.id)?s.saved.filter(id=>id!==l.id):[...s.saved,l.id]}))} aria-label={`${saved?'Unsave':'Save'} ${l.name}`}><Bookmark size={18} fill={saved?'currentColor':'none'}/></button></div>
 <Link to={link} className="card-title-link"><h3>{l.name}</h3></Link><p className="location-meta">{l.sourceKind==='public'?`${l.borough} ${l.zip}`:`${l.neighborhood}, ${l.borough}`}{miles!==undefined&&<span className="resource-distance">{miles<.1?'Nearby':`${miles.toFixed(1)} mi away`}</span>}</p>
 <div className="food-card-time"><strong>{next?.date?(next.date===today?'Today':formatDate(next.date)):'Call for hours'}</strong><span>{next?.window?`${time(next.window.start)}–${time(next.window.end)}`:'Schedule not published'}</span></div>
 <div className="card-badges">{l.sourceKind==='public'?<span className="plain-tag">{l.conditionalSchedule?'Schedule has conditions':'Posted hours · confirm before visiting'}</span>:<span className="plain-tag">Sample organization</span>}{l.appointment===false&&<span className="plain-tag">No appointment</span>}{l.accessible===true&&<span className="plain-tag">Step-free entrance</span>}{l.delivery===true&&<span className="plain-tag">Delivery assistance</span>}</div>
 <div className="food-card-footer"><span>{l.sourceKind==='public'?'NYC Food Help listing':'Demonstration listing'}</span><Link className="text-link" to={link}>{compact?'Plan this visit':'View details'}</Link></div></article>;
}
