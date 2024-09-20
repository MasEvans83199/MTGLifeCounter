import { db } from '../firebaseConfig';

export const createGame = async (hostId: string) => {
  const gameRef = db.ref('games').push();
  const gameId = gameRef.key;
  await gameRef.set({
    hostId,
    players: {},
    gameState: null,
  });
  return gameId;
};

export const joinGame = async (gameId: string, playerId: string) => {
  const gameRef = db.ref(`games/${gameId}`);
  const snapshot = await gameRef.once('value');
  if (snapshot.exists()) {
    await gameRef.child('players').update({ [playerId]: true });
    return true;
  }
  return false;
};

export const updateGameState = async (gameId: string, gameState: any) => {
    let sanitizedGameHistory = [];
    
    if (gameState.gameHistory && Array.isArray(gameState.gameHistory)) {
        sanitizedGameHistory = gameState.gameHistory.filter((event: string | undefined) => event !== undefined);
    }

    const sanitizedGameState = {
        ...gameState,
        gameHistory: sanitizedGameHistory
    };

    await db.ref(`games/${gameId}/gameState`).set(sanitizedGameState);
}

export const listenToGameState = (gameId: string, callback: (gameState: any) => void) => {
  const gameRef = db.ref(`games/${gameId}/gameState`);
  gameRef.on('value', (snapshot) => {
    const gameState = snapshot.val();
    if (gameState) {
      callback(gameState);
    }
  });
  return () => gameRef.off('value');
};
