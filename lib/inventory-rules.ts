export type Product = {id:string;sku:string;title:string;warehouse:string;shelf:string;minimum:number|null;quantity:number;reserved:number;purchase:number;transit:number;cost:number|null;created:string;version:number};
export function whole(value:unknown, label:string, zero=true) {const n=Number(value); if(value === '' || value === null || !Number.isSafeInteger(n) || n<(zero?0:1) || n>100000000) throw new Error(`${label}: informe uma quantidade inteira válida.`); return n;}
export function money(value:unknown) {if(value===''||value===null||value===undefined)return null; const n=Number(value);if(!Number.isFinite(n)||n<0||n>1e10)throw new Error('Custo inválido.');return n;}
export function transition(p:Product,type:string,n:number,cost:number|null) {
 let quantity=p.quantity,reserved=p.reserved,nextCost=p.cost;
 if(type==='entrada'){quantity+=n;if(cost!==null){if(p.quantity && p.cost===null)throw new Error('Defina o custo do saldo existente antes de registrar uma compra com custo.');nextCost=((p.quantity*(p.cost??0))+n*cost)/quantity;}}
 else if(type==='saida')quantity-=n;
 else if(type==='saida-reserva'){quantity-=n;reserved-=n;}
 else if(type==='reserva')reserved+=n;
 else if(type==='liberacao')reserved-=n;
 else if(type==='ajuste')quantity=n;
 else throw new Error('Tipo de movimentação inválido.');
 if(quantity<0||reserved<0||quantity<reserved)throw new Error('Saldo disponível ou reserva insuficiente para esta operação.');
 return {quantity,reserved,cost:nextCost};
}
