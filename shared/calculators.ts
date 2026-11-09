export type LandAreaUnit = "acres" | "perches" | "sqft" | "sqm" | "hectares";

export type MortgageInput = {
  propertyPrice: number;
  deposit: number;
  annualInterestRate: number;
  years: number;
};

export type AmortizationYear = {
  year: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type MortgageResult = {
  financedAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  monthlyInterestRate: number;
  numberOfPayments: number;
  amortization: AmortizationYear[];
};

export type AffordabilityInput = {
  monthlyIncome: number;
  coApplicantIncome?: number;
  monthlyExpenses: number;
  monthlyDebts: number;
  otherCommitments?: number;
  repaymentRatio: number;
  annualInterestRate: number;
  years: number;
  deposit: number;
};

export type AffordabilityResult = {
  totalIncome: number;
  totalCommitments: number;
  disposableIncome: number;
  affordableMonthlyRepayment: number;
  affordableLoan: number;
  estimatedPropertyBudget: number;
};

export type InvestmentInput = {
  purchaseCost: number;
  monthlyRent: number;
  annualExpenses: number;
  holdingPeriodYears?: number;
  annualAppreciationRate?: number;
  saleAppreciationRate?: number;
  saleCostsPercentage?: number;
  inflationRate?: number;
};

export type InvestmentResult = {
  annualRent: number;
  annualCashFlow: number;
  grossRentalYield: number;
  netRentalYield: number;
  estimatedAnnualAppreciation: number;
  estimatedTotalAnnualReturn: number;
  estimatedTotalReturnYield: number;
  holdingPeriodYears: number;
  futureSalePrice: number;
  saleCosts: number;
  totalRentalCashFlow: number;
  totalNominalReturn: number;
  totalRoi: number;
  annualizedRoi: number;
  realAnnualizedReturn: number;
};

export type PriceAreaUnit = "perches" | "sqft";

export type PricePerUnitInput = {
  totalPrice: number;
  area: number;
  areaUnit: PriceAreaUnit;
};

export type PricePerUnitResult = {
  pricePerPerch: number;
  pricePerSqFt: number;
};

export type StampDutyInput = {
  purchasePrice: number;
  percentage: number;
  fixedCharges: number;
};

export type StampDutyResult = {
  percentageAmount: number;
  fixedCharges: number;
  estimatedTotal: number;
};

export type CurrencyConversionInput = {
  lkrAmount: number;
  lkrPerCurrencyUnit: number;
};

export type LoanOffer = {
  principal: number;
  annualInterestRate: number;
  years: number;
};

export type LoanOfferResult = MortgageResult;

export type LoanComparisonResult = {
  offerA: LoanOfferResult;
  offerB: LoanOfferResult;
  monthlyPaymentDifference: number;
  totalInterestDifference: number;
  lowerMonthlyPayment: "A" | "B" | "same";
  lowerTotalInterest: "A" | "B" | "same";
};

export type AskingPriceRecord = {
  district?: string;
  kind?: string;
  price?: number;
  intent?: string;
  status?: string;
  isDemo?: boolean;
};

export type PriceMeterInput = {
  records: AskingPriceRecord[];
  district: string;
  kind: string;
  intent?: "buy" | "rent";
  minimumRecords?: number;
};

export type PriceMeterResult = {
  status: "ready" | "insufficient-data";
  sampleSize: number;
  minimumRecords: number;
  medianAskingPrice?: number;
  lowerAskingPrice?: number;
  upperAskingPrice?: number;
};

const SQ_FT_PER_ACRE = 43_560;
const SQ_FT_PER_PERCH = 272.25;
const SQ_M_PER_SQ_FT = 0.09290304;
const SQ_FT_PER_HECTARE = 107_639.1041671;

function finite(value: number, label: string) {
  if (!Number.isFinite(value))
    throw new Error(`${label} must be a finite number.`);
  return value;
}

function nonNegative(value: number, label: string) {
  finite(value, label);
  if (value < 0) throw new Error(`${label} cannot be negative.`);
  return value;
}

function positive(value: number, label: string) {
  finite(value, label);
  if (value <= 0) throw new Error(`${label} must be greater than zero.`);
  return value;
}

function rate(value: number, label: string) {
  finite(value, label);
  if (value < 0 || value > 100)
    throw new Error(`${label} must be between 0% and 100%.`);
  return value;
}

function years(value: number, label = "Years") {
  finite(value, label);
  if (!Number.isInteger(value) || value < 1 || value > 40)
    throw new Error(`${label} must be a whole number from 1 to 40.`);
  return value;
}

function annuityPayment(
  principal: number,
  monthlyInterestRate: number,
  payments: number
) {
  if (principal === 0) return 0;
  if (monthlyInterestRate === 0) return principal / payments;
  // This form avoids overflowing the positive factor at the upper rate/term bounds.
  const discountFactor = (1 + monthlyInterestRate) ** -payments;
  return (principal * monthlyInterestRate) / (1 - discountFactor);
}

function buildAmortization(
  principal: number,
  annualInterestRate: number,
  termYears: number,
  monthlyPayment: number
) {
  const monthlyRate = annualInterestRate / 100 / 12;
  let balance = principal;
  const rows: AmortizationYear[] = [];
  for (let year = 1; year <= termYears; year += 1) {
    let payment = 0;
    let principalPaid = 0;
    let interestPaid = 0;
    for (let month = 0; month < 12; month += 1) {
      const interest = balance * monthlyRate;
      const principalPart = Math.min(
        balance,
        Math.max(0, monthlyPayment - interest)
      );
      const actualPayment = interest + principalPart;
      balance = Math.max(0, balance - principalPart);
      payment += actualPayment;
      principalPaid += principalPart;
      interestPaid += interest;
    }
    rows.push({
      year,
      payment,
      principal: principalPaid,
      interest: interestPaid,
      balance,
    });
  }
  return rows;
}

function loanResult(
  principal: number,
  annualInterestRate: number,
  termYears: number
): MortgageResult {
  positive(principal, "Loan amount");
  rate(annualInterestRate, "Annual interest rate");
  years(termYears, "Loan term");
  const numberOfPayments = termYears * 12;
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const monthlyPayment = annuityPayment(
    principal,
    monthlyInterestRate,
    numberOfPayments
  );
  const totalPayment = monthlyPayment * numberOfPayments;
  return {
    financedAmount: principal,
    monthlyPayment,
    totalPayment,
    totalInterest: Math.max(0, totalPayment - principal),
    monthlyInterestRate,
    numberOfPayments,
    amortization: buildAmortization(
      principal,
      annualInterestRate,
      termYears,
      monthlyPayment
    ),
  };
}

export function calculateMortgage(input: MortgageInput): MortgageResult {
  positive(input.propertyPrice, "Property price");
  nonNegative(input.deposit, "Deposit");
  rate(input.annualInterestRate, "Annual interest rate");
  years(input.years, "Loan term");
  if (input.deposit > input.propertyPrice)
    throw new Error("Deposit cannot be greater than the property price.");
  const financedAmount = input.propertyPrice - input.deposit;
  if (financedAmount === 0) {
    return {
      financedAmount: 0,
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      monthlyInterestRate: input.annualInterestRate / 100 / 12,
      numberOfPayments: input.years * 12,
      amortization: Array.from({ length: input.years }, (_, index) => ({
        year: index + 1,
        payment: 0,
        principal: 0,
        interest: 0,
        balance: 0,
      })),
    };
  }
  return loanResult(financedAmount, input.annualInterestRate, input.years);
}

export function calculateAffordability(
  input: AffordabilityInput
): AffordabilityResult {
  positive(input.monthlyIncome, "Monthly income");
  const coApplicantIncome = input.coApplicantIncome ?? 0;
  const otherCommitments = input.otherCommitments ?? 0;
  nonNegative(coApplicantIncome, "Co-applicant income");
  nonNegative(input.monthlyExpenses, "Monthly expenses");
  nonNegative(input.monthlyDebts, "Monthly debts");
  nonNegative(otherCommitments, "Other commitments");
  rate(input.repaymentRatio, "Repayment ratio");
  rate(input.annualInterestRate, "Annual interest rate");
  years(input.years, "Loan term");
  nonNegative(input.deposit, "Deposit");
  const totalIncome = input.monthlyIncome + coApplicantIncome;
  const totalCommitments =
    input.monthlyExpenses + input.monthlyDebts + otherCommitments;
  const disposableIncome = totalIncome - totalCommitments;
  if (disposableIncome < 0)
    throw new Error(
      "Expenses and commitments cannot exceed total monthly income."
    );
  const affordableMonthlyRepayment =
    (disposableIncome * input.repaymentRatio) / 100;
  const affordableLoan =
    affordableMonthlyRepayment === 0
      ? 0
      : affordableMonthlyRepayment *
        (input.annualInterestRate === 0
          ? input.years * 12
          : (1 -
              (1 + input.annualInterestRate / 100 / 12) **
                -(input.years * 12)) /
            (input.annualInterestRate / 100 / 12));
  return {
    totalIncome,
    totalCommitments,
    disposableIncome,
    affordableMonthlyRepayment,
    affordableLoan,
    estimatedPropertyBudget: affordableLoan + input.deposit,
  };
}

export function calculateInvestmentReturn(
  input: InvestmentInput
): InvestmentResult {
  positive(input.purchaseCost, "Purchase cost");
  nonNegative(input.monthlyRent, "Monthly rent");
  nonNegative(input.annualExpenses, "Annual expenses");
  const holdingPeriodYears = input.holdingPeriodYears ?? 1;
  years(holdingPeriodYears, "Holding period");
  const appreciationRate =
    input.annualAppreciationRate ?? input.saleAppreciationRate ?? 0;
  const saleAppreciationRate = input.saleAppreciationRate ?? appreciationRate;
  const saleCostsPercentage = input.saleCostsPercentage ?? 0;
  const inflationRate = input.inflationRate ?? 0;
  rate(appreciationRate, "Annual appreciation rate");
  rate(saleAppreciationRate, "Sale appreciation rate");
  rate(saleCostsPercentage, "Sale costs percentage");
  rate(inflationRate, "Inflation rate");
  const annualRent = input.monthlyRent * 12;
  const annualCashFlow = annualRent - input.annualExpenses;
  const estimatedAnnualAppreciation =
    (input.purchaseCost * appreciationRate) / 100;
  const futureSalePrice =
    input.purchaseCost * (1 + saleAppreciationRate / 100) ** holdingPeriodYears;
  const saleCosts = (futureSalePrice * saleCostsPercentage) / 100;
  const totalRentalCashFlow = annualCashFlow * holdingPeriodYears;
  const totalNominalReturn =
    futureSalePrice - input.purchaseCost - saleCosts + totalRentalCashFlow;
  const totalRoi = (totalNominalReturn / input.purchaseCost) * 100;
  const annualizedRoi =
    (Math.max(0.000001, 1 + totalRoi / 100) ** (1 / holdingPeriodYears) - 1) *
    100;
  const realAnnualizedReturn =
    ((1 + annualizedRoi / 100) / (1 + inflationRate / 100) - 1) * 100;
  return {
    annualRent,
    annualCashFlow,
    grossRentalYield: (annualRent / input.purchaseCost) * 100,
    netRentalYield: (annualCashFlow / input.purchaseCost) * 100,
    estimatedAnnualAppreciation,
    estimatedTotalAnnualReturn: annualCashFlow + estimatedAnnualAppreciation,
    estimatedTotalReturnYield:
      ((annualCashFlow + estimatedAnnualAppreciation) / input.purchaseCost) *
      100,
    holdingPeriodYears,
    futureSalePrice,
    saleCosts,
    totalRentalCashFlow,
    totalNominalReturn,
    totalRoi,
    annualizedRoi,
    realAnnualizedReturn,
  };
}

function toSquareFeet(value: number, unit: LandAreaUnit) {
  switch (unit) {
    case "acres":
      return value * SQ_FT_PER_ACRE;
    case "perches":
      return value * SQ_FT_PER_PERCH;
    case "sqft":
      return value;
    case "sqm":
      return value / SQ_M_PER_SQ_FT;
    case "hectares":
      return value * SQ_FT_PER_HECTARE;
  }
}

export function convertLandArea(
  value: number,
  from: LandAreaUnit,
  to: LandAreaUnit
) {
  nonNegative(value, "Area");
  const squareFeet = toSquareFeet(value, from);
  switch (to) {
    case "acres":
      return squareFeet / SQ_FT_PER_ACRE;
    case "perches":
      return squareFeet / SQ_FT_PER_PERCH;
    case "sqft":
      return squareFeet;
    case "sqm":
      return squareFeet * SQ_M_PER_SQ_FT;
    case "hectares":
      return squareFeet / SQ_FT_PER_HECTARE;
  }
}

export const convertLand = convertLandArea;

export function calculatePricePerUnit(
  input: PricePerUnitInput
): PricePerUnitResult {
  positive(input.totalPrice, "Total price");
  positive(input.area, "Area");
  const squareFeet =
    input.areaUnit === "perches" ? input.area * SQ_FT_PER_PERCH : input.area;
  return {
    pricePerPerch: input.totalPrice / (squareFeet / SQ_FT_PER_PERCH),
    pricePerSqFt: input.totalPrice / squareFeet,
  };
}

export function estimateStampDuty(input: StampDutyInput): StampDutyResult {
  positive(input.purchasePrice, "Purchase price");
  rate(input.percentage, "Stamp-duty percentage");
  nonNegative(input.fixedCharges, "Fixed charges");
  const percentageAmount = (input.purchasePrice * input.percentage) / 100;
  return {
    percentageAmount,
    fixedCharges: input.fixedCharges,
    estimatedTotal: percentageAmount + input.fixedCharges,
  };
}

export function convertLkrToCurrency(input: CurrencyConversionInput) {
  nonNegative(input.lkrAmount, "LKR amount");
  positive(input.lkrPerCurrencyUnit, "LKR per currency unit");
  return input.lkrAmount / input.lkrPerCurrencyUnit;
}

export function compareLoans(
  offerA: LoanOffer,
  offerB: LoanOffer
): LoanComparisonResult {
  const resultA = loanResult(
    offerA.principal,
    offerA.annualInterestRate,
    offerA.years
  );
  const resultB = loanResult(
    offerB.principal,
    offerB.annualInterestRate,
    offerB.years
  );
  const monthlyPaymentDifference =
    resultA.monthlyPayment - resultB.monthlyPayment;
  const totalInterestDifference = resultA.totalInterest - resultB.totalInterest;
  return {
    offerA: resultA,
    offerB: resultB,
    monthlyPaymentDifference,
    totalInterestDifference,
    lowerMonthlyPayment:
      monthlyPaymentDifference === 0
        ? "same"
        : monthlyPaymentDifference < 0
          ? "A"
          : "B",
    lowerTotalInterest:
      totalInterestDifference === 0
        ? "same"
        : totalInterestDifference < 0
          ? "A"
          : "B",
  };
}

export function calculateObservedAskingMedians(records: AskingPriceRecord[]) {
  const grouped = new Map<
    string,
    { district: string; kind: string; prices: number[] }
  >();
  records.forEach(record => {
    if (
      record.isDemo ||
      record.intent === "rent" ||
      record.status === "inactive" ||
      !record.district ||
      !record.kind ||
      record.price === undefined
    )
      return;
    if (!Number.isFinite(record.price) || record.price <= 0) return;
    const key = `${record.district}\u0000${record.kind}`;
    const group = grouped.get(key) ?? {
      district: record.district,
      kind: record.kind,
      prices: [],
    };
    group.prices.push(record.price);
    grouped.set(key, group);
  });
  return [...grouped.values()]
    .map(group => {
      const prices = [...group.prices].sort((a, b) => a - b);
      const middle = Math.floor(prices.length / 2);
      const medianAskingPrice =
        prices.length % 2
          ? prices[middle]
          : (prices[middle - 1] + prices[middle]) / 2;
      return {
        district: group.district,
        kind: group.kind,
        medianAskingPrice,
        sampleSize: prices.length,
      };
    })
    .sort(
      (a, b) =>
        a.district.localeCompare(b.district) || a.kind.localeCompare(b.kind)
    );
}

export function calculatePriceMeter(input: PriceMeterInput): PriceMeterResult {
  if (!input.district.trim() || !input.kind.trim())
    throw new Error("Choose a district and property type.");
  const minimumRecords = input.minimumRecords ?? 5;
  if (!Number.isInteger(minimumRecords) || minimumRecords < 1)
    throw new Error(
      "Minimum comparable records must be a positive whole number."
    );
  const comparablePrices = input.records
    .filter(
      record =>
        !record.isDemo &&
        record.status !== "inactive" &&
        (!input.intent || record.intent === input.intent)
    )
    .filter(
      record => record.district === input.district && record.kind === input.kind
    )
    .map(record => record.price)
    .filter(
      (price): price is number =>
        price !== undefined && Number.isFinite(price) && price > 0
    )
    .sort((a, b) => a - b);
  if (comparablePrices.length < minimumRecords)
    return {
      status: "insufficient-data",
      sampleSize: comparablePrices.length,
      minimumRecords,
    };
  const middle = Math.floor(comparablePrices.length / 2);
  const medianAskingPrice =
    comparablePrices.length % 2
      ? comparablePrices[middle]
      : (comparablePrices[middle - 1] + comparablePrices[middle]) / 2;
  return {
    status: "ready",
    sampleSize: comparablePrices.length,
    minimumRecords,
    medianAskingPrice,
    lowerAskingPrice: comparablePrices[0],
    upperAskingPrice: comparablePrices[comparablePrices.length - 1],
  };
}
