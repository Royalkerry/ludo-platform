module.exports = {
    SAFE_POSITIONS: [1, 9, 14, 22, 27, 35, 40, 48],
    HOME_ENTRY: { red: 51, yellow: 12, green: 25, blue: 38 },
    HOME_TRACKS: {
        red: [101, 102, 103, 104, 105, 999],
        yellow: [201, 202, 203, 204, 205, 999],
        green: [301, 302, 303, 304, 305, 999],
        blue: [401, 402, 403, 404, 405, 999],
    },

    createInitialPositions() {
        return {
            red: [0, 0, 0, 0],
            green: [0, 0, 0, 0],
            yellow: [0, 0, 0, 0],
            blue: [0, 0, 0, 0],
        };
    },

    hasAnyPawnOnBoard(positions, color) {
        return positions[color].some((p) => p > 0);
    },

    getStartPosition(color) {
        switch (color) {
            case "red": return 1;
            case "yellow": return 14;
            case "green": return 27;
            case "blue": return 40;
            default: return 0;
        }
    },

    // ----------- Get Next Position ----------
    getNextPosition(color, currentPos, steps) {
        const { HOME_ENTRY, HOME_TRACKS } = this;

        // Already in home track
        if (HOME_TRACKS[color].includes(currentPos)) {
            const index = HOME_TRACKS[color].indexOf(currentPos);
            const newIndex = index + steps;

            // Overshoot center cell not allowed
            if (newIndex >= HOME_TRACKS[color].length) {
                return currentPos; // can't move
            }
            return HOME_TRACKS[color][newIndex];
        }

        // Normal track -> entering home
        let newPos = currentPos + steps;

        if (currentPos <= HOME_ENTRY[color] && newPos > HOME_ENTRY[color]) {
            const overshoot = newPos - HOME_ENTRY[color];
            // Check overshoot in home track
            if (overshoot >= HOME_TRACKS[color].length) return currentPos; // can't move
            return HOME_TRACKS[color][overshoot - 1];
        }

        if (newPos > 52) newPos -= 52;
        return newPos;
    },

    // ----------- Handle Kill ----------
    handleKill(positions, color, pawnIndex) {
        const pos = positions[color][pawnIndex];
        if (this.SAFE_POSITIONS.includes(pos) || pos === 999) return false;

        let killed = false;
        for (const opponent in positions) {
            if (opponent !== color) {
                positions[opponent] = positions[opponent].map((p) => {
                    if (p === pos) {
                        killed = true;
                        return 0;
                    }
                    return p;
                });
            }
        }
        return killed;
    },

    mustMoveHomeFirst() {
        return false; // disabled old rule
    },

    // ----------- Move Piece ----------
    movePiece(room, color, pawnIndex, dice) {
        const positions = JSON.parse(JSON.stringify(room.positions));
        const currentPos = positions[color][pawnIndex];

        // Must move from home first rule
        const mustMoveHome = this.mustMoveHomeFirst(room.positions, color, dice);
        if (mustMoveHome && currentPos !== 0) {
            return {
                error: "move home pawn first",
                positions: room.positions,
                killed: false,
                nextTurnIndex: room.currentTurnIndex,
                extraTurnRequired: false,
                forceNextTurn: false
            };
        }

        // Pawn at home
        if (currentPos === 0) {
            if (dice === 6) {
                positions[color][pawnIndex] = this.getStartPosition(color);
                return {
                    positions,
                    killed: false,
                    nextTurnIndex: room.currentTurnIndex,
                    extraTurnRequired: true,
                    forceNextTurn: false
                };
            } else {
                const allHome = room.positions[color].every(p => p === 0);
                return {
                    error: allHome ? "all pawns home" : "no move from home",
                    positions: room.positions,
                    killed: false,
                    nextTurnIndex: (room.currentTurnIndex + 1) % room.users.length,
                    extraTurnRequired: false,
                    forceNextTurn: allHome
                };
            }
        }

        // Normal move
        const newPos = this.getNextPosition(color, currentPos, dice);

        // Count active pawns on board (excluding home & win)
        const activePawns = room.positions[color].filter(p => p !== 0 && p !== 999).length;

        // If can't move due to overshoot -> skip turn
        if (newPos === currentPos) {
            return {
                error: "overshoot not allowed",
                positions: room.positions,
                killed: false,
                nextTurnIndex: (room.currentTurnIndex + 1) % room.users.length,
                extraTurnRequired: false,
                forceNextTurn: (activePawns ===1)
            };
        }

        positions[color][pawnIndex] = newPos;
        const killed = this.handleKill(positions, color, pawnIndex);

        let nextTurnIndex = room.currentTurnIndex;
        let extraTurnRequired = false;

        const pawnReachedHome = newPos === 999;

        if (dice === 6 || killed || pawnReachedHome) {
            extraTurnRequired = true;
        } else {
            nextTurnIndex = (room.currentTurnIndex + 1) % room.users.length;
        }

        // Check win
        const won = positions[color].every(p => p === 999);

        return { positions, killed, nextTurnIndex, extraTurnRequired, forceNextTurn: false, won };
    }
};
