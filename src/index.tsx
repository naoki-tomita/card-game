import { createRoot } from "react-dom/client";
import { Card, Deck, Suit, TableCards, Cards } from "./Card";
import { FC, useEffect, useState } from "react";


class GameState {
  constructor(
    readonly plays: number = 3,
    readonly discards: number = 3,
    readonly score: number = 0,
    readonly deck: Deck = new Deck(),
    readonly hands: Cards = new Cards([]),
    readonly tableCards: TableCards = new TableCards([]),
    readonly sortMode: "suit" | "num" = "num",
  ) {}

  init() {
    this.deck.shuffle();
  }

  drawCards() {
    let remains = this.deck;
    let hands = this.hands;
    while(hands.size < 8) {
      const drawed = remains.draw();
      const card = drawed.card;
      remains = drawed.remains;
      hands = hands.push(card);
    }
    return this.copy({ deck: remains, hands });
  }

  sort() {
    const sorted = this.hands.sort((b, a) => {
      if (this.sortMode === "suit") {
        return a.suit.localeCompare(b.suit);
      }
      return a.num - b.num;
    });
    return this.copy({ hands: sorted });
  }

  copy({
    plays = this.plays,
    discards = this.discards,
    score = this.score,
    deck = this.deck,
    hands = this.hands,
    tableCards = this.tableCards,
  }: {
    plays?: number,
    discards?: number,
    score?: number,
    deck?: Deck,
    hands?: Cards,
    tableCards?: TableCards,
  } = {}) {
    return new GameState(plays, discards, score, deck, hands, tableCards);
  }

  select(card: Card) {
    const tableCards = this.tableCards.contains(card) ? this.tableCards.remove(card) : this.tableCards.add(card);
    return this.copy({ tableCards });
  }

  hasSelected(card: Card) {
    return this.tableCards.contains(card);
  }

  play() {
    const score = this.score + this.tableCards.score;
    const hands = this.hands.filter((card) => !this.tableCards.contains(card));
    const tableCards = new TableCards([]);
    return this.copy({ plays: this.plays - 1, score, hands, tableCards }).drawCards().sort();
  }

  discard() {
    const hands = this.hands.filter((card) => !this.tableCards.contains(card));
    const tableCards = new TableCards([]);
    return this.copy({ discards: this.discards - 1, hands, tableCards }).drawCards().sort();
  }
}

const SuitComponent: FC<{ suit: Suit }> = ({ suit }) => {
  switch (suit) {
    case "s":
      return <div>♠</div>;
    case "h":
      return <div>♥</div>;
    case "d":
      return <div>♦</div>;
    case "c":
      return <div>♣</div>;
  }
}

const CardNumComponent: FC<{ num: number }> = ({ num }) => {
  switch (num) {
    case 1:
      return <div>A</div>;
    case 11:
      return <div>J</div>;
    case 12:
      return <div>Q</div>;
    case 13:
      return <div>K</div>;
    default:
      return <div>{num}</div>;
  }
}

function color(suit: Suit) {
  switch (suit) {
    case "s":
    case "c":
      return "black";
    case "h":
    case "d":
      return "red";
  }
}

const CardComponent: FC<{ card: Card, onClick: () => void }> = ({ card, onClick }) => {
  return (
    <button
      style={{
        background: "transparent",
        fontSize: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: color(card.suit),
        width: 42,
        height: 48,
        border: "1px solid #ccc",
        borderRadius: 4,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <SuitComponent suit={card.suit} />
      <CardNumComponent num={card.num} />
    </button>
  );
}

const App = () => {
  const [phase, setPhase] = useState<"initialPhase" | "selectPhase" | "resultPhase">("initialPhase");
  const [state, setState] = useState(new GameState());
  useEffect(() => {
    if (phase === "initialPhase") {
      state.init();
      setState(state.copy());
      setPhase("selectPhase");
    } if (phase === "selectPhase") {
      setState(state.drawCards().sort().copy());
    }
  }, [phase]);

  function selectCard(card: Card) {
    if (phase !== "selectPhase") {
      return;
    }
    setState(state.select(card));
  }

  function play() {
    setState(state.play());
  }

  function discard() {
    setState(state.discard());
  }

  return (
    <div>
      <ul
        style={{
          listStyle: "none",
          display: "flex",
          gap: 4,
          padding: 0,
          margin: 0,
        }}
      >
        {state.hands.map((card, i) => (
          <li
            key={i}
            style={{
              display: "flex",
            }}
          >
            <div style={{ marginTop: state.hasSelected(card) ? 0 : 20 }}>
              <CardComponent card={card} onClick={() => selectCard(card)} />
            </div>
          </li>
        ))}
      </ul>
      <div>
        <button onClick={play}>
          Play
        </button>
        <button onClick={discard}>
          Discard
        </button>
      </div>
      <div>
          <div>Score: {state.score}</div>
          <div>Kind: {state.tableCards.kind}</div>
          <div>{state.tableCards.score}</div>
          <div>Remaining: {state.deck.size}</div>
        </div>
    </div>
  );
}

const root = createRoot(document.getElementById("app")!);
root.render(<App />);
