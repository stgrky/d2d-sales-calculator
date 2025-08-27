"use client";

// pages/index.tsx
import { useState, useRef, useEffect } from "react";
import './globals.css';
import Head from "next/head";
import FinancingCalculator from "@/components/FinancingCalculator"; // adjust path if needed

const HomePage: React.FC = () => {
  // State hooks first
  useEffect(() => {
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.async = true;
  document.body.appendChild(script);

  return () => {
    document.body.removeChild(script);
  };
}, []);

  const [model, setModel] = useState<string>("");
  const [unitPad, setUnitPad] = useState<boolean>(false);
  const [mobility, setMobility] = useState<boolean>(false);
  const [tank, setTank] = useState<string>("");
  const [tankPad, setTankPad] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const [sensor, setSensor] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [filterQty, setFilterQty] = useState<number>(0);
  const [pump, setPump] = useState<string>("");
  const [connection, setConnection] = useState<string>("");
  const [trenchingSections, setTrenchingSections] = useState([
    { type: "", distance: 0 },
  ]);
    const [ab_trenchingSections, setab_TrenchingSections] = useState([
    { type: "", distance: 0 },
  ]);
  const [panelUpgrade, setPanelUpgrade] = useState<string>("");
  const [warranty, setWarranty] = useState<string>("standard");
  const [quoteTotal, setQuoteTotal] = useState<number | null>(null); // shown only after clicking
  const [total, setTotal] = useState<number>(0); // always stores current total
  const [showFinancing, setShowFinancing] = useState(false);
  const [quoteIsStale, setQuoteIsStale] = useState<boolean>(true);
  const financingRef = useRef<HTMLDivElement>(null);
  const [demolition, setDemolition] = useState<{
    enabled: boolean;
    distance: number;
  }>({
    enabled: false,
    distance: 0,
  });

  // Price lookup
  const modelPrices: Record<
    string,
    {
      system: number;
      install: number;
      ship: number;
      pad: number;
      mobility: number;
      warrantys: number;
      warranty5: number;
      warranty8: number;
    }
  > = {
    // Prices updated as of 07/04
    s: {
      system: 9999,
      install: 0,
      ship: 645,
      pad: 1750,
      mobility: 500,
      warrantys: 0,
      warranty5: 999,
      warranty8: 1499,
    },
    standard: {
      system: 17499,
      install: 0,
      ship: 1095,
      pad: 1850,
      mobility: 500,
      warrantys: 0,
      warranty5: 1749,
      warranty8: 2599,
    },
    x: {
      system: 29999,
      install: 0,
      ship: 1550,
      pad: 2100,
      mobility: 1000,
      warrantys: 0,
      warranty5: 2999,
      warranty8: 4499,
    },
  };

  const tankPrices: Record<string, number> = {
    "500": 770.9,
    "1550": 1430.35,
    "3000": 2428.9,
    "5000": 5125.99,
  };

  const tankPads: Record<string, number> = {
    "500": 1750,
    "1550": 1850,
    "3000": 2300,
    "5000": 4200,
  };

  const cityDelivery: Record<string, number> = {
    Austin: 999,
    "Corpus Christi": 858,
    Dallas: 577.5,
    Houston: 200,
    "San Antonio": 660,
  };

  const sensorPrices: Record<string, number> = {
    "": 0,
    normal: 35,
  };

  const filterPrices: Record<string, number> = {
    s: 100,
    standard: 150,
    x: 200,
  };

  const pumpPrices: Record<string, number> = {
    dab: 1900,
    mini: 800,
    "": 0,
  };

  const trenchRates: Record<string, number> = {
    trench_elec: 32.5,
    trench_plumb: 58.5,
    trench_comb: 65.5,
    "": 0,
  };

  const ab_trenchRates: Record<string, number> = {
    ab_elec: 35.5,
    ab_plumb: 26.5,
    ab_comb: 35.5,
    "": 0,
  };

  const getTotal = () => {
    const ADM = 500;
    const COMM = 2500;
    const AQM = 500;
    const DISP = 200; // disposal fee
    const net30 = 100; // Net 30

    let subtotal = 0;
    let taxable = 0;
    let installTotal = 0;
    let hasSelections = false;
    let hasInstallOptions = false;

    // Model system + shipping + install
    if (model) {
      subtotal += modelPrices[model].system;
      subtotal += modelPrices[model].ship;
      if (mobility) subtotal += modelPrices[model].mobility;
      hasSelections = true;
    }

    // Install items
    if (unitPad) {
      installTotal += modelPrices[model]?.pad || 0;
      hasSelections = true;
      hasInstallOptions = true;
    }
    if (tankPad) {
      installTotal += tankPads[tank] || 0;
      hasSelections = true;
      hasInstallOptions = true;
    }
    if (connection === "2way-t-valve") {
      installTotal += 100;
      hasSelections = true;
      hasInstallOptions = true;
    }
    if (connection === "3way-t-valve") {
      installTotal += 300;
      hasSelections = true;
      hasInstallOptions = true;
    }
    if (panelUpgrade === "panel") {
      installTotal += 8000;
      hasSelections = true;
      hasInstallOptions = true;
    }
    if (panelUpgrade === "subpanel") {
      installTotal += 3000;
      hasSelections = true;
      hasInstallOptions = true;
    }

    trenchingSections.forEach(({ type, distance }) => {
      const t_rate = trenchRates[type] || 0;
      const tcost = t_rate * distance;
      if (tcost > 0) {
        hasSelections = true;
        hasInstallOptions = true;
      }
      installTotal += tcost;
    });

      ab_trenchingSections.forEach(({ type, distance }) => {
      const ab_t_rate = ab_trenchRates[type] || 0;
      const ab_t_cost = ab_t_rate * distance;
      if (ab_t_cost > 0) {
        hasSelections = true;
        hasInstallOptions = true;
      }
      installTotal += ab_t_cost;
    });


  // Tank
  if (tank) {
    const tCost = tankPrices[tank] || 0;
    subtotal += tCost;
    taxable += tCost;
    if (city && cityDelivery[city]) subtotal += cityDelivery[city];
    hasSelections = true;
  }

  // Sensor
  if (sensor) {
    const sCost = sensorPrices[sensor] || 0;
    if (sCost > 0) hasSelections = true;
    subtotal += sCost;
    taxable += sCost;
  }

  // Filter
  if (filter && filterQty > 0) {
    const fCost = (filterPrices[filter] || 0) * filterQty;
    subtotal += fCost;
    taxable += fCost;
    hasSelections = true;
  }

  // Pump and pump install cost
  if (pump) {
    const pCost = (pumpPrices[pump] || 0);
    const pInstCost = 200;
    if (pCost > 0) hasSelections = true;
    subtotal += pCost;
    taxable += pCost;
    installTotal += pInstCost;
  }


  // Warranty
if (warranty && warranty !== "standard" && model) {
  if (warranty === "warranty5" || warranty === "warranty8") {
    const wCost = modelPrices[model]?.[warranty] || 0;
    subtotal += wCost;
    hasSelections = true;
  }
}

// Demolition
if (demolition?.enabled && demolition?.distance > 0) {
  const demoCost = demolition.distance * 150;
  installTotal += demoCost;
  hasSelections = true;
}

  // Admin fees (if anything selected)
  if (hasSelections) {
    subtotal += ADM + net30;
  }

  // Comm + AQM (if install-related options selected)
  if (hasInstallOptions) {
    installTotal += COMM + AQM + DISP;
  }


  console.log("DEBUG Total Breakdown", {
  model: model,
  subtotal,
  installTotal,
  ADM,
  net30,
  hasSelections,
  hasInstallOptions,
  connection,
  pump,
  sensor,
  filter,
  filterQty,
  demolition
});

  const taxRate = 0.0825;
  const tax = taxable * taxRate;
  const finalTotal = subtotal + installTotal + tax;

  return finalTotal;
};

const calculateTotal = () => {
  const final = getTotal();
  setQuoteTotal(final);    // visible
  setTotal(final);         // internal
  setQuoteIsStale(false);  // manually refreshed
};



// Download PDF using jsPDF
const downloadPDF = () => {
  if (quoteTotal === null || quoteIsStale) {
    alert("Please click 'Calculate Total' to generate an updated quote before downloading.");
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsPDF = (window as any).jspdf?.jsPDF;
  if (!jsPDF) return;

  const doc = new jsPDF("p", "mm", "a4");
  const date = new Date().toLocaleDateString("en-US");
  const totalStr = total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const logo = new Image();
  logo.src = "https://raw.githubusercontent.com/KhalidMas23/Aquaria-Calculator/52de119ecbc4d4910952b0384c5092621f70e62d/AQ_TRANSPARENT_LOGO.png";

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Grey Header Bar ---
    doc.setFillColor(243, 244, 246); // Tailwind gray-100
    doc.rect(0, 0, pageWidth, 25, "F");

    // Logo in header
    const logoWidth = 35;
    const aspectRatio = logo.width / logo.height;
    const logoHeight = logoWidth / aspectRatio;
    doc.addImage(logo, "PNG", 15, 5, logoWidth, logoHeight);

    // Company Info Right
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81); // Tailwind gray-700
    const infoX = pageWidth - 80;
    let infoY = 12;
    doc.text("600 Congress Ave, Austin, TX 78701", infoX, infoY);
    infoY += 6;
    doc.text(`Quote Generated: ${date}`, infoX, infoY);

    let y = 40; // start content below header

    // --- Section Helpers ---
    const addSectionHeader = (title: string) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(43, 103, 119); // Aquaria blue-green
      doc.text(title, 20, y);
      y += 3;

      // full-width divider line
      doc.setDrawColor(200);
      doc.line(20, y, pageWidth - 20, y);
      y += 8;

      doc.setTextColor(0, 0, 0); // reset to black
    };

    const addLine = (label: string, value: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`${label}:`, 25, y);
      doc.text(value, 95, y);
      y += 7;
    };

    const addService = (component: string, qty: string, description: string) => {
      doc.setFontSize(11);
      doc.text(component, 25, y);
      doc.text(qty, 95, y);
      doc.text(description, 120, y);
      y += 7;
    };

    // MAIN PRODUCT
    addSectionHeader("Main Product");
    const modelText = model
      ? (document.querySelector(`#model option[value='${model}']`) as HTMLOptionElement)?.textContent || "None"
      : "None";
    addLine("Hydropack Model", modelText);

    // TANK
    addSectionHeader("Tank Selection");
    const tankText = tank
      ? (document.querySelector(`#tank option[value='${tank}']`) as HTMLOptionElement)?.textContent || "None"
      : "None";
    addLine("Selected Tank", tankText);

    // FILTERS
    addSectionHeader("Additional Filters");
    const filterText = filter
      ? (document.querySelector(`#filter option[value='${filter}']`) as HTMLOptionElement)?.textContent || "None"
      : "None";
    addLine("Extra Filter(s)", `${filterText} x${filterQty}`);

    // SHIPPING
    addSectionHeader("Shipping/Handling");
    addLine("Nearest City", city || "None");

    // ADDITIONAL SERVICES
    addSectionHeader("Additional Services");
    doc.setFont("helvetica", "bold");
    doc.text("Component", 25, y);
    doc.text("Qty", 95, y);
    doc.text("Description", 120, y);
    y += 7;
    doc.setFont("helvetica", "normal");

    if (unitPad) addService("Unit Concrete Pad", "1", "Concrete base for main system");
    if (tankPad) addService("Tank Concrete Pad", "1", "Concrete base for tank support");

    // trench label map
const trenchLabels: Record<string, string> = {
  trench_elec: "Trenching - Electrical",
  trench_plumb: "Trenching - Plumbing",
  trench_comb: "Trenching - Combined",
};

const ab_trenchLabels: Record<string, string> = {
  ab_elec: "Above Ground - Electrical",
  ab_plumb: "Above Ground - Plumbing",
  ab_comb: "Above Ground - Combined",
};

const trenchingLines = trenchingSections.filter((section) => section.type && section.distance > 0);
trenchingLines.forEach(({ type, distance }) => {
  const label = trenchLabels[type] || type; // fallback to raw if not found
  doc.text(label, 25, y);
  doc.text(`${distance} ft`, 95, y);
  doc.text("Trenching Services", 120, y);
  y += 7;
});

const ab_trenchingLines = ab_trenchingSections.filter((section) => section.type && section.distance > 0);
ab_trenchingLines.forEach(({ type, distance }) => {
  const label = ab_trenchLabels[type] || type; // fallback to raw if not found
  doc.text(label, 25, y);
  doc.text(`${distance} ft`, 95, y);
  doc.text("Trenching Services", 120, y);
  y += 7;
});

if (connection === "2way-t-valve") addService("Connection Type", "", "Manual 2-way T-valve install");
if (connection === "3way-t-valve") addService("Connection Type", "", "Automatic 3-way T-valve install");
if (panelUpgrade === "panel") addService("Panel Upgrade", "", "Electrical panel enhancement");
else if (panelUpgrade === "subpanel") addService("Subpanel Upgrade", "", "Electrical subpanel support");

// WARRANTY
    addSectionHeader("Warranty");
    if (warranty === "warranty5") addService("5-Year Extended Warranty", "", "Extended protection for system");
    else if (warranty === "warranty8") addService("8-Year Extended Warranty", "", "Extended protection for system");
    else addService("Standard Warranty", "", "Basic coverage included at no cost");

    // SALES TAX
    addSectionHeader("8.25% Sales Tax");

    // TOTAL
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(`Total: $${totalStr}`, pageWidth - 20, y, { align: "right" });

    // FOOTER
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(
      "Thank you for your interest in Aquaria. This quote is valid for 30 days. Aquaria Atmospheric Water Generator units are exempt from sales tax.",
      pageWidth / 2,
      285,
      { align: "center", maxWidth: pageWidth - 40 }
    );

    doc.save("Hydropack_Quote.pdf");
  };
};





  return (
    <>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <title>Aquaria Hydropack Quote</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className="max-w-2xl mx-auto my-8 p-6 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">
          Aquaria Hydropack Quote Generator
        </h1>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Hydropack Model</legend>
          <select
            id="model"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={model}
            onChange={(e) => {
            setModel(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
        }}
          >
            <option value="">Select Model</option>
            <option value="s">Hydropack S</option>
            <option value="standard">Hydropack</option>
            <option value="x">Hydropack X</option>
          </select>

        
          <label className="flex items-center mt-2">
            <input
              id="unitPad"
              type="checkbox"
              className="mr-2"
              checked={unitPad}
            onChange={(e) => {
            setUnitPad(e.target.checked);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
            />
            Include concrete pad for unit
          </label>
          <label className="flex items-center mt-2">
            <input
              id="mobility"
              type="checkbox"
              className="mr-2"
              checked={mobility}
              onChange={(e) => {
            setMobility(e.target.checked);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
            />
            Mobility assistance: unload unit off truck
          </label>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Tank Selection</legend>
          <select
            id="tank"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={tank}
            onChange={(e) => {
            setTank(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
          >
            <option value="">None</option>
            <option value="500">500 gallon</option>
            <option value="1550">1550 gallon</option>
            <option value="3000">3000 gallon</option>
            <option value="5000">5000 gallon</option>
          </select>
          <label className="flex items-center mt-2">
            <input
            id="tankPad"
            type="checkbox"
            className="mr-2"
            checked={tankPad}
            onChange={(e) => {
            setTankPad(e.target.checked);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
            />
            Include concrete pad for tank
          </label>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Nearest City</legend>
          <select
            id="city"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={city}
            onChange={(e) => {
            setCity(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
          >
            <option value="">Select City</option>
            <option value="Austin">Austin</option>
            <option value="Corpus Christi">Corpus Christi</option>
            <option value="Dallas">Dallas</option>
            <option value="Houston">Houston</option>
            <option value="San Antonio">San Antonio</option>
          </select>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Tank Sensor</legend>
          <select
            id="sensor"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={sensor}
            onChange={(e) => {
            setSensor(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
            
          >
            <option value="">None</option>
            <option value="normal">Normal</option>
          </select>
        </fieldset>

      <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
  <legend className="font-semibold px-2">Extra Filter(s)</legend>
  
  <div className="flex items-center gap-4 mt-2">
    <select
      id="filter"
      className="p-2 border border-gray-300 rounded flex-grow"
      value={filter}
      onChange={(e) => {
        setFilter(e.target.value);
        setQuoteIsStale(true);
        setShowFinancing(false);
      }}
    >
      <option value="">None</option>
      <option value="s">Hydropack S</option>
      <option value="standard">Hydropack</option>
      <option value="x">Hydropack X</option>
    </select>

    <div className="flex items-center">
      <input
        id="filterQty"
        type="number"
        min="0"
        className="p-2 border border-gray-300 rounded w-20"
        value={filterQty}
        onChange={(e) => {
          setFilterQty(parseInt(e.target.value) || 0);
          setQuoteIsStale(true);
          setShowFinancing(false);
        }}
      />
      <span className="ml-2">Qty</span>
    </div>
  </div>
</fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">External Water Pump</legend>
          <select
            id="pump"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={pump}
            onChange={(e) => {
            setPump(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
          >
            <option value="">None</option>
            <option value="mini">DAB Mini</option>
          </select>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Connection Type</legend>
          <select
            id="connection"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={connection}
            onChange={(e) => {
            setConnection(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
          >
            <option value="">None</option>
            <option value="2way-t-valve">Manual 2-way T-valve</option>
            <option value="3way-t-valve">Manual 3-way T-valve</option>
          </select>
        </fieldset>

<fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
  <legend className="font-semibold px-2">Trenching Sections</legend>
  {trenchingSections.map((section, index) => (
  <div
  key={index}
  className="w-full flex flex-wrap md:flex-nowrap items-start gap-4 p-4 border border-gray-300 rounded-md bg-white"
>
  {/* Material */}
  <div className="flex flex-col flex-1 min-w-[140px]">
    <label className="text-sm font-medium text-gray-600 mb-1">Material</label>
    <select
  className="border border-gray-300 rounded px-2 py-1"
  value={section.type}
  onChange={(e) => {
    const updated = [...trenchingSections];
    updated[index].type = e.target.value;
    setTrenchingSections(updated);
    setQuoteIsStale(true);
    setShowFinancing(false);
  }}
>

      <option value="">Select</option>
      <option value="trench_elec">Electrical</option>
      <option value="trench_plumb">Plumbing</option>
      <option value="trench_comb">Combined Electrical + Plumbing</option>
      {/* <option value="dirt">Dirt</option> */}
      {/* <option value="rock">Rock</option> */}
      {/* <option value="limestone">Limestone</option> */}
      {/* <option value="elec_above_gr">Electrical (above ground)</option> */}
      {/* <option value="plumb_above_gr">Plumbing (above ground)</option> */}
      {/* <option value="comb_above_gr">Combined (above ground)</option> */}
    </select>
  </div>

  {/* Distance */}
  <div className="flex flex-col flex-1 min-w-[140px]">
    <label className="text-sm font-medium text-gray-600 mb-1">Distance (ft)</label>
    <input
  type="number"
  min="0"
  className="border border-gray-300 rounded px-2 py-1"
  value={section.distance}
  onChange={(e) => {
    const updated = [...trenchingSections];
    updated[index].distance = parseFloat(e.target.value) || 0;
    setTrenchingSections(updated);
    setQuoteIsStale(true);
    setShowFinancing(false);
  }}
/>

  </div>

{/* Remove Button */}
<button
  type="button"
  className="text-red-500 text-xl px-2 mt-6 md:mt-0"
  onClick={() => {
    const updated = trenchingSections.filter((_, i) => i !== index);
    setTrenchingSections(updated);
    setQuoteIsStale(true); // Mark quote as stale when a section is removed
 setShowFinancing(false); 
  }}
>
  ✕
</button>
</div>
  ))}
  <button
    type="button"
    className="text-sm text-blue-600 mt-2"
    onClick={() => setTrenchingSections([...trenchingSections, { type: "", distance: 0 }])}
  >
    + Add Another Section
  </button>
</fieldset>

<fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
  <legend className="font-semibold px-2">Above-Ground Runs</legend>
  {ab_trenchingSections.map((section, index) => (
    <div
      key={index}
      className="w-full flex flex-wrap md:flex-nowrap items-start gap-4 p-4 border border-gray-300 rounded-md bg-white"
    >
      {/* Material */}
      <div className="flex flex-col flex-1 min-w-[140px]">
        <label className="text-sm font-medium text-gray-600 mb-1">Material</label>
        <select
          className="border border-gray-300 rounded px-2 py-1"
          value={section.type}
          onChange={(e) => {
            const updated = [...ab_trenchingSections];
            updated[index].type = e.target.value;
            setab_TrenchingSections(updated);
            setQuoteIsStale(true);
            setShowFinancing(false);
          }}
        >
          <option value="">Select</option>
          <option value="ab_elec">Electrical (above ground)</option>
          <option value="ab_plumb">Plumbing (above ground)</option>
          <option value="ab_comb">Combined Electrical + Plumbing</option>
        </select>
      </div>

      {/* Distance */}
      <div className="flex flex-col flex-1 min-w-[140px]">
        <label className="text-sm font-medium text-gray-600 mb-1">Distance (ft)</label>
        <input
          type="number"
          min="0"
          className="border border-gray-300 rounded px-2 py-1"
          value={section.distance}
          onChange={(e) => {
            const updated = [...ab_trenchingSections];
            updated[index].distance = parseFloat(e.target.value) || 0;
            setab_TrenchingSections(updated);
            setQuoteIsStale(true);
            setShowFinancing(false);
          }}
        />
      </div>

      {/* Remove Button */}
      <button
        type="button"
        className="text-red-500 text-xl px-2 mt-6 md:mt-0"
        onClick={() => {
          const updated = ab_trenchingSections.filter((_, i) => i !== index);
          setab_TrenchingSections(updated);
          setQuoteIsStale(true);
          setShowFinancing(false);
        }}
      >
        ✕
      </button>
    </div>
  ))}
  <button
    type="button"
    className="text-sm text-blue-600 mt-2"
    onClick={() =>
      setab_TrenchingSections([...ab_trenchingSections, { type: "", distance: 0 }])
    }
  >
    + Add Another Section
  </button>
</fieldset>



<fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
  <legend className="font-semibold px-2">Add-ons</legend>
  <select
    id="panelUpgrade"
    className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
    value={panelUpgrade}
    onChange={(e) => {
            setPanelUpgrade(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
          }}
  >
  <option value="">None</option>
  <option value="panel">Panel Upgrade</option>
  <option value="subpanel">Subpanel Upgrade</option>
  </select>
</fieldset>

<fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
  <legend className="font-semibold px-2">Warranty Options</legend>
  <select
    id="WarrantyOptions"
    className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
    value={warranty}
    onChange={(e) => {
            setWarranty(e.target.value);
            setQuoteIsStale(true);
            setShowFinancing(false);
                          }}
  >
    <option value="standard">Standard (Included)</option>
    <option value="warranty5">5-Year Extended Warranty</option>
    <option value="warranty8">8-Year Extended Warranty</option>
  </select>
</fieldset>

<fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
  <legend className="font-semibold px-2">Demolition</legend>

  <div className="flex items-center gap-4">
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={demolition.enabled}
        onChange={(e) => {
          setDemolition({ ...demolition, enabled: e.target.checked });
          setQuoteIsStale(true);
          setShowFinancing(false);
        }}
      />
      Include demolition (in ft)
    </label>

    {demolition.enabled && (
      <input
        type="number"
        className="border border-gray-300 rounded px-2 py-1"
        placeholder="Distance (ft)"
        min={0}
        value={demolition.distance}
        onChange={(e) => {
          setDemolition({ ...demolition, distance: Number(e.target.value) });
          setQuoteIsStale(true);
          setShowFinancing(false);
        }}
      />
    )}
  </div>
</fieldset>





        

{quoteTotal !== null && (
  <>
    <hr className="my-6 border-t border-gray-300" />

    <p className="text-center text-2xl font-semibold text-gray-800">
      Total:{" "}
      <span className="text-green-600">
        ${quoteTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </p>
  </>
)}



<button
  className="block w-full py-3 mt-4 text-lg bg-green-600 text-white rounded hover:bg-green-700"
  onClick={calculateTotal}
>
  {quoteIsStale ? "Calculate Total" : "Calculate Total"}
</button>


<button
  disabled={quoteTotal === null || quoteIsStale}
  className={`block w-full py-3 mt-4 text-lg rounded text-white ${
    quoteTotal === null || quoteIsStale
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-blue-600 hover:bg-blue-700'
  }`}
  onClick={() => {
    if (quoteTotal === null || quoteIsStale) {
      alert("Please click 'Calculate Total' after making changes before downloading your quote.");
      return;
    }
    downloadPDF();
  }}
>
  Download Quote PDF
</button>

   <button
  onClick={() => {
  if (quoteTotal === null || quoteIsStale) {
    alert("Please click 'Calculate Total' before viewing financing options.");
    return;
  }

  setShowFinancing((prev) => {
    const next = !prev;
    if (next) {
      setTimeout(() => {
        financingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
    return next;
  });
}}

  className="block w-full py-3 mt-4 text-lg bg-gray-600 text-white rounded text-center hover:bg-gray-700"
>
  {showFinancing ? "Hide Financing Calculator" : "See Financing Options"}
</button>


<div
  ref={financingRef}
  className={`transition-all duration-500 ease-in-out transform ${
    showFinancing
      ? 'opacity-100 translate-y-0 max-h-[1000px] mb-4'
      : 'opacity-0 -translate-y-4 max-h-0 overflow-hidden'
  }`}
>
  {showFinancing && <FinancingCalculator totalAmount={total} />}
</div>





      </div>
    </>
  );
};

export default HomePage;
