// src/store/gameStore.js
import { create } from "zustand";
import { paths } from "../utils/ludoPaths";

const createPawns = () => {
  const colors = ["red", "green", "blue", "yellow"];
  const pawns = [];

  colors.forEach((color) => {
    for (let i = 0; i < 4; i++) {
      pawns.push({
        id: `${color}-${i}`,
        color,
        index: -1, // -1 = in home
        completed: false
      });
    }
  });

  return pawns;
};

const useGameStore = create((set, get) => ({
  // ✅ USER AUTH state
  username: "",
  setUsername: (username) => set({ username }),

  // ✅ LOBBY state
  gameType: "2-player",
  setGameType: (gameType) => set({ gameType }),

  coinAmount: 100,
  setCoinAmount: (coinAmount) => set({ coinAmount }),

  room: "",
  setRoom: (room) => set({ room }),

  // ✅ GAME state
  currentPlayer: "red",
  diceValue: null,
  isRolling: false,
  pawns: createPawns(),

  rollDice: () => {
    const value = Math.floor(Math.random() * 6) + 1;
    set({ diceValue: value, isRolling: false });
  },

  nextTurn: () => {
    set((state) => {
      const next =
        state.currentPlayer === "red"
          ? "green"
          : state.currentPlayer === "green"
          ? "yellow"
          : state.currentPlayer === "yellow"
          ? "blue"
          : "red";
      return { currentPlayer: next, diceValue: null };
    });
  },

  movePawn: (pawnId) => {
    const { pawns, diceValue } = get();
    if (!diceValue) return;

    const newPawns = pawns.map((p) => {
      if (p.id === pawnId) {
        if (p.index === -1 && diceValue === 6) {
          return { ...p, index: 0 };
        } else if (p.index >= 0 && p.index + diceValue < paths[p.color].length) {
          return { ...p, index: p.index + diceValue };
        }
      }
      return p;
    });

    set({ pawns: newPawns });
    get().checkKills();
    get().checkWin();
  },

  updatePawnPosition: (id, index) => {
    const pawns = get().pawns.map((p) =>
      p.id === id ? { ...p, index } : p
    );
    set({ pawns });
  },

  checkKills: () => {
    const { pawns } = get();
    const updated = [...pawns];

    for (const p1 of pawns) {
      if (p1.index < 0 || p1.completed) continue;

      for (const p2 of pawns) {
        if (
          p1.id !== p2.id &&
          p1.index === p2.index &&
          p1.color !== p2.color &&
          !p2.completed
        ) {
          const idx = updated.findIndex((x) => x.id === p2.id);
          updated[idx].index = -1;
        }
      }
    }

    set({ pawns: updated });
  },

  checkWin: () => {
    const { pawns, currentPlayer } = get();
    const finished = pawns.filter(
      (p) =>
        p.color === currentPlayer && p.index === paths[p.color].length - 1
    ).length;

    if (finished === 4) {
      alert(`🎉 ${currentPlayer.toUpperCase()} wins the game!`);
    }
  },

  resetGame: () => {
    set({
      currentPlayer: "red",
      diceValue: null,
      pawns: createPawns()
    });
  }
}));

export default useGameStore;
