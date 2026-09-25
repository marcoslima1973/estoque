import assert from 'node:assert/strict';
import {periodBounds,summarizePeriod,movementDay} from './stock-period.ts';
assert.deepEqual(periodBounds('month','2024','02','',''),{from:'2024-02-01',to:'2024-02-29'});
assert.deepEqual(periodBounds('month','2025','02','',''),{from:'2025-02-01',to:'2025-02-28'});
assert.deepEqual(periodBounds('year','2026','09','',''),{from:'2026-01-01',to:'2026-12-31'});
assert.equal(periodBounds('custom','2026','09','2026-10-01','2026-09-01'),null);
assert.equal(periodBounds('custom','2026','09','','2026-09-01'),null);
assert.equal(movementDay({created:'2026-09-01T01:00:00Z'}),'2026-08-31');
const row=(type,day,quantity,before,after,reserved_before=0,reserved_after=0)=>({product:'a',type,quantity,before,after,reserved_before,reserved_after,created:day+'T12:00:00Z',movement_date:day});
const rows=[row('abertura','2026-08-01',100,0,100),row('entrada','2026-09-01',20,100,120),row('reserva','2026-09-10',10,120,120,0,10),row('saida-reserva','2026-09-15',5,120,115,10,5),row('ajuste','2026-09-20',112,115,112,5,5),row('saida','2026-09-30',2,112,110,5,5),row('entrada','2026-10-01',30,110,140,5,5),row('liberacao','2026-10-02',5,140,140,5,0)];
const products=[{id:'a',quantity:140,reserved:0}];
assert.deepEqual(summarizePeriod(products,rows,{from:'2026-09-01',to:'2026-09-30'}).get('a'),{initial:100,entries:20,exits:7,available:105});
assert.deepEqual(summarizePeriod(products,rows,{from:'2026-09-15',to:'2026-09-15'}).get('a'),{initial:120,entries:0,exits:5,available:110});
assert.deepEqual(summarizePeriod(products,rows,{from:'2026-01-01',to:'2026-01-31'}).get('a'),{initial:0,entries:0,exits:0,available:0});
assert.deepEqual(summarizePeriod(products,rows,{from:'',to:''}).get('a'),{initial:100,entries:50,exits:7,available:140});
assert.deepEqual(summarizePeriod(products,rows,{from:'2027-01-01',to:'2027-12-31'}).get('a'),{initial:140,entries:0,exits:0,available:140});
// Business dates take precedence over registration order for backdated entries.
rows[1].created='2026-10-05T12:00:00Z';
assert.equal(summarizePeriod(products,rows,{from:'2026-09-01',to:'2026-09-30'}).get('a').entries,20);
console.log('Period bounds, leap years, inclusive dates, opening balances, reservations, adjustments and backdated movements: OK');

