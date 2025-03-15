export const Suit = ["s", "c", "h", "d"] as const
export type Suit = typeof Suit[number];
export const CardNum = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;
export type CardNum = typeof CardNum[number];

export class Card {
  constructor(readonly suit: Suit, readonly num: CardNum) {}
  equals(other: Card) {
    return this.suit === other.suit && this.num === other.num;
  }
}

export class Cards {
  constructor(readonly list: Card[]) {}
  shuffle() {
    return new Cards(this.list.toSorted(() => Math.random() - 0.5));
  }
  sort(fn: (a: Card, b: Card) => number) {
    return new Cards(this.list.toSorted(fn));
  }
  draw() {
    return {
      card: this.list[0],
      remains: new Cards(this.list.slice(1)),
    }
  }
  filter(fn: (card: Card) => boolean) {
    return new Cards(this.list.filter(fn));
  }
  push(card: Card) {
    return new Cards([...this.list, card]);
  }
  map<T>(fn: (card: Card, index: number) => T) {
    return this.list.map(fn);
  }
  get size() {
    return this.list.length;
  }
  contains(card: Card) {
    return this.list.some((it) => it.equals(card));
  }
}

export class Deck {
  constructor(
    public cards: Cards = this.generate(),
  ) {}

  shuffle() {
    this.cards = this.cards.shuffle();
    return this;
  }
  get size() {
    return this.cards.size;
  }
  draw() {
    const { card, remains } = this.cards.draw();
    return {
      card,
      remains: new Deck(remains),
    };
  }
  generate() {
    const cards = Suit.map((suit) =>
      CardNum.map((num) =>
        new Card(suit, num))).flat();
    return new Cards(cards);
  }
}

export type Kind = "none" | "straightFlush" | "fourCard" | "fullHouse" | "flush" | "straight" | "threeCard" | "twoPair" | "onePair" | "highCard";

export class TableCards extends Cards {
  constructor(list: Card[]) {
    super(list);
  }
  add(card: Card) {
    return new TableCards([...this.list, card]);
  }
  remove(card: Card) {
    return new TableCards(this.list.filter((it) => !it.equals(card)));
  }
  get kind(): Kind {
    if (this.size === 0) {
      return "none";
    }
    if (this.isStraightFlush()) {
      return "straightFlush";
    }
    if (this.isFourCard()) {
      return "fourCard";
    }
    if (this.isFullHouse()) {
      return "fullHouse";
    }
    if (this.isFlush()) {
      return "flush";
    }
    if (this.isStraight()) {
      return "straight";
    }
    if (this.isThreeCard()) {
      return "threeCard";
    }
    if (this.isTwoPair()) {
      return "twoPair";
    }
    if (this.isOnePair()) {
      return "onePair";
    }
    return "highCard";
  }

  get scoredCards() {
    const mapping = this.cardMapping;
    const kind = this.kind;
    switch (kind) {
      case "straightFlush":
        return [...this.list];
      case "fourCard":
        return Object.values(mapping.num).find((cards) => cards.length === 4)!;
      case "fullHouse":
        return [...this.list];
      case "flush":
        return [...this.list];
      case "straight":
        return [...this.list];
      case "threeCard":
        return Object.values(mapping.num).find((cards) => cards.length === 3)!;
      case "twoPair":
        return Object.values(mapping.num).filter((cards) => cards.length === 2).flat();
      case "onePair":
        return Object.values(mapping.num).find((cards) => cards.length === 2)!;
      case "highCard":
        return [this.list.toSorted((a, b) => b.num - a.num)[0]];
      case "none":
        return [];
    }
  }

  get score(): number {
    let score = 0;
    switch (this.kind) {
      case "straightFlush":
        score = 80;
        break;
      case "fourCard":
        score = 60;
        break;
      case "fullHouse":
        score = 40;
        break;
      case "flush":
        score = 30;
        break;
      case "straight":
        score = 20;
        break;
      case "threeCard":
        score = 15;
        break;
      case "twoPair":
        score = 10;
        break;
      case "onePair":
        score = 5;
        break;
      case "highCard":
        score = 1;
        break;
      case "none":
        score = 0;
        break;
    }

    for (const card of this.scoredCards) {
      score += card.num;
    }

    return score;
  }

  get cardMapping() {
    type Mapping = {
      suit: {
        [key in Suit]: Card[];
      },
      num: {
        [key in CardNum]: Card[];
      }
    }

    const mapping: Mapping = {
      suit: {
        s: [],
        c: [],
        h: [],
        d: [],
      },
      num: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        12: [],
        13: [],
      }
    };

    for (const card of this.list) {
      mapping.suit[card.suit].push(card);
      mapping.num[card.num].push(card);
    }
    return mapping;
  }

  isStraightFlush(): boolean {
    return this.isStraight() && this.isFlush();
  }

  isFourCard(): boolean {
    const mapping = this.cardMapping;
    return Object.values(mapping.num).some((cards) => cards.length === 4);
  }

  isFullHouse(): boolean {
    const mapping = this.cardMapping;
    return (
      Object.values(mapping.num).some((cards) => cards.length === 3) &&
      Object.values(mapping.num).some((cards) => cards.length === 2)
    );
  }

  isFlush(): boolean {
    const mapping = this.cardMapping;
    return Object.values(mapping.suit).some((cards) => cards.length === 5);
  }

  isStraight(): boolean {
    const numbers = this.list.map((card) => card.num);
    if (numbers.length !== 5) {
      return false;
    }
    numbers.sort((a, b) => a - b);
    if (numbers.every((num, i) => num === numbers[0] + i)) {
      return true;
    } else if (numbers[0] === 1 && numbers[1] === 10 && numbers[2] === 11 && numbers[3] === 12 && numbers[4] === 13) {
      return true;
    }
    return false;
  }

  isThreeCard(): boolean {
    const mapping = this.cardMapping;
    return Object.values(mapping.num).some((cards) => cards.length === 3);
  }

  isTwoPair(): boolean {
    const mapping = this.cardMapping;
    return Object.values(mapping.num).filter(it => it.length === 2).length === 2;
  }

  isOnePair(): boolean {
    const mapping = this.cardMapping;
    return Object.values(mapping.num).some((cards) => cards.length === 2);
  }
}
