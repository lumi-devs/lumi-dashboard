export interface UserGuild {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
}

export interface User {
  id: string;
  username: string;
  globalName?: string | null;
  avatar?: string | null;
  isOwner: boolean;
  guilds?: UserGuild[];
}

export interface Viewer extends User {
  email?: string | null;
  isBotOwner: boolean;
}
