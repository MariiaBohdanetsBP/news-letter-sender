import type { CompanyDecision } from "@/types";

export const MOCK_COMPANIES: CompanyDecision[] = [
  { companyId: "C001", companyName: "Alza.cz a.s.", selected: false, decidedBy: null, accountManager: "Jana Nováková", systemType: "Muza" },
  { companyId: "C002", companyName: "Škoda Auto a.s.", selected: false, decidedBy: null, accountManager: "Petr Dvořák", systemType: "BP1" },
  { companyId: "C003", companyName: "ČSOB Pojišťovna", selected: false, decidedBy: null, accountManager: "Jana Nováková", systemType: "Muza" },
  { companyId: "C004", companyName: "Komerční banka a.s.", selected: false, decidedBy: null, accountManager: "Martin Horák", systemType: "BP1" },
  { companyId: "C005", companyName: "O2 Czech Republic", selected: false, decidedBy: null, accountManager: "Eva Svobodová", systemType: "Muza" },
  { companyId: "C006", companyName: "Vodafone Czech Republic", selected: false, decidedBy: null, accountManager: "Petr Dvořák", systemType: "Muza" },
  { companyId: "C007", companyName: "T-Mobile Czech Republic", selected: false, decidedBy: null, accountManager: "Martin Horák", systemType: "BP1" },
  { companyId: "C008", companyName: "Česká spořitelna a.s.", selected: false, decidedBy: null, accountManager: "Jana Nováková", systemType: "Muza" },
  { companyId: "C009", companyName: "Moneta Money Bank", selected: false, decidedBy: null, accountManager: "Eva Svobodová", systemType: "BP1" },
  { companyId: "C010", companyName: "PPF Group N.V.", selected: false, decidedBy: null, accountManager: "Lucie Králová", systemType: "Muza" },
  { companyId: "C011", companyName: "Agrofert a.s.", selected: false, decidedBy: null, accountManager: "Lucie Králová", systemType: "BP1" },
  { companyId: "C012", companyName: "Energetický regulační úřad", selected: false, decidedBy: null, accountManager: "Tomáš Procházka", systemType: "Muza" },
  { companyId: "C013", companyName: "ČEZ Group a.s.", selected: false, decidedBy: null, accountManager: "Tomáš Procházka", systemType: "BP1" },
  { companyId: "C014", companyName: "Avast Software s.r.o.", selected: false, decidedBy: null, accountManager: "Eva Svobodová", systemType: "Muza" },
  { companyId: "C015", companyName: "Lékárna.cz s.r.o.", selected: false, decidedBy: null, accountManager: "Lucie Králová", systemType: "BP1" },
];

export const ACCOUNT_MANAGERS = [
  "Jana Nováková",
  "Petr Dvořák",
  "Martin Horák",
  "Eva Svobodová",
  "Lucie Králová",
  "Tomáš Procházka",
];
