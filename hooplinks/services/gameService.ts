
import { Game, SkillLevel, PlayerEntry, User, Notification } from '../types';

const STORAGE_KEY = 'hoopslink_games';
const NOTIFICATIONS_KEY = 'hoopslink_notifications';

export const getGames = (): Game[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
};

export const saveGames = (games: Game[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
};

export const getNotifications = (userId: string): Notification[] => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) return [];
  try {
    const all: Notification[] = JSON.parse(data);
    return all.filter(n => n.userId === userId);
  } catch (e) {
    return [];
  }
};

export const clearNotifications = (userId: string) => {
  const data = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!data) return;
  try {
    const all: Notification[] = JSON.parse(data);
    const filtered = all.filter(n => n.userId !== userId);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
  } catch (e) { }
};

export const createGame = (gameData: Omit<Game, 'id' | 'players' | 'createdAt' | 'isLocked'>): Game => {
  const games = getGames();
  const newGame: Game = {
    ...gameData,
    id: Math.random().toString(36).substr(2, 9),
    players: [],
    createdAt: Date.now(),
    isLocked: false,
  };
  saveGames([...games, newGame]);
  return newGame;
};

export const updateGame = (gameId: string, updates: Partial<Game>): Game | null => {
  const games = getGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return null;
  
  games[index] = { ...games[index], ...updates };
  saveGames(games);
  return games[index];
};

export const deleteGame = (gameId: string, reason: string) => {
  const games = getGames();
  const gameToDelete = games.find(g => g.id === gameId);
  
  if (gameToDelete) {
    const notificationsData = localStorage.getItem(NOTIFICATIONS_KEY);
    let notifications: Notification[] = notificationsData ? JSON.parse(notificationsData) : [];
    
    // Notify all registered players
    gameToDelete.players.forEach(p => {
      notifications.push({
        id: Math.random().toString(36).substr(2, 9),
        userId: p.userId,
        gameTitle: gameToDelete.title,
        reason: reason,
        timestamp: Date.now(),
        read: false
      });
    });
    
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  }

  const filtered = games.filter(g => g.id !== gameId);
  saveGames(filtered);
};

export const joinGame = (gameId: string, user: User, phone?: string): Game | null => {
  const games = getGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return null;

  const game = games[index];
  
  // Prevent duplicate join
  if (game.players.some(p => p.userId === user.id)) return game;

  const confirmedCount = game.players.filter(p => p.status === 'confirmed').length;
  const status = confirmedCount < game.maxPlayers ? 'confirmed' : 'waitlist';

  const newPlayer: PlayerEntry = {
    userId: user.id,
    name: user.name,
    phone: phone || user.phone,
    joinedAt: Date.now(),
    status,
  };

  game.players.push(newPlayer);
  saveGames(games);
  return game;
};

export const manuallyAddPlayer = (gameId: string, name: string, phone?: string): Game | null => {
  const games = getGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return null;

  const game = games[index];
  const confirmedCount = game.players.filter(p => p.status === 'confirmed').length;
  const status = confirmedCount < game.maxPlayers ? 'confirmed' : 'waitlist';

  const newPlayer: PlayerEntry = {
    userId: 'manual-' + Math.random().toString(36).substr(2, 9),
    name,
    phone,
    joinedAt: Date.now(),
    status,
  };

  game.players.push(newPlayer);
  saveGames(games);
  return game;
};

export const updatePlayerInGame = (gameId: string, userId: string, updates: Partial<PlayerEntry>): Game | null => {
  const games = getGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return null;

  const game = games[index];
  const playerIndex = game.players.findIndex(p => p.userId === userId);
  if (playerIndex === -1) return null;

  game.players[playerIndex] = { ...game.players[playerIndex], ...updates };
  saveGames(games);
  return game;
};

export const removePlayerFromGame = (gameId: string, userId: string): Game | null => {
  return leaveGame(gameId, userId);
};

export const leaveGame = (gameId: string, userId: string): Game | null => {
  const games = getGames();
  const index = games.findIndex(g => g.id === gameId);
  if (index === -1) return null;

  const game = games[index];
  const playerLeaving = game.players.find(p => p.userId === userId);
  
  game.players = game.players.filter(p => p.userId !== userId);

  // If a confirmed player leaves, pull the first person from the waitlist
  if (playerLeaving?.status === 'confirmed') {
    const nextInWaitlist = game.players.find(p => p.status === 'waitlist');
    if (nextInWaitlist) {
      nextInWaitlist.status = 'confirmed';
    }
  }

  saveGames(games);
  return game;
};

export const getUniquePlayers = () => {
  const games = getGames();
  const playersMap = new Map<string, { userId: string, name: string, phone?: string, gamesPlayed: number, lastPlayed: number }>();

  games.forEach(game => {
    game.players.forEach(p => {
      const existing = playersMap.get(p.userId);
      if (existing) {
        existing.gamesPlayed += 1;
        if (game.createdAt > existing.lastPlayed) {
          existing.lastPlayed = game.createdAt;
        }
      } else {
        playersMap.set(p.userId, {
          userId: p.userId,
          name: p.name,
          phone: p.phone,
          gamesPlayed: 1,
          lastPlayed: game.createdAt
        });
      }
    });
  });

  return Array.from(playersMap.values()).sort((a, b) => b.gamesPlayed - a.gamesPlayed);
};
