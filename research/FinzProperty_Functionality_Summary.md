# FinzProperty: researched functional expansion

**Reference:** LankaPropertyWeb public portal. **Audit date:** 9 November 2026. **Excluded:** every Post Your Ad / property-ad submission option, public wanted-ad publication, and advertiser ad-management workflow. The supplied FINZ PROPERTY logo is preserved.

The source audit records 114 observed or documented feature entries across six public areas. Some entries overlap, and some gated or dynamic actions could not be verified because of access/CAPTCHA restrictions. This is an evidence-based feature inventory, not a claim that 114 unique working functions have been cloned or that every private LPW workflow is known.

## What is implemented in the app

### Property discovery

Buy, rent/lease, land, commercial and apartment discovery connect to database records. Search criteria are URL-backed and include location keywords, all 25 districts, houses/apartments/bungalows/villas/studios/annexes/hostels/rooms, commercial/land subtypes, price ranges, total or per-square-foot/per-perch/per-acre pricing, bedroom/bathroom minima, floor/land extent, amenities, exact-word search, recorded-date and media/status flags. Browser navigation restores applied criteria; empty matches stay empty rather than being replaced with sample matches. Grid, list, real map controls, sorting and record-based pagination are usable.

Near-me discovery requests browser permission only when the visitor chooses location access. School/university and hospital/clinic searches use managed geocoding and a selected radius. Listing positions represent geocoded localities, not verified property boundaries. Failed/unknown locations and unavailable providers are explained rather than replaced with random markers.

### Seeker tools and listing follow-up

Properties can be saved, compared (up to four) and revisited. Guests have clearly labeled this-device favourites/comparison/recent views. Signed-in favourites and named saved searches use ownership-scoped database operations. Saved-search cards expose matching current records; nearby criteria reopen the location search. Preference frequencies are stored, but automatic email/mobile delivery is not configured.

Listing pages provide photos/gallery navigation, facts, recorded amenities, associated advertiser profiles, similar records, sharing/copying and email-to-friend links, a property-price-prefilled mortgage path, and a price-indicator path. Enquiries, requested viewing dates, callbacks and listing reports persist before a receipt/success is shown. Demonstration advertiser phone/WhatsApp contacts are suppressed; actual contacts require real advertiser records.

### Developments and Apartment Finder

Project discovery supports search, locality, price and recorded-status filters, list/table/map views and actual pagination. Project details query their database record and explicitly associated active listings; unrelated apartments are not arbitrarily attached to projects. Missing brochures, floor plans, unit configurations, availability or payment plans remain unavailable.

Apartment Finder supports sale/rent, multiple cities, bedrooms/floor area, total-budget or illustrative maximum-monthly-payment filtering, editable rate/term/deposit assumptions, recorded ready/off-plan/short-term flags, and list/table/map results. Project associations are used only when present; otherwise rows are marked unassociated. Sold/rented-history feeds are not fabricated.

### Finance and market resources

Fourteen tool/resource routes cover mortgage estimates, annual repayment plans, co-applicant affordability, rental/investment ROI with holding/exit/inflation assumptions, land conversion, price-per-unit conversion, user-entered stamp-duty assumptions, user-entered currency rates, two-offer loan comparison, a comparable asking-price indicator, observed asking-price summaries, house/land index resources and market reports. Calculations validate their numerical inputs and state assumptions. They are not financial/legal advice, valuations or loan approvals.

The price indicator excludes demonstration records and requires a minimum comparable sample. With the current sample inventory, it correctly reports insufficient live data. Historic indices, verified bank-rate boards and detailed reports are linked as clearly external resources rather than reproduced with invented series or rates.

### Accounts, agents and operations

The existing real Manus OAuth authentication is preserved. Account tabs include database-backed favourites, saved searches, enquiries, assistance-request history, this-device recent views, profile-name update and logout. Private queries enforce ownership; administrators alone can read operation counts, requests and reports and review/resolve records. No fake user or marketplace statistics are presented.

The agent directory supports keyword/location and actual-inventory-based sales/rent/land/commercial filters, record-based pagination, correct profile slugs and filtered associated listings. Demonstration advertisers are clearly marked and do not imply professional verification.

### Guides, assistance and contact

Original editorial content includes nine practical property guides and a clearly identified FinzProperty update, with searchable topics, article detail routes, previous/next/related navigation, sharing and help links. The main buying and renting guides have scoped English/Sinhala/Tamil reading variants; other content is English-first.

About, contact, FAQ, privacy, terms, safety and events pages are connected. Contact/newsletter preferences and project/service/event interest requests are stored with validation and clear receipts. Valuation, legal/document, mortgage, moving, insurance, photography, market research, construction, architecture, surveying and interior-design assistance paths capture private requirements. Construction matching asks about project/land/timing/stage/help; property matching is a private seeker brief, not a public advertisement. No provider partnership, match, appointment, quote or event is falsely promised.

## What still requires real connections or data

A production inventory must be supplied through an authorized operator/import integration; visitors cannot post ads. Real agents/developers, verified contact details and unit/project relationships must be onboarded. Brochures, floor plans, video/360 media, recorded subtypes/statuses, sold/rented history and exact coordinates must come from those records.

Customer email/SMS/push delivery, live chat and automatic notification scheduling are not connected. The app stores requests/preferences and supports internal review, but does not claim to have delivered a message externally. A licensed/permissioned historical market dataset, maintained live bank/product rates and FX feed would be needed for native data parity. Certified valuers, attorneys, contractors, lenders and event operators must be confirmed before service fulfilment can be offered.

The reference's Facebook/Google/email-password activation/recovery system is not duplicated: this app retains its existing Manus sign-in. Adding other identity providers would be a separate integration choice. Public account-gated LPW workflows were not tested or guessed.

## Data provenance and delivery status

The current database contains eight demonstration properties, three demonstration agents and three demonstration developments, explicitly flagged `isDemo`. They are sample experience records, not verified live offers, market evidence or real availability. Seeding is an explicit finite, idempotent command and will not overwrite a populated inventory. Runtime query failures are surfaced; mutations never return fabricated success.

Public routes serve meaningful initial HTML and route-specific metadata; unavailable records/routes return HTTP 404, and private account pages are noindex without private data in public HTML. The application is available in Manus Preview and is saved to the managed repository after final checks. Saving is not the same as public publication.

The detailed sourced reference inventory is in `LankaPropertyWeb_Feature_Audit.md`, with machine-readable entries in `lpw-features.json`. Source functionality and integration limitations are preserved separately so future work can target genuine gaps instead of adding visual-only controls.

## Final validation

The final standard test suite passes 39 tests across six files; TypeScript and production build pass. Read-only validation confirmed the integrated API/route paths and no active posting CTA. Its four confirmed defects—detail state across slugs, exact multi-word matching, land offer headings and missing-map-location counts—were fixed. The public route manifest has 34 synchronized route patterns. Canonical/social absolute URLs remain omitted until a real public origin is configured; no preview/internal origin is fabricated as the production domain.
