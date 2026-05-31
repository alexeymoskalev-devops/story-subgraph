import { assert, test, clearStore, afterEach, newMockEvent } from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { LicenseTermsRegistered } from "../generated/PILicenseTemplate/PILicenseTemplate";
import { LicenseTermsAttached } from "../generated/LicensingModule/LicensingModule";
import { handleLicenseTermsRegistered, handleLicenseTermsAttached } from "../src/licensing";

afterEach(() => { clearStore(); });

function newTermsRegistered(id: i32): LicenseTermsRegistered {
  let e = changetype<LicenseTermsRegistered>(newMockEvent());
  e.parameters = new Array();
  e.parameters.push(new ethereum.EventParam("licenseTermsId", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(id))));
  e.parameters.push(new ethereum.EventParam("licenseTemplate", ethereum.Value.fromAddress(Address.fromString("0x00000000000000000000000000000000000000dd"))));
  e.parameters.push(new ethereum.EventParam("licenseTerms", ethereum.Value.fromBytes(Bytes.fromHexString("0x1234"))));
  return e;
}
function newTermsAttached(ip: string, id: i32): LicenseTermsAttached {
  let e = changetype<LicenseTermsAttached>(newMockEvent());
  e.parameters = new Array();
  e.parameters.push(new ethereum.EventParam("caller", ethereum.Value.fromAddress(Address.fromString("0x00000000000000000000000000000000000000cc"))));
  e.parameters.push(new ethereum.EventParam("ipId", ethereum.Value.fromAddress(Address.fromString(ip))));
  e.parameters.push(new ethereum.EventParam("licenseTemplate", ethereum.Value.fromAddress(Address.fromString("0x00000000000000000000000000000000000000dd"))));
  e.parameters.push(new ethereum.EventParam("licenseTermsId", ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(id))));
  return e;
}

test("handleLicenseTermsRegistered stores terms", () => {
  handleLicenseTermsRegistered(newTermsRegistered(7));
  assert.entityCount("LicenseTerms", 1);
  assert.fieldEquals("LicenseTerms", "7", "rawTerms", "0x1234");
});

test("handleLicenseTermsAttached links terms to ip", () => {
  let ip = "0x0000000000000000000000000000000000000001";
  handleLicenseTermsAttached(newTermsAttached(ip, 7));
  assert.entityCount("LicenseAttachment", 1);
  assert.fieldEquals("LicenseAttachment", ip + "-7", "licenseTermsId", "7");
  assert.fieldEquals("LicenseAttachment", ip + "-7", "ip", ip);
});
