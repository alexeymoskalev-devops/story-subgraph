import { assert, test, clearStore, afterEach, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { DerivativeRegistered } from "../generated/LicensingModule/LicensingModule";
import { handleDerivativeRegistered } from "../src/derivative";

afterEach(() => { clearStore(); });

function addrArray(addrs: string[]): ethereum.Value {
  let out = new Array<ethereum.Value>();
  for (let i = 0; i < addrs.length; i++) {
    out.push(ethereum.Value.fromAddress(Address.fromString(addrs[i])));
  }
  return ethereum.Value.fromArray(out);
}

function uintArray(nums: i32[]): ethereum.Value {
  let out = new Array<ethereum.Value>();
  for (let i = 0; i < nums.length; i++) {
    out.push(ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(nums[i])));
  }
  return ethereum.Value.fromArray(out);
}

function newDerivativeRegistered(
  childIpId: string,
  parentIpIds: string[],
  licenseTermsIds: i32[],
  licenseTemplate: string
): DerivativeRegistered {
  let e = changetype<DerivativeRegistered>(newMockEvent());
  e.parameters = new Array();
  e.parameters.push(new ethereum.EventParam("caller", ethereum.Value.fromAddress(Address.fromString("0x00000000000000000000000000000000000000ca"))));
  e.parameters.push(new ethereum.EventParam("childIpId", ethereum.Value.fromAddress(Address.fromString(childIpId))));
  e.parameters.push(new ethereum.EventParam("licenseTokenIds", uintArray(licenseTermsIds)));
  e.parameters.push(new ethereum.EventParam("parentIpIds", addrArray(parentIpIds)));
  e.parameters.push(new ethereum.EventParam("licenseTermsIds", uintArray(licenseTermsIds)));
  e.parameters.push(new ethereum.EventParam("licenseTemplate", ethereum.Value.fromAddress(Address.fromString(licenseTemplate))));
  return e;
}

test("handleDerivativeRegistered links child to parent and updates counts", () => {
  let child = "0x0000000000000000000000000000000000000002";
  let parent = "0x0000000000000000000000000000000000000001";
  let template = "0x00000000000000000000000000000000000000bb";

  handleDerivativeRegistered(newDerivativeRegistered(child, [parent], [7], template));

  let linkId = child + "-" + parent;
  assert.entityCount("DerivativeLink", 1);
  assert.fieldEquals("DerivativeLink", linkId, "child", child);
  assert.fieldEquals("DerivativeLink", linkId, "parent", parent);
  assert.fieldEquals("DerivativeLink", linkId, "licenseTemplate", template);

  assert.fieldEquals("IPAsset", child, "parentCount", "1");
  assert.fieldEquals("IPAsset", parent, "derivativeCount", "1");
});

test("handleDerivativeRegistered handles multiple parents", () => {
  let child = "0x0000000000000000000000000000000000000003";
  let p1 = "0x0000000000000000000000000000000000000004";
  let p2 = "0x0000000000000000000000000000000000000005";
  let template = "0x00000000000000000000000000000000000000bb";
  handleDerivativeRegistered(newDerivativeRegistered(child, [p1, p2], [7, 8], template));
  assert.entityCount("DerivativeLink", 2);
  assert.fieldEquals("IPAsset", child, "parentCount", "2");
  assert.fieldEquals("IPAsset", p1, "derivativeCount", "1");
  assert.fieldEquals("IPAsset", p2, "derivativeCount", "1");
});
