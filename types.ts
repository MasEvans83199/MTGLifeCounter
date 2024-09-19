export interface Player {
    id: number;
    name: string;
    life: number;
    manaColor: string;
    commanderDamage: number;
    poisonCounters: number;
    isDead: boolean;
    hasCrown: boolean;
    icon: string;
    stats: PlayerStats;
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