import { Ranking } from "@/services/collections/ranking/ranking.model";
import { useMemo, useState } from "react";

export type SortField =
  | "winRatio"
  | "totalPoints"
  | "avgPointsPerMatch-2"
  | "avgPointsPerMatch-3"
  | "avgPointsPerMatch-4"
  | "avgPointsPerTurn"
  | "avgMatchPointsRatio-2"
  | "avgMatchPointsRatio-3"
  | "avgMatchPointsRatio-4";

export type SortDirection = "asc" | "desc";

export const useRankingSort = (rankings: Ranking[] | undefined) => {
  const [sortField, setSortField] = useState<SortField>("avgPointsPerTurn");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedRankings = useMemo(() => {
    if (!rankings) return [];

    const sorted = [...rankings].sort((a, b) => {
      let aValue: number | undefined;
      let bValue: number | undefined;

      // Extract the values based on the sort field
      if (sortField.startsWith("avgPointsPerMatch-")) {
        const numPlayers = parseInt(sortField.split("-")[1]) as 2 | 3 | 4;
        aValue = a.avgPointsPerMatch[numPlayers];
        bValue = b.avgPointsPerMatch[numPlayers];
      } else if (sortField.startsWith("avgMatchPointsRatio-")) {
        const numPlayers = parseInt(sortField.split("-")[1]) as 2 | 3 | 4;
        aValue = a.avgMatchPointsRatio[numPlayers];
        bValue = b.avgMatchPointsRatio[numPlayers];
      } else {
        // sortField is now narrowed to direct properties of Ranking
        aValue = a[sortField as keyof Pick<Ranking, "winRatio" | "totalPoints" | "avgPointsPerTurn">];
        bValue = b[sortField as keyof Pick<Ranking, "winRatio" | "totalPoints" | "avgPointsPerTurn">];
      }

      // Handle undefined values (players who haven't played with that number of players)
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1; // Put undefined at the end
      if (bValue === undefined) return -1; // Put undefined at the end

      // Compare values
      const comparison = aValue - bValue;
      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [rankings, sortField, sortDirection]);

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortedRankings,
  };
};
