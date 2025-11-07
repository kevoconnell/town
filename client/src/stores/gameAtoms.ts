import { atom } from 'jotai';
import { SurvivalStats, PlayerState, BuildingLocation, Vector3 } from '@my-town/shared';

// Connection status type
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

// Basic atoms
export const playerIdAtom = atom<string | null>(null);
export const connectionStatusAtom = atom<ConnectionStatus>('disconnected');
export const playersAtom = atom<Map<string, PlayerState>>(new Map());
export const localStatsAtom = atom<SurvivalStats | null>(null);
export const isDeadAtom = atom<boolean>(false);
export const buildingsAtom = atom<BuildingLocation[]>([]);
export const localPositionAtom = atom<Vector3>({ x: 0, y: 0, z: 0 });

// Derived atom for players array
export const playersArrayAtom = atom((get) => {
  const players = get(playersAtom);
  return Array.from(players.values());
});

// Write-only atoms for actions
export const updatePlayerAtom = atom(
  null,
  (get, set, player: PlayerState) => {
    const players = new Map(get(playersAtom));
    players.set(player.id, player);
    set(playersAtom, players);

    // Update local stats and death state if this is the local player
    if (player.id === get(playerIdAtom)) {
      set(localStatsAtom, player.stats);
      set(isDeadAtom, player.isDead);
    }
  }
);

export const removePlayerAtom = atom(
  null,
  (get, set, playerId: string) => {
    const players = new Map(get(playersAtom));
    players.delete(playerId);
    set(playersAtom, players);
  }
);

// Buildings and position atoms
export const buildingsAtom = atom<BuildingLocation[]>([]);
export const localPositionAtom = atom<Vector3>({ x: 0, y: 0, z: 0 });
export const localRotationAtom = atom<number>(0);

// Tutorial state atoms
export const showTutorialAtom = atom<boolean>(false);
export const tutorialCompletedAtom = atom<boolean>(false);

// Local player position atom
export const localPositionAtom = atom<Vector3>({ x: 0, y: 2, z: 5 });
