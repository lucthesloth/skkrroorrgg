import { Database } from 'sqlite3';
import { AnniversaryBot } from './AnniversaryBot';
import { Config } from './Config';
const PlayerListEndpoint = 'https://plan.dominionserver.net/v1/players?server=02faecf7-9934-43ba-a928-8e4d0046bd9a';

export class Anniversary {
  declare data: Database;
  declare AnniversaryTimer: NodeJS.Timeout;
  declare UserTimer: NodeJS.Timeout;

  constructor() {
    this.data = new Database('anniversary.db');
    this.setupDatabase();
    this.AnniversaryTimer = setInterval(() => AnniversaryBot.instance.congratulateUsers(this.checkAnniversaries()), Config.config.anniversaryRefreshInterval);
    this.UserTimer = setInterval(this.refreshUsers, Config.config.userUpdateInterval);
  }
  async setupDatabase() {
    this.data.run('CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, discord TEXT, anniversary INTEGER, anniversaryNotified INTEGER DEFAULT 0)');
  }
  async refreshUsers() {    
    const response = await fetch(PlayerListEndpoint);
    const data = (await response.json()) as PlayerList;
    let name = '';
    for (const player of data.data) {
      name = player.name.split('>')[1].split('<')[0];
      this.data.run('INSERT OR IGNORE INTO users (id, discord, anniversary) VALUES (?, ?, ?)', [name, player.username['d'], player.registered['v']]);
      this.data.run('UPDATE users SET discord = ? where id = ?', [player.username['d'], name]);
    }
  }
  async checkAnniversaries(): Promise<Array<String>> {
    const now = new Date();
    const rowDate = new Date();
    const users: Array<String> = [];
    const promise = new Promise<Array<String>>((resolve, reject) => {

    this.data.each('SELECT * FROM users WHERE ? - anniversaryNotified > 86400000', [Date.now()], (err: any, row: DataRow) => {
      if (err) {
        console.error(err);
      } else {
        rowDate.setTime(row.anniversary);
        if (rowDate.getDate() == now.getDate() && rowDate.getMonth() == now.getMonth()) {
          if (row.discord && row.discord != '-') users.push(row.discord);
          this.data.run('UPDATE users SET anniversaryNotified = ? WHERE id = ?', [Date.now(), row.id]);
        }
      }
    }, (err: any) => {
        if (err) {
            reject(err);
        } else
            resolve(users);
    });
    });
    return promise;
  }
}

export interface PlayerList {
  timestamp: number;
  timestamp_f: string;
  data: Player[];
  columns: {}[];
}

export interface Player {
  sessions: string;
  name: string;
  activePlaytime: { [key: string]: string };
  index: {};
  registered: { [key: string]: any };
  permissionGroups: {};
  seen: {};
  primaryGroup: {};
  geolocation: string;
  group: {};
  username: { [key: string]: string };
}

export interface DataRow {
  id: string;
  discord: string;
  anniversary: number;
  anniversaryNotified: number;
}
