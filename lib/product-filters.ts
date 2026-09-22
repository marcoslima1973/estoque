export const ALL = '__all__';
export const UNKNOWN = 'Não informado';
const sizePattern=/^(?:PP|P|M|G|GG|XG|XGG|G[1-9]|XXS|XS|S|L|XL|XXL|XXXL|[2-5]XL|[2-6]\d|[ÚU]NICO|UN)$/i;
export function productAttributes(p:{sku:string;title:string}){
 const parts=p.sku.split('-').map(s=>s.trim());
 let color=UNKNOWN,size=UNKNOWN;
 if(parts.length>=3){
  const last=parts.at(-1)!,previous=parts.at(-2)!;
  if(sizePattern.test(last)){size=last.toUpperCase();color=previous||UNKNOWN;}
  else if(sizePattern.test(previous)){size=previous.toUpperCase();color=last||UNKNOWN;}
 }
 return {product:p.title.trim()||UNKNOWN,color,size};
}
export function matchesAttributes(p:{sku:string;title:string},product:string,color:string,size:string){
 const a=productAttributes(p);
 return (product===ALL||a.product===product)&&(color===ALL||a.color===color)&&(size===ALL||a.size===size);
}
export function sortSizes(a:string,b:string){
 const order=['XXS','XS','PP','P','S','M','G','L','GG','XL','XG','XGG','XXL','XXXL','G1','G2','G3','G4','G5','G6','G7','G8','G9'];
 const ai=order.indexOf(a),bi=order.indexOf(b);
 return (ai<0?100:ai)-(bi<0?100:bi)||a.localeCompare(b,'pt-BR',{numeric:true});
}
