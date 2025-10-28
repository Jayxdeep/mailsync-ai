//conection and fetching of emails from acctns 
import Imap, { errorMonitor } from 'node-imap';
import {simpleParser} from 'mailparser';
export interface ImapConfig extends Imap.Config{
    id:number; //acctn number 
}
export class ImapServ{
    private imap:Imap;
    private config:ImapConfig;
    //for each export we need to use const
    constructor(config:ImapConfig){  //using for imap config
        this.config=config;
        this.imap=new Imap(config); //refers to instance of the class on which method is called
    }
    public connect(){ //if the connect success open the inbox
        this.imap.once('ready',()=> this.onReady()); //for imap connection if successful
        this.imap.once('error',(err:Error)=>{ //condtn for error in imap connec
            console.error(`[IMAP acc ${this.config.id}] Connection error:`,err); //somwthing went wrong while reconnectng
        })
        this.imap.once('end',()=>{
            console.log(`[IMAP acc ${this.config.id}]Connection ended`)//connection is closed
        });
        console.log(`[IMAP accn ${this.config.id}]Connecting again..`);
        this.imap.connect();
    }
    private onReady(){
        console.log(`[IMAP accn ${this.config.id}]Connection successful`)
        this.imap.openBox('Inbox',false,(err,box)=>{
            if(err)throw err;
            console.log(`[Imap acctn ${this.config.id}]Inboxed opened`);
            this.imap.on('Mail',(numMsgs:number)=>{
                console.log(`[Imap acctn ${this.config.id}]new email! you have ${numMsgs} new msgs`);
                this.fetchAndProcessEmails(box.messages.total);//get the latest msgs
            });
            this.fetchLast30days();//fetch for 30 days emails
        });

    }
    private fetchLast30days(){
        const thirtydays=new Date();
        thirtydays.setDate(thirtydays.getDate()-30);
        const readDate=thirtydays.toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'})
        console.log(`[Imap acctn ${this.config.id}]fetch emails from last 30 days`);
        console.log(`[Imap acctn ${this.config.id}]since:${readDate}`);
        //searching to find the msgs 
        this.imap.search([['SINCE',thirtydays.toISOString()]],(err,res)=>{
            if(err) throw err;
            if(res.length==0){
                console.log(`[Imap acctn ${this.config.id}]No emails found from past 30 days`);
                this.IdleMode();
                return;
            }
             this.fetchAndProcessEmails(res);
        });
    }
    private fetchAndProcessEmails(uids: number|number[]){
        //fetching of mails
        const fet=this.imap.fetch(uids,{bodies: ''});//will take the uids of imap function
        fet.on('message',(msg,seqno)=>{
            console.log(`[Imap acctn ${this.config.id}]Process message #${seqno}`);
            msg.on('body',(stream,info)=>{
                simpleParser(stream,async(errorMonitor,parsed)=>{
                    if(err){
                        console.log(`[Imap acctn ${this.config.id}]Error in email:`,err);
                        return;
                    }
                })
            })
        })
    }
    private IdleMode(){ //idle mode for later 
    }
}