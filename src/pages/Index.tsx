import { useState, useRef, useEffect } from "react";
import DashboardTab from "@/components/dashboard/DashboardTab";
import ROASTab from "@/components/dashboard/ROASTab";
import { DATE_RANGE_OPTIONS, DEFAULT_RANGE, getStartDate, type DateRangeOption } from "@/lib/dateRange";
import { CalendarDays, ChevronDown } from "lucide-react";

const TABS = ["Dashboard", "ROAS"] as const;
type Tab = (typeof TABS)[number];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("Dashboard");
  const [dateRange, setDateRange] = useState<DateRangeOption>(DEFAULT_RANGE);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const startDate = getStartDate(dateRange.days);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  return (
    <div className="min-h-screen bg-apollo-dark">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-apollo-dark/80 backdrop-blur-xl border-b border-apollo-card-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <img src="/logo.png" alt="ApolloOS" className="h-8 w-auto" />
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 bg-apollo-card border border-apollo-card-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/30 transition-colors"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              {dateRange.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-40 bg-apollo-card border border-apollo-card-border rounded-lg shadow-xl overflow-hidden z-50">
                {DATE_RANGE_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => { setDateRange(opt); setDropdownOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      opt.label === dateRange.label
                        ? "text-apollo-cyan bg-apollo-cyan/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
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

        {/* Tab Content */}
        {activeTab === "Dashboard" && <DashboardTab startDate={startDate} />}
        {activeTab === "ROAS" && <ROASTab startDate={startDate} />}
      </div>
    </div>
  );
};

export default Index;
