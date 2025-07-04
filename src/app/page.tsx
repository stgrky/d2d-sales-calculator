"use client";

// pages/index.tsx
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import FinancingCalculator from '@/components/FinancingCalculator'; // adjust path if needed


const HomePage: React.FC = () => {


// State hooks first
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
const [pumpDist, setPumpDist] = useState<number>(0);
const [connection, setConnection] = useState<string>("");
const [trenchingSections, setTrenchingSections] = useState([{ type: "", distance: 0 }]);
const [panelUpgrade, setPanelUpgrade] = useState<string>("");
const [total, setTotal] = useState<number>(0);
const [showFinancing, setShowFinancing] = useState(false);
const financingRef = useRef<HTMLDivElement>(null);

// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  calculateTotal();
}, [
  model,
  unitPad,
  mobility,
  tank,
  tankPad,
  city,
  sensor,
  filter,
  filterQty,
  pump,
  pumpDist,
  connection,
  trenchingSections,
  panelUpgrade
]);


// Price lookup
const modelPrices: Record<
  string,
  {
    system: number;
    install: number;
    ship: number;
    pad: number;
    mobility: number;
  }
> = {
  s: { system: 9999, install: 0, ship: 645, pad: 2750, mobility: 500 },
  standard: {system: 17499, install: 0, ship: 1095, pad: 3250, mobility: 500,},
  x: { system: 29999, install: 0, ship: 1550, pad: 4550, mobility: 1000 },
};

const tankPrices: Record<string, number> = {
  "500": 770.9,
  "1550": 1430.35,
  "3000": 2428.9,
};

const tankPads: Record<string, number> = {
  "500": 1850,
  "1550": 2250,
  "3000": 2550,
};

const cityDelivery: Record<string, number> = {
  "Austin": 999,
  "Corpus Christi": 858,  
  "Dallas": 577.5,
  "Houston": 200,
  "San Antonio": 660,
};

const sensorPrices: Record<string, number> = {
   "": 0,
   normal: 35,
};

const filterPrices: Record<string, number> = {
  // Last updated 06/17
  s: 100,
  standard: 150,
  x: 200,
};

const pumpPrices: Record<string, number> = { 
  dab: 1900, 
  mini: 800, 
  "": 0 
};

const trenchRates: Record<string, number> = {
  dirt: 54.5,
  rock: 59.5,
  limestone: 61.5,
  elec_above_gr: 35.5,
  plumb_above_gr: 26.5,
  comb_above_gr: 35.5,
  "": 0,
};

const calculateTotal = () => {
  const ADM = 500;
  const COMM = 2500;
  const AQM = 500;

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
  if (connection === "t-valve") {
    installTotal += 75;
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
    const rate = trenchRates[type] || 0;
    const cost = rate * distance;
    if (cost > 0) {
      hasSelections = true;
      hasInstallOptions = true;
    }
    installTotal += cost;
  });

  subtotal += installTotal;

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

  // Pump
  if (pump) {
    const pCost = (pumpPrices[pump] || 0) + Math.ceil((pumpDist / 20)) * 120;
    if (pCost > 0) hasSelections = true;
    subtotal += pCost;
    taxable += pCost;
    // hasInstallOptions = true;
    // Add an "own install option?"
  }

  // Admin fee (if anything selected)
  if (hasSelections) {
    subtotal += ADM;
  }

  // Comm + AQM (if install-related options selected)
  if (hasInstallOptions) {
    subtotal += COMM + AQM;
  }

  const taxRate = 0.0825;
  const tax = taxable * taxRate;
  const grandTotal = subtotal + tax;

  setTotal(parseFloat(grandTotal.toFixed(2)));
};





// Download PDF using jsPDF
  const downloadPDF = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsPDF = (window as any).jspdf?.jsPDF;

    if (!jsPDF) return;

    const doc = new jsPDF();
    const date = new Date().toLocaleDateString("en-US");
    const totalStr = total.toFixed(2);

    const logo = new Image();
    logo.src =
      "https://raw.githubusercontent.com/KhalidMas23/Aquaria-Calculator/8dc0a0fc0875cb830a78b1b9d2eee37c5048348a/AQ_LOGOPACK_RGB-04.png";
    logo.onload = () => {
      doc.addImage(logo, "PNG", 150, 10, 40, 15);
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text("Aquaria", 20, 15);
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text("600 Congress Ave, Austin, TX 78701", 20, 21);
      doc.text(`Quote Generated: ${date}`, 20, 27);

      let y = 40;
      const addSectionHeader = (title: string) => {
        doc.setFont(undefined, "bold");
        doc.setFontSize(12);
        doc.text(title, 20, y);
        y += 5;
        doc.setDrawColor(180);
        doc.line(20, y, 190, y);
        y += 5;
      };
      const addLine = (label: string, value: string) => {
        doc.setFont(undefined, "normal");
        doc.text(`${label}: ${value}`, 25, y);
        y += 7;
      };

      // Main Product
      addSectionHeader("Main Product");
      const modelText = model
        ? (
            document.querySelector(
              `#model option[value='${model}']`
            ) as HTMLOptionElement
          ).textContent
        : "None";
      addLine("Hydropack Model", modelText || "None");

      // Tank Selection
      addSectionHeader("Tank Selection");
      const tankText = tank
        ? (
            document.querySelector(
              `#tank option[value='${tank}']`
            ) as HTMLOptionElement
          ).textContent
        : "None";
      addLine("Selected Tank", tankText || "None");

      // Additional Filters
      addSectionHeader("Additional Filters");
      const filterText = filter
        ? (
            document.querySelector(
              `#filter option[value='${filter}']`
            ) as HTMLOptionElement
          ).textContent
        : "None";
      addLine("Extra Filter(s)", `${filterText || "None"} x${filterQty}`);

      // Shipping/Handling
      addSectionHeader("Shipping/Handling");
      addLine("Nearest City", city || "None");

      // Additional Services
      addSectionHeader("Additional Services");
      doc.setFont(undefined, "bold");
      doc.text("Component", 25, y);
      doc.text("Qty", 100, y);
      doc.text("Description", 110, y);
      y += 7;
      doc.setFont(undefined, "normal");
      if (unitPad)
        addService("Unit Concrete Pad", "1", "Concrete base for main system");
      if (tankPad)
        addService("Tank Concrete Pad", "1", "Concrete base for tank support");
  
      // Grouped Trenching Section (Single Description)
      const trenchingLines = trenchingSections.filter(
      (section) => section.type && section.distance > 0
      );

      if (trenchingLines.length > 0) {
        const labelMap: Record<string, string> = {
        dirt: "Dirt trenching",
        rock: "Rock trenching",
        limestone: "Limestone trenching",
        elec_above_gr: "Electrical trenching (above ground)",
        plumb_above_gr: "Plumbing trenching (above ground)",
        comb_above_gr: "Combined trenching (above ground)",  
      };

      const trenchDescription =
      "Trenching for water/power/plumbing, above/below ground as selected";

      const startY = y; // Save starting y-position for description

      // Render each trenching line on the left/middle
      trenchingLines.forEach(({ type, distance }) => {
      doc.text(labelMap[type] || `Trenching (${type})`, 25, y);
      doc.text(`${distance} ft`, 100, y);
      y += 7;
      });

  // Render description aligned with the first line on the right
 let wrappedLines: string[] = [];

try {
  const result = doc.splitTextToSize(trenchDescription || "", 80);
  wrappedLines = Array.isArray(result) ? result : [String(result)];
} catch (err) {
  console.error("Error wrapping trench description:", err);
  wrappedLines = [String(trenchDescription || "")];
}

wrappedLines.forEach((line: string, i: number) => {
  doc.text(line, 110, startY + i * 7);
});


  // Ensure y continues past both sections
  y = Math.max(y, startY + wrappedLines.length * 7);
      }

      if (connection === "t-valve")
        addService("Connection Type", "", "Manual 2-way T-valve install");
      if (panelUpgrade === "panel")
        addService("Panel Upgrade", "", "Electrical panel enhancement");
      else if (panelUpgrade === "subpanel")
        addService("Subpanel Upgrade", "", "Electrical subpanel support");

      function addService(component: string, qty: string, description: string) {
        doc.text(component, 25, y);
        doc.text(qty, 100, y);
        doc.text(description, 110, y);
        y += 7;
      }

      // Admin Fee Section
      addSectionHeader("Admin & Processing Fee");

      // Tax Section
      // To edit later, change phrasing
      addSectionHeader("8.25% Sales Tax");

      // Total
      doc.setFont(undefined, "bold");
      doc.setFontSize(14);
      doc.text(`Total: $${totalStr}`, 20, y);

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.text(
        "Thank you for your interest in Aquaria. This quote is valid for 30 days.",
        20,
        285
      );

      doc.save("Hydropack_Quote.pdf");
    };
  };

  // Ensure jsPDF script is loaded on client side
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

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
            onChange={(e) => setModel(e.target.value)}
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
              onChange={(e) => setUnitPad(e.target.checked)}
            />
            Include concrete pad for unit
          </label>
          <label className="flex items-center mt-2">
            <input
              id="mobility"
              type="checkbox"
              className="mr-2"
              checked={mobility}
              onChange={(e) => setMobility(e.target.checked)}
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
            onChange={(e) => setTank(e.target.value)}
          >
            <option value="">None</option>
            <option value="500">500 gallon</option>
            <option value="1550">1550 gallon</option>
            <option value="3000">3000 gallon</option>
          </select>
          <label className="flex items-center mt-2">
            <input
              id="tankPad"
              type="checkbox"
              className="mr-2"
              checked={tankPad}
              onChange={(e) => setTankPad(e.target.checked)}
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
            onChange={(e) => setCity(e.target.value)}
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
            onChange={(e) => setSensor(e.target.value)}
          >
            <option value="">None</option>
            <option value="normal">Normal</option>
          </select>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Extra Filter(s)</legend>
          <select
            id="filter"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="">None</option>
            <option value="s">Hydropack S</option>
            <option value="standard">Hydropack</option>
            <option value="x">Hydropack X</option>
          </select>
          <div className="flex items-center mt-2">
            <input
              id="filterQty"
              type="number"
              min="0"
              className="p-2 border border-gray-300 rounded w-16"
              value={filterQty}
              onChange={(e) => setFilterQty(parseInt(e.target.value) || 0)}
            />
            <span className="ml-2">Qty</span>
          </div>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">External Water Pump</legend>
          <select
            id="pump"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={pump}
            onChange={(e) => setPump(e.target.value)}
          >
            <option value="">None</option>
            <option value="mini">DAB Mini</option>
          </select>
          <div className="flex items-center mt-2">
            <input
              id="pumpDist"
              type="number"
              min="0"
              className="p-2 border border-gray-300 rounded w-16"
              value={pumpDist}
              onChange={(e) => setPumpDist(parseInt(e.target.value) || 0)}
            />
            <span className="ml-2">Distance (ft)</span>
          </div>
        </fieldset>

        <fieldset className="border border-gray-300 rounded bg-gray-50 mb-6 p-4">
          <legend className="font-semibold px-2">Connection Type</legend>
          <select
            id="connection"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={connection}
            onChange={(e) => setConnection(e.target.value)}
          >
            <option value="">None</option>
            <option value="t-valve">Manual 2-way T-valve</option>
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
      }}
    >
      <option value="">Select</option>
      <option value="dirt">Dirt</option>
      <option value="rock">Rock</option>
      <option value="limestone">Limestone</option>
      <option value="elec_above_gr">Electrical (above ground)</option>
      <option value="plumb_above_gr">Plumbing (above ground)</option>
      <option value="comb_above_gr">Combined (above ground)</option>
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
          <legend className="font-semibold px-2">Add-ons</legend>
          <select
            id="panelUpgrade"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={panelUpgrade}
            onChange={(e) => setPanelUpgrade(e.target.value)}
          >
            <option value="">None</option>
            <option value="panel">Panel Upgrade</option>
            <option value="subpanel">Subpanel Upgrade</option>
          </select>
        </fieldset>

        <p className="text-center text-lg font-semibold">
          Total: ${total.toFixed(2)}
        </p>
        <button
          className="block w-full py-3 mt-4 text-lg bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={downloadPDF}
        >
          Download Quote PDF
        </button>
   <button
  onClick={() => {
    setShowFinancing((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          financingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100); // delay to ensure rendering completes
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
