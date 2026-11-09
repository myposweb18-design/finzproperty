# FinzProperty delivery checklist

## Marketplace shell and brand
- [x] The application uses the user-supplied FINZ PROPERTY logo with its original navy/gold artwork, responsive sizing in the header and footer, and the supplied F/roof symbol for the favicon and project branding.
- [x] The Post Your Property / Post Your Ad option is removed from desktop and mobile navigation, homepage, footer, account dashboard, and the post-property page route, as requested by the user.
- [x] The site has Home, Buy, Rent, Land, Commercial, New Developments, Agents, Property News, Sign in/Register, and account/admin entry points with no dead primary links.
- [x] The app serves a synchronized `/manus-routes.json` route manifest for public, dynamic, account, and admin page patterns.

## Property discovery
- [x] The homepage has a Sri Lankan real-estate hero, the stated headline/subtitle, Buy/Rent intent tabs, location/type/price/bedroom search fields, and working navigation to results.
- [x] Results support real property records, search text, buy/rent/category/location/bedroom filters, sorting, grid/list views, pagination or stable result loading, favourites, and useful empty/loading/error states.
- [x] Listing cards display image, title, LKR price, location, bedrooms, bathrooms, land/floor area, featured/verified state, advertiser, and favourite action.
- [x] Property details show a gallery, title/price, full facts, description, features, location context, agent details, contact form, WhatsApp/call actions, viewing request, sharing, reporting, and similar listings.
- [x] Development discovery is represented with project cards and a dedicated project route pattern, with map/list/table-ready structure and affordability copy that is clearly an estimate.

## Accounts and trust
- [x] The existing Manus OAuth/session foundation remains the authentication path, with public logged-out browsing and protected mutation procedures.
- [x] Users can save properties, see account favourites, submit enquiries/viewing requests, and receive confirmation feedback.
- [x] Agent directory and profile cards show agency, location, verification state, active listings, and contact action.
- [x] Account and admin pages have role-aware navigation, real query-backed summary metrics where available, and clear states for pending workflows.

## Data and backend
- [x] Drizzle schema contains marketplace entities for properties, media, agents, favourites, enquiries, developments, and saved searches.
- [x] Public listing/detail/agent queries, favourite mutations, and enquiry mutations are implemented through tRPC with server-side validation.
- [x] Development seed data is clearly separable from production data and supports realistic Sri Lankan prices, locations, measurements, and categories.
- [x] Mutations enforce authentication and ownership/role checks; no live stats or listings are hardcoded in place of database behavior.

## Quality and delivery
- [x] Responsive behavior is polished on mobile, tablet, and desktop, including mobile filter controls and touch-friendly actions.
- [x] Metadata, canonical-friendly routes, accessible labels, keyboard focus, and structured loading/empty/error/success states are present.
- [x] TypeScript diagnostics, tests, production build, health endpoint, and route manifest checks pass.
- [ ] The working app is started in Preview and a checkpoint is saved after validation.

## Reference feature audit and current expansion
- [x] Audit LankaPropertyWeb public search/listing details, developments/Apartment Finder, agents/services, calculators/market data, news/guides, seeker accounts/contact. Save sourced observed functionality and qualify gated/unverified features; exclude all property-ad submission options.
- [x] Search preserves intent, category, location, all 25 districts, price range, bedrooms, bathrooms, floor/land size, features and sorting in URL state; advanced controls affect results, browser navigation restores them, pagination reflects actual available records, and empty/error states are honest.
- [x] Grid/list/map views use actual coordinates or clearly approximate locality coordinates and real map controls, not decorative random markers. Up to four selected properties can be compared, removed and opened from a dedicated comparison page.
- [x] Favourites synchronize across cards/detail/account, persist on this device for guests and in the database for logged-in users. Saved searches can be named, opened and deleted by their owner; notification preferences must not falsely claim customer-email delivery.
- [x] Property enquiries and viewing requests persist before success, attach the current authenticated user where available, and appear in account contact history. Correct advertiser phone/profile links, functional share/copy actions, and a durable listing-report workflow are present.
- [x] Account pages use actual authentication and query-backed counts, favourites, saved searches, contact history and profile update/logout; no fake user statistics or inaccessible posting options. Admin entry is role-protected and report/request review is backed by real data.
- [x] Development discovery has search/location/price/status filtering, project routes, list/table and real map discovery where coordinates exist, working project contact requests, and clearly labeled repayment estimates. Demonstration project claims are labeled and no availability/completion/payment plan is invented as live data.
- [x] Calculators/converters accept validated inputs and recalculate meaningful outputs with assumptions and disclaimers; historical market data is not invented when no licensed/source dataset exists.
- [x] Original guides/article detail pages, resource/service paths, FAQ/About/Contact/Privacy/Terms/Safety and request/newsletter forms are linked and functional. No copied reference text or fake outbound delivery.
- [x] The supplied FINZ PROPERTY logo is preserved; no Post Your Ad, Post Your Property, listing-submission route, or owner-posting CTA is restored anywhere.
- [x] Demonstration listing/agent/project records are explicitly distinguishable from live inventory, empty database matches remain empty, and mutation failure never returns a fabricated success.
- [x] TypeScript, meaningful functional tests, production build, route manifest and health checks pass; one read-only validation agent checks connected functionality and confirmed defects are fixed before saving.

## Additional verified portal functions
- [x] Expand sale/rental taxonomy to bungalows, villas, studios, annexes, hostels and rooms; expose commercial and land subtypes, sale/rent/either modes, total/per-sq-ft/per-perch/per-acre pricing, exact-word/date/media/availability flags where real metadata exists.
- [x] Near-me, named-school/university, hospital/clinic and apartment/locality discovery use permission-based geolocation or managed geocoding and radius choices 1–5, 10 and 20 km; missing coordinates/providers produce honest states rather than random markers.
- [x] Apartment Finder supports sale/rent, multiple cities, total-budget/monthly-payment criteria, rooms/area/status filters and actual list/table/map records. Project-to-unit data must come from explicit associations, and missing brochures/floor plans/availability stay unavailable rather than invented.
- [x] Loan estimates support editable property price/deposit/rate/term, an annual amortization plan, co-applicant borrowing power and loan-offer comparisons; ROI includes holding/exit/inflation assumptions. Price Meter excludes demo rows and requires sufficient comparable data; proprietary historic house/land indices, verified bank-rate boards and reports stay explicitly external/unavailable without a source connection.
- [x] Property detail includes callback request, email-to-friend/share, property-price-prefilled loan link, price-meter and neighbourhood links; agent profiles offer actual sale/rent/land/commercial inventory filters.
- [x] Assistance categories cover valuation, legal/documents, mortgage advice, moving, insurance, photography, market research and construction/professional matching. Requests are private lead records, not public property ads; third-party fulfilment is not promised without real providers.
- [x] Guide hub and article detail support search/topics, related/previous/next/share/help; English/Sinhala/Tamil reading variants are clearly scoped. Event archive is not presented as an invented FinzProperty event; support/newsletter/data-rights requests are stored and actual outbound delivery limitations are stated.
- [x] Preserve the existing Manus login provider for this app. Reference Facebook/Google/password activation/recovery requires separate provider setup and is not represented by fake buttons or fabricated workflows.

## Remaining production connections (not completed)
- [ ] Onboard authorized live inventory and genuine advertiser/developer contact data; associate actual project units and supply exact coordinates, brochures, floor plans, video/360 assets and verified statuses. Visitor ad posting must remain unavailable.
- [ ] Connect customer email/SMS/push and optional live-chat/notification execution, with consent and delivery status; stored preferences/requests are not outbound delivery.
- [ ] Connect licensed historical house/land datasets, maintained bank product/rate data and FX sources if native live market-data parity is required.
- [ ] Confirm real certified valuers, legal advisers, contractors, lenders and event operators before offering fulfilment or matching guarantees.
- [ ] Add alternative identity providers only if separately requested; Manus OAuth remains the real existing account path.

## Validation evidence
TypeScript and production build pass. The standard suite now includes 39 passing tests in six files (backend boundaries, authentication, calculators, filtering, and public-document/404/privacy behavior). Read-only validation identified four connected defects; route-keyed detail reset, multi-word exact filtering, intent-correct land headings and missing-geocode counts were corrected. HTTP checks confirm health, 34 route patterns, real public listing/guide HTML and HTTP 404 for removed posting routes.

## Map, more-filter and motion repair — 9 November 2026
- [x] Show clearly labeled Grid/List/Map view controls above search results on desktop and mobile, and a visible Map view entry from homepage search; switching retains applied criteria and real maps have loading/error/retry feedback.
- [x] More filters is prominent and opens a usable accessible panel on homepage/results, with all existing criteria, Apply/Reset/Close actions, valid numeric ranges, no clipping, and consistent URL-backed filters after applying or resetting.
- [x] Repair animations, transforms and transitions without altering the supplied logo or restoring ad posting: restrained smooth card/menu/filter interactions, no sticky transform or layout jumps, no global animation on map internals, reduced-motion and keyboard/touch support.

Repair evidence: the supported public Preview loads the real Google map and locality markers after adding anonymous cross-origin SDK loading and callback-based readiness. Browser checks applied an advanced price cap, returned 3 matching records, retained view=map and preserved criteria when switching List/Map. Mobile 390×844 captures show homepage Map view/More filters and a scrollable dialog with visible Apply/Reset controls. TypeScript/build and 45tests pass; no new posting route or global map transform was added.

Final targeted review found and fixed dismissal semantics: closing More filters via X/Escape/overlay restores its opening criteria rather than silently retaining un-applied edits. Browser re-open confirmed discarded edits; the homepage Map view action then opened /buy with view=map, ready status and five real geocoded locality markers.

## Same-page homepage map
- [x] Clicking homepage Map view expands a real map and matching listing panel directly below the existing search form without changing the page path or opening a new tab. Existing filters are retained; Search and Apply filters update the inline map while it is open. Hide map returns to the existing search form, with loading/error/empty states and responsive layout preserved.

Verified: homepage URL remained unchanged when Map view expanded with five locality markers; applying a price cap updated the inline panel to three matching records without navigation. Hide map removed the panel and returned focus to Map view. TypeScript, production build and all 45 tests passed.

## Property details Location map
- [x] Replace the Location card’s “Open map search” button with an automatically visible, full-width interactive map in that same card. Locate the current listing’s published locality, retain a clear approximate-location disclaimer, and show genuine loading/error/not-found/retry states without inventing an exact property address.

Verified on Park Lane, Colombo 03: the Location card automatically renders a 420px interactive map, one approximate locality marker and zoom controls; the Open map search action is absent. TypeScript, production build and all 45 tests passed.

## Map-list property selection and zoom
- [x] Selecting a property card in the map panel pans/zooms the existing map to that published locality without changing the current URL; the matching marker and card are highlighted, with title/price shown in a map popup and an explicit separate View details link.
- [x] Marker clicks select the corresponding card; Show all on map restores the overview. Rapid selections, selections during geocoding, missing localities and filtered-out selections must not focus stale or invented coordinates. Keyboard/touch selection and reduced-motion handling are preserved.

Verified in Preview: selecting Park Lane stayed on the homepage and rendered map tiles at zoom 15 with its title/price popup. Rapid card selections kept only the latest choice; Show all cleared selection and popup; clicking the Coconut Grove marker selected its corresponding card without navigation. The read-only review’s pre-load filtered-selection edge case was corrected. TypeScript, production build and all 47 tests passed.

## Business contact and running homepage hero
- [x] Publish FinzProperty’s contact number +94 77 231 0421 with working tel:+94772310421 and WhatsApp https://wa.me/94772310421 links on the homepage, contact page and footer; property pages may show separately labelled FinzProperty help without attributing this number to unrelated advertisers. Preserve the request form and its delivery boundaries.
- [x] Add two original illustrative property hero images alongside the existing image in an automatically rotating homepage showcase, with restrained crossfades, manual previous/next/dot controls and pause/resume. Preserve headline readability, search, inline map selection, supplied logo and mobile layout; pause automatic rotation for reduced-motion, hidden/off-screen or actively interacting users.

Verified: Call and WhatsApp links use +94 77 231 0421 on the homepage/footer/contact surfaces, and contact initial HTML includes the same number. The three-frame hero advances automatically, manual selection and pause/resume work, and both new coastal/city images render as completed images rather than placeholders. Motion rules preserve search/map containers. TypeScript, production build, route-manifest consistency and all 52 tests passed.
