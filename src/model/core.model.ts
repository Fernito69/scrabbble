/**********
 * CORE
 **********/

export type StandardLetterLiteral =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

export type ExoticLetterLiteral =
  | "ñ"
  | "ch"
  | "rr"
  | "ll"
  | "ö"
  | "ä"
  | "ü"
  | "ø"
  | "œ"
  | "å";

export type LetterLiteral = StandardLetterLiteral | ExoticLetterLiteral;
export type LetterValueMap = {
  [key in StandardLetterLiteral]: number;
} & { [key in ExoticLetterLiteral]?: number };

export enum Bonus {
  DOUBLE_LETTER = "double_letter",
  DOUBLE_WORD = "double_word",
  TRIPLE_LETTER = "triple_letter",
  TRIPLE_WORD = "triple_word",
}

export type Tile = {
  ownerId: string;
  letter: LetterLiteral;
  newlyPlaced?: boolean;
};

export type Square = {
  tile?: Tile;
  bonus?: Bonus;
};

// Each row has 15 squares, and there are 15 rows,
// for a total of 225 arranged in a 2D square array
export type BoardRow = [
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square,
  Square
];

export type Board = [
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow,
  BoardRow
];

type PlayerScore = {
  [PlayerId: string]: number;
};
export type ScoreState = {
  total: PlayerScore;
  perTurn: (PlayerScore & { turn: number })[];
};

// requires x,y coordinates, and a letter. It's an array of moves, fix in model below
export type Move = {
  x: number;
  y: number;
  letter: LetterLiteral;
};
export type PlayerMove = {
  playerId: string;
  move: Move;
};

export type GameState = {
  board: Board;
  playerIds: [
    string,
    string | undefined,
    string | undefined,
    string | undefined
  ];
  currentPlayerId: string | undefined;
  currentTurn: number;
  score: ScoreState;
  gameStarted: boolean;
  gameOver: boolean;
  currentProposedMove: PlayerMove | undefined;
  currentVote: Vote | undefined;
};

// For now just boolean votes
export type Vote = {
  proposerId?: string;
  description: string;
  timeLeft?: number;
  voteFinished: boolean;
  votes: {
    playerId: string;
    voted: boolean;
  }[];
};
