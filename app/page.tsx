import Image from "next/image";
import CoinSection from "@/components/CoinSection";

export default function Home() {
  return (
    <div className="w-full min-h-screen px-4 py-12 bg-zinc-900 flex justify-center">
      <CoinSection />
    </div>
  );
}
