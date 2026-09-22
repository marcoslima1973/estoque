alter table public.estoque_movements add column movement_date date;
CREATE OR REPLACE FUNCTION estoque_private.command(body jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 u uuid := auth.uid(); a text := body->>'action'; actor_email text;
 p public.estoque_products; r jsonb; rows_json jsonb; inserted_id uuid;
 added integer:=0; skipped integer:=0; n integer; q integer; res integer; c numeric; supplied_cost numeric;
 business_date date; op uuid; kind text; why text; ref text; existing public.estoque_movements;
begin
 if u is null then raise exception 'Entre na sua conta para continuar.'; end if;
 select coalesce(email,'') into actor_email from auth.users where id=u;
 if actor_email is null then raise exception 'Conta inválida.'; end if;
 if a in ('create','import') then
  rows_json:=case when a='create' then jsonb_build_array(body->'product') else body->'rows' end;
  if jsonb_typeof(rows_json) is distinct from 'array' then raise exception 'Lista de produtos inválida.'; end if;
  if jsonb_array_length(rows_json) not between 1 and 2000 then raise exception 'Importe entre 1 e 2.000 registros.'; end if;
  for r in select value from jsonb_array_elements(rows_json) loop
   -- Integer casts from text reject fractional quantities.
   insert into public.estoque_products(owner,sku,title,warehouse,shelf,minimum,quantity,reserved,purchase,transit,cost,created)
   values(u,btrim(r->>'sku'),btrim(r->>'title'),coalesce(nullif(btrim(r->>'warehouse'),''),'My Warehouse'),coalesce(btrim(r->>'shelf'),''),
    nullif(r->>'minimum','')::integer,(r->>'quantity')::integer,coalesce(nullif(r->>'reserved','')::integer,0),coalesce(nullif(r->>'purchase','')::integer,0),coalesce(nullif(r->>'transit','')::integer,0),nullif(r->>'cost','')::numeric,coalesce(nullif(r->>'created',''),now()::text))
   on conflict(owner,sku,warehouse,shelf) do nothing returning id into inserted_id;
   if inserted_id is null then skipped:=skipped+1;
   else
    select * into p from public.estoque_products where id=inserted_id;
    insert into public.estoque_movements(owner,product,type,quantity,"before","after",cost_before,cost_after,reserved_before,reserved_after,reason,reference,actor)
    values(u,p.id,'abertura',p.quantity,0,p.quantity,null,p.cost,0,p.reserved,'Saldo inicial',case when a='import' then 'Importação Excel' else 'Cadastro' end,actor_email);
    added:=added+1;
   end if;
  end loop;
  return jsonb_build_object('message',format('%s registros adicionados. %s já existentes mantidos sem alteração.',added,skipped));
 end if;
 select * into p from public.estoque_products where id=(body->>'productId')::uuid and owner=u for update;
 if not found then raise exception 'Produto não encontrado.'; end if;
 if a='edit' then
  update public.estoque_products set title=btrim(body->>'title'),minimum=nullif(body->>'minimum','')::integer,version=version+1 where id=p.id;
  return jsonb_build_object('message','Cadastro atualizado.');
 end if;
 if a is distinct from 'move' then raise exception 'Operação inválida.'; end if;
 op:=(body->>'id')::uuid; if op is null then raise exception 'Identificador obrigatório.'; end if;
 kind:=body->>'type'; why:=btrim(body->>'reason'); ref:=coalesce(body->>'reference','');
 if kind in ('entrada','saida','saida-reserva') then
 if coalesce(body->>'movementDate','') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'Informe a data da movimentação (dia, mês e ano).'; end if;
 begin business_date:=(body->>'movementDate')::date;
 exception when datetime_field_overflow or invalid_datetime_format then raise exception 'Data da movimentação inválida.'; end;
end if;
 n:=(body->>'quantity')::integer; supplied_cost:=nullif(body->>'cost','')::numeric;
 if n is null or n<0 or n>100000000 or (kind<>'ajuste' and n=0) then raise exception 'Quantidade inválida.'; end if;
 if supplied_cost<0 or supplied_cost>10000000000 then raise exception 'Custo inválido.'; end if;
 select * into existing from public.estoque_movements where id=op;
 if found then
  if existing.owner=u and existing.product=p.id and existing.type=kind and existing.quantity=n and existing.movement_date is not distinct from business_date then return jsonb_build_object('message','Movimentação já registrada.'); end if;
  raise exception 'Identificador já utilizado.';
 end if;
 q:=p.quantity; res:=p.reserved; c:=p.cost;
 case kind
 when 'entrada' then
  q:=q+n;
  if supplied_cost is not null then
   if p.quantity>0 and p.cost is null then raise exception 'O saldo existente está sem custo informado.'; end if;
   c:=(p.quantity*coalesce(p.cost,0)+n*supplied_cost)/q;
  end if;
 when 'saida' then q:=q-n;
 when 'saida-reserva' then q:=q-n; res:=res-n;
 when 'reserva' then res:=res+n;
 when 'liberacao' then res:=res-n;
 when 'ajuste' then q:=n;
 else raise exception 'Tipo inválido.';
 end case;
 if q<0 or res<0 or res>q then raise exception 'Saldo disponível ou reserva insuficiente.'; end if;
 update public.estoque_products set quantity=q,reserved=res,cost=c,version=version+1 where id=p.id;
 insert into public.estoque_movements(id,owner,product,type,quantity,"before","after",cost_before,cost_after,reserved_before,reserved_after,reason,reference,actor,movement_date)
 values(op,u,p.id,kind,n,p.quantity,q,p.cost,c,p.reserved,res,why,ref,actor_email,business_date);
 return jsonb_build_object('message','Movimentação registrada.');
end $function$
