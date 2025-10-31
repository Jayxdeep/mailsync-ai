//conection and fetching of emails from acctns 
import Imap from 'node-imap';
// import { Readable } from 'node:stream';
import {Readable} from 'stream';
import { simpleParser, ParsedMail } from 'mailparser';

export interface ImapConfig extends Imap.Config {
  id: number; //acctn number 
}
export class ImapServ {
  private imap: Imap;
  private config: ImapConfig;
  //for each export we need to use const
  constructor(config: ImapConfig) {  //using for imap config
    this.config = config;
    this.imap = new Imap(config); //refers to instance of the class on which method is called
  }
  public connect() { //if the connect success open the inbox
    this.imap.once('ready', () => this.onReady()); //for imap connection if successful
    this.imap.once('error', (err: Error) => { //condtn for error in imap connec
      console.error(`[IMAP acc ${this.config.id}] Connection error:`, err); //somwthing went wrong while reconnectng
    })
    this.imap.once('end', () => {
      console.log(`[IMAP acc ${this.config.id}]Connection ended`)//connection is closed
    });
    console.log(`[IMAP accn ${this.config.id}]Connecting again..`);
    this.imap.connect();
  }
  private onReady() {
    console.log(`[IMAP accn ${this.config.id}]Connection successful`)
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) throw err;
      console.log(`[Imap acctn ${this.config.id}]Inboxed opened`);
      this.imap.on('mail', (numMsgs: number) => {
        console.log(`[Imap acctn ${this.config.id}]new email! you have ${numMsgs} new msgs`);
        this.fetchAndProcessEmails(box.messages.total);//get the latest msgs
      });
      this.fetchLast30days();//fetch for 30 days emails
    });

  }
  private fetchLast30days() {
    const thirtydays = new Date();
    thirtydays.setDate(thirtydays.getDate() - 30);
    const readDate = thirtydays.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    console.log(`[Imap acctn ${this.config.id}]fetch emails from last 30 days`);
    console.log(`[Imap acctn ${this.config.id}]since:${readDate}`);
    //searching to find the msgs 
    this.imap.search([['SINCE', thirtydays.toISOString()]], (err, res) => {
      if (err) throw err;
      if (res.length == 0) {
        console.log(`[Imap acctn ${this.config.id}]No emails found from past 30 days`);
        this.IdleMode();
        return;
      }
      this.fetchAndProcessEmails(res);
    });
  }
  private fetchAndProcessEmails(uids: number | number[]) {
    //fetching of mails
    const fet: Imap.ImapFetch = this.imap.fetch(uids, { bodies: '' });
    fet.on('message', (msg: any, seqno: number) => {
      console.log(`[Imap acctn ${this.config.id}]Process message ${seqno}`);
      msg.on('body', (stream:Readable, _info: any) => { 
        // const nodeStream = Readable.fromWeb(stream as any);
        simpleParser(stream, (err: Error, parsed: ParsedMail) => {
          if (err) {
            console.log(`[Imap acctn ${this.config.id}]Error in email:`, err);
            return;
          }
          const subject = parsed.subject || 'No subject';
          const from = parsed.from?.text || 'No sender';
          console.log(`[Imap acctn ${this.config.id}]-Subject:${subject}`);
          console.log(`[Imap acctn ${this.config.id}]-From:${from}`);
        })
      })
    })
    fet.once('error', (err) => {
      console.log(`[Imap acctn ${this.config.id}]fetch error:`, err);
    })
    fet.once('end', () => {
      console.log(`[Imap acctn ${this.config.id}]finished fetching`);
      if (Array.isArray(uids)) {
        this.IdleMode();
      }
    });
  }
  private IdleMode() { //idle mode for later 
    console.log(`[Imap acctn ${this.config.id}]Initial sync done`);
    // this.imap.idle();
  }
}