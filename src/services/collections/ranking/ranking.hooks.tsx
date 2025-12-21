import { useEffect, useState } from "react";
import { Ranking } from "./ranking.model";
import { getLastNRankingSnapshot } from "./ranking";
import { db } from "@/config/firebase";

export const useGetLastNRankings = (
  n: number = 10
): {
  rankings: Ranking[] | undefined;
  error: string | undefined;
} => {
  const [rankings, setRankings] = useState<Ranking[] | undefined>();
  const [error, setError] = useState<string | undefined>();

  useEffect(
    () =>
      getLastNRankingSnapshot(
        db,
        n,
        (data) => {
          setRankings(data);
        },
        (err) => {
          setError(err);
        }
      ),
    [n]
  );

  return { rankings, error };
};
