import dotenv from 'dotenv';
import { ImapServ,ImapConfig } from './services/imapserv';
dotenv.config();

function getImapConfigs(): ImapConfig[] {
  const configs: ImapConfig[] = [];
  let i = 1;
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
    console.error("No IMAP configurations found.");
    return;
  }

  console.log(`Found ${imapConfigs.length} IMAP account to sync.`);
  for (const config of imapConfigs) {
    const imapserv=new ImapServ(config);
    imapserv.connect();
  }
}

main();