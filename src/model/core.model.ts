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
  | "x"
  | "y"
  | "z";

export type ExoticLetterLiteral =
  | "w"
  | "k"
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

// Used to represent the wildcard
export type SpecialLetterLiteral = "0";

export type LetterLiteral =
  | StandardLetterLiteral
  | ExoticLetterLiteral
  | SpecialLetterLiteral;
export type LetterValueMap = {
  [key in StandardLetterLiteral]: number;
} & { [key in ExoticLetterLiteral]?: number } & {
  [key in SpecialLetterLiteral]?: number;
};

export enum Bonus {
  DOUBLE_LETTER = "double_letter",
  DOUBLE_WORD = "double_word",
  TRIPLE_LETTER = "triple_letter",
  TRIPLE_WORD = "triple_word",
}

export type Tile = {
  ownerId: string;
  letter: LetterLiteral;
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
type ScorePerTurn = {
  playerId: string;
  turn: number;
  score: number;
};
export type ScoreState = {
  total: PlayerScore;
  perTurn: ScorePerTurn[];
};

// requires x,y coordinates, and a letter. It's an array of moves, fix in model below
export type Move = {
  x: number;
  y: number;
  letter: LetterLiteral;
};
export type PlayerMove = {
  playerId: string;
  move: Move[];
  tentativeNewHand: PlayerHand;
};
export type PlayerHand = [
  LetterLiteral | null,
  LetterLiteral | null,
  LetterLiteral | null,
  LetterLiteral | null,
  LetterLiteral | null,
  LetterLiteral | null,
  LetterLiteral | null
];

export type PlayerIds = [
  string | null,
  string | null,
  string | null,
  string | null
];

export type GameState = {
  board: Board;
  tilePouch: LetterLiteral[];
  playerIds: PlayerIds;
  playerHands: Record<string, PlayerHand>;
  currentPlayerId: string | undefined;
  currentTurn: number;
  score: ScoreState;
  gameStarted: boolean;
  gameOver: boolean;
  currentProposedMove: PlayerMove | undefined;
  currentVote: Vote | undefined;
};

// For now just boolean votes
export enum VoteType {
  START_VOTE = "start_vote",
  ACCEPT_PROPOSED_MOVE = "accept_proposed_move",
}
export type PlayerVote = {
  playerId: string;
  // null means not voted
  voted: boolean | null;
};

export type Vote = {
  proposerId?: string;
  type: VoteType;
  description: string;
  timeLeft?: number;
  voteFinished: boolean;
  votes: PlayerVote[];
};
