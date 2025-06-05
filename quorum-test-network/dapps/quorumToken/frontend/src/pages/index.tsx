// frontend/src/pages/index.tsx

import type { NextPage } from "next";
import { CreateTicket } from "../components/CreateTicket";
import { BuyTicket } from "../components/BuyTicket";
import { ResellTicket } from "../components/ResellTicket";
import { MyTickets } from "components/MyTickets";
import { AllTickets } from "components/AllTickets";

const Home: NextPage = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">TicketNFT DApp</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MyTickets />
        <AllTickets/>
        <CreateTicket />
        <BuyTicket />
        <ResellTicket />
      </div>
    </div>
  );
};

export default Home;
