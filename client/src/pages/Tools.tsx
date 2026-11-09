import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calculator,
  Check,
  ExternalLink,
  Home,
  LandPlot,
  LineChart,
  Percent,
  RefreshCw,
  Scale,
  WalletCards,
} from "lucide-react";
import { Link } from "wouter";
import { Footer } from "@/components/finz/Sections";
import { SiteHeader } from "@/components/finz/SiteHeader";
import { useProperties } from "@/lib/marketplace";
import { districts, propertyKinds } from "@shared/search";
import { formatLkr, type Property } from "@shared/marketplace";
import {
  calculateAffordability,
  calculateInvestmentReturn,
  calculateMortgage,
  calculateObservedAskingMedians,
  calculatePriceMeter,
  calculatePricePerUnit,
  compareLoans,
  convertLandArea,
  convertLkrToCurrency,
  estimateStampDuty,
  type LandAreaUnit,
} from "@shared/calculators";

const inputClass =
  "mt-1.5 h-11 w-full rounded-xl border border-[#e3ded5] bg-white px-3 text-sm text-[#0b1f33] outline-none transition focus:border-[#b28d48]";
const toolSlugs = [
  "mortgage",
  "repayment-plan",
  "affordability",
  "investment",
  "land-converter",
  "price-converter",
  "stamp-duty",
  "currency",
  "loan-comparison",
  "price-meter",
  "market-insights",
  "house-price-index",
  "land-price-index",
  "market-reports",
] as const;
type ToolSlug = (typeof toolSlugs)[number];

const tools: {
  slug: ToolSlug;
  title: string;
  description: string;
  icon: typeof Calculator;
}[] = [
  {
    slug: "mortgage",
    title: "Home loan calculator",
    description:
      "Estimate monthly payment, financed value and total interest from your assumptions.",
    icon: Home,
  },
  {
    slug: "repayment-plan",
    title: "Repayment plan",
    description: "See year-by-year principal, interest and remaining balance.",
    icon: BarChart3,
  },
  {
    slug: "affordability",
    title: "Affordability",
    description:
      "Turn income, commitments and a chosen repayment ratio into a budget.",
    icon: WalletCards,
  },
  {
    slug: "investment",
    title: "Investment return",
    description:
      "Explore rental yield, cash flow, sale assumptions and real return.",
    icon: LineChart,
  },
  {
    slug: "land-converter",
    title: "Land area converter",
    description:
      "Convert acres, perches, square feet, square metres and hectares.",
    icon: LandPlot,
  },
  {
    slug: "price-converter",
    title: "Price per unit",
    description: "Translate a land price into price per perch and square foot.",
    icon: Scale,
  },
  {
    slug: "stamp-duty",
    title: "Stamp-duty estimate",
    description: "Apply your own percentage and fixed-charge assumptions.",
    icon: Percent,
  },
  {
    slug: "currency",
    title: "Currency converter",
    description: "Convert LKR using an exchange rate you enter yourself.",
    icon: RefreshCw,
  },
  {
    slug: "loan-comparison",
    title: "Loan comparison",
    description:
      "Compare two user-entered offers without inventing bank rates.",
    icon: Calculator,
  },
  {
    slug: "price-meter",
    title: "Price meter",
    description:
      "Indicative asking-price range from enough current comparable records.",
    icon: BarChart3,
  },
  {
    slug: "market-insights",
    title: "Market insights",
    description:
      "Inspect this marketplace sample alongside official external resources.",
    icon: LineChart,
  },
  {
    slug: "house-price-index",
    title: "House price index",
    description:
      "Read the official external house-price resource, not a reproduced series.",
    icon: LineChart,
  },
  {
    slug: "land-price-index",
    title: "Land price index",
    description:
      "Read the official external land-price resource, not a reproduced series.",
    icon: LandPlot,
  },
  {
    slug: "market-reports",
    title: "Market reports",
    description: "Open official market-outlook reporting and its access notes.",
    icon: ExternalLink,
  },
];

function numberInput(
  value: number,
  event: React.ChangeEvent<HTMLInputElement>
) {
  return event.target.value === "" ? Number.NaN : Number(event.target.value);
}

function safe<T>(work: () => T) {
  try {
    return { value: work(), error: "" };
  } catch (error) {
    return {
      value: null as T | null,
      error:
        error instanceof Error ? error.message : "Check the values entered.",
    };
  }
}

function money(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return formatLkr(Math.round(value));
}

function plain(value: number | undefined, digits = 0) {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return value.toLocaleString("en-LK", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
}

function pct(value: number | undefined) {
  return value === undefined || !Number.isFinite(value)
    ? "—"
    : `${plain(value, 2)}%`;
}

function Field({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = "any",
  suffix,
  help,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number | "any";
  suffix?: string;
  help?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[#44535f]">
      <span>{label}</span>
      <span className="relative mt-1.5 block">
        <input
          type="number"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step}
          onChange={event => onChange(numberInput(value, event))}
          className={inputClass}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#8c969c]">
            {suffix}
          </span>
        )}
      </span>
      {help && (
        <span className="mt-1 block text-[11px] font-normal leading-4 text-[#8a959b]">
          {help}
        </span>
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block text-sm font-semibold text-[#44535f]">
      <span>{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className={inputClass}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${emphasis ? "border-[#d8b66a] bg-[#fff9eb]" : "border-[#ece7df] bg-[#fffdf9]"}`}
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#8b795b]">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-xl font-semibold tracking-[-0.035em] ${emphasis ? "text-[#0b1f33]" : "text-[#243d50]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ResultState({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  if (error)
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#e5c6be] bg-[#fff4f0] p-5 text-sm leading-6 text-[#8e4d43]"
      >
        <strong className="font-semibold">Check your assumptions.</strong>
        <span className="ml-1">{error}</span>
      </div>
    );
  return <>{children}</>;
}

function AssumptionNote({
  children = "Illustrative assumptions only—not current bank rates, an offer, valuation, legal advice or a promise of return.",
}: {
  children?: React.ReactNode;
}) {
  return (
    <p className="mt-5 rounded-xl bg-[#f4f1ea] px-4 py-3 text-xs leading-5 text-[#6f7b82]">
      <span className="font-bold text-[#9b742b]">Assumptions:</span> {children}
    </p>
  );
}

function ToolFrame({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
      <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-5 sm:p-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-[-0.05em] text-[#0b1f33] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[#71808b]">
          {description}
        </p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">{children}</div>
      </section>
    </div>
  );
}

function MortgageOutput({
  repaymentPlan = false,
}: {
  repaymentPlan?: boolean;
}) {
  const [propertyPrice, setPropertyPrice] = useState(() => {
    const raw =
      typeof window === "undefined"
        ? ""
        : new URLSearchParams(window.location.search).get("price");
    const parsed = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 120_000_000;
  });
  const [deposit, setDeposit] = useState(20_000_000);
  const [annualInterestRate, setAnnualInterestRate] = useState(12);
  const [years, setYears] = useState(20);
  const result = useMemo(
    () =>
      safe(() =>
        calculateMortgage({ propertyPrice, deposit, annualInterestRate, years })
      ),
    [propertyPrice, deposit, annualInterestRate, years]
  );
  return (
    <ToolFrame
      eyebrow={repaymentPlan ? "Year-by-year view" : "Home finance"}
      title={repaymentPlan ? "Repayment plan" : "Home-loan calculator"}
      description="Estimate a fixed-rate repayment from your property price, deposit, annual rate and term. The advertised property price is an asking assumption, not a transaction price."
    >
      <Field
        label="Property price"
        value={propertyPrice}
        onChange={setPropertyPrice}
        suffix="LKR"
        help="Editable assumption; a URL ?price= value may prefill this."
      />
      <Field
        label="Deposit"
        value={deposit}
        onChange={setDeposit}
        suffix="LKR"
      />
      <Field
        label="Annual interest rate"
        value={annualInterestRate}
        onChange={setAnnualInterestRate}
        max={100}
        suffix="%"
      />
      <Field
        label="Loan term"
        value={years}
        onChange={setYears}
        min={1}
        max={40}
        step={1}
        suffix="years"
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric
                  label="Financed value"
                  value={money(result.value.financedAmount)}
                />
                <Metric
                  label="Monthly payment"
                  value={money(result.value.monthlyPayment)}
                  emphasis
                />
                <Metric
                  label="Total interest"
                  value={money(result.value.totalInterest)}
                />
                <Metric
                  label="Total paid"
                  value={money(result.value.totalPayment)}
                />
              </div>
              {repaymentPlan || (
                <p className="mt-5 text-xs text-[#71808b]">
                  The repayment plan is available from the directory as a
                  detailed year-by-year view.
                </p>
              )}
              {repaymentPlan && (
                <AmortizationTable rows={result.value.amortization} />
              )}
            </>
          )}
        </ResultState>
        <AssumptionNote>
          Illustrative fixed-rate maths with no fees, insurance, taxes or
          lender-specific assessment. Zero interest is handled as principal
          divided across the number of payments.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function AmortizationTable({
  rows,
}: {
  rows: {
    year: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}) {
  return (
    <div className="mt-6 overflow-x-auto rounded-2xl border border-[#ece7df]">
      <table className="min-w-[620px] w-full text-left text-xs">
        <caption className="border-b border-[#ece7df] bg-[#fffdf9] px-4 py-3 text-left font-semibold text-[#53616d]">
          Annual amortization schedule
        </caption>
        <thead className="bg-[#f7f4ee] text-[10px] uppercase tracking-[0.12em] text-[#7f8b91]">
          <tr>
            <th className="px-4 py-3">Year</th>
            <th className="px-4 py-3">Payment</th>
            <th className="px-4 py-3">Principal</th>
            <th className="px-4 py-3">Interest</th>
            <th className="px-4 py-3">Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.year} className="border-t border-[#f0ece5]">
              <td className="px-4 py-3 font-semibold">{row.year}</td>
              <td className="px-4 py-3">{money(row.payment)}</td>
              <td className="px-4 py-3">{money(row.principal)}</td>
              <td className="px-4 py-3">{money(row.interest)}</td>
              <td className="px-4 py-3">{money(row.balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AffordabilityTool() {
  const [income, setIncome] = useState(350_000);
  const [coApplicantIncome, setCoApplicantIncome] = useState(0);
  const [expenses, setExpenses] = useState(100_000);
  const [debts, setDebts] = useState(25_000);
  const [commitments, setCommitments] = useState(0);
  const [ratio, setRatio] = useState(40);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(20);
  const [deposit, setDeposit] = useState(15_000_000);
  const result = useMemo(
    () =>
      safe(() =>
        calculateAffordability({
          monthlyIncome: income,
          coApplicantIncome,
          monthlyExpenses: expenses,
          monthlyDebts: debts,
          otherCommitments: commitments,
          repaymentRatio: ratio,
          annualInterestRate: rate,
          years,
          deposit,
        })
      ),
    [
      income,
      coApplicantIncome,
      expenses,
      debts,
      commitments,
      ratio,
      rate,
      years,
      deposit,
    ]
  );
  return (
    <ToolFrame
      eyebrow="Borrowing power"
      title="Affordability calculator"
      description="Use your household income and explicit commitments to estimate a budget at a repayment ratio you control. Lenders may use different affordability rules and verification. "
    >
      <Field
        label="Your monthly income"
        value={income}
        onChange={setIncome}
        suffix="LKR"
      />
      <Field
        label="Co-applicant income"
        value={coApplicantIncome}
        onChange={setCoApplicantIncome}
        suffix="LKR"
      />
      <Field
        label="Monthly living expenses"
        value={expenses}
        onChange={setExpenses}
        suffix="LKR"
      />
      <Field
        label="Existing debt payments"
        value={debts}
        onChange={setDebts}
        suffix="LKR"
      />
      <Field
        label="Other commitments"
        value={commitments}
        onChange={setCommitments}
        suffix="LKR"
        help="Keep recurring commitments explicit rather than hiding them in a ratio."
      />
      <Field
        label="Repayment ratio"
        value={ratio}
        onChange={setRatio}
        max={100}
        suffix="%"
      />
      <Field
        label="Annual interest rate"
        value={rate}
        onChange={setRate}
        max={100}
        suffix="%"
      />
      <Field
        label="Loan term"
        value={years}
        onChange={setYears}
        min={1}
        max={40}
        step={1}
        suffix="years"
      />
      <Field
        label="Deposit"
        value={deposit}
        onChange={setDeposit}
        suffix="LKR"
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric
                label="Estimated property budget"
                value={money(result.value.estimatedPropertyBudget)}
                emphasis
              />
              <Metric
                label="Affordable loan"
                value={money(result.value.affordableLoan)}
              />
              <Metric
                label="Monthly repayment budget"
                value={money(result.value.affordableMonthlyRepayment)}
              />
              <Metric
                label="Disposable income"
                value={money(result.value.disposableIncome)}
              />
            </div>
          )}
        </ResultState>
        <AssumptionNote>
          Repayment ratio is user-controlled and is not a lender approval rule.
          Income, expenses, debts, age, fees, credit assessment and
          documentation can change an actual ceiling.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function InvestmentTool() {
  const [purchase, setPurchase] = useState(80_000_000);
  const [rent, setRent] = useState(350_000);
  const [expenses, setExpenses] = useState(600_000);
  const [holding, setHolding] = useState(10);
  const [appreciation, setAppreciation] = useState(5);
  const [saleCosts, setSaleCosts] = useState(2);
  const [inflation, setInflation] = useState(5);
  const result = useMemo(
    () =>
      safe(() =>
        calculateInvestmentReturn({
          purchaseCost: purchase,
          monthlyRent: rent,
          annualExpenses: expenses,
          holdingPeriodYears: holding,
          saleAppreciationRate: appreciation,
          annualAppreciationRate: appreciation,
          saleCostsPercentage: saleCosts,
          inflationRate: inflation,
        })
      ),
    [purchase, rent, expenses, holding, appreciation, saleCosts, inflation]
  );
  return (
    <ToolFrame
      eyebrow="Rental analysis"
      title="Investment return"
      description="Explore gross and net rental yield, annual cash flow, sale assumptions and an inflation-adjusted annualized return. This is a scenario model, not a forecast."
    >
      <Field
        label="Purchase cost"
        value={purchase}
        onChange={setPurchase}
        suffix="LKR"
      />
      <Field
        label="Monthly rent"
        value={rent}
        onChange={setRent}
        suffix="LKR"
      />
      <Field
        label="Annual expenses"
        value={expenses}
        onChange={setExpenses}
        suffix="LKR"
        help="Repairs, vacancy, management and other recurring costs as one assumption."
      />
      <Field
        label="Holding period"
        value={holding}
        onChange={setHolding}
        min={1}
        max={40}
        step={1}
        suffix="years"
      />
      <Field
        label="Annual sale appreciation"
        value={appreciation}
        onChange={setAppreciation}
        max={100}
        suffix="%"
      />
      <Field
        label="Sale costs"
        value={saleCosts}
        onChange={setSaleCosts}
        max={100}
        suffix="%"
      />
      <Field
        label="Inflation assumption"
        value={inflation}
        onChange={setInflation}
        max={100}
        suffix="%"
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric
                  label="Gross rental yield"
                  value={pct(result.value.grossRentalYield)}
                />
                <Metric
                  label="Net rental yield"
                  value={pct(result.value.netRentalYield)}
                />
                <Metric
                  label="Annual cash flow"
                  value={money(result.value.annualCashFlow)}
                />
                <Metric
                  label="Future sale price"
                  value={money(result.value.futureSalePrice)}
                />
                <Metric
                  label="Total nominal ROI"
                  value={pct(result.value.totalRoi)}
                  emphasis
                />
                <Metric
                  label="Annualized ROI"
                  value={pct(result.value.annualizedRoi)}
                />
                <Metric
                  label="Real annualized return"
                  value={pct(result.value.realAnnualizedReturn)}
                />
                <Metric
                  label="Total rental cash flow"
                  value={money(result.value.totalRentalCashFlow)}
                />
              </div>
            </>
          )}
        </ResultState>
        <AssumptionNote>
          Returns exclude financing, tax and purchase costs not entered here.
          Appreciation, sale costs, rent and inflation are your assumptions;
          negative cash flow can reduce the result.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function LandConverterTool() {
  const [value, setValue] = useState(1);
  const [from, setFrom] = useState<LandAreaUnit>("acres");
  const [to, setTo] = useState<LandAreaUnit>("perches");
  const result = useMemo(
    () => safe(() => convertLandArea(value, from, to)),
    [value, from, to]
  );
  const names: Record<LandAreaUnit, string> = {
    acres: "Acres",
    perches: "Perches",
    sqft: "Square feet",
    sqm: "Square metres",
    hectares: "Hectares",
  };
  return (
    <ToolFrame
      eyebrow="Area"
      title="Land area converter"
      description="Use the fixed relationships 1 acre = 160 perches = 43,560 sq ft and 1 perch = 272.25 sq ft. Results are recalculated as you edit."
    >
      <Field label="Area" value={value} onChange={setValue} />
      <SelectField
        label="From"
        value={from}
        onChange={next => setFrom(next as LandAreaUnit)}
        options={Object.keys(names).map(key => names[key as LandAreaUnit])}
      />
      <SelectField
        label="To"
        value={names[to]}
        onChange={next =>
          setTo(
            (Object.keys(names) as LandAreaUnit[]).find(
              key => names[key] === next
            ) ?? "perches"
          )
        }
        options={Object.keys(names).map(key => names[key as LandAreaUnit])}
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value !== null && (
            <div className="rounded-2xl border border-[#d8b66a] bg-[#fff9eb] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#99742c]">
                Converted area
              </p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.05em] text-[#0b1f33]">
                {plain(result.value, 4)} {names[to]}
              </p>
            </div>
          )}
        </ResultState>
        <AssumptionNote>
          Area conversion only; it does not infer plot shape, survey accuracy or
          legal boundaries.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function PriceConverterTool() {
  const [price, setPrice] = useState(18_500_000);
  const [area, setArea] = useState(42);
  const [unit, setUnit] = useState<"perches" | "sqft">("perches");
  const result = useMemo(
    () =>
      safe(() =>
        calculatePricePerUnit({ totalPrice: price, area, areaUnit: unit })
      ),
    [price, area, unit]
  );
  return (
    <ToolFrame
      eyebrow="Land pricing"
      title="Price per perch / sq ft"
      description="Translate one total asking price and area into two useful unit prices. Enter the area unit that matches the listing or survey note."
    >
      <Field
        label="Total price"
        value={price}
        onChange={setPrice}
        suffix="LKR"
      />
      <Field label="Area" value={area} onChange={setArea} />
      <SelectField
        label="Area unit"
        value={unit}
        onChange={next => setUnit(next as "perches" | "sqft")}
        options={["perches", "sqft"]}
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Metric
                label="Price per perch"
                value={money(result.value.pricePerPerch)}
                emphasis
              />
              <Metric
                label="Price per sq ft"
                value={money(result.value.pricePerSqFt)}
              />
            </div>
          )}
        </ResultState>
        <AssumptionNote>
          Uses 1 perch = 272.25 sq ft. This is a unit conversion, not an
          appraisal or fair-value opinion.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function StampDutyTool() {
  const [price, setPrice] = useState(80_000_000);
  const [percentage, setPercentage] = useState(0);
  const [fixed, setFixed] = useState(0);
  const result = useMemo(
    () =>
      safe(() =>
        estimateStampDuty({
          purchasePrice: price,
          percentage,
          fixedCharges: fixed,
        })
      ),
    [price, percentage, fixed]
  );
  return (
    <ToolFrame
      eyebrow="Transaction planning"
      title="Stamp-duty estimate"
      description="Apply a percentage and fixed charges you have been given or want to test. No Sri Lankan legal rate schedule is asserted here."
    >
      <Field
        label="Purchase price"
        value={price}
        onChange={setPrice}
        suffix="LKR"
      />
      <Field
        label="Your percentage assumption"
        value={percentage}
        onChange={setPercentage}
        max={100}
        suffix="%"
      />
      <Field
        label="Fixed charges"
        value={fixed}
        onChange={setFixed}
        suffix="LKR"
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value && (
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric
                label="Percentage amount"
                value={money(result.value.percentageAmount)}
              />
              <Metric
                label="Fixed charges"
                value={money(result.value.fixedCharges)}
              />
              <Metric
                label="Estimated total"
                value={money(result.value.estimatedTotal)}
                emphasis
              />
            </div>
          )}
        </ResultState>
        <AssumptionNote>
          Confirm applicable taxes, duties, exemptions and professional charges
          with a qualified local adviser before relying on any estimate.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function CurrencyTool() {
  const [lkr, setLkr] = useState(1_000_000);
  const [rate, setRate] = useState(300);
  const [code, setCode] = useState("USD");
  const result = useMemo(
    () =>
      safe(() =>
        convertLkrToCurrency({ lkrAmount: lkr, lkrPerCurrencyUnit: rate })
      ),
    [lkr, rate]
  );
  return (
    <ToolFrame
      eyebrow="User-entered FX"
      title="Currency converter"
      description="Convert LKR using the LKR-per-unit rate you enter. There is no live FX feed behind this tool."
    >
      <Field label="LKR amount" value={lkr} onChange={setLkr} suffix="LKR" />
      <Field
        label="LKR per 1 unit"
        value={rate}
        onChange={setRate}
        suffix="LKR"
        help="Example: 300 means LKR 300 = 1 unit."
      />
      <label className="block text-sm font-semibold text-[#44535f]">
        <span>Currency label</span>
        <input
          value={code}
          onChange={event =>
            setCode(event.target.value.toUpperCase().slice(0, 6))
          }
          className={inputClass}
        />
      </label>
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value !== null && (
            <div className="rounded-2xl border border-[#d8b66a] bg-[#fff9eb] p-6">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#99742c]">
                Converted amount
              </p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-[-0.05em] text-[#0b1f33]">
                {plain(result.value, 2)} {code || "units"}
              </p>
            </div>
          )}
        </ResultState>
        <AssumptionNote>
          The rate is a manual assumption. It is not live, time-stamped,
          guaranteed or suitable for a payment decision without checking a
          current source.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function LoanComparisonTool() {
  const [principal, setPrincipal] = useState(60_000_000);
  const [rateA, setRateA] = useState(11.5);
  const [rateB, setRateB] = useState(12.5);
  const [yearsA, setYearsA] = useState(20);
  const [yearsB, setYearsB] = useState(20);
  const result = useMemo(
    () =>
      safe(() =>
        compareLoans(
          { principal, annualInterestRate: rateA, years: yearsA },
          { principal, annualInterestRate: rateB, years: yearsB }
        )
      ),
    [principal, rateA, rateB, yearsA, yearsB]
  );
  return (
    <ToolFrame
      eyebrow="Side-by-side"
      title="Loan comparison"
      description="Compare two offers using the same principal or different terms. Enter bank/product assumptions yourself; no bank-rate board is reproduced here."
    >
      <Field
        label="Loan amount"
        value={principal}
        onChange={setPrincipal}
        suffix="LKR"
      />
      <div />
      <Field
        label="Offer A rate"
        value={rateA}
        onChange={setRateA}
        max={100}
        suffix="%"
      />
      <Field
        label="Offer A term"
        value={yearsA}
        onChange={setYearsA}
        min={1}
        max={40}
        step={1}
        suffix="years"
      />
      <Field
        label="Offer B rate"
        value={rateB}
        onChange={setRateB}
        max={100}
        suffix="%"
      />
      <Field
        label="Offer B term"
        value={yearsB}
        onChange={setYearsB}
        min={1}
        max={40}
        step={1}
        suffix="years"
      />
      <div className="sm:col-span-2">
        <ResultState error={result.error}>
          {result.value && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <Metric
                  label="Offer A monthly payment"
                  value={money(result.value.offerA.monthlyPayment)}
                />
                <Metric
                  label="Offer B monthly payment"
                  value={money(result.value.offerB.monthlyPayment)}
                />
                <Metric
                  label="Monthly difference (A − B)"
                  value={money(result.value.monthlyPaymentDifference)}
                  emphasis
                />
                <Metric
                  label="Interest difference (A − B)"
                  value={money(result.value.totalInterestDifference)}
                />
              </div>
              <p className="mt-4 text-sm font-semibold text-[#53616d]">
                Lower monthly payment:{" "}
                {result.value.lowerMonthlyPayment === "same"
                  ? "same"
                  : `Offer ${result.value.lowerMonthlyPayment}`}{" "}
                · Lower total interest:{" "}
                {result.value.lowerTotalInterest === "same"
                  ? "same"
                  : `Offer ${result.value.lowerTotalInterest}`}
              </p>
            </>
          )}
        </ResultState>
        <AssumptionNote>
          Illustrative principal-and-interest maths only. Fees, variable-rate
          changes, insurance, approval conditions and a verified 15-bank board
          are not included; the board is unavailable without a rates feed.
        </AssumptionNote>
      </div>
    </ToolFrame>
  );
}

function LiveDataState({
  query,
  children,
}: {
  query: ReturnType<typeof useProperties>;
  children: React.ReactNode;
}) {
  if (query.isLoading)
    return (
      <div className="rounded-2xl border border-[#e7e2d9] bg-white p-10 text-center text-sm text-[#71808b]">
        Loading current marketplace records…
      </div>
    );
  if (query.error)
    return (
      <div
        role="alert"
        className="rounded-2xl border border-[#e5c6be] bg-[#fff4f0] p-8 text-center text-sm leading-6 text-[#8e4d43]"
      >
        We couldn’t load the current sample. No substitute or fabricated rows
        are shown. Please try again later.
      </div>
    );
  return <>{children}</>;
}

function PriceMeterTool() {
  const query = useProperties();
  const [district, setDistrict] = useState("Colombo");
  const [kind, setKind] = useState("House");
  const [intent, setIntent] = useState<"buy" | "rent">("buy");
  const result = useMemo(
    () =>
      safe(() =>
        calculatePriceMeter({
          records: query.data,
          district,
          kind,
          intent,
          minimumRecords: 5,
        })
      ),
    [query.data, district, kind, intent]
  );
  return (
    <div className="space-y-5">
      <ToolFrame
        eyebrow="Indicative asking sample"
        title="Price meter"
        description="A transparent comparable-row check using current non-demo marketplace records. It is not a formal valuation and will show insufficient data when fewer than five exact comparables are available."
      >
        <SelectField
          label="Purpose"
          value={intent === "buy" ? "Sale" : "Rental"}
          onChange={value => setIntent(value === "Sale" ? "buy" : "rent")}
          options={["Sale", "Rental"]}
        />
        <SelectField
          label="District"
          value={district}
          onChange={setDistrict}
          options={districts}
        />
        <SelectField
          label="Property type"
          value={kind}
          onChange={setKind}
          options={propertyKinds}
        />
        <div className="sm:col-span-2">
          <LiveDataState query={query}>
            <ResultState error={result.error}>
              {result.value?.status === "insufficient-data" ? (
                <div className="rounded-2xl border border-dashed border-[#d8cdbd] bg-[#fffdf9] p-7">
                  <p className="font-display text-2xl font-semibold text-[#0b1f33]">
                    Not enough exact comparables
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#71808b]">
                    Only {result.value.sampleSize} current non-demo{" "}
                    {intent === "buy" ? "sale" : "rental"} record
                    {result.value.sampleSize === 1 ? "" : "s"} match
                    {result.value.sampleSize === 1 ? "es" : ""} {district} ·{" "}
                    {kind}. At least {result.value.minimumRecords} are required
                    for this indicative sample.
                  </p>
                </div>
              ) : (
                result.value && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Metric
                      label="Indicative median asking price"
                      value={money(result.value.medianAskingPrice)}
                      emphasis
                    />
                    <Metric
                      label="Observed lower row"
                      value={money(result.value.lowerAskingPrice)}
                    />
                    <Metric
                      label="Observed upper row"
                      value={money(result.value.upperAskingPrice)}
                    />
                  </div>
                )
              )}
            </ResultState>
          </LiveDataState>
          <AssumptionNote>
            Current sample asking prices only: not transactions, valuation,
            historic index, lender advice or a proprietary LPW model. Demo
            records are excluded.
          </AssumptionNote>
        </div>
      </ToolFrame>
    </div>
  );
}

function MarketInsightsTool() {
  const query = useProperties();
  const medians = useMemo(
    () => calculateObservedAskingMedians(query.data),
    [query.data]
  );
  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-5 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
          Current marketplace sample
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-[-0.05em] text-[#0b1f33] sm:text-4xl">
          Market insights
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#71808b]">
          Observed asking-price medians calculated from current active, non-demo
          sale records available to this FinzProperty marketplace. These are not
          transactions, valuations or historical index figures.
        </p>
        <div className="mt-7">
          <LiveDataState query={query}>
            {medians.length ? (
              <div className="overflow-x-auto rounded-2xl border border-[#ece7df]">
                <table className="min-w-[560px] w-full text-left text-sm">
                  <thead className="bg-[#f7f4ee] text-[10px] uppercase tracking-[0.12em] text-[#7f8b91]">
                    <tr>
                      <th className="px-4 py-3">District</th>
                      <th className="px-4 py-3">Kind</th>
                      <th className="px-4 py-3">Median asking price</th>
                      <th className="px-4 py-3">Sample</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medians.map(row => (
                      <tr
                        key={`${row.district}-${row.kind}`}
                        className="border-t border-[#f0ece5]"
                      >
                        <td className="px-4 py-3 font-semibold">
                          {row.district}
                        </td>
                        <td className="px-4 py-3">{row.kind}</td>
                        <td className="px-4 py-3">
                          {money(row.medianAskingPrice)}
                        </td>
                        <td className="px-4 py-3 text-[#71808b]">
                          {row.sampleSize}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d8cdbd] p-8 text-center text-sm text-[#71808b]">
                No current non-demo sale records are available for a sample
                summary.
              </div>
            )}
          </LiveDataState>
        </div>
      </section>
      <OfficialResources />
    </div>
  );
}

function OfficialResources() {
  const links = [
    {
      title: "House price index / average prices",
      href: "https://www.lankapropertyweb.com/house_prices.php",
      copy: "Official external resource; FinzProperty does not reproduce its historic series.",
    },
    {
      title: "Land price index",
      href: "https://www.lankapropertyweb.com/land-prices/",
      copy: "Official external resource with its own asking-price methodology and coverage.",
    },
    {
      title: "Market outlook reports",
      href: "https://www.lankapropertyweb.com/MOR26/",
      copy: "Official report hub; full or detailed access may be limited externally.",
    },
    {
      title: "Market insights hub",
      href: "https://www.lankapropertyweb.com/market-insights/",
      copy: "Open the source dashboard for its own freshness and methodology notes.",
    },
  ];
  return (
    <section className="rounded-[24px] border border-[#e7e2d9] bg-[#0b1f33] p-5 text-white sm:p-8">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#d8b66a]">
        Source links
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.04em]">
        Official external resources
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
        Use these links for official LPW indices and reports. No external data
        is scraped or copied into this tool.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {links.map(link => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-white/15 p-4 transition hover:border-[#d8b66a]"
          >
            <span className="flex items-start justify-between gap-3 text-sm font-semibold">
              {link.title}
              <ExternalLink size={15} className="shrink-0 text-[#d8b66a]" />
            </span>
            <span className="mt-2 block text-xs leading-5 text-white/55">
              {link.copy}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

function ExternalResourceTool({
  kind,
}: {
  kind: "house" | "land" | "reports";
}) {
  const content =
    kind === "house"
      ? {
          eyebrow: "Official external link",
          title: "House price index",
          copy: "FinzProperty does not claim to reproduce a historic house-price index. Open the official LPW resource for its current snapshots, coverage and methodology notes.",
          href: "https://www.lankapropertyweb.com/house_prices.php",
          label: "Open official house-price resource",
        }
      : kind === "land"
        ? {
            eyebrow: "Official external link",
            title: "Land price index",
            copy: "FinzProperty does not claim to reproduce a historic land-price index. Open the official LPW resource for its district/city coverage and insufficient-data labels.",
            href: "https://www.lankapropertyweb.com/land-prices/",
            label: "Open official land-price resource",
          }
        : {
            eyebrow: "Official external link",
            title: "Market reports",
            copy: "Market outlook reporting covers topics such as supply, demand, rents, yields, land and macro context. Detailed access and freshness are controlled by the external source.",
            href: "https://www.lankapropertyweb.com/MOR26/",
            label: "Open official market reports",
          };
  return (
    <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-6 sm:p-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
        {content.eyebrow}
      </p>
      <h1 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.05em] text-[#0b1f33] sm:text-5xl">
        {content.title}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-[#71808b]">
        {content.copy}
      </p>
      <a
        href={content.href}
        target="_blank"
        rel="noreferrer"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white hover:bg-[#173b5b]"
      >
        {content.label}
        <ExternalLink size={16} />
      </a>
      <p className="mt-8 rounded-xl bg-[#f4f1ea] px-4 py-3 text-xs leading-5 text-[#6f7b82]">
        External data is not available as a verified FinzProperty feed in this
        tool. No historic values or current rates are invented here.
      </p>
    </section>
  );
}

function Directory() {
  return (
    <section>
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
          Property tools
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.055em] text-[#0b1f33] sm:text-6xl">
          Make the numbers clearer.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-[#71808b]">
          Practical calculators for comparing property assumptions,
          understanding land units and reading the current marketplace sample
          with appropriate caution.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="group rounded-[22px] border border-[#e7e2d9] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#d8b66a] hover:shadow-[0_14px_35px_rgba(11,31,51,.08)]"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f5f0e6] text-[#a47b2b]">
                <Icon size={20} />
              </span>
              <h2 className="mt-5 font-display text-xl font-semibold tracking-[-0.035em] text-[#0b1f33]">
                {tool.title}
              </h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-[#71808b]">
                {tool.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#9b742b]">
                Open tool{" "}
                <ArrowRight
                  size={14}
                  className="transition group-hover:translate-x-1"
                />
              </span>
            </Link>
          );
        })}
      </div>
      <div className="mt-6 rounded-2xl border border-[#e7e2d9] bg-[#f8f5ef] p-5 text-sm leading-6 text-[#65737c]">
        <Check size={16} className="mr-1 inline text-[#8aa28b]" /> Every output
        is recalculated from the inputs on this page. No bank-rate board, live
        FX feed, formal valuation or legal-rate schedule is assumed.
      </div>
    </section>
  );
}

function ToolNotFound() {
  return (
    <section className="rounded-[24px] border border-[#e7e2d9] bg-white p-8 text-center sm:p-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#ad8436]">
        Tools
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-[#0b1f33]">
        That tool isn’t available.
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#71808b]">
        Choose a calculator from the tools directory.
      </p>
      <Link
        href="/tools"
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#0b1f33] px-5 py-3 text-sm font-semibold text-white"
      >
        Back to tools <ArrowRight size={16} />
      </Link>
    </section>
  );
}

export default function Tools({ tool }: { tool?: string }) {
  const active = tool as ToolSlug | undefined;
  const page = !active ? (
    <Directory />
  ) : active === "mortgage" ? (
    <MortgageOutput />
  ) : active === "repayment-plan" ? (
    <MortgageOutput repaymentPlan />
  ) : active === "affordability" ? (
    <AffordabilityTool />
  ) : active === "investment" ? (
    <InvestmentTool />
  ) : active === "land-converter" ? (
    <LandConverterTool />
  ) : active === "price-converter" ? (
    <PriceConverterTool />
  ) : active === "stamp-duty" ? (
    <StampDutyTool />
  ) : active === "currency" ? (
    <CurrencyTool />
  ) : active === "loan-comparison" ? (
    <LoanComparisonTool />
  ) : active === "price-meter" ? (
    <PriceMeterTool />
  ) : active === "market-insights" ? (
    <MarketInsightsTool />
  ) : active === "house-price-index" ? (
    <ExternalResourceTool kind="house" />
  ) : active === "land-price-index" ? (
    <ExternalResourceTool kind="land" />
  ) : active === "market-reports" ? (
    <ExternalResourceTool kind="reports" />
  ) : (
    <ToolNotFound />
  );
  return (
    <div className="min-h-screen bg-[#f7f5f0] text-[#0b1f33]">
      <SiteHeader solid />
      <main className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8 lg:py-12">
        {active && (
          <Link
            href="/tools"
            className="mb-7 inline-flex items-center gap-2 text-xs font-bold text-[#71808b] hover:text-[#0b1f33]"
          >
            <ArrowLeft size={14} /> All tools
          </Link>
        )}
        {page}
      </main>
      <Footer />
    </div>
  );
}
