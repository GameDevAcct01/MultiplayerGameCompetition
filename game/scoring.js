export function scoreAccusations(room){
 const thief=room.caseData.truth.thiefId;
 room.players.forEach(function(p){
  let points=p.score||0,target=room.votes[p.id];
  if(room.caseData.roles[p.character]==="THIEF"){
   if(target!==thief)points+=5;
   if(target&&target!==thief&&Object.values(room.votes).filter(function(v){return v===target}).length>=2)points+=1;
  } else if(target===thief)points+=3;
  p.score=points;
 });
}