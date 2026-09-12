import { BoundaryMap, useBoundaries, type RegionValue } from "@geo-atlas/react";
import { useState } from "react";
import { corsProxyFetch } from "./corsProxyFetch.js";
import { mockKenyaScanRates, mockNigeriaScanRates, mockUkScanRates, mockUsaScanRates } from "./mockData.js";

function scanRateColor(value: number | undefined): string {
  if (value === undefined) return "#EEEEEE";
  if (value < 40) return "#F4AEB2";
  if (value < 70) return "#FFE099";
  return "#B7E1C1";
}

const MOCK_DATA_BY_COUNTRY: Record<string, RegionValue[]> = {
  NG: mockNigeriaScanRates,
  KE: mockKenyaScanRates,
  GB: mockUkScanRates,
  US: mockUsaScanRates,
};

export default function App() {
  const [country, setCountry] = useState("NG");
  const { boundaries, loading, error } = useBoundaries(
    { country, level: "admin1" },
    { fetchImpl: corsProxyFetch }
  );
  const [selected, setSelected] = useState<string>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>geo-atlas demo</h1>
      <p>
        Country: <code>{country}</code> · Level: <code>admin1</code> · Source:{" "}
        {boundaries ? `${boundaries.meta.sourceName} (${boundaries.meta.license})` : "loading..."}
      </p>

      <div style={{ marginBottom: 16 }}>
        {["NG", "KE", "GB", "US"].map((code) => (
          <button
            key={code}
            onClick={() => setCountry(code)}
            style={{ marginRight: 8, fontWeight: country === code ? 700 : 400 }}
          >
            {code}
          </button>
        ))}
      </div>

      {loading && <p>Loading boundary data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error.message}</p>}

      {boundaries && (
        <BoundaryMap
          boundaries={boundaries}
          data={MOCK_DATA_BY_COUNTRY[country] ?? []}
          colorScale={scanRateColor}
          width={700}
          height={550}
          onRegionClick={(region) => setSelected(`${region.shapeName}: ${region.value ?? "no data"}`)}
        />
      )}

      {selected && <p>Selected: {selected}</p>}
    </div>
  );
}
