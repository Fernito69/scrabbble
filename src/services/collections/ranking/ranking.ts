import {
  Firestore,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { RANKING_COLLECTION } from "./ranking.defaults";
import { Ranking } from "./ranking.model";

export const getLastNRankingSnapshot = (
  db: Firestore,
  n: number,
  callback: (data: Ranking[]) => void,
  errorCallback: (err: string) => void
) => {
  const q = query(
    collection(db, RANKING_COLLECTION),
    orderBy("winRatio", "desc"),
    limit(n)
  );

  const unsubscribe = onSnapshot(q, {
    next: (collSnap) => {
      const data = collSnap.docs.map((d) => d.data() as Ranking);
      callback(data);
    },
    error: (err) => errorCallback(err.message),
  });

  return unsubscribe;
};
