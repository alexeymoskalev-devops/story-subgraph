import { assert, test, clearStore, afterEach, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { RoyaltyPaid, RevenueTokenClaimed } from "../generated/RoyaltyModule/RoyaltyModule";
import { handleRoyaltyPaid, handleRevenueTokenClaimed } from "../src/royalty";

afterEach(() => { clearStore(); });

function newRoyaltyPaid(receiver: string, amount: i32): RoyaltyPaid {
  let e = changetype<RoyaltyPaid>(newMockEvent());
  e.parameters = new Array();
  e.parameters.push(new ethereum.EventParam("receiverIpId", ethereum.Value.fromAddress(Address.fromString(receiver))));
  e.parameters.push(new ethereum.EventParam("payerIpId", ethereum.Value.fromAddress(Address.fromString("0x00000000000000000000000000000000000000bb"))));
  e.parameters.push(new ethereum.EventParam("sender", ethereum.Value.fromAddress(Address.fromString("0x00000000000000000000000000000000000000cc"))));
  e.parameters.push(new ethereum.EventParam("token", ethereum.Value.fromAddress(Address.fromString("0x1514000000000000000000000000000000000000"))));
  e.parameters.push(new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount))));
  e.parameters.push(new ethereum.EventParam("amountAfterFee", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(amount))));
  return e;
}

test("handleRoyaltyPaid records a payment and increments receiver total", () => {
  let receiver = "0x0000000000000000000000000000000000000001";
  handleRoyaltyPaid(newRoyaltyPaid(receiver, 50));
  assert.entityCount("RoyaltyPayment", 1);
  assert.fieldEquals("IPAsset", receiver, "royaltyPaidTotal", "50");
});
