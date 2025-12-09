import { describe, expect, it } from "vitest";
import { SPANISH_LANGUAGE_TEMPLATE } from "../collections/letterValueMap/languageTemplate.defaults";
import { ScoringService } from "../scoring";
import { scoringTestData } from "./scoring.testData";
import { stringifyBoard } from "../utils/core";

describe("Test ", () => {
  scoringTestData.forEach(
    ({ name, board, playerMove, expectedScore }) => {
      // if (skip) return;
      it(name, () => {
        const { score, updatedBoard } = new ScoringService(
          board(),
          SPANISH_LANGUAGE_TEMPLATE
        ).score(playerMove);

        console.log("updatedBoard\n" + stringifyBoard(updatedBoard));

        expect(score).toEqual(expectedScore);
      });
    }
  );
});
