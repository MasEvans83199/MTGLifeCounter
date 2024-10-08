export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
};

export interface Player {
    id: string;
    name: string;
    life: number;
    manaColor: string;
    commanderDamage: number;
    poisonCounters: number;
    isDead: boolean;
    hasCrown: boolean;
    icon: string;
    stats: PlayerStats;
    isHost: boolean;
  }
  
  export interface PlayerStats {
    gamesPlayed: number;
    wins: number;
    totalLifeGained: number;
    totalLifeLost: number;
    totalCommanderDamageDealt: number;
    totalCommanderDamageReceived: number;
    totalPoisonCountersGiven: number;
    totalPoisonCountersReceived: number;
  }
  
  export interface Preset {
    id: string;
    name: string;
    players: Player[];
    gameState: {
      players: Player[];
      gameHistory: string[];
      gameEnded: boolean;
    } | null;
  }  