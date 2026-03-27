import { useState } from "react";
import { LEAD_SOURCES, type LeadSource } from "@/data/mockData";
import OverviewTab from "@/components/dashboard/OverviewTab";
import VoiceTab from "@/components/dashboard/VoiceTab";
import TextTab from "@/components/dashboard/TextTab";
import SalesPipeline from "@/components/dashboard/SalesPipeline";
import { CalendarDays, ChevronDown } from "lucide-react";

const TABS = ["Overview", "Voice", "Text"] as const;
type Tab = (typeof TABS)[number];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [activeSource, setActiveSource] = useState<LeadSource>("All Sources");

  return (
    <div className="min-h-screen bg-apollo-dark">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-apollo-dark/80 backdrop-blur-xl border-b border-apollo-card-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <img src="/logo.png" alt="ApolloOS" className="h-8 w-auto" />
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-apollo-card border border-apollo-card-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 transition-colors">
              <CalendarDays className="w-3.5 h-3.5" />
              Last 30 days
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="flex items-center gap-2 bg-apollo-card border border-apollo-card-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 transition-colors">
              All Clients
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-apollo-card border border-apollo-card-border rounded-lg p-1 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-gradient-to-r from-apollo-cyan/20 to-apollo-green/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Source Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          {LEAD_SOURCES.map((source) => (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                activeSource === source
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-apollo-card-border bg-apollo-card text-muted-foreground hover:border-primary/30"
              }`}
            >
              {source}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Overview" && <OverviewTab source={activeSource} />}
        {activeTab === "Voice" && <VoiceTab source={activeSource} />}
        {activeTab === "Text" && <TextTab source={activeSource} />}

        {/* Sales Pipeline — always visible */}
        <SalesPipeline />
      </div>
    </div>
  );
};

export default Index;
