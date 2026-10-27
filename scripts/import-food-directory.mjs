/** Rebuild the attributed local snapshot from the two query-only layers
 * published in NYC Food Help's production configuration. No keys are used.
 * Run: node scripts/import-food-directory.mjs [--from-local]
 */
import fs from 'node:fs/promises';
const services=[
 'https://services6.arcgis.com/yG5s3afENB5iO9fj/arcgis/rest/services/Food_Help_Programs_PROD_view/FeatureServer/0',
 'https://services5.arcgis.com/tMsas0Edz7Aih7fO/arcgis/rest/services/EFAP_PFRED_Programs_PROD_view/FeatureServer/0',
];
const boroughs={BK:'Brooklyn',QN:'Queens',BX:'Bronx',NY:'Manhattan',SI:'Staten Island'};
const dayKeys=['sun','mon','tue','wed','thu','fri','sat'];
const parseTime=(value)=>{const m=String(value||'').trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);if(!m)return null;return Number(m[1])%12+(m[3].toUpperCase()==='PM'?12:0)+Number(m[2])/60;};
const title=(s)=>String(s||'').toLowerCase().replace(/\b\w/g,c=>c.toUpperCase()).replace(/\bNyc\b/g,'NYC').replace(/\bYmca\b/g,'YMCA');
const sourceData=[];
for(let i=0;i<services.length;i++){
 let data;
 if(process.argv.includes('--from-local'))data=JSON.parse(await fs.readFile(i===0?'/tmp/nourish-nyc-food.json':'/tmp/nourish-nyc-food-secondary.json','utf8'));
 else {const response=await fetch(`${services[i]}/query?${new URLSearchParams({where:'1=1',outFields:'*',outSR:'4326',f:'json',resultRecordCount:'2000'})}`);if(!response.ok)throw new Error('Directory source unavailable');data=await response.json();}
 if(data.error||data.exceededTransferLimit)throw new Error('Incomplete source data; do not overwrite the directory');
 sourceData.push(data.features||[]);
}
const combined=new Map();
for(let i=0;i<sourceData.length;i++)for(const feature of sourceData[i]){
 const a=feature.attributes;const lat=Number(a.lat||feature.geometry?.y),lng=Number(a.lon||feature.geometry?.x);
 if(a.status!=='Open'||!a.program||!a.distadd||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<40.45||lat>41.1||lng<-74.3||lng>-73.65)continue;
 const key=`${String(a.program).trim().toLowerCase()}|${String(a.distadd).replace(/\s/g,'').toLowerCase()}`;
 const previous=combined.get(key);if(previous&&Number(previous.a.EditDate)>=Number(a.EditDate))continue;
 combined.set(key,{a,lat,lng,source:services[i]});
}
const locations=[...combined.values()].map(({a,lat,lng,source})=>{
 const weeklySchedule=[];
 for(const service of ['fp','sk'])for(let weekday=0;weekday<7;weekday++)for(let slot=1;slot<=3;slot++){
  const start=parseTime(a[`${service}_${dayKeys[weekday]}_open${slot}`]),end=parseTime(a[`${service}_${dayKeys[weekday]}_close${slot}`]);
  if(start!==null&&end!==null&&end>start&&!weeklySchedule.some(w=>w.day===weekday&&w.start===start&&w.end===end&&w.service===(service==='fp'?'Food pantry':'Prepared meals')))weeklySchedule.push({day:weekday,start,end,service:service==='fp'?'Food pantry':'Prepared meals'});
 }
 const serviceTypes=[...(a.type_fp?['Food pantry']:[]),...(a.type_sk?['Prepared meals']:[])];
 const notes=[a.fp_notes,a.sk_notes,a.dist_location_info].filter(Boolean).map(v=>String(v).trim()).join(' ');
 const conditionalSchedule=/\b(first|second|third|fourth|last|1st|2nd|3rd|4th|monthly|every other|twice|once|appointment|reservation)\b/i.test([notes,a.fp_days_orig,a.sk_days_orig,a.fp_hours_orig,a.sk_hours_orig].filter(Boolean).join(' '));
 const address=String(a.distadd).trim();const borough=boroughs[a.distboro]||'New York';
 // Stable public IDs are independent of layer FIDs and source ordering.
 let hash=2166136261;for(const ch of `${a.program}|${address}`.toLowerCase()){hash^=ch.charCodeAt(0);hash=Math.imul(hash,16777619);}
 return {id:`nyc-${(hash>>>0).toString(36)}`,name:title(a.program),neighborhood:borough,borough,zip:String(a.distzip||'').slice(0,5),address,lat,lng,type:serviceTypes[0]||'Food pantry',serviceTypes,description:`A publicly listed ${serviceTypes.includes('Prepared meals')?'food and meal':'food pantry'} program in ${borough}. Contact the organization before visiting to confirm the posted schedule, eligibility, and available food.`,days:[...new Set(weeklySchedule.map(w=>w.day))].sort(),start:weeklySchedule.length?Math.min(...weeklySchedule.map(w=>w.start)):0,end:weeklySchedule.length?Math.max(...weeklySchedule.map(w=>w.end)):0,dietary:[],languages:[],accessible:null,delivery:null,appointment:null,noId:null,verified:false,updatedAt:a.EditDate?new Date(a.EditDate).toISOString().slice(0,10):'Unknown',inventory:[],instructions:notes||'Pickup requirements are not included in the public record. Call the organization to confirm before visiting.',image:'',sourceKind:'public',sourceName:'NYC Food Help',sourceUrl:'https://finder.nyc.gov/foodhelp/',sourceRecordUrl:`${source}/query?where=FID%3D${a.FID}&outFields=program,distadd,org_phone&f=pjson`,importedAt:new Date().toISOString(),phone:a.org_phone||undefined,weeklySchedule,scheduleNotes:notes,conditionalSchedule,postedSchedule:[a.fp_days_orig,a.fp_hours_orig,a.sk_days_orig,a.sk_hours_orig].filter(Boolean).join(' / ')};
}).sort((a,b)=>a.name.localeCompare(b.name));
const metadata={publisher:'NYC Human Resources Administration / NYC Food Help',configuration:'https://finder.nyc.gov/foodhelp/config/runtime-config.json',sources:services,retrievedAt:new Date().toISOString(),count:locations.length,boroughCounts:Object.fromEntries(Object.values(boroughs).map(b=>[b,locations.filter(l=>l.borough===b).length])),notes:'Public listings, not confirmed stock or guaranteed service. Each record retains its source edit date. Source schedules may be conditional; call ahead. No volunteer needs or delivery services have been invented for these organizations.'};
await fs.writeFile('src/data/nyc-food-directory.json',JSON.stringify({metadata,locations},null,2)+'\n');
console.log(JSON.stringify(metadata,null,2));
