// Read-only-reviewed local test adapter, adapted from Development's independent
// sqlite-d1.mjs. In-memory SQLite only; no Miniflare listener or production binding.
import {DatabaseSync} from 'node:sqlite';
export class Miniflare {
 constructor(){this.sqlite=new DatabaseSync(':memory:');}
 async getD1Database(){const sqlite=this.sqlite;return {prepare(sql){let args=[];const q={bind(...values){args=values;return q;},async all(){return {results:sqlite.prepare(sql).all(...args).map(r=>({...r}))};},async first(){const r=sqlite.prepare(sql).get(...args);return r?{...r}:null;},async run(){const r=sqlite.prepare(sql).run(...args);return {success:true,meta:{changes:Number(r.changes)}};}};return q;},async batch(queries){sqlite.exec('BEGIN');try{const result=[];for(const q of queries)result.push(await q.run());sqlite.exec('COMMIT');return result;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};}
 async dispose(){this.sqlite.close();}
}
