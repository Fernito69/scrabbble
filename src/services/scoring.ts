import {
  Board,
  Bonus,
  LetterLiteral,
  Move,
  PlayerMove,
} from "@/model/core.model";
import { cloneDeep } from "lodash";
import { LanguageTemplate } from "./collections/letterValueMap/languageTemplate.model";
import { bonusMultiplierMap } from "./collections/game/game.utils";
import { PLAYER_HAND_LENGTH } from "@/model/core.defaults";

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

type Vector = [number, number];

const dirVectorMapping: Record<Dir, Vector> = {
  [Dir.UP]: [0, -1],
  [Dir.DOWN]: [0, 1],
  [Dir.LEFT]: [-1, 0],
  [Dir.RIGHT]: [1, 0],
};

type WordLetter = {
  letter: Move & { score: number };
  bonus: Bonus | undefined;
};

type Word = {
  isHorizontal: boolean;
  word: WordLetter[];
};

const LETTER_BONUSES: Bonus[] = [Bonus.DOUBLE_LETTER, Bonus.TRIPLE_LETTER];
const WORD_BONUSES: Bonus[] = [Bonus.DOUBLE_WORD, Bonus.TRIPLE_WORD];
const HORIZONTAL_DIRS: Dir[] = [Dir.LEFT, Dir.RIGHT];

export class ScoringService {
  private board: Board;
  private template: LanguageTemplate;

  constructor(board: Board, template: LanguageTemplate) {
    this.board = board;
    this.template = template;
  }

  // Scores and returns updated board
  public score(playerMove: PlayerMove): ScoringResult {
    const { move } = playerMove;

    // Identify all words formed by the move
    const words: Word[] = [];

    for (const movePart of move) {
      const { letter, x, y } = movePart;
      const { bonus, tile } = this.board[y][x];

      if (tile) {
        throw new Error(
          "Cannot put a tile on a square that already has a tile"
        );
      }

      /* Helpers */

      // Checks if there is a tile in the given coordinate
      const coordHasTile = (x: number, y: number): boolean =>
        !!this.board[y]?.[x]?.tile || move.some((m) => m.x === x && m.y === y);

      // Returns the number of squares between the current
      // x,y coords and the first empty square in the given direction.
      const getNumSquaresToNextEmptySquare = (dir: Dir): number =>
        Array.from({ length: this.board.length }, (_, i) => i + 1).find(
          (diff) =>
            !coordHasTile(
              !HORIZONTAL_DIRS.includes(dir)
                ? x
                : x + (dir === Dir.RIGHT ? 1 : -1) * diff,
              HORIZONTAL_DIRS.includes(dir)
                ? y
                : y + (dir === Dir.DOWN ? 1 : -1) * diff
            )
        )! - 1;

      // Check in all directions for a neighboring letter
      const dirVectors = Object.entries(dirVectorMapping) as [Dir, Vector][];

      for (const [dir, [dx, dy]] of dirVectors) {
        const x2 = x + dx;
        const y2 = y + dy;

        // Ignore direction if no neighboring tile exists
        if (!coordHasTile(x2, y2)) continue;

        // Begin compiling the word
        const isHorizontal = HORIZONTAL_DIRS.includes(dir);
        const word: Word = {
          isHorizontal,
          word: [],
        };

        // TODO: I don't like this if statement, try to generalize horizontal/vertical cases?
        /********************/
        // If horizontal word
        /********************/
        if (isHorizontal) {
          // Check all the way to the left and right to find the start/end of the word
          const wordStartX = x - getNumSquaresToNextEmptySquare(Dir.LEFT);
          const wordEndX = x + getNumSquaresToNextEmptySquare(Dir.RIGHT);

          // Add letters to the word
          for (let x2 = wordStartX; x2 <= wordEndX; x2++) {
            const moveLetter: Move | undefined = move.find(
              (m) => m.x === x2 && m.y === y
            );

            // Check if the letter is already accounted for in another horizontal word
            const alreadyAccountedFor = words.some((w) =>
              w.word.some(
                ({ letter: l }) =>
                  l.x === x2 && l.y === y && isHorizontal === w.isHorizontal
              )
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
        }
        /********************/
        // If vertical word
        /********************/
        else {
          // Check all the way to up and down to find the start/end of the word
          const wordStartY = y - getNumSquaresToNextEmptySquare(Dir.UP);
          const wordEndY = y + getNumSquaresToNextEmptySquare(Dir.DOWN);

          // Add letters to the word
          for (let y2 = wordStartY; y2 <= wordEndY; y2++) {
            const moveLetter = move.find((m) => m.x === x && m.y === y2);

            // Check if the letter is already accounted for in another vertical word
            const alreadyAccountedFor = words.some((w) =>
              w.word.some(
                ({ letter: l }) =>
                  l.x === x && l.y === y2 && isHorizontal === w.isHorizontal
              )
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
    if (move.length === PLAYER_HAND_LENGTH) {
      score += 50;
    }

    return {
      score,
      updatedBoard: this.updateBoard(playerMove),
    };
  }

  private updateBoard = (playerMove: PlayerMove): Board => {
    const newBoard = cloneDeep(this.board);

    playerMove.move.forEach(({ x, y, letter, collapsedWildcard }) => {
      newBoard[y][x] = {
        ...newBoard[y][x],
        tile: { letter, ownerId: playerMove.playerId, collapsedWildcard },
      };
    });

    return newBoard;
  };

  private getLetterScore = (letter: LetterLiteral): number => {
    return this.template.scoreMap[letter] ?? 0;
  };
}
