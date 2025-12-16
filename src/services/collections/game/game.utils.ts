import { DEFAULT_GAME_STATE, PLAYER_HAND_LENGTH } from "@/model/core.defaults";
import {
  Bonus,
  GameState,
  LetterLiteral,
  LetterValueMap,
  Move,
  PlayerHand,
  Vote,
  VoteType,
} from "@/model/core.model";
import { ScoringService } from "@/services/scoring";
import { cloneDeep } from "lodash";
import { LanguageTemplate } from "../letterValueMap/languageTemplate.model";
import { DbGamePayload } from "./game.model";
import { User } from "firebase/auth";

export const computeTilePouch = (
  quantityMap: LetterValueMap
): LetterLiteral[] => {
  return Object.entries(quantityMap)
    .reduce(
      (acc, [letter, quantity]) => [...acc, ...Array(quantity).fill(letter)],
      [] as LetterLiteral[]
    )
    .sort(() => Math.random() - 0.5);
};

export const getInitGamePayload = (
  state: GameState
): Partial<DbGamePayload> => {
  // Shuffle players random (for now)
  const playerIds = cloneDeep(state.playerIds)
    .sort(() => Math.random() - 0.5)
    .sort((a, b) => (a === null ? 1 : b === null ? -1 : 0));

  return {
    currentVote: null,
    gameStarted: true,
    currentTurn: 1,
    currentPlayerId: playerIds[0],
    playerIds,
    score: {
      total: {},
      perTurn: [],
    },
  } satisfies Partial<DbGamePayload>;
};

export const drawCards = (
  tilePouch: LetterLiteral[],
  playerHand: PlayerHand = [null, null, null, null, null, null, null]
): { hand: PlayerHand; tilePouch: LetterLiteral[] } => {
  const newTilePouch = [...tilePouch];

  // Calculate how many cards to draw
  const handWithoutNulls = playerHand.filter(Boolean) as LetterLiteral[];
  const numCardsToDraw = PLAYER_HAND_LENGTH - handWithoutNulls.length;

  const newHand = [
    ...handWithoutNulls,
    ...newTilePouch.splice(0, numCardsToDraw),
  ] as PlayerHand;

  // If the pouch is empty, the new hand will be smaller than the player hand. Fill the rest with nulls
  if (newHand.length < PLAYER_HAND_LENGTH) {
    newHand.push(...Array(PLAYER_HAND_LENGTH - newHand.length).fill(null));
  }

  return { hand: newHand, tilePouch: newTilePouch };
};

// It's not perfect, but at least let's us check whether it's a straight line
export const isMoveValid = (
  move: Move[]
): {
  valid: boolean;
  error?: string;
} => {
  let valid: boolean = true;

  // Check if the move is valid
  if (move.length === 0) {
    valid = false;
    return { valid, error: "Empty move" };
  }

  if (move.length < 2) return { valid };

  // Check if the move is a straight line
  valid =
    new Set(move.map(({ x }) => x)).size === 1 ||
    new Set(move.map(({ y }) => y)).size === 1;

  return {
    valid,
    error: valid ? undefined : "It doesn't seem to be a valid move",
  };
};

export const getNextPlayerAndTurn = (
  currentPlayerId: string,
  state: GameState
): { nextPlayerId: string; nextTurn: number } => {
  const currentPlayerIdx = state.playerIds.findIndex(
    (id) => id === currentPlayerId
  );
  const isEndOfTurn =
    currentPlayerIdx >= state.playerIds.filter(Boolean).length - 1;
  const nextPlayerIndex = isEndOfTurn ? 0 : currentPlayerIdx + 1;
  const nextTurn = isEndOfTurn ? state.currentTurn + 1 : state.currentTurn;

  return { nextPlayerId: state.playerIds[nextPlayerIndex]!, nextTurn };
};

export const buildMovePayload = (
  state: GameState,
  template: LanguageTemplate
): Partial<DbGamePayload> | undefined => {
  if (
    !state.currentVote ||
    state.currentVote.type !== VoteType.ACCEPT_PROPOSED_MOVE ||
    !state.currentProposedMove ||
    !state.currentPlayerId
  )
    return undefined;

  const {
    currentPlayerId,
    currentProposedMove,
    currentVote,
    board,
    playerHands,
    currentTurn,
  } = state;

  const rejected = currentVote.votes.every((v) => !v.voted);
  const accepted = currentVote.votes.every((v) => v.voted);

  if (!rejected && !accepted) return undefined;

  // Prepare base payload
  const { nextPlayerId, nextTurn } = getNextPlayerAndTurn(
    currentPlayerId,
    state
  );

  const payload: Partial<DbGamePayload> = {
    currentVote: null,
    currentProposedMove: null,
    currentPlayerId: nextPlayerId,
    currentTurn: nextTurn,
  };

  // If move is rejected
  if (currentVote.votes.every((v) => !v.voted)) {
    const perTurn = [
      ...state.score.perTurn,
      { playerId: currentPlayerId, turn: currentTurn, score: 0 },
    ];
    payload.score = {
      ...state.score,
      perTurn,
    };
    return payload;
  }

  // If move is accepted
  if (currentVote.votes.every((v) => v.voted)) {
    // Draw cards
    const { hand, tilePouch } = drawCards(
      state.tilePouch,
      currentProposedMove.tentativeNewHand
    );
    payload.tilePouch = tilePouch;
    payload.playerHands = {
      ...playerHands,
      [currentPlayerId]: hand,
    };

    // Calculate score and new board
    const { score, updatedBoard } = new ScoringService(board, template).score(
      currentProposedMove
    );

    const perTurn = [
      ...state.score.perTurn,
      { playerId: currentPlayerId, turn: currentTurn, score },
    ];
    const total = {
      ...state.score.total,
      [currentPlayerId]: (state.score.total[currentPlayerId] ?? 0) + score,
    };

    payload.score = {
      total,
      perTurn,
    };
    payload.board = JSON.stringify(updatedBoard);
  }

  return payload;
};

export const buildProposeMovePayload = (
  localProposedMove: Move[],
  localPlayerHand: PlayerHand,
  state: GameState,
  user: User | null
): Partial<DbGamePayload> => {
  if (!user) throw new Error("User not found");

  const payload = {
    currentProposedMove: {
      playerId: user.uid,
      move: localProposedMove,
      tentativeNewHand: localPlayerHand,
    },
    currentVote: {
      proposerId: user.uid,
      type: VoteType.ACCEPT_PROPOSED_MOVE,
      voteFinished: false,
      votes: state.playerIds.filter(Boolean).map((id) => ({
        playerId: id!,
        voted: id === user.uid ? true : null,
      })),
    },
  } satisfies Partial<DbGamePayload>;

  return payload;
};

export const buildInitialReshuffleVotePayload = (
  state: GameState,
  user: User | null
): Partial<DbGamePayload> => {
  if (!user) throw new Error("User not found");

  const currentVote = {
    type: VoteType.INITIAL_RESHUFFLE,
    proposerId: user.uid,
    voteFinished: false,
    votes: state.playerIds
      .filter(Boolean)
      .map((id) => ({ playerId: id!, voted: id === user.uid ? true : null })),
  } satisfies Vote;

  const payload = {
    currentVote,
  } satisfies Partial<DbGamePayload>;

  return payload;
};

export const buildReshufflePayload = (
  state: GameState,
  user: User | null
): Partial<DbGamePayload> => {
  if (!user) throw new Error("User not found");

  const currentHand = state.playerHands[user.uid].filter(
    Boolean
  ) as LetterLiteral[];

  if (
    currentHand.length < PLAYER_HAND_LENGTH ||
    state.tilePouch.length < PLAYER_HAND_LENGTH
  )
    throw new Error("Not enough tiles to reshuffle");

  const { nextPlayerId, nextTurn } = getNextPlayerAndTurn(user.uid, state);

  const newTilePouch = [...state.tilePouch, ...currentHand].sort(
    () => Math.random() - 0.5
  );
  const { hand, tilePouch } = drawCards(newTilePouch, [
    null,
    null,
    null,
    null,
    null,
    null,
    null,
  ]);

  const payload = {
    playerHands: { ...state.playerHands, [user.uid]: hand },
    currentPlayerId: nextPlayerId,
    currentTurn: nextTurn,
    tilePouch,
  } satisfies Partial<DbGamePayload>;

  return payload;
};

export const buildSkipTurnPayload = (
  currentPlayerId: string,
  state: GameState
) => {
  const { nextPlayerId, nextTurn } = getNextPlayerAndTurn(
    currentPlayerId,
    state
  );

  const perTurn = [
    ...state.score.perTurn,
    { playerId: currentPlayerId, turn: state.currentTurn, score: 0 },
  ];

  const payload = {
    currentVote: null,
    currentProposedMove: null,
    currentPlayerId: nextPlayerId,
    currentTurn: nextTurn,
    score: {
      ...state.score,
      perTurn,
    },
  } satisfies Partial<DbGamePayload>;

  return payload;
};

export const getDefaultGameName = (defaultString: string): string => {
  return `${defaultString} - ${new Date().toLocaleString()}`;
};

export const getInitialGamePayload = (
  userId: string,
  template: LanguageTemplate,
  game: GameState = DEFAULT_GAME_STATE
): Partial<DbGamePayload> => {
  const {
    playerIds,
    score,
    gameStarted,
    gameOver,
    currentTurn,
    board,
    gameName,
  } = game;

  const payload = {
    gameName,
    createdByUserId: userId,
    createdAt: new Date(),
    lastModifiedAt: new Date(),
    template,
    playerIds,
    currentPlayerId: null,
    currentProposedMove: null,
    currentVote: null,
    score,
    gameStarted,
    currentTurn,
    gameOver,
    board: JSON.stringify(board),
    tilePouch: computeTilePouch(template.quantityMap),
    playerHands: {},
  } satisfies DbGamePayload;

  return payload;
};

export const computeRemainingTilesScore = (
  state: GameState,
  template: LanguageTemplate
) => {
  const points: number = Object.values(state.playerHands).reduce(
    (acc, playerHand) => {
      return (
        acc +
        playerHand
          .filter(Boolean)
          .map((t) => template.scoreMap[t!] ?? 0)
          .reduce((accc, score) => accc + score, 0)
      );
    },
    0
  );
  return points;
};

// TODO: MOVE THIS?
export const bonusColorMap: Record<Bonus, string> = {
  [Bonus.DOUBLE_LETTER]: "bg-blue-200",
  [Bonus.DOUBLE_WORD]: "bg-yellow-200",
  [Bonus.TRIPLE_LETTER]: "bg-blue-600 text-white",
  [Bonus.TRIPLE_WORD]:
    "text-white bg-gradient-to-b from-red-600 via-red-500 to-red-500",
};

export const bonusMultiplierMap: Record<Bonus, number> = {
  [Bonus.DOUBLE_LETTER]: 2,
  [Bonus.DOUBLE_WORD]: 2,
  [Bonus.TRIPLE_LETTER]: 3,
  [Bonus.TRIPLE_WORD]: 3,
};

export const playNotificationSound = (num: 1 | 2 | 3 = 2) => {
  const audio = new Audio(`/sounds/notification${num}.wav`);
  audio.play();
};
