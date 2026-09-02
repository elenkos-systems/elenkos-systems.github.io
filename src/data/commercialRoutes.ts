export const commercialRoutes = Object.freeze({
  quoteRequest: 'https://org.elenkos.systems/quotes/request',
  organizationInterest: 'https://org.elenkos.systems/register-interest',
  individualInterest: 'https://user.elenkos.systems/register-interest',
  api: 'https://api.elenkos.systems',
  activationState: 'prelaunch' as const,
});

export const commercialBoundaries = Object.freeze({
  quoteCreatesFinancialObligation: false,
  interestCreatesAccount: false,
  interestCreatesEnrollment: false,
  marketingSiteCollectsPersonalData: false,
});
