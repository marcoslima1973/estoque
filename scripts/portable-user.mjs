import os from 'node:os';
import { syncBuiltinESMExports } from 'node:module';
// Some Windows sandbox accounts do not expose the passwd API to Node.
try { os.userInfo(); } catch {
 os.userInfo = () => ({ username: process.env.USERNAME || 'site-builder', homedir: os.homedir(), shell: null, uid: -1, gid: -1 });
 syncBuiltinESMExports();
}
