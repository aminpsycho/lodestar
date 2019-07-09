import {Deposit} from "../types";
import {MAX_DEPOSITS} from "../constants";

export function processSortedDeposits(
  deposits: Deposit[],
  from: number,
  to: number,
  process: (d: Deposit, index: number) => Deposit): Deposit[] {
  return deposits
    //assume deposit order
    .slice(0, Math.min(MAX_DEPOSITS, to - from))
    .map((deposit, index) => {
      return process(deposit, index + from);
    });
}