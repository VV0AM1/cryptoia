import Image from "next/image";
import CoinSection from "@/components/CoinSection";

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-zinc-900 flex justify-center items-start px-2 sm:px-6 py-12">
      <CoinSection />
    </div>
  );
}