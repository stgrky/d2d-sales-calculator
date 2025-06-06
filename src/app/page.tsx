"use client";

// pages/index.tsx
import { useState, useEffect } from "react";
import Head from "next/head";

const HomePage: React.FC = () => {
  // State for form inputs
  const [model, setModel] = useState<string>("");
  const [unitOnly, setUnitOnly] = useState<boolean>(false);
  const [unitPad, setUnitPad] = useState<boolean>(false);
  const [mobility, setMobility] = useState<boolean>(false);
  const [tank, setTank] = useState<string>("");
  const [tankPad, setTankPad] = useState<boolean>(false);
  const [city, setCity] = useState<string>("");
  const [sensor, setSensor] = useState<string>("");
  const [filter, setFilter] = useState<string>("");
  const [filterQty, setFilterQty] = useState<number>(1);
  const [pump, setPump] = useState<string>("");
  const [connection, setConnection] = useState<string>("");
  const [trenchingType, setTrenchingType] = useState<string>("");
  const [trenchDistance, setTrenchDistance] = useState<number>(0);
  const [panelUpgrade, setPanelUpgrade] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

  // Price lookup tables
  const modelPrices: Record<
    string,
    { system: number; install: number; ship: number; pad: number; mobility: number }
  > = {
    s: { system: 9999, install: 6750, ship: 645, pad: 2750, mobility: 500 },
    standard: { system: 17499, install: 7450, ship: 1095, pad: 3250, mobility: 500 },
    x: { system: 29999, install: 8750, ship: 1550, pad: 4550, mobility: 1000 },
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
    Austin: 999,
    "Corpus Christi": 858,
    Dallas: 577.5,
    Houston: 200,
    "San Antonio": 660,
  };

  const filterPrices: Record<string, number> = { s: 350, standard: 500, x: 700 };

  const pumpPrices: Record<string, number> = { dab: 1900, mini: 800, "": 0 };

  const trenchRates: Record<string, number> = { dirt: 54.5, rock: 59.5, limestone: 61.5, "": 0 };

  // Calculate total when "Calculate Total" button is clicked
  const calculateTotal = () => {
    let subtotal = 0;
    let taxable = 0;

    if (model) {
      subtotal += modelPrices[model].system;
      if (!unitOnly) subtotal += modelPrices[model].install;
      subtotal += modelPrices[model].ship;
      if (unitPad) subtotal += modelPrices[model].pad;
      if (mobility) subtotal += modelPrices[model].mobility;
    }

    if (tank) {
      const tCost = tankPrices[tank] || 0;
      subtotal += tCost;
      taxable += tCost;
      if (tankPad) subtotal += tankPads[tank] || 0;
      if (city && cityDelivery[city]) subtotal += cityDelivery[city];
    }

    if (filter) {
      const fCost = (filterPrices[filter] || 0) * filterQty;
      subtotal += fCost;
      taxable += fCost;
    }

    if (pump) {
      const pCost = pumpPrices[pump] || 0;
      subtotal += pCost;
      taxable += pCost;
    }

    if (connection === "t-valve") subtotal += 75;

    subtotal += (trenchRates[trenchingType] || 0) * trenchDistance;

    if (panelUpgrade === "panel") subtotal += 8000;
    if (panelUpgrade === "subpanel") subtotal += 3000;

    subtotal += 500; // Admin fee

    const taxRate = 0.0825;
    const tax = taxable * taxRate;
    const grandTotal = subtotal + tax;

    setTotal(parseFloat(grandTotal.toFixed(2)));
  };

  // Download PDF using jsPDF
  const downloadPDF = () => {
    // Ensure jsPDF script is loaded
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
        ? (document.querySelector(`#model option[value='${model}']`) as HTMLOptionElement)
            .textContent
        : "None";
      addLine("Hydropack Model", modelText || "None");

      // Tank Selection
      addSectionHeader("Tank Selection");
      const tankText = tank
        ? (document.querySelector(`#tank option[value='${tank}']`) as HTMLOptionElement)
            .textContent
        : "None";
      addLine("Selected Tank", tankText || "None");

      // Additional Filters
      addSectionHeader("Additional Filters");
      const filterText = filter
        ? (document.querySelector(`#filter option[value='${filter}']`) as HTMLOptionElement)
            .textContent
        : "None";
      addLine("Extra Filter(s)", `${filterText || "None"} x${filterQty}`);

      // Shipping/Handling
      addSectionHeader("Shipping/Handling");
      addLine("Nearest City", city || "None");

      // Additional Services
      addSectionHeader("Additional Services");
      doc.setFont(undefined, "bold");
      doc.text("Component", 25, y);
      doc.text("Qty", 90, y);
      doc.text("Description", 110, y);
      y += 7;
      doc.setFont(undefined, "normal");
      if (unitPad) addService("Unit Concrete Pad", "1", "Concrete base for main system");
      if (tankPad) addService("Tank Concrete Pad", "1", "Concrete base for tank support");
      if (trenchingType && trenchDistance > 0)
        addService(
          `Trenching (${trenchingType})`,
          `${trenchDistance} ft`,
          "Underground piping trench"
        );
      if (connection === "t-valve")
        addService("Connection Type", "1", "Manual 2-way T-valve install");
      if (panelUpgrade === "panel")
        addService("Panel Upgrade", "1", "Electrical panel enhancement");
      else if (panelUpgrade === "subpanel")
        addService("Subpanel Upgrade", "1", "Electrical subpanel support");

      function addService(component: string, qty: string, description: string) {
        doc.text(component, 25, y);
        doc.text(qty, 90, y);
        doc.text(description, 110, y);
        y += 7;
      }

      // Admin Fee Section
      addSectionHeader("Admin & Processing Fee");

      // Tax Section
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
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <Head>
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
              id="unitOnly"
              type="checkbox"
              className="mr-2"
              checked={unitOnly}
              onChange={(e) => setUnitOnly(e.target.checked)}
            />
            Unit purchase only
          </label>
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
            Include mobility assistance
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
              min="1"
              className="p-2 border border-gray-300 rounded w-16"
              value={filterQty}
              onChange={(e) => setFilterQty(parseInt(e.target.value) || 1)}
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
          <legend className="font-semibold px-2">Trenching</legend>
          <select
            id="trenchingType"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={trenchingType}
            onChange={(e) => setTrenchingType(e.target.value)}
          >
            <option value="">None</option>
            <option value="dirt">Dirt</option>
            <option value="rock">Rock</option>
            <option value="limestone">Limestone</option>
          </select>
          <input
            id="trenchDistance"
            type="number"
            placeholder="Distance in ft"
            className="mt-2 mb-2 p-2 w-full border border-gray-300 rounded"
            value={trenchDistance}
            onChange={(e) => setTrenchDistance(parseFloat(e.target.value) || 0)}
          />
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
          onClick={calculateTotal}
        >
          Calculate Total
        </button>
        <button
          className="block w-full py-3 mt-4 text-lg bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={downloadPDF}
        >
          Download Quote PDF
        </button>
      </div>
    </>
  );
};

export default HomePage;
