import { describe, it, expect } from "vitest";
import { Card, CardNum, Kind, TableCards, Suit } from "./Card";

describe("Roles", () => {

  describe("#calculateKind", () => {
    const tests: [Kind, [Suit, CardNum][]][] = [
      ["straightFlush", [["s", 1], ["s", 2], ["s", 3], ["s", 4], ["s", 5]]],
      ["straight",      [["d", 1], ["s", 2], ["s", 3], ["s", 4], ["s", 5]]],
      ["flush",         [["s", 9], ["s", 2], ["s", 3], ["s", 4], ["s", 5]]],
      ["fourCard",      [["s", 1], ["d", 1], ["c", 1], ["h", 1], ["s", 5]]],
      ["threeCard",     [["s", 1], ["d", 1], ["c", 1], ["s", 4], ["s", 5]]],
      ["twoPair",       [["s", 1], ["d", 1], ["s", 2], ["d", 2], ["s", 5]]],
      ["onePair",       [["s", 1], ["d", 1], ["s", 3], ["s", 4], ["s", 5]]],
      ["highCard",      [["s", 1], ["d", 2], ["h", 3], ["c", 9], ["s", 5]]],
    ]
    it.each(tests)("%s <-- %j", (expected, cards) => {
      const roles = new TableCards(cards.map(([suit, num]) => new Card(suit, num)));
      expect(roles.kind).toBe(expected);
    });
  });

  describe("#getScoredCards", () => {
    const tests: [[Suit, CardNum][], [Suit, CardNum][]][] = [
      [[["s", 1], ["s", 2], ["s", 3], ["s", 4], ["s", 5]], [["s", 1], ["s", 2], ["s", 3], ["s", 4], ["s", 5]]],
      [[["d", 1], ["s", 2], ["s", 3], ["s", 4], ["s", 5]], [["d", 1], ["s", 2], ["s", 3], ["s", 4], ["s", 5]]],
      [[["s", 9], ["s", 2], ["s", 3], ["s", 4], ["s", 5]], [["s", 9], ["s", 2], ["s", 3], ["s", 4], ["s", 5]]],
      [[["s", 1], ["d", 1], ["c", 1], ["h", 1], ["s", 5]], [["s", 1], ["d", 1], ["c", 1], ["h", 1]]],
      [[["s", 1], ["d", 1], ["c", 1], ["s", 4], ["s", 5]], [["s", 1], ["d", 1], ["c", 1]]],
      [[["s", 1], ["d", 1], ["s", 2], ["d", 2], ["s", 5]], [["s", 1], ["d", 1], ["s", 2], ["d", 2]]],
      [[["s", 1], ["d", 1], ["s", 3], ["s", 4], ["s", 5]], [["s", 1], ["d", 1]]],
      [[["s", 1], ["d", 2], ["h", 3], ["c", 9], ["s", 5]], [["c", 9]]],
    ]
    it.each(tests)("%j --> %j", (cards, expected) => {
      const roles = new TableCards(cards.map(([suit, num]) => new Card(suit, num)));
      expect(roles.scoredCards.map(card => [card.suit, card.num])).toEqual(expected);
    });
  });
});
