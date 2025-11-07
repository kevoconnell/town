import { atom } from 'jotai';
import { SurvivalStats, PlayerState } from '@my-town/shared';

// Basic atoms
export const playerIdAtom = atom<string | null>(null);
export const connectedAtom = atom<boolean>(false);
export const playersAtom = atom<Map<string, PlayerState>>(new Map());
export const localStatsAtom = atom<SurvivalStats | null>(null);

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

    // Update local stats if this is the local player
    if (player.id === get(playerIdAtom)) {
      set(localStatsAtom, player.stats);
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

// Tutorial state atoms
export const showTutorialAtom = atom<boolean>(false);
export const tutorialCompletedAtom = atom<boolean>(false);
