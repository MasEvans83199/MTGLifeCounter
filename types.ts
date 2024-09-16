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
    wins: number;
  }
  
  export interface Preset {
    id: string;
    name: string;
    players: Player[];
  }
  