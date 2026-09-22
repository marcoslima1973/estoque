import {useEffect,useState,type FormEvent} from 'react';
import {createRoot} from 'react-dom/client';
import type {Session} from '@supabase/supabase-js';
import Inventory from '../app/inventory';
import {supabase} from '../lib/supabase';
import '../app/globals.css';
import '../app/inventory.css';
function App(){
 const [session,setSession]=useState<Session|null>(null),[ready,setReady]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[register,setRegister]=useState(false);
 useEffect(()=>{supabase.auth.getSession().then(({data,error})=>{if(error)setMessage(error.message);setSession(data.session);setReady(true)});const {data}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);setReady(true)});return()=>data.subscription.unsubscribe()},[]);
 async function submit(event:FormEvent){event.preventDefault();setBusy(true);setMessage('');try{
  const result=register?await supabase.auth.signUp({email,password}):await supabase.auth.signInWithPassword({email,password});
  if(result.error)throw result.error;
  if(register&&!result.data.session)setMessage('Confira seu e-mail para confirmar o cadastro. Depois volte aqui e entre com sua senha.');
 }catch(e){setMessage((e as Error).message)}finally{setBusy(false)}}
 if(!ready)return <main className="workspace">Carregando…</main>;
 if(session)return <Inventory key={session.user.id} name={session.user.email??'Minha conta'}/>;
 return <main className="workspace" style={{maxWidth:480,margin:'8vh auto'}}><section className="panel" style={{padding:32}}><p className="eyebrow">CONTROLE DE ESTOQUE</p><h1>{register?'Criar conta':'Entrar'}</h1><p className="muted">Acesse seus produtos e movimentações.</p><form onSubmit={submit} style={{display:'grid',gap:16,marginTop:24}}><label>E-mail<input className="border rounded-md w-full p-3" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input className="border rounded-md w-full p-3" type="password" required minLength={8} autoComplete={register?'new-password':'current-password'} value={password} onChange={e=>setPassword(e.target.value)}/></label>{message&&<p role="status">{message}</p>}<button className="border rounded-md p-3" disabled={busy}>{busy?'Aguarde…':register?'Criar conta':'Entrar'}</button><button type="button" onClick={()=>{setRegister(!register);setMessage('')}}>{register?'Já tenho conta':'Criar uma conta'}</button></form></section></main>;
}
createRoot(document.getElementById('root')!).render(<App/>);
