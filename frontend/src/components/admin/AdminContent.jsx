// AdminContent.jsx
import Users from "./Users";
import RefillRequests from "./RefillRequests";
import WithdrawRequests from "./WithdrawRequests";
import GameHistory from "./GameHistory";

export default function AdminContent({ selected }) {
  switch (selected) {
    case "users":
      return <Users />;
    case "refillRequests":
      return <RefillRequests />;
    case "withdrawRequests":
      return <WithdrawRequests />;
    case "gameHistory":
      return <GameHistory />;
    default:
      return <div>Select an option from the sidebar</div>;
  }
}
