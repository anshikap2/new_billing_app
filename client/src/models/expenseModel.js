export class ExpenseModel {
  constructor(data = {}) {
    this.expenseId = data.expenseId || "EXP101";
    this.project = data.project || "Unknown Project";
    this.employee = data.employee || "Unknown Employee";
    this.paidby = data.paidby || "Bank Transfer";

    if (Array.isArray(data.natureOfFund)) {
      this.natureOfFund = data.natureOfFund.map((item) =>
        typeof item === "object" && item.type ? item.type : item
      );
    } else if (typeof data.natureOfFund === "string") {
      this.natureOfFund = [data.natureOfFund];
    } else {
      this.natureOfFund = ["Miscellaneous"];
    }

    this.debit = data.debit || 0;
    this.credit = data.credit || 0;
    this.date = data.date ? new Date(data.date) : new Date();
    this.updatedDate = data.updatedDate
      ? new Date(data.updatedDate)
      : new Date();
    this.remarks = data.remarks || "";
    this.createdDate = data.createdDate
      ? new Date(data.createdDate)
      : new Date();
    this.paidbyDetails = data.paidbyDetails || "";
  }

  static PAYMENT_STATUSES = {
    PENDING: "Pending",
    PAID: "Paid",
    REJECTED: "Rejected",
    PROCESSING: "Processing",
  };
}
