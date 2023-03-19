import * as fs from "fs";
import * as path from "path";
export interface Config {
    token: string;
    anniversaryRefreshInterval: number;
    userUpdateInterval: number;
    clientID: string;
    Guilds: {[key: string]: Guild}
}
export interface Guild {
    id: string;
    announce?: string;
}

export class Config {    
    static config: Config;
    static configPath: string = path.join(__dirname,'..', "config.json");
    static loadConfig(){
        try {
            this.config = JSON.parse(fs.readFileSync(this.configPath, "utf-8"));
        } catch (e) {
            console.error("Config file not found. Please create a config.json file in the root directory.");
            this.config = {
                anniversaryRefreshInterval: 3600000,
                userUpdateInterval: 86400000,
                token: "",
                clientID: "",
                Guilds: {}
            };
            this.saveConfig();
        }
    }
    static saveConfig() {
        console.log("Saving config file...")
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 4));        
    }
    static setAnnounceChannel(guildID: string, channelID: string){
        this.config.Guilds[guildID].announce = channelID;
        this.saveConfig();
    }
    static getAnnounceChannel(guildID: string): string {
        return this.config.Guilds[guildID].announce ?? "";
    }
}