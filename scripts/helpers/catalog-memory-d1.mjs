import {DatabaseSync} from 'node:sqlite';
class Statement {
 constructor(statement,args=[],source=''){this.statement=statement;this.args=args;this.source=source;}
 bind(...args){return new Statement(this.statement,args,this.source);}
 runSync(){const result=this.statement.run(...this.args);return {success:true,meta:{changes:Number(result.changes)}};}
 async run(){return this.runSync();}
 async first(){return this.statement.get(...this.args)??null;}
 async all(){return {results:this.statement.all(...this.args)};}
}
export class MemoryD1 {
 constructor(){this.sqlite=new DatabaseSync(':memory:');this.sqlite.exec('PRAGMA foreign_keys=ON');}
 prepare(sql){return new Statement(this.sqlite.prepare(sql),[],sql);}
 async batch(statements){
  this.sqlite.exec('BEGIN IMMEDIATE');
  try{const results=statements.map(statement=>statement.runSync());this.sqlite.exec('COMMIT');return results;}
  catch(error){this.sqlite.exec('ROLLBACK');throw error;}
 }
}
