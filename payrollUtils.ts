
export const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Calculates SOCSO (PERKESO) Jenis Pertama contributions based on the official table.
 */
export const getSocsoValues = (salary: number) => {
  if (salary <= 0) return { er: 0, ee: 0 };
  
  const s = Math.min(salary, 5000);

  if (s <= 30) return { er: 0.40, ee: 0.10 };
  if (s <= 50) return { er: 0.70, ee: 0.20 };
  if (s <= 70) return { er: 1.10, ee: 0.30 };
  if (s <= 100) return { er: 1.50, ee: 0.40 };
  if (s <= 140) return { er: 2.10, ee: 0.60 };
  if (s <= 200) return { er: 2.95, ee: 0.85 };
  if (s <= 300) return { er: 4.35, ee: 1.25 };
  
  let currentER = 4.35; 
  let currentEE = 1.25; 
  let bracketStart = 300;
  
  while (bracketStart < s && bracketStart < 5000) {
    currentEE += 0.50;
    const increment = (bracketStart / 100) % 2 === 1 ? 1.80 : 1.70;
    currentER += increment;
    bracketStart += 100;
  }
  
  return {
    er: parseFloat(currentER.toFixed(2)),
    ee: parseFloat(currentEE.toFixed(2))
  };
};

/**
 * Calculates EIS (SIP) contributions based on the provided table.
 */
export const getEisValue = (salary: number) => {
  if (salary <= 0) return 0;
  
  const s = Math.min(salary, 4000);

  if (s <= 1000) return 1.90;

  const bracketsAbove1000 = Math.ceil((s - 1000) / 100);
  const contribution = 1.90 + (bracketsAbove1000 * 0.20);
  
  return parseFloat(contribution.toFixed(2));
};

/**
 * Standard Statutory Calculation for Malaysia (EPF, SOCSO, EIS).
 * PCB (MTD) is now passed as a manual value per user requirement.
 */
export const calculateStatutory = (
  actualBasic: number, 
  allowance: number = 0,
  bonus: number = 0,
  overtime: number = 0,
  unpaidLeaveDays: number = 0,
  otherDeductions: number = 0,
  manualPcb: number = 0,
  daysInMonth: number = 30
) => {
  const unpaidLeaveDeduction = unpaidLeaveDays > 0 ? (actualBasic / daysInMonth) * unpaidLeaveDays : 0;
  // Gross Salary for EPF includes Basic, Allowance, Bonus, Overtime (usually subject to EPF)
  const grossSalary = actualBasic + allowance + bonus + overtime - unpaidLeaveDeduction;

  // 1. EPF Calculation (Employee 11%, Employer 12-13%)
  const epfEmployee = Math.ceil(grossSalary * 0.11);
  const epfEmployer = grossSalary <= 5000 ? Math.ceil(grossSalary * 0.13) : Math.ceil(grossSalary * 0.12);

  // 2. SOCSO Calculation (ceiling RM5000)
  const socsoData = getSocsoValues(grossSalary);
  const socsoEmployee = socsoData.ee;
  const socsoEmployer = socsoData.er;

  // 3. EIS (SIP) Calculation (ceiling RM4000)
  const eisValue = getEisValue(grossSalary);
  const eisEmployee = eisValue;
  const eisEmployer = eisValue;

  // 4. PCB is now manual
  const pcb = manualPcb;
  
  // Net Salary = Gross - Statutory Deductions - Other Deductions - PCB
  const netSalary = parseFloat((grossSalary - epfEmployee - socsoEmployee - eisEmployee - otherDeductions - pcb).toFixed(2));

  return {
    grossSalary: parseFloat(grossSalary.toFixed(2)),
    unpaidLeaveDeduction: parseFloat(unpaidLeaveDeduction.toFixed(2)),
    epfEmployee,
    epfEmployer,
    socsoEmployee,
    socsoEmployer,
    eisEmployee,
    eisEmployer,
    pcb,
    netSalary
  };
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value);
};
