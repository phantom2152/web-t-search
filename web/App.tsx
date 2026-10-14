import { useState, type ReactNode } from "react";
import { Header } from "./components/Header";
import { ProviderTabs } from "./components/ProviderTabs";
import type { ProviderId } from "./lib/types";
import { EztvScreen } from "./screens/EztvScreen";
import { NyaaScreen } from "./screens/NyaaScreen";
import { TpbScreen } from "./screens/TpbScreen";
import { YtsScreen } from "./screens/YtsScreen";

function renderScreen(provider: ProviderId, tabs: ReactNode) {
  switch (provider) {
    case "yts":
      return <YtsScreen tabs={tabs} />;
    case "tpb":
      return <TpbScreen tabs={tabs} />;
    case "eztv":
      return <EztvScreen tabs={tabs} />;
    case "nyaa":
      return <NyaaScreen tabs={tabs} />;
  }
}

export default function App() {
  const [provider, setProvider] = useState<ProviderId>("yts");
  const tabs = <ProviderTabs active={provider} onChange={setProvider} />;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5.5 px-6 pb-18 pt-7">
      <Header />
      {renderScreen(provider, tabs)}
    </div>
  );
}