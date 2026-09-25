type Row={product:string;type:string;quantity:number};
export function summarizeMovements(rows:Row[]){
 const totals=new Map<string,{initial:number;entries:number;exits:number}>();
 for(const row of rows){
  const total=totals.get(row.product)??{initial:0,entries:0,exits:0};
  if(row.type==='abertura')total.initial+=row.quantity;
  else if(row.type==='entrada')total.entries+=row.quantity;
  else if(row.type==='saida'||row.type==='saida-reserva')total.exits+=row.quantity;
  totals.set(row.product,total);
 }
 return totals;
}
