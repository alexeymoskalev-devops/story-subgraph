import { RoyaltyPaid, RevenueTokenClaimed } from "../generated/RoyaltyModule/RoyaltyModule";
import { RoyaltyPayment, RevenueClaim } from "../generated/schema";
import { loadOrCreateIPAsset } from "./helpers";

export function handleRoyaltyPaid(event: RoyaltyPaid): void {
  let receiver = loadOrCreateIPAsset(event.params.receiverIpId);
  receiver.royaltyPaidTotal = receiver.royaltyPaidTotal.plus(event.params.amount);
  receiver.save();

  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let p = new RoyaltyPayment(id);
  p.receiverIp = event.params.receiverIpId.toHexString();
  p.payerIp = event.params.payerIpId;
  p.sender = event.params.sender;
  p.token = event.params.token;
  p.amount = event.params.amount;
  p.amountAfterFee = event.params.amountAfterFee;
  p.timestamp = event.block.timestamp;
  p.save();
}

export function handleRevenueTokenClaimed(event: RevenueTokenClaimed): void {
  let id = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let c = new RevenueClaim(id);
  c.claimer = event.params.claimer;
  c.token = event.params.token;
  c.amount = event.params.amount;
  c.timestamp = event.block.timestamp;
  c.save();
}
