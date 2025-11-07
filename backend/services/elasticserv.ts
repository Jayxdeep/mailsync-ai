import {Client} from '@elastic/elasticsearch';
class Es{
    private client: Client;
    public readonly indName='emails';//cant be reassigned again
    constructor(){
        this.client=new Client({
            node:'http://localhost:9200'
        });
    }
    public aysnc connect(){ //connecting with emails 
        try{
            await this.client.ping();
            console.log('connected to elasticsearch')
            await this.createIndex();
        }catch(error){
            console.error('failed to connect to elastic')
            console.error(error);
            process.exit(1);
        }
    }
    private async createIndex(){ //create emails index if not exits
        const indexExits=await this.client.indices.exists({
            index:this.indName
        })
        if(!indexExits){
            console.log(`Index "${this.indName}" does not exit`)
            await this.client.indices.create({index:this.indName});
            console.log(`Index "${this.indName}" created`);
        }else{
            console.log(`Index "${this.indName}" already exists`);
        }
    }
    public async indexEmail(emailData:Record<string,any>){//
        
    }
}
export const elasticSearch =new Es();