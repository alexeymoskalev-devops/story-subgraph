export { handleDerivativeRegistered } from "./derivative";

import { LicenseTermsAttached } from "../generated/LicensingModule/LicensingModule";
import { LicenseTermsRegistered } from "../generated/PILicenseTemplate/PILicenseTemplate";

// S3 will implement these; kept as stubs so codegen/build resolve all handlers.
export function handleLicenseTermsAttached(event: LicenseTermsAttached): void {}
export function handleLicenseTermsRegistered(event: LicenseTermsRegistered): void {}
