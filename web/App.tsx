import { useState, type ReactNode } from "react";
import { Header } from "./components/Header";
import { Notice } from "./components/Notice";
import { ProviderTabs } from "./components/ProviderTabs";
import type { ProviderId } from "./lib/types";
import { NyaaScreen } from "./screens/NyaaScreen";
import { TpbScreen } from "./screens/TpbScreen";

function renderScreen(provider: ProviderId, tabs: ReactNode) {
  switch (provider) {
    case "nyaa":
      return <NyaaScreen tabs={tabs} />;
    case "tpb":
      return <TpbScreen tabs={tabs} />;
    default:
      return (
        <>
          {tabs}
          <Notice kind="info">{provider} isn't ported to the new UI yet.</Notice>
        </>
      );
  }
}

export default function App() {
  const [provider, setProvider] = useState<ProviderId>("nyaa");
  const tabs = <ProviderTabs active={provider} onChange={setProvider} />;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-5.5 px-6 pb-18 pt-7">
      <Header />
      {renderScreen(provider, tabs)}
    </div>
  );
}