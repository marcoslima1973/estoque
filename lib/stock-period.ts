export type PeriodMovement = {product:string;type:string;quantity:number;before:number;after:number;reserved_before:number;reserved_after:number;created:string;movement_date?:string|null};
export type Period = {from:string;to:string};
const dayFormatter=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo'});
export const movementDay=(m:Pick<PeriodMovement,'movement_date'|'created'>)=>m.movement_date||dayFormatter.format(new Date(m.created));
export function periodBounds(mode:string,year:string,month:string,from:string,to:string):Period|null {
 if(mode==='all')return {from:'',to:''};
 if(mode==='year')return {from:`${year}-01-01`,to:`${year}-12-31`};
 if(mode==='month'){
  const last=new Date(Date.UTC(Number(year),Number(month),0)).getUTCDate();
  return {from:`${year}-${month}-01`,to:`${year}-${month}-${last}`};
 }
 return from&&to&&from<=to?{from,to}:null;
}
export function summarizePeriod(products:{id:string;quantity:number;reserved:number}[],rows:PeriodMovement[],period:Period){
 const totals=new Map(products.map(p=>[p.id,{initial:p.quantity,entries:0,exits:0,available:p.quantity-p.reserved}]));
 for(const m of rows){
  const total=totals.get(m.product);if(!total)continue;
  const day=movementDay(m),delta=m.after-m.before,reservedDelta=m.reserved_after-m.reserved_before;
  const afterEnd=!!period.to&&day>period.to;
  const inPeriod=(!period.from||day>=period.from)&&!afterEnd;
  // Remove all period/later changes to reconstruct its initial physical balance.
  // Opening balances introduced within the period remain in Inicial.
  if(!period.from||day>=period.from)total.initial-=delta;
  if(inPeriod&&m.type==='abertura')total.initial+=delta;
  if(afterEnd)total.available-=delta-reservedDelta;
  if(inPeriod&&m.type==='entrada')total.entries+=m.quantity;
  if(inPeriod&&(m.type==='saida'||m.type==='saida-reserva'))total.exits+=m.quantity;
 }
 return totals;
}
