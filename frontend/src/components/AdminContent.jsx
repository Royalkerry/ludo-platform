// AdminContent.jsx
import Users from "./admin/Users";
import RefillRequests from "./admin/RefillRequests";
import WithdrawRequests from "./admin/WithdrawRequests";
import GameHistory from "./admin/GameHistory";

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
