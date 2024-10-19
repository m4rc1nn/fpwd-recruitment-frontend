import ExchangeBox from "@/components/ExchangeBox";
import HistoryBox from "@/components/HistoryBox";

export default function Home() {

  return (
    <div className="container w-full flex flex-col items-center justify-center h-screen mx-auto max-w-2xl py-10">
      <ExchangeBox />
      <HistoryBox />
    </div>
  );
}
