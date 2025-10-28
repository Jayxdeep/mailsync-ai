// index.ts

import dotenv from 'dotenv';
import { ImapServ,ImapConfig } from './services/imapserv.js';
dotenv.config();

function getImapConfigs(): ImapConfig[] {
  const configs: ImapConfig[] = [];
  let i = 1;

  // Loop through environment variables to find all account configurations
  while (process.env[`IMAP_USER_${i}`]) {
    const user = process.env[`IMAP_USER_${i}`];
    const password = process.env[`IMAP_PASS_${i}`];
    const host = process.env[`IMAP_HOST_${i}`];

    if (user && password && host) {
      configs.push({
        id: i,
        user,
        password,
        host,
        port: 993,
        tls: true,
      });
    }
    i++;
  }
  return configs;
}

function main() {
  const imapConfigs = getImapConfigs();
  if (imapConfigs.length === 0) {
    console.error("No IMAP configurations found in .env file. Please check your configuration.");
    return;
  }

  console.log(`Found ${imapConfigs.length} IMAP account(s) to sync.`);

  // Create and start an ImapService for each configuration
  for (const config of imapConfigs) {
    const imapserv=new ImapServ(config);
    imapserv.connect();
  }
}

main();