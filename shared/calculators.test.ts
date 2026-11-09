import { describe, expect, it } from "vitest";
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
} from "./calculators";

describe("mortgage calculations", () => {
  it("handles zero interest as principal divided over the term", () => {
    const result = calculateMortgage({
      propertyPrice: 1_200_000,
      deposit: 200_000,
      annualInterestRate: 0,
      years: 10,
    });
    expect(result.financedAmount).toBe(1_000_000);
    expect(result.monthlyPayment).toBeCloseTo(1_000_000 / 120, 8);
    expect(result.totalInterest).toBeCloseTo(0, 8);
    expect(result.amortization).toHaveLength(10);
    expect(result.amortization.at(-1)?.balance).toBeCloseTo(0, 8);
  });

  it("returns year-by-year principal, interest and balance", () => {
    const result = calculateMortgage({
      propertyPrice: 10_000_000,
      deposit: 0,
      annualInterestRate: 12,
      years: 2,
    });
    expect(result.amortization).toHaveLength(2);
    expect(result.amortization[0].payment).toBeGreaterThan(0);
    expect(result.amortization[0].principal).toBeGreaterThan(0);
    expect(result.amortization[0].interest).toBeGreaterThan(0);
    expect(result.amortization[1].balance).toBeCloseTo(0, 5);
  });

  it("guards invalid finance bounds", () => {
    expect(() =>
      calculateMortgage({
        propertyPrice: 0,
        deposit: 0,
        annualInterestRate: 10,
        years: 20,
      })
    ).toThrow();
    expect(() =>
      calculateMortgage({
        propertyPrice: 1_000,
        deposit: 2_000,
        annualInterestRate: 10,
        years: 20,
      })
    ).toThrow();
    expect(() =>
      calculateMortgage({
        propertyPrice: 1_000,
        deposit: 0,
        annualInterestRate: 101,
        years: 20,
      })
    ).toThrow();
    expect(() =>
      calculateMortgage({
        propertyPrice: 1_000,
        deposit: 0,
        annualInterestRate: 10,
        years: 41,
      })
    ).toThrow();
  });
  it("keeps the allowed upper rate and term numerically finite", () => {
    const result = calculateMortgage({
      propertyPrice: 1_000_000,
      deposit: 0,
      annualInterestRate: 100,
      years: 40,
    });
    expect(Number.isFinite(result.monthlyPayment)).toBe(true);
    expect(Number.isFinite(result.totalInterest)).toBe(true);
  });
});

describe("affordability and investment", () => {
  it("inverts the repayment budget at zero interest and includes co-applicant commitments", () => {
    const result = calculateAffordability({
      monthlyIncome: 100,
      coApplicantIncome: 10,
      monthlyExpenses: 20,
      monthlyDebts: 10,
      otherCommitments: 5,
      repaymentRatio: 50,
      annualInterestRate: 0,
      years: 10,
      deposit: 0,
    });
    expect(result.totalIncome).toBe(110);
    expect(result.totalCommitments).toBe(35);
    expect(result.disposableIncome).toBe(75);
    expect(result.affordableMonthlyRepayment).toBe(37.5);
    expect(result.affordableLoan).toBeCloseTo(4_500, 8);
  });

  it("calculates holding-period, annualized and inflation-adjusted return", () => {
    const result = calculateInvestmentReturn({
      purchaseCost: 1_000_000,
      monthlyRent: 10_000,
      annualExpenses: 20_000,
      holdingPeriodYears: 5,
      saleAppreciationRate: 10,
      saleCostsPercentage: 2,
      inflationRate: 5,
    });
    expect(result.grossRentalYield).toBeCloseTo(12, 8);
    expect(result.annualCashFlow).toBe(100_000);
    expect(result.futureSalePrice).toBeCloseTo(1_610_510, 5);
    expect(result.totalRentalCashFlow).toBe(500_000);
    expect(Number.isFinite(result.annualizedRoi)).toBe(true);
    expect(Number.isFinite(result.realAnnualizedReturn)).toBe(true);
  });
});

describe("land and unit conversions", () => {
  it("round trips an acre through perches and square feet", () => {
    const perches = convertLandArea(1, "acres", "perches");
    const squareFeet = convertLandArea(perches, "perches", "sqft");
    expect(perches).toBeCloseTo(160, 10);
    expect(squareFeet).toBeCloseTo(43_560, 8);
    expect(convertLandArea(squareFeet, "sqft", "acres")).toBeCloseTo(1, 8);
    expect(convertLandArea(1, "perches", "sqft")).toBeCloseTo(272.25, 8);
  });

  it("guards negative areas and division by zero", () => {
    expect(() => convertLandArea(-1, "acres", "perches")).toThrow();
    expect(() =>
      calculatePricePerUnit({ totalPrice: 10, area: 0, areaUnit: "perches" })
    ).toThrow();
    expect(() =>
      calculatePricePerUnit({ totalPrice: -10, area: 1, areaUnit: "perches" })
    ).toThrow();
  });

  it("converts price per perch and square foot consistently", () => {
    const result = calculatePricePerUnit({
      totalPrice: 27_225,
      area: 100,
      areaUnit: "perches",
    });
    expect(result.pricePerPerch).toBeCloseTo(272.25, 8);
    expect(result.pricePerSqFt).toBeCloseTo(1, 8);
  });
});

describe("other tools and data guards", () => {
  it("keeps stamp duty and FX entirely user-entered", () => {
    expect(
      estimateStampDuty({
        purchasePrice: 1_000,
        percentage: 3,
        fixedCharges: 50,
      }).estimatedTotal
    ).toBe(80);
    expect(
      convertLkrToCurrency({ lkrAmount: 900, lkrPerCurrencyUnit: 300 })
    ).toBe(3);
    expect(() =>
      convertLkrToCurrency({ lkrAmount: 900, lkrPerCurrencyUnit: 0 })
    ).toThrow();
  });

  it("reports loan payment and interest differences", () => {
    const result = compareLoans(
      { principal: 1_000_000, annualInterestRate: 10, years: 10 },
      { principal: 1_000_000, annualInterestRate: 12, years: 10 }
    );
    expect(result.monthlyPaymentDifference).toBeLessThan(0);
    expect(result.totalInterestDifference).toBeLessThan(0);
    expect(result.lowerMonthlyPayment).toBe("A");
    expect(result.lowerTotalInterest).toBe("A");
  });

  it("calculates observed medians without rentals or demo data", () => {
    const rows = calculateObservedAskingMedians([
      {
        district: "Colombo",
        kind: "House",
        price: 100,
        intent: "buy",
        status: "active",
      },
      {
        district: "Colombo",
        kind: "House",
        price: 300,
        intent: "buy",
        status: "active",
      },
      {
        district: "Colombo",
        kind: "House",
        price: 900,
        intent: "rent",
        status: "active",
      },
      {
        district: "Colombo",
        kind: "House",
        price: 500,
        intent: "buy",
        status: "active",
        isDemo: true,
      },
    ]);
    expect(rows[0].medianAskingPrice).toBe(200);
    expect(rows[0].sampleSize).toBe(2);
  });

  it("requires five non-demo current comparables for the price meter", () => {
    const base = Array.from({ length: 4 }, (_, index) => ({
      district: "Galle",
      kind: "Land",
      price: (index + 1) * 100,
      intent: "buy",
      status: "active",
    }));
    expect(
      calculatePriceMeter({ records: base, district: "Galle", kind: "Land" })
        .status
    ).toBe("insufficient-data");
    const ready = calculatePriceMeter({
      records: [
        ...base,
        {
          district: "Galle",
          kind: "Land",
          price: 500,
          intent: "buy",
          status: "active",
        },
      ],
      district: "Galle",
      kind: "Land",
    });
    expect(ready.status).toBe("ready");
    expect(ready.medianAskingPrice).toBe(300);
  });
});
