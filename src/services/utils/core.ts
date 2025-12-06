import { Board } from "@/model/core.model";

export const stringifyBoard = (board: Board) => {
  return board
    .map(
      (row) =>
        "|" +
        row
          .map(
            (tile) =>
              tile.tile?.letter.toUpperCase() ?? (tile.bonus ? "·" : " ")
          )
          .join("|") +
        "|"
    )
    .join("\n");
};
