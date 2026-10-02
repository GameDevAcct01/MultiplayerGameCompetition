import {CHARACTERS,NPC,LOCATIONS,shortestMinutes} from "./characters.js";
function shuffle(a){return [...a].sort(function(){return Math.random()-.5});}
const titles=["The Blackout Ledger","The Missing Provenance","A Gem in the Dark","The East Hall Deception"];
export function generateCase(count){
 const active=shuffle(CHARACTERS).slice(0,count),thief=active[Math.floor(Math.random()*active.length)];
 const spots=shuffle(LOCATIONS.filter(function(x){return x!=="Library"})),locations={};active.forEach(function(c,i){locations[c.id]=spots[i%spots.length]});
 const roles={},clues={};active.forEach(function(c){roles[c.id]=c.id===thief.id?"THIEF":"INVESTIGATOR";clues[c.id]=[]});
 const investigators=shuffle(active.filter(function(c){return c.id!==thief.id}));
 const add=function(i,title,text){if(investigators[i])clues[investigators[i].id].push({title:title,text:text})};
 add(0,"A blurred observation","Around 11:44 PM you saw a person leave East Hall carrying something small. You could not identify the face.");
 add(1,"Door log","The Service Corridor door registered an unscheduled opening at 11:44 PM.");
 add(2,"Route knowledge","From East Hall, the Service Corridor provides a route toward the Grand Gallery without crossing the Ballroom.");
 add(3,"Time window","A security note narrows the blackout movement window to roughly 11:43–11:45 PM.");
 add(4,"Late arrival","One participant joined the investigation well after it opened. Treat the late arrival as evidence only when combined with movement information.");
 add(5,"Physical detail","The display mount was left in a condition consistent with someone familiar with its release mechanism.");
clues[thief.id].push({title:"Your secret",text:"You took the Star. You know the critical movement happened during the blackout. Your other information is deliberately limited."});
 const profiles=active.map(function(c){return {id:c.id,name:c.name,occupation:c.occupation,age:c.age,profile:c.profile,motive:c.motive,portrait:c.portrait}});
 if(count===2)profiles.push({...NPC,npc:true});
 const evidence=Object.values(clues).flat(),travel=shortestMinutes(locations[thief.id],"Grand Gallery");
 const validation={evidencePoints:evidence.length,hasTime:evidence.some(function(x){return /11:4|time|late/i.test(x.text)}),hasMovement:evidence.some(function(x){return /corridor|route|leave East Hall|movement/i.test(x.text)}),travelMinutes:travel};
 if(!validation.hasTime||!validation.hasMovement||validation.evidencePoints<2||travel>=99)return generateCase(count);
 return {title:titles[Math.floor(Math.random()*titles.length)],crime:"The 74-carat blue Star of Alexandria vanished from its display at Blackwood Museum of Art during a brief blackout.",profiles:profiles,timeline:["11:40 PM — The gala is in progress.","11:42 PM — Security cameras briefly flicker.","11:43 PM — The Star of Alexandria disappears during a blackout.","11:46 PM — The theft is discovered.","11:48 PM — The investigation opens.","11:49–11:52 PM — Most investigators join.","11:57–12:00 AM — One participant joins unusually late."],publicEvidence:active.map(function(c){return {kind:"profile",text:c.name+" reports being in "+locations[c.id]+" around the blackout."}}),clues:clues,roles:roles,truth:{thiefId:thief.id,locations:locations,route:"East Hall → Service Corridor → Grand Gallery"},validation:validation};
}