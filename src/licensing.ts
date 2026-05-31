export { handleDerivativeRegistered } from "./derivative";

import { LicenseTermsRegistered } from "../generated/PILicenseTemplate/PILicenseTemplate";
import { LicenseTermsAttached } from "../generated/LicensingModule/LicensingModule";
import { LicenseTerms, LicenseAttachment } from "../generated/schema";
import { loadOrCreateIPAsset } from "./helpers";

export function handleLicenseTermsRegistered(event: LicenseTermsRegistered): void {
  let id = event.params.licenseTermsId.toString();
  let terms = new LicenseTerms(id);
  terms.licenseTemplate = event.params.licenseTemplate;
  terms.rawTerms = event.params.licenseTerms;
  terms.registeredAtBlock = event.block.number;
  terms.save();
}

export function handleLicenseTermsAttached(event: LicenseTermsAttached): void {
  let ip = loadOrCreateIPAsset(event.params.ipId);
  ip.save();
  let ipId = event.params.ipId.toHexString();
  let termsId = event.params.licenseTermsId.toString();
  let attId = ipId + "-" + termsId;
  let att = new LicenseAttachment(attId);
  att.ip = ipId;
  att.licenseTermsId = event.params.licenseTermsId;
  att.licenseTemplate = event.params.licenseTemplate;
  att.blockNumber = event.block.number;
  att.save();
}
