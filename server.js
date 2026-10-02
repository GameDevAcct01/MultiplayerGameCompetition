import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static('public'));
const PORT = process.env.PORT || 3000;
const rooms = new Map();

const chars = [
 ['adrian','Adrian Cross','Museum Security Specialist'],['bea','Beatrice “Bea” Monroe','Art Historian'],
 ['caleb','Caleb Reed','Museum Technician'],['diana','Diana Hart','Investigative Journalist'],
 ['elias','Elias Grant','Private Art Collector'],['fiona','Fiona Park','Museum Conservator'],
 ['marcus','Marcus Bell','Event Coordinator'],['naomi','Naomi Sinclair','Gemstone Appraiser']
];
const profiles = {
 adrian:'Six years at Blackwood; authorized for restricted access; assigned to the east side during the gala.',
 bea:'Visiting curator who has published on the Star of Alexandria and knows its provenance history.',
 caleb:'Maintains exhibition systems and legitimately uses the Service Corridor.',
 diana:'Invited journalist investigating the museum’s ownership records; carries recording equipment.',
 elias:'Major donor who previously tried to purchase the Star and was rejected.',
 fiona:'Conservator who examined the Star before exhibition and understands its handling requirements.',
 marcus:'Event coordinator who knows the gala schedule and guest movements.',
 naomi:'Independent gemstone appraiser whose reputation is tied to the Star’s authentication.'
};
const alibis=['Grand Gallery','East Hall','Library','Ballroom','Service Corridor','Courtyard'];

function code(){return Math.random().toString(36).slice(2,7).toUpperCase();}
function publicRoom(r){
 return {code:r.code,phase:r.phase,players:r.players.map(p=>({id:p.id,name:p.name,character:p.character,characterName:p.characterName,occupation:p.occupation,connected:p.connected,score:p.score})),hostId:r.hostId,caseData:r.caseData?{title:r.caseData.title,crime:r.caseData.crime,timeline:r.caseData.timeline,publicEvidence:r.caseData.publicEvidence,caseProfiles:r.caseData.caseProfiles}:null,endsAt:r.endsAt};
}
function clientState(r,p){
 const base=publicRoom(r);
 base.me={id:p.id,name:p.name,character:p.character,characterName:p.characterName,occupation:p.occupation,score:p.score,role:r.caseData?.roles?.[p.id]||null,privateClues:r.caseData?.privateClues?.[p.id]||[]};
 base.voted=!!r.votes[p.id];
 base.votesSubmitted=Object.keys(r.votes).length;
 base.voteCount=r.players.length;
 return base;
}
function makeCase(r){
 const ps=r.players, spots={};
 ps.forEach((p,i)=>spots[p.id]=alibis[i%alibis.length]);
 const thief=ps.find(p=>spots[p.id]==='East Hall') || ps[0];
 const role={}; ps.forEach(p=>role[p.id]=p.id===thief.id?'THIEF':'INVESTIGATOR');
 const timeline=['11:40 PM — The gala is in progress.','11:42 PM — Security cameras briefly flicker.','11:43 PM — The Star of Alexandria disappears during a blackout.','11:46 PM — The theft is discovered.','11:48 PM — The investigation opens.'];
 const publicEvidence=ps.map(p=>`${p.characterName} reported being in ${spots[p.id]} around the blackout.`);
 const clues={}; ps.forEach(p=>clues[p.id]=[]);
 const observers=ps.filter(p=>p.id!==thief.id);
 if(observers[0]) clues[observers[0].id].push('At approximately 11:44 PM, you noticed someone leaving East Hall carrying something small. You could not identify the person.');
 if(observers[1]) clues[observers[1].id].push('The Service Corridor door logged an opening at 11:44 PM. No scheduled event required that door to open.');
 if(observers[2]) clues[observers[2].id].push('The Grand Gallery is only reachable from East Hall through the normal public route or from the Service Corridor.');
 if(observers[3]) clues[observers[3].id].push('A security note places the blackout at roughly 11:43–11:44 PM, narrowing the relevant movement window.');
 clues[thief.id].push('You know exactly how the Star left the display. Your private knowledge is intentionally incomplete to other players.');
 const caseProfiles=ps.map(p=>({character:p.characterName,occupation:p.occupation,description:profiles[p.character]}));
 if(r.players.length===2) caseProfiles.push({character:'Dr. Evelyn Vale',occupation:'Museum Director',description:'Director of Blackwood Museum for 12 years. She authorized the Star exhibition and coordinated security. A security-terminal session places her in the Library during the critical window. She is static and can never be the Thief.'});
 return {title:'The Case of the Stolen Crown',crime:'The 74-carat blue Star of Alexandria vanished from its display at Blackwood Museum of Art during a brief blackout.',timeline,publicEvidence,caseProfiles,roles:role,privateClues:clues,solution:{thiefId:thief.id,spots}};
}
function emitRoom(r){r.players.forEach(p=>io.to(p.id).emit('state',clientState(r,p)));}
function resetRoom(r){r.phase='LOBBY';r.caseData=null;r.votes={};r.endsAt=null;r.players.forEach(p=>p.score=0);}

io.on('connection',socket=>{
 socket.on('create',({name})=>{
  const c=code(); const p={id:socket.id,name:(name||'Detective').slice(0,24),character:null,characterName:null,occupation:null,score:0,connected:true};
  const r={code:c,hostId:p.id,phase:'LOBBY',players:[p],caseData:null,votes:{},endsAt:null};
  rooms.set(c,r); socket.join(c); socket.data.room=c; socket.data.player=p.id; emitRoom(r);
 });
 socket.on('join',({code,name})=>{
  const r=rooms.get(String(code||'').toUpperCase());
  if(!r) return socket.emit('errorMsg','Room not found.');
  if(r.phase!=='LOBBY') return socket.emit('errorMsg','That case has already started. Join the next case instead.');
  if(r.players.length>=8) return socket.emit('errorMsg','Room is full.');
  const p={id:socket.id,name:(name||'Detective').slice(0,24),character:null,characterName:null,occupation:null,score:0,connected:true};
  r.players.push(p); socket.join(r.code); socket.data.room=r.code; socket.data.player=p.id; emitRoom(r);
 });
 socket.on('start',()=>{
  const r=rooms.get(socket.data.room); if(!r||r.hostId!==socket.id||r.players.length<2) return;
  const pool=[...chars].sort(()=>Math.random()-.5).slice(0,r.players.length);
  r.players.forEach((p,i)=>{p.character=pool[i][0];p.characterName=pool[i][1];p.occupation=pool[i][2];});
  r.caseData=makeCase(r); r.phase='BRIEFING'; r.endsAt=Date.now()+90000; emitRoom(r);
  setTimeout(()=>{if(r.phase==='BRIEFING'){r.phase='INVESTIGATION';r.endsAt=Date.now()+12*60*1000;emitRoom(r);}},2500);
 });
 socket.on('beginInvestigation',()=>{const r=rooms.get(socket.data.room);if(r?.phase==='BRIEFING'){r.phase='INVESTIGATION';r.endsAt=Date.now()+12*60*1000;emitRoom(r);}});
 socket.on('accuse',({targetId})=>{
  const r=rooms.get(socket.data.room); if(!r||r.phase!=='INVESTIGATION')return; if(!r.players.some(p=>p.id===targetId))return;
  r.votes[socket.id]=targetId;
  if(Object.keys(r.votes).length===r.players.length){
   r.phase='REVEAL'; const thief=r.caseData.solution.thiefId;
   r.players.forEach(p=>{
    const target=r.votes[p.id];
    if(r.caseData.roles[p.id]==='THIEF'){
      if(target!==thief)p.score+=5;
      if(Object.values(r.votes).filter(v=>v===target).length>=2&&target!==thief)p.score+=1;
    } else if(target===thief)p.score+=3;
   });
   emitRoom(r);
  } else emitRoom(r);
 });
 socket.on('rematch',()=>{const r=rooms.get(socket.data.room);if(!r||r.hostId!==socket.id)return;resetRoom(r);emitRoom(r);});
 socket.on('disconnect',()=>{const r=rooms.get(socket.data.room);if(!r)return;const p=r.players.find(x=>x.id===socket.id);if(p)p.connected=false;emitRoom(r);});
});
server.listen(PORT,()=>console.log(`Stolen Crown running on ${PORT}`));