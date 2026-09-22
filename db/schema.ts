import { sqliteTable, text, integer, real, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), sku: text('sku').notNull(), title: text('title').notNull(), warehouse: text('warehouse').notNull(), shelf: text('shelf').notNull().default(''),
 minimum: integer('minimum'), quantity: integer('quantity').notNull().default(0), reserved: integer('reserved').notNull().default(0), purchase: integer('purchase').notNull().default(0), transit: integer('transit').notNull().default(0), cost: real('cost'), created: text('created').notNull(), version: integer('version').notNull().default(0),
}, t => [uniqueIndex('product_location').on(t.owner,t.sku,t.warehouse,t.shelf)]);
export const movements = sqliteTable('movements', {
 id: text('id').primaryKey(), owner: text('owner').notNull(), product: text('product').notNull().references(()=>products.id), type: text('type').notNull(), quantity: integer('quantity').notNull(), before: integer('before').notNull(), after: integer('after').notNull(), costBefore: real('cost_before'), costAfter: real('cost_after'), reservedBefore: integer('reserved_before').notNull(), reservedAfter: integer('reserved_after').notNull(), reason: text('reason').notNull(), reference: text('reference').notNull().default(''), actor: text('actor').notNull(), created: text('created').notNull(), reversal: text('reversal'),
}, t=>[uniqueIndex('one_reversal').on(t.owner,t.reversal)]);
