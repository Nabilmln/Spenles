export type SplitBillDiscountMode = "none" | "fixed" | "percentage";
export type SplitBillRecordStatus = "draft" | "finalized" | "archived";
export type SplitBillPaymentState = "unpaid" | "partially_paid" | "paid";

export type CalculationParticipant = {
  id: string;
  name: string;
  position: number;
};

export type CalculationAssignment = {
  id: string;
  participantId: string;
};

export type CalculationItem = {
  id: string;
  name: string;
  position: number;
  quantity: number;
  unitPrice: bigint;
  itemTaxBps: number;
  assignments: CalculationAssignment[];
};

export type SplitBillCalculationInput = {
  discountMode: SplitBillDiscountMode;
  fixedDiscountAmount: bigint;
  discountBps: number;
  billTaxBps: number;
  serviceChargeBps: number;
  participants: CalculationParticipant[];
  items: CalculationItem[];
};

export type SplitBillItemResult = {
  itemId: string;
  name: string;
  position: number;
  quantity: number;
  unitPrice: bigint;
  itemTaxBps: number;
  subtotalAmount: bigint;
  discountAmount: bigint;
  discountedAmount: bigint;
  itemTaxAmount: bigint;
  billTaxAmount: bigint;
  totalBeforeServiceAmount: bigint;
};

export type SplitBillAssignmentResult = {
  assignmentId: string;
  itemId: string;
  participantId: string;
  itemAmount: bigint;
  itemTaxAmount: bigint;
  billTaxAmount: bigint;
};

export type SplitBillParticipantResult = {
  participantId: string;
  name: string;
  position: number;
  itemAmount: bigint;
  itemTaxAmount: bigint;
  billTaxAmount: bigint;
  serviceChargeAmount: bigint;
  finalAmount: bigint;
};

export type SplitBillCalculationResult = {
  calculationVersion: 1;
  subtotalAmount: bigint;
  discountAmount: bigint;
  discountedSubtotalAmount: bigint;
  itemTaxAmount: bigint;
  billTaxAmount: bigint;
  totalTaxAmount: bigint;
  serviceChargeAmount: bigint;
  finalAmount: bigint;
  items: SplitBillItemResult[];
  assignments: SplitBillAssignmentResult[];
  participants: SplitBillParticipantResult[];
};
