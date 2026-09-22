import Inventory from './inventory';
import { requireChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home() {
 const user = await requireChatGPTUser('/');
 return <Inventory name={user.displayName} />;
}
