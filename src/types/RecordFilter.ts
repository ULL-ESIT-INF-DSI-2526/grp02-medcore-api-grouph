export type RecordFilter = { 
  startDate: {  $gte: Date, $lte: Date };
  type?: "Ambulatoria" | "Hospitalaria";
};