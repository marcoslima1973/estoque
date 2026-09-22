import { getChatGPTUser } from '../../chatgpt-auth';
import { database } from '@/lib/inventory-db';
import { whole, money, transition, type Product } from '@/lib/inventory-rules';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status});
const str=(v:unknown,max=300)=>typeof v==='string'?v.trim().slice(0,max):'';
export async function GET(){
 const user=await getChatGPTUser();if(!user)return json({error:'Entre na sua conta para continuar.'},401);
 try {const db=database();const [products,movements]=await Promise.all([
 db.prepare('SELECT * FROM products WHERE owner=? ORDER BY sku,warehouse,shelf').bind(user.userId).all(),
 db.prepare('SELECT m.*,p.sku,p.title,p.warehouse FROM movements m JOIN products p ON p.id=m.product WHERE m.owner=? ORDER BY m.created DESC LIMIT 2000').bind(user.userId).all()]);
 return json({products:products.results,movements:movements.results});
 }catch(e){console.error(e);return json({error:'Não foi possível carregar o estoque. Tente novamente.'},503);}
}
export async function POST(request:Request){
 const user=await getChatGPTUser();if(!user)return json({error:'Entre na sua conta para continuar.'},401);
 const origin=request.headers.get('origin');if(origin && origin!==new URL(request.url).origin)return json({error:'Origem inválida.'},403);
 try {
 const body:any=await request.json();const db=database();const owner=user.userId,actor=user.email,now=new Date().toISOString();
 if(body.action==='import'||body.action==='create'){
 const rows=body.action==='create'?[body.product]:body.rows;
 if(!Array.isArray(rows)||!rows.length||rows.length>2000)throw new Error('Importe entre 1 e 2.000 registros por vez.');
 const seen=new Set<string>();let imported=0,skipped=0;
 const parsed=rows.map((r:any)=>{const sku=str(r.sku),title=str(r.title),warehouse=str(r.warehouse)||'My Warehouse',shelf=str(r.shelf);if(!sku||!title)throw new Error('SKU e título são obrigatórios.');const key=JSON.stringify([sku,warehouse,shelf]);if(seen.has(key))throw new Error(`SKU duplicado no mesmo local: ${sku}`);seen.add(key);const quantity=whole(r.quantity,'Estoque atual'),reserved=whole(r.reserved??0,'Ocupado');if(reserved>quantity)throw new Error(`Reserva superior ao estoque: ${sku}`);return {sku,title,warehouse,shelf,quantity,reserved,minimum:r.minimum==null||r.minimum===''?null:whole(r.minimum,'Estoque baixo'),cost:money(r.cost),purchase:whole(r.purchase??0,'Em trânsito'),transit:whole(r.transit??0,'Transferência'),created:str(r.created)||now};});
 for(const p of parsed){
 const id=crypto.randomUUID();const results=await db.batch([
 db.prepare('INSERT OR IGNORE INTO products (id,owner,sku,title,warehouse,shelf,minimum,quantity,reserved,purchase,transit,cost,created,version) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,0)').bind(id,owner,p.sku,p.title,p.warehouse,p.shelf,p.minimum,p.quantity,p.reserved,p.purchase,p.transit,p.cost,p.created),
 db.prepare("INSERT INTO movements (id,owner,product,type,quantity,before,after,cost_before,cost_after,reserved_before,reserved_after,reason,reference,actor,created) SELECT ?,?,id,'abertura',quantity,0,quantity,NULL,cost,0,reserved,'Saldo inicial',?,?,? FROM products WHERE id=? AND owner=?").bind(crypto.randomUUID(),owner,body.action==='import'?'Importação Excel':'Cadastro',actor,now,id,owner)]);
 if(results[0].meta.changes)imported++;else skipped++;
 } return json({message:`${imported} registros adicionados. ${skipped} já existentes mantidos sem alteração.`});
 }
 const p=await db.prepare('SELECT * FROM products WHERE id=? AND owner=?').bind(str(body.productId),owner).first<Product>();if(!p)throw new Error('Produto não encontrado.');
 if(body.action==='edit'){
 const title=str(body.title);if(!title)throw new Error('Informe o título.');
 await db.prepare('UPDATE products SET title=?,minimum=?,version=version+1 WHERE id=? AND owner=?').bind(title,body.minimum===''||body.minimum==null?null:whole(body.minimum,'Estoque baixo'),p.id,owner).run();return json({message:'Cadastro atualizado.'});
 }
 const id=str(body.id);if(!/^[\w-]{20,80}$/.test(id))throw new Error('Identificador da operação inválido.');
 const already=await db.prepare('SELECT id FROM movements WHERE id=? AND owner=?').bind(id,owner).first();if(already)return json({message:'Movimentação já registrada.'});
 const reason=str(body.reason,1000);if(!reason)throw new Error('Informe o motivo da movimentação.');
 let type=str(body.type),n=whole(body.quantity,'Quantidade',type==='ajuste'),next=transition(p,type,n,money(body.cost));
 const statements=[
 db.prepare('UPDATE products SET quantity=?,reserved=?,cost=?,version=version+1 WHERE id=? AND owner=? AND version=?').bind(next.quantity,next.reserved,next.cost,p.id,owner,p.version),
 db.prepare('INSERT INTO movements (id,owner,product,type,quantity,before,after,cost_before,cost_after,reserved_before,reserved_after,reason,reference,actor,created) SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE changes()=1').bind(id,owner,p.id,type,n,p.quantity,next.quantity,p.cost,next.cost,p.reserved,next.reserved,reason,str(body.reference),actor,now)
 ];
 const result=await db.batch(statements);if(!result[0].meta.changes)return json({error:'O saldo mudou durante a operação. Atualize o estoque e tente novamente.'},409);
 return json({message:'Movimentação registrada.'});
 }catch(e){console.error(e);return json({error:e instanceof Error?e.message:'Não foi possível salvar.'},400);}
}
