export interface Player {
    id: number;
    name: string;
    life: number;
    manaColor: string;
    commanderDamage: number;
    poisonCounters: number;
    isDead: boolean;
    icon: string;
    wins: number;
    hasCrown: boolean;
  }
  
  export interface Preset {
    id: string;
    name: string;
    players: Player[];
  }
  