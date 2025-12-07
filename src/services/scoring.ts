import {
  Board,
  Bonus,
  LetterLiteral,
  Move,
  PlayerMove,
} from "@/model/core.model";
import { cloneDeep } from "lodash";
import { LanguageTemplate } from "./collections/letterValueMap/languageTemplate.model";

interface ScoringResult {
  score: number;
  updatedBoard: Board;
}

enum Dir {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
}

type Tuple = [number, number];

// X, Y, and opposite direction
const dirMapping: Record<Dir, Tuple> = {
  [Dir.UP]: [0, -1],
  [Dir.DOWN]: [0, 1],
  [Dir.LEFT]: [-1, 0],
  [Dir.RIGHT]: [1, 0],
};

// const HORIZONTAL_DIRS = [Dir.LEFT, Dir.RIGHT] as const;
// const VERTICAL_DIRS = [Dir.UP, Dir.DOWN] as const;

type WordLetter = {
  letter: Move & { score: number };
  bonus: Bonus | undefined;
};

type Word = {
  horizontal: boolean;
  word: WordLetter[];
};

const bonusMultiplierMap: Record<Bonus, number> = {
  [Bonus.DOUBLE_LETTER]: 2,
  [Bonus.DOUBLE_WORD]: 2,
  [Bonus.TRIPLE_LETTER]: 3,
  [Bonus.TRIPLE_WORD]: 3,
};

const LETTER_BONUSES = [Bonus.DOUBLE_LETTER, Bonus.TRIPLE_LETTER] as Bonus[];
const WORD_BONUSES = [Bonus.DOUBLE_WORD, Bonus.TRIPLE_WORD] as Bonus[];

export class ScoringService {
  private board: Board;
  private template: LanguageTemplate;

  constructor(board: Board, template: LanguageTemplate) {
    this.board = board;
    this.template = template;
  }

  // Returns updated board
  public score(playerMove: PlayerMove): ScoringResult {
    const { move: moves } = playerMove;

    // Identify words formed by the move
    const words: Word[] = [];

    for (const move of moves) {
      const { letter, x, y } = move;
      const { bonus, tile } = this.board[y][x];

      if (tile) {
        throw new Error(
          "Cannot put a tile on a square that already has a tile"
        );
      }

      // Helpers
      const getDiff = (
        moves: Move[],
        dim: "x" | "y",
        multi: 1 | -1
      ): number => {
        return (
          Array(this.board.length)
            .fill(0)
            .map((_, i) => i + 1)
            .find((dif) => {
              const yIndex = dim === "x" ? y : y + multi * dif;
              const xIndex = dim === "y" ? x : x + multi * dif;
              return (
                !this.board[yIndex]?.[xIndex]?.tile &&
                !moves.some((m) => m.x === xIndex && m.y === yIndex)
              );
            })! - 1
        );
      };

      // Check in all directions for a neighboring letter
      for (const [dir, [dx, dy]] of Object.entries(dirMapping)) {
        const newX = x + dx;
        const newY = y + dy;

        const neighborExists =
          this.board[newY]?.[newX]?.tile ||
          moves.some((m) => m.x === newX && m.y === newY);

        if (!neighborExists) continue;

        // Check the word's orientation (horizontal or vertical)
        const horizontal = dir === Dir.LEFT || dir === Dir.RIGHT;

        const word: Word = {
          horizontal,
          word: [],
        };

        if (horizontal) {
          // Check all the way to the left and right to find the start/end of the word
          const wordStartX = x - getDiff(moves, "x", -1);
          const wordEndX = x + getDiff(moves, "x", 1);

          // Add letters to the word
          for (let x2 = wordStartX; x2 <= wordEndX; x2++) {
            const moveLetter: Move | undefined = moves.find(
              (m) => m.x === x2 && m.y === y
            );

            // Check if the letter is already accounted for
            // This only counts for the letters that are not in the move
            const alreadyAccountedFor = words.some(
              ({ horizontal: thisWordHorizontal, word }) => {
                return word.some(
                  ({ letter: l }) =>
                    l.x === x2 && l.y === y && horizontal === thisWordHorizontal
                );
              }
            );

            if (alreadyAccountedFor) {
              continue;
            }

            if (x === x2) {
              if (moveLetter) {
                word.word.push({
                  letter: {
                    letter,
                    x,
                    y,
                    score: this.getLetterScore(letter),
                  },
                  bonus,
                });
              }
            } else {
              const { tile, bonus } = this.board[y]?.[x2] ?? {};

              const currLetter = (moveLetter?.letter ?? tile?.letter)!;
              const currBonus = moveLetter ? bonus : undefined;

              word.word.push({
                letter: {
                  letter: currLetter,
                  x: x2,
                  y,
                  score: this.getLetterScore(currLetter),
                },
                bonus: currBonus,
              });
            }
          }

          words.push(word);
        } else {
          // Check all the way to up and down to find the start/end of the word
          const wordStartY = y - getDiff(moves, "y", -1);
          const wordEndY = y + getDiff(moves, "y", 1);

          // Add letters to the word
          for (let y2 = wordStartY; y2 <= wordEndY; y2++) {
            const moveLetter = moves.find((m) => m.x === x && m.y === y2);

            // Check if the letter is already accounted for
            const alreadyAccountedFor = words.some(
              ({ horizontal: thisWordHorizontal, word }) => {
                return word.some(
                  ({ letter: l }) =>
                    l.x === x && l.y === y2 && horizontal === thisWordHorizontal
                );
              }
            );

            if (alreadyAccountedFor) {
              continue;
            }

            if (y === y2) {
              if (moveLetter) {
                word.word.push({
                  letter: {
                    letter,
                    x,
                    y,
                    score: this.getLetterScore(letter),
                  },
                  bonus,
                });
              }
            } else {
              const { tile, bonus } = this.board[y2]?.[x] ?? {};

              const currLeter = (moveLetter?.letter ?? tile?.letter)!;
              const currBonus = moveLetter ? bonus : undefined;

              word.word.push({
                letter: {
                  letter: currLeter,
                  x,
                  y: y2,
                  score: this.getLetterScore(currLeter),
                },
                bonus: currBonus,
              });
            }
          }

          if (word.word.length > 0) words.push(word);
        }
      }
    }

    // Now that we have the words, let's compute the scores
    let score: number = 0;

    words.forEach(({ word }) => {
      let wordMulti: number = 1;
      let wordScore: number = 0;

      console.log("word", word.map((w) => w.letter.letter).join(""));

      word.forEach(({ letter, bonus }) => {
        let letterScore = letter.score;
        if (bonus && WORD_BONUSES.includes(bonus)) {
          wordMulti *= bonusMultiplierMap[bonus];
        }
        if (bonus && LETTER_BONUSES.includes(bonus)) {
          letterScore *= bonusMultiplierMap[bonus];
        }
        wordScore += letterScore;
      });

      score += wordScore * wordMulti;
    });

    // Using all 7 letters gives you extra 50 points
    if (moves.length === 7) {
      score += 50;
    }

    return {
      score,
      updatedBoard: this.updateBoard(playerMove),
    };
  }

  private updateBoard = (playerMove: PlayerMove): Board => {
    const newBoard = cloneDeep(this.board);

    playerMove.move.forEach(({ x, y, letter }) => {
      newBoard[y][x] = {
        tile: { letter, ownerId: playerMove.playerId },
      };
    });

    return newBoard;
  };

  private getLetterScore = (letter: LetterLiteral): number => {
    return this.template.scoreMap[letter] ?? 0;
  };
}
