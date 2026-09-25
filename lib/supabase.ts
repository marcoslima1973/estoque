import {summarizeMovements} from './stock-summary';
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient('https://wbuupbmqwjropdvisuce.supabase.co','sb_publishable_LC_WPq-RjGXX8eXncfYz8Q_sn8s4VUj');
export async function inventoryData() {
 const {data:{user},error:authError}=await supabase.auth.getUser();
 if(authError||!user)throw new Error('Entre novamente para continuar.');
 const products:any[]=[];
 for(let start=0;;start+=500){
  const {data,error}=await supabase.from('estoque_products').select('*').eq('owner',user.id).order('id').range(start,start+499);
  if(error)throw error; products.push(...data); if(data.length<500)break;
 }
 const movements:any[]=[];
 for(let start=0;;start+=500){
  const {data,error}=await supabase.from('estoque_movements').select('*').eq('owner',user.id).order('created',{ascending:false}).order('id').range(start,start+499);
  if(error)throw error; movements.push(...data);if(data.length<500)break;
 }
 const totals=summarizeMovements(movements);
 for(const p of products)Object.assign(p,totals.get(p.id)??{initial:0,entries:0,exits:0});
 const byId=new Map(products.map(p=>[p.id,p]));
 return {products:products.sort((a,b)=>a.sku.localeCompare(b.sku)),movements:movements.slice(0,2000).map(m=>({...m,sku:byId.get(m.product)?.sku??'',title:byId.get(m.product)?.title??'',warehouse:byId.get(m.product)?.warehouse??''}))};
}
export async function inventoryCommand(body:unknown){
 const {data,error}=await supabase.rpc('estoque_command',{body});
 if(error)throw new Error(error.message);
 return data;
}
