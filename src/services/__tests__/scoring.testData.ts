import { EMPTY_BOARD } from "@/model/core.defaults";
import { Board, LetterLiteral, PlayerMove, Square } from "@/model/core.model";
import { cloneDeep } from "lodash";

interface ScoringTestData {
  name: string;
  board: () => Board;
  playerMove: PlayerMove;
  expectedScore: number;
  skip: boolean;
}

const toSquare = (letter: LetterLiteral): Square => ({
  tile: { letter, ownerId: "player1" },
});

export const scoringTestData: ScoringTestData[] = [
  {
    name: "Single horizontal word, no bonus",
    skip: true,
    board: () => EMPTY_BOARD,
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 5,
          y: 4,
          letter: "h",
        },
        {
          x: 6,
          y: 4,
          letter: "o",
        },
        {
          x: 7,
          y: 4,
          letter: "l",
        },
        {
          x: 8,
          y: 4,
          letter: "a",
        },
      ],
    },
    expectedScore: 7,
  },
  {
    name: "Single vertical word, no bonus",
    skip: true,
    board: () => EMPTY_BOARD,
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 4,
          y: 0,
          letter: "h",
        },
        {
          x: 4,
          y: 1,
          letter: "o",
        },
        {
          x: 4,
          y: 2,
          letter: "l",
        },
        {
          x: 4,
          y: 3,
          letter: "a",
        },
      ],
    },
    expectedScore: 7,
  },
  {
    name: "Single horizontal word, word bonus",
    skip: true,
    board: () => EMPTY_BOARD,
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 0,
          y: 1,
          letter: "h",
        },
        {
          x: 1,
          y: 1,
          letter: "o",
        },
        {
          x: 2,
          y: 1,
          letter: "l",
        },
        {
          x: 3,
          y: 1,
          letter: "a",
        },
      ],
    },
    expectedScore: 14,
  },
  {
    name: "Single horizontal word, letter bonus",
    skip: true,
    board: () => EMPTY_BOARD,
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 3,
          y: 0,
          letter: "h",
        },
        {
          x: 4,
          y: 0,
          letter: "o",
        },
        {
          x: 5,
          y: 0,
          letter: "l",
        },
        {
          x: 6,
          y: 0,
          letter: "a",
        },
      ],
    },
    expectedScore: 11,
  },
  {
    name: "Single horizontal word, word + letter bonus",
    skip: true,
    board: () => EMPTY_BOARD,
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 0,
          y: 0,
          letter: "h",
        },
        {
          x: 1,
          y: 0,
          letter: "o",
        },
        {
          x: 2,
          y: 0,
          letter: "l",
        },
        {
          x: 3,
          y: 0,
          letter: "a",
        },
      ],
    },
    expectedScore: 24,
  },
  {
    name: "Single word, use all letters",
    skip: true,
    board: () => EMPTY_BOARD,
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 0,
          y: 5,
          letter: "b",
        },
        {
          x: 1,
          y: 5,
          letter: "a",
        },
        {
          x: 2,
          y: 5,
          letter: "l",
        },
        {
          x: 3,
          y: 5,
          letter: "t",
        },
        {
          x: 4,
          y: 5,
          letter: "i",
        },
        {
          x: 5,
          y: 5,
          letter: "c",
        },
        {
          x: 6,
          y: 5,
          letter: "o",
        },
      ],
    },
    expectedScore: 69,
  },
  {
    name: "Pluralize word",
    skip: true,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[4][5] = toSquare("o");
      newBoard[4][6] = toSquare("l");
      newBoard[4][7] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 8,
          y: 4,
          letter: "s",
        },
      ],
    },
    expectedScore: 4,
  },
  {
    name: "Pluralize 2 words",
    skip: true,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[4][5] = toSquare("o");
      newBoard[4][6] = toSquare("l");
      newBoard[4][7] = toSquare("a");
      newBoard[1][8] = toSquare("o");
      newBoard[2][8] = toSquare("l");
      newBoard[3][8] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 8,
          y: 4,
          letter: "s",
        },
      ],
    },
    expectedScore: 8,
  },
  {
    name: "Pluralize 2 words + word bonus",
    skip: true,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[7][11] = toSquare("o");
      newBoard[7][12] = toSquare("l");
      newBoard[7][13] = toSquare("a");
      newBoard[4][14] = toSquare("o");
      newBoard[5][14] = toSquare("l");
      newBoard[6][14] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 14,
          y: 7,
          letter: "s",
        },
      ],
    },
    expectedScore: 24,
  },
  {
    name: "Pluralize 2 words + letter bonus",
    skip: true,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[7][8] = toSquare("o");
      newBoard[7][9] = toSquare("l");
      newBoard[7][10] = toSquare("a");
      newBoard[4][11] = toSquare("o");
      newBoard[5][11] = toSquare("l");
      newBoard[6][11] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 11,
          y: 7,
          letter: "s",
        },
      ],
    },
    expectedScore: 10,
  },
  {
    name: "Use existing word as base",
    skip: false,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[4][5] = toSquare("o");
      newBoard[4][6] = toSquare("l");
      newBoard[4][7] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 6,
          y: 2,
          letter: "h",
        },
        {
          x: 6,
          y: 3,
          letter: "o",
        },
        {
          x: 6,
          y: 5,
          letter: "a",
        },
      ],
    },
    expectedScore: 11,
  },
  {
    name: "Use two existing words as base",
    skip: false,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[4][5] = toSquare("o");
      newBoard[4][6] = toSquare("l");
      newBoard[4][7] = toSquare("a");
      newBoard[6][6] = toSquare("o");
      newBoard[6][7] = toSquare("l");
      newBoard[6][8] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      playerId: "player1",
      tentativeNewHand: [] as any,
      move: [
        {
          x: 6,
          y: 5,
          letter: "i",
        },
        {
          x: 6,
          y: 7,
          letter: "s",
        },
      ],
    },
    expectedScore: 4,
  },
  {
    name: "Use two letters of existing word as base",
    skip: true,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[4][5] = toSquare("o");
      newBoard[4][6] = toSquare("l");
      newBoard[4][7] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 6,
          y: 5,
          letter: "a",
        },
        {
          x: 7,
          y: 5,
          letter: "l",
        },
        {
          x: 8,
          y: 5,
          letter: "a",
        },
      ],
    },
    expectedScore: 7,
  },
  {
    name: "2x word bonus + 2nd word extension",
    skip: false,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[5][4] = toSquare("r");
      newBoard[6][4] = toSquare("o");
      newBoard[7][4] = toSquare("q");
      newBoard[8][4] = toSquare("u");
      newBoard[9][4] = toSquare("e");
      newBoard[10][5] = toSquare("e");
      newBoard[10][6] = toSquare("c");
      newBoard[10][7] = toSquare("o");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 4,
          y: 3,
          letter: "e",
        },
        {
          x: 4,
          y: 4,
          letter: "n",
        },
        {
          x: 4,
          y: 10,
          letter: "s",
        },
      ],
    },
    expectedScore: 60,
  },
  {
    name: "Corner word",
    skip: false,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[1][0] = toSquare("a");
      newBoard[1][1] = toSquare("l");
      newBoard[0][1] = toSquare("a");
      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 0,
          y: 0,
          letter: "l",
        },
      ],
    },
    expectedScore: 12,
  },
  {
    name: "Tuja + Roquero",
    skip: false,
    board: () => {
      const newBoard = cloneDeep(EMPTY_BOARD);
      newBoard[6][8] = toSquare("r");
      newBoard[7][8] = toSquare("o");
      newBoard[8][8] = toSquare("q");
      newBoard[9][8] = toSquare("u");
      newBoard[10][8] = toSquare("e");
      newBoard[11][8] = toSquare("r");
      newBoard[12][8] = toSquare("o");

      return newBoard;
    },
    playerMove: {
      tentativeNewHand: [] as any,
      playerId: "player1",
      move: [
        {
          x: 7,
          y: 9,
          letter: "t",
        },
        {
          x: 9,
          y: 9,
          letter: "j",
        },
        {
          x: 10,
          y: 9,
          letter: "a",
        },
      ],
    },
    expectedScore: 27,
  },
];
