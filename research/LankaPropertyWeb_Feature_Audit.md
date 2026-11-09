# FinzProperty implementation inventory: verified LankaPropertyWeb functionality

**Audit basis.** This final inventory consolidates only the supplied verified area results from official LankaPropertyWeb and LPW-owned Idealhome pages. It is a product-research reference, not a claim that every control is currently active or suitable for direct copying.

**Feature count: 114.** Each entry keeps the observed behavior, implementation dependencies, confidence, and numbered official source references. Dynamic values such as inventory counts, prices, rates, availability and event status are observations, not fixed requirements.

**Explicitly excluded scope.** All Post Your Ad, post-property, ad-submission, advertiser-submission and ad-management functionality is excluded, as requested. Wanted-property seeker requests are retained only where the supplied audit verified/documented them as seeker-side capability; their actual submission fields remain marked unverified.

## Property discovery: homepage, sales, rentals, land and listing details

### Homepage navigation and discovery entry points — High
**Behavior.** Homepage exposes Sales, Rentals, Land, New Development, direct property-for-sale/property-for-rent/land-for-sale/featured-projects links and Area Guide. Post-ad entry is excluded. [1][1]
**Required dependencies.** LPW navigation and live listing/index data; featured content and counts are dynamic.

### Homepage search modes — High
**Behavior.** Search modes cover near me, school, hospital and location; rendered filters include property type, land subtype, price bands, apartment type, bedrooms and possession-within. Execution was not performed. [1][1]
**Required dependencies.** LPW search backend; near-me may require browser/device geolocation; school/hospital provider undisclosed.

### Sales property taxonomy — High
**Behavior.** Sales categories include House, Apartments, Commercial Buildings, Bungalows and Villas; Commercial expands to office, shop, hotel/resort, restaurant/cafe, guest house, factory, warehouse, shopping mall, coworking, hospital, multipurpose and buildings. [2][2]
**Required dependencies.** LPW taxonomy, live inventory and dynamic counts.

### Rental property taxonomy — High
**Behavior.** Rental categories include House, Apartments, Commercial Buildings, Bungalows, Villas, Studio/Bedsit, Annexes, Hostel and Rooms; Commercial has the observed office through buildings subtypes. [3][3]
**Required dependencies.** LPW rental taxonomy, inventory and dynamic subtype counts.

### Land taxonomy and offer modes — High
**Behavior.** Land discovery includes bare, cultivated, land with house, coconut, tea, rubber, paddy/rice, beachfront, cinnamon and waterfront land, with Sale, Lease/Rent or Either. [4][4]
**Required dependencies.** LPW land inventory and dynamic subtype/offer availability.

### Commercial subcategory browsing — High
**Behavior.** Commercial sale/rental pages expose clickable subtype landing pages with result counts and SEO-style URLs. [2][2], [3][3]
**Required dependencies.** LPW category routes and live inventory counts.

### Location search fields and nearby modes — High
**Behavior.** Category controls expose city/location, school/university, apartment name and hospital/clinic fields plus near-me, school, apartment, hospital and location modes; land omits apartment-name mode in extracted controls. [2][2], [3][3], [4][4]
**Required dependencies.** LPW index and likely school, hospital, location and geolocation datasets; providers undisclosed.

### Radius filtering — High
**Behavior.** Select Radius offers only this city or 1, 2, 3, 4, 5, 10 or 20 km around a selected location. [2][2]
**Required dependencies.** Geocoded LPW listing/location data; geocoding provider undisclosed.

### Sales filters — High
**Behavior.** Sales filters cover property type/subtype, total or per-square-foot price, min/max price, missing-price inclusion, bedrooms, floor area, missing-area inclusion, amenities, exact-word matching, date posted and image/availability/urgency/ready/off-plan/below-average/360/video flags. [2][2]
**Required dependencies.** LPW filter/query backend and advertiser-supplied listing metadata.

### Rental filters — High
**Behavior.** Rental filters cover location, type, bedrooms, floor area, amenities, exact-word/date controls, per-month or per-SQFT pricing, missing-price/area inclusion and image/availability/short-term/below-average/360/video flags. [3][3]
**Required dependencies.** LPW rental query backend and advertiser-supplied rent/area/amenity data.

### Land filters — High
**Behavior.** Land filters cover total/per-perch/per-acre price, missing-price inclusion, perch/acre extent, exact words, Sale/Lease/Rent/Either, date posted and image/availability/urgency/below-average/360/video flags. [4][4]
**Required dependencies.** LPW land backend and advertiser-supplied price, extent and offer metadata.

### Category listing cards — High
**Behavior.** Cards expose offer/type, locality, trend or urgency labels, bedrooms or land/floor area, subtype, prices, title, description and sometimes Verified Agent branding/detail links. [2][2], [3][3], [4][4]
**Required dependencies.** LPW listing records, media, advertiser fields and LPW verification/tagging state.

### Pagination and result counts — High
**Behavior.** Category pages show inventory totals, numbered pages and next links; observed commercial sale, commercial rent and land totals/pages were time-sensitive snapshots. [2][2], [3][3], [4][4]
**Required dependencies.** LPW pagination/query backend and live inventory.

### Favorite/save property — High
**Behavior.** Visible states include Property Saved, Favorite not saved and Favorite removed, with Manage linking to the favorite-properties dashboard; no favorite was saved. [2][2], [5][5]
**Required dependencies.** LPW account/authentication and favorite persistence; sign-in was not attempted.

### Save search and email alerts — High
**Behavior.** Category pages expose Save Search and Create E-Mail Alerts; targets indicate account storage and a login gate; no alert was created. [2][2], [3][3], [4][4]
**Required dependencies.** LPW account/authentication, saved-search storage and email delivery.

### Result-page sharing — High
**Behavior.** Share targets are exposed for Facebook, WhatsApp, Twitter/X, LinkedIn, Telegram and email with current URL/title encoded; nothing was sent. [2][2], [3][3], [4][4]
**Required dependencies.** External social endpoints and user mail client.

### Apartment Finder view modes — High
**Behavior.** Category pages advertise Apartment Finder Table, List and Map URLs for sales and rentals; this is not verified as a map mode for every general category. [2][2], [3][3]
**Required dependencies.** LPW Apartment Finder, map data/rendering and unknown map provider.

### Area/location browsing and market context — High
**Behavior.** Area page provides national sale/rent/land price summaries, a Sri Lanka map, nearby-amenities/neighborhood headings and price selectors; Top Cities links appear on category pages. Generated national Find links resolved to Invalid City and are not treated as working navigation. [6][6], [4][4]
**Required dependencies.** LPW area/market data; map and nearby-amenity provider undisclosed.

### Listing detail structured information — High
**Behavior.** Public details include breadcrumbs, photo gallery, title/locality, floor/land area, price/currency conversions, overview attributes and long property details. [5][5]
**Required dependencies.** LPW listing record and image hosting; currency source undisclosed.

### Detail-page neighborhood map — High
**Behavior.** Explore Neighbourhood includes a large-map link opening a Google Maps place URL with listing coordinates. [5][5]
**Required dependencies.** Google Maps rendering/directions; LPW supplies coordinates.

### Listing detail follow-up, contact and report controls — High
**Behavior.** Details expose advertiser identity/type, phone reveal, tel/WhatsApp, callback, contact/email/chat, email-to-friend and Report AD reasons; no action was submitted. [5][5]
**Required dependencies.** LPW forms/backend, advertiser contacts, tel/WhatsApp and user mail client.

### Similar-property and neighborhood discovery — High
**Behavior.** Details link to similar properties and constrained locality/subtype/price result sets, local property prices, Price Meter and a home-loan calculator. [5][5]
**Required dependencies.** LPW recommendation/query backend, price data and calculators.

### Compare listings — Medium — documented concept, UI not verified
**Behavior.** Buying guide discusses comparing ad prices, but no explicit compare button/table/URL was observed; implement only as an unverified concept. [7][7], [2][2], [5][5]
**Required dependencies.** Would require normalized LPW listing data; no verified compare endpoint.

### Sorting controls/order — Not verified
**Behavior.** No visible Sort By control or documented ordering appeared in fetched category content; dynamic/other-route sorting cannot be ruled out. [2][2], [3][3], [4][4]
**Required dependencies.** Unknown; no sorting endpoint/provider disclosed.

## New developments and Apartment Finder

### New-development project directory — High
**Behavior.** Condo Directory covers new condominiums, luxury apartments, housing complexes and future developments; Show Filters, city selector, SEARCH, result count, 15-per-page and pagination are exposed. [8][8]
**Required dependencies.** LPW project catalog, location taxonomy, pagination and dynamic inventory/counts.

### Directory project cards and sale/rent pathways — High
**Behavior.** Cards can show locality, project, address, developer, completion, floors and units, with Buy, Rent/Lease and More Details links; missing fields must be tolerated. [8][8]
**Required dependencies.** Project metadata quality and linked sale/rental indexes.

### Apartment Finder sale/rent mode — High
**Behavior.** Finder has Sale and Rent modes; sale uses total-budget/home-loan-oriented ranges and rent uses monthly ranges, with visible mode controls. [9][9]
**Required dependencies.** LPW apartment inventory, classification and URL query state.

### Apartment Finder location, budget, bedroom and floor-area filters — High
**Behavior.** Finder supports multi-city Add More, price inputs, 1BR–5+BR, square-foot bounds/presets and View Properties; observed sale ranges run Rs.5M–200M and rent Rs.50K–500K+. [9][9]
**Required dependencies.** LPW location hierarchy, numeric filters and apartment attributes.

### Status and market-condition filters — High
**Behavior.** Sale toggles cover new, completed, below-market and recently sold; rent adds recently rented and short-term. Combination semantics were not verified. [9][9]
**Required dependencies.** LPW status/completion/market-value and sold/rented flags.

### Map, List and Table discovery views — High
**Behavior.** Finder visibly offers Map, List, Table and Back to List; LPW describes Map for neighbourhoods, Table for structured scanning and List for richer browsing. [10][10]
**Required dependencies.** Map/geocoding/rendering provider not identified, responsive state and normalized apartment data.

### Project-centric aggregation and unit-level discovery — High
**Behavior.** Finder groups units by development; cards show project/locality/price range and rows for bedroom, area, ad count, price and Sold status, with View More routing to project or grouped search. [10][10]
**Required dependencies.** LPW project-to-listing matching, deduplication/grouping, inventory and sold/rented feeds.

### Recently sold/rented recovery inquiry — Medium-high — documented, workflow not verified
**Behavior.** LPW launch material says sold/rented units can lead to an inquiry connecting users with agents holding similar inventory; exact UI/routing not opened. [10][10]
**Required dependencies.** Agent inventory matching, inquiry/lead routing and possible CAPTCHA/personal-data collection.

### Project detail overview and unit matrix — High
**Behavior.** Marina Square detail includes location, units, sizes, timing, highlights, developer, features, amenities and configurations with beds, baths, area, parking, availability, price, sea-view and SOLD OUT states. [11][11]
**Required dependencies.** Developer/LPW project content, live unit availability/prices, media and project taxonomy.

### Neighbourhood and nearby-place discovery — High
**Behavior.** Project page offers neighbourhood categories (banks, cinemas, restaurants, groceries, hospitals, shopping, parks, bus stands, gas, police and schools) plus nearest-place references/distances. [11][11]
**Required dependencies.** Geocoding/map provider and nearby-place data; some facts manually curated.

### Brochure/availability affordances — Medium — UI observed, download unverified
**Behavior.** Visible brochure-labelled controls, Check Availability, unit-level and callback actions exist, but no concrete brochure URL/download was verified. [11][11]
**Required dependencies.** Brochure storage, availability endpoint, project content and possible gated lead form.

### Project-page home-loan repayment calculator — High
**Behavior.** Project loan module supports LKR/USD, property value, down payment, rate and period and outputs EMI, loan amount, interest and total payment; apply action exists. [11][11]
**Required dependencies.** EMI logic, user inputs, rates/currency and bank/advisor lead service.

### Repayment-oriented Apartment Finder search — Medium-high — documented labels, math not verified
**Behavior.** Sale price section offers Total budget, Monthly payment and With a Home Loan modes; exact repayment inputs, assumptions and math were not verified. [10][10]
**Required dependencies.** Loan/repayment calculation, rate/tenure assumptions, affordability query and apartment data.

### Cross-bank loan comparison, repayment plan and borrowing power — High
**Behavior.** Loan page compares 15+ banks with lowest-rate/lowest-installment sorting, EMI/yearly plan and borrowing-power inputs for income, co-applicant and commitments. [12][12]
**Required dependencies.** Bank rate/product data, EMI and affordability rules, lender/advisor service.

### Enquiry and contact pathways on project pages — High
**Behavior.** Project page exposes phone/WhatsApp, availability, email, inquiry, callback and chat/call plus name/email/contact form, optional marketing checkbox and reCAPTCHA; no submission. [11][11]
**Required dependencies.** Agent/developer contacts, tel/wa.me, email/lead routing, chat, reCAPTCHA and user data.

### Market and unit price comparison support — High
**Behavior.** Buying guide recommends price comparisons, House Price Index, Area Guides and ROI; grouped unit rows/Table view assist scanning, not a side-by-side workspace. [7][7]
**Required dependencies.** Listing/price history, indexes, area data and ROI logic.

### Dedicated side-by-side unit comparison control — Not verified
**Behavior.** No explicit compare checkbox, shortlist or side-by-side unit workspace was found in extracted Finder/directory/project content; do not infer it. [9][9]
**Required dependencies.** If implemented by FinzProperty, normalized unit attributes, selection state and persistence would be needed.

## Agents, assistance and professional services

### Agent directory category navigation — High
**Behavior.** Public agent directory links residential sales, letting/rentals, land brokers and commercial agents via agent_type routes. [13][13]
**Required dependencies.** LPW directory backend and current agent records.

### Agent directory result cards and pagination — High
**Behavior.** Cards show agency/person, profile, covered areas, service labels and description; numbered pagination was visible. [13][13]
**Required dependencies.** LPW profile/listing data and pagination; completeness varies.

### Agent directory type-filtered results — Medium — filter observed, parameter controls unverified
**Behavior.** Land-filtered route narrows results while retaining categories/pagination; BR/search_area URL parameters were present but control behavior not verified. [14][14]
**Required dependencies.** LPW query routing and agent taxonomy; parameter semantics unverified.

### Agency profile overview and direct contact controls — High
**Behavior.** Agency profile shows name, coverage, services, description and CALL AGENT/EMAIL AGENT controls; inspected profile stated All Island and sales/rent/commercial services. [15][15]
**Required dependencies.** Agency-supplied data, phone/email delivery and contact workflow.

### Agency profile ad-inventory filters — High
**Behavior.** Profile lists agency ads with All, Sales, Rentals, Land and Wanted filters; cards show location, class, price/unit, title and detail link. [15][15]
**Required dependencies.** LPW inventory and agency attribution; freshness/completeness unverified.

### Direct advertiser contact model — High
**Behavior.** About page says owners/agents post ads and visitors contact them directly; LPW is not an estate agent or affiliate. [16][16]
**Required dependencies.** Advertiser-provided contacts and LPW direct-contact UI; no inquiry sent.

### Buyer and Seller Assistance: property valuation referral — High
**Behavior.** LPW offers valuations, visa/loan reports and certified-valuer referrals across Sri Lanka; this is coordination, not a browsable valuer directory. [17][17]
**Required dependencies.** External certified valuers, geographic availability and LPW lead workflow.

### Buyer and Seller Assistance: legal and document services — High
**Behavior.** LPW documents attorney support for legal advice, deeds/tenancy agreements, title/condo checks, foreign-buyer advice, fraud protection and Land Registry submission. [17][17]
**Required dependencies.** External attorneys/notaries, registry processes and LPW coordination.

### Buyer and Seller Assistance: mortgage, fees and personal-assistant workflow — High
**Behavior.** Service page covers loan eligibility, partner-bank comparison, documents/follow-up, stamp duty, local fees, CGT and assistant status updates/contact. [17][17]
**Required dependencies.** Partner banks, government/local-authority fee systems, tax rules, staff and lead backend.

### Buyer and Seller Assistance: ancillary and research services — High
**Behavior.** Documents moving, insurance, photography and market research/advisory including feasibility, demand/pricing and reports. [17][17]
**Required dependencies.** External movers, insurers, photographers, analysts and LPW market data.

### Public visitor contact paths — High
**Behavior.** Contact page exposes office address, phone, email, chat and Feedback/Help Needed/Others form; assistance page has phone and service selector; reCAPTCHA is indicated. [18][18]
**Required dependencies.** LPW phone/email/chat and reCAPTCHA; forms/chat not submitted.

### LPW-to-idealhome professional-directory referral — High
**Behavior.** LPW guide links to idealhome professional categories for solicitors, interior designers, valuers, architects, civil engineers, quantity surveyors, consultants and land surveyors; inspected solicitors page had zero results. [19][19], [20][20]
**Required dependencies.** Separate idealhome provider database and dynamic inventory.

### Idealhome contractor directory — High
**Behavior.** Linked directory has category/city/division/area selectors, Grid/List, sorting and public cards; Contractors page showed House of the Builder. [21][21]
**Required dependencies.** Idealhome provider records and construction-service content.

### Idealhome house-builder guided matching flow — High
**Behavior.** Questionnaire covers project type, land, timing, stage and extra services; documented flow shares requirements with builders who evaluate/contact users; submit was not used. [22][22]
**Required dependencies.** Idealhome matching/lead system, builder availability, city taxonomy and third-party follow-up.

## Calculators, valuation, market data and insights

### Home Loan Calculator (EMI) — High
**Behavior.** Inputs currency, property value, down payment, rate and period; outputs EMI, loan amount, rate, total interest and total payable. [23][23]
**Required dependencies.** User inputs and LPW stated fixed-rate assumption; final rates depend on bank assessment.

### Property-linked Home Loan Calculator — High
**Behavior.** Property detail links to calculator with advertised property value passed in URL; destination state was not opened. [24][24]
**Required dependencies.** Listing price and standalone LPW calculator; advertised price is not transaction price.

### ROI Calculator — High
**Behavior.** Accepts Sri Lankan area, price, loan/down payment/rate/term, income, expenses and sale assumptions; outputs holding-period and annualized ROI, real return, instalment and loan cost. [25][25]
**Required dependencies.** User assumptions; no live external feed disclosed.

### Online Property Price Indicator / Price Meter — High
**Behavior.** Choose Sale/Rental/Land and property type; Check now leads to indicative price flow not submitted. LPW describes OPPI as an ad-based statistical model, not a registered valuation. [26][26]
**Required dependencies.** LPW advertised-property dataset/model and user selections.

### Certified Valuation Referral — High
**Behavior.** Price Meter/Market Insights offer Request a Quote for certified valuer inspection and formal report; not requested. [26][26]
**Required dependencies.** External certified/registered valuer and LPW assistance workflow.

### Property-page Currency Converter — Medium-high
**Behavior.** Detail page displays LKR plus USD, GBP, EUR, JPY, INR, AUD, CAD, CNY and RUB values; selector/source/timing unverified. [24][24]
**Required dependencies.** LPW FX data/service and listing LKR price.

### Home Loan Comparison Rate Board — High
**Behavior.** Compares 15 banks; accepts loan amount, period and contribution, recalculates and sorts by rate or instalment; rates/terms are advertised estimates. [12][12]
**Required dependencies.** LPW-maintained bank rates/product terms; final rates, fees and approval depend on bank.

### Home Loan Repayment Plan — High
**Behavior.** Calculator accepts property value, down payment, rate and period and shows EMI, totals and year-by-year principal/interest/balance. [12][12]
**Required dependencies.** User inputs, advertised rate and LPW amortization logic.

### Borrowing Power / Housing Affordability Calculator — High
**Behavior.** Inputs monthly income, co-applicant income and commitments; LPW documents a typical 40% free-income repayment rule and 60% total-deduction guidance. [12][12]
**Required dependencies.** Inputs and heuristic; lender policy, age, loans, expenses and verification determine actual ceiling.

### House Price Index / Average Property Prices — High
**Behavior.** Quarter snapshots Q4 2011–Q2 2026 report asking sale averages for houses/apartments/commercial buildings by region, with YoY change and methodology caveats. [27][27]
**Required dependencies.** About 15,000 LPW ads; asking prices, outlier/algorithm updates and insufficient-data handling.

### Public Rental Price Data — High
**Behavior.** Official data reports average monthly asking rents for standard 4-bedroom houses and 3-bedroom apartments across Sri Lankan regions. [27][27]
**Required dependencies.** LPW ad sample/methodology; asking rents, coverage varies.

### Gross Rental Yield and Rental Analysis — High
**Behavior.** MOR26/MOR25 document average rents, YoY changes, regional comparisons and gross-yield analysis; detailed figures are gated/not all public. [28][28]
**Required dependencies.** LPW research, asking-price/rent/search data and macro inputs; full report requires registration/contact.

### Land Price Index — High
**Behavior.** 2017-base index reports average residential land price per perch by district/city, YoY change, change since 2017 and insufficient-data labels. [29][29]
**Required dependencies.** Advertised land-for-sale data from multiple sites; asking values and local differences matter.

### Market Insights Dashboard — High
**Behavior.** Hub links reports, HPI, Land Index, OPPI, ROI and loan tools; displays headline/rate cards and Total Sales period selector. [30][30]
**Required dependencies.** LPW listing/research data, bank rates and linked tool freshness.

### Market Outlook Reports and Data Availability — High
**Behavior.** MOR26/MOR25 scope includes macro indicators, supply gap, incomes, construction, rates, prices/demand, management fees, rents/yields, land, traffic, commercial leases and tourism; summaries public, full/limited access gated. [28][28]
**Required dependencies.** LPW research plus external macro/banking/construction/demographic/tourism inputs and access tier.

### Listing-level Mortgage Widget on LPW Subdomain — Not verified
**Behavior.** Search-index evidence describes Sale Price, Percent Down, Term, Interest Rate and Calculate, but direct extraction failed; not an LPW-verified feature. [31][31]
**Required dependencies.** If present, listing price and finance inputs; formula/rate source unknown.

## Content, guides, area, help and events

### Property-news archive with article entries — High
**Behavior.** News archive lists linked titles, excerpts and Read More canonical article URLs across market, investment and property topics. [32][32]
**Required dependencies.** LPW editorial/CMS data.

### News archive pagination — High
**Behavior.** News index exposes pages 1–5, next and last page 23. [32][32]
**Required dependencies.** LPW archive routing and editorial inventory.

### News/site search entry point — Medium
**Behavior.** News page has Search the site; events page exposes Read More Articles with an s= query; no query submitted. [32][32]
**Required dependencies.** LPW search/indexing backend.

### Individual guide/article navigation and feedback controls — High
**Behavior.** Guide article exposes Browse Topics, Next/Back, Share, Ask Any Question/Chat Us and question/recommendation prompt; not activated. [7][7]
**Required dependencies.** LPW article templates and implied chat/feedback services.

### Multi-topic property guide hub — High
**Behavior.** Browse Topics spans finding/buying, checks, financing, purchasing/building, moving, maintenance and renting with linked guides. [7][7]
**Required dependencies.** LPW guide CMS and internal routing.

### Multilingual guide access — High
**Behavior.** Guide links English, Sinhala and Tamil variants; translation completeness not tested. [7][7]
**Required dependencies.** LPW language-specific CMS routes.

### Buying and property-selection education — High
**Behavior.** Guide covers locations/types, land/apartments, documents/approvals, developer reputation, infrastructure, prices, living vs investment and ROI, linking LPW tools. [7][7]
**Required dependencies.** Editorial content plus internal indexes/tools and linked external destinations.

### Renting/landlord preparation guidance — High
**Behavior.** Renting guide covers preparation, repairs, deposits, written agreements, screening, advertising and rent-vs-lease; links assistance and videos. [33][33]
**Required dependencies.** LPW editorial content, rental inventory and YouTube links.

### Legal/compliance learning links within guides — Medium
**Behavior.** Guide structure includes documents/approvals, financing, purchasing/building and maintenance; renting guide addresses agreements and rent/lease law; legal resources are informational. [7][7]
**Required dependencies.** LPW editorial/legal-reference content and current Sri Lankan law; professional verification needed.

### Embedded video/webinar learning resources — High
**Behavior.** Renting guide links YouTube webinar/videos on tenant screening, rent-setting and agreements; playback not tested. [33][33]
**Required dependencies.** YouTube hosting and availability.

### Area-guide market dashboard — High
**Behavior.** Area landing page shows national average sale prices for standard house/apartment/land, rental slots and category listing counts; some metrics say Insufficient Data. [6][6]
**Required dependencies.** LPW market/listing database and aggregation logic.

### Area map, amenities and neighborhood sections — Medium
**Behavior.** Area page labels Sri Lanka map, nearby amenities, neighborhood and average prices for house/apartment/land/commercial; interaction/provider not verified. [6][6]
**Required dependencies.** LPW area data plus undisclosed map/amenity visualization service.

### Featured agents within area information — High
**Behavior.** Area page includes carousel-style Featured Agents with Previous/Next, agency names and Contact links. [6][6]
**Required dependencies.** LPW agency/service profiles; contact behavior untested.

### FAQ/help center for content and property-market questions — High
**Behavior.** Help/FAQs cover newsletter, contact/help, foreign buyers, CGT, apartment VAT, market information and Buyer & Seller Assistance with related links. [34][34]
**Required dependencies.** LPW FAQ content; tax/legal statements are time-sensitive.

### Newsletter signup prompts and success-state copy — High
**Behavior.** Guide/news/events expose Subscribe prompt; FAQ describes email plus Submit; success-state copy/Close exists in markup; no signup. [7][7]
**Required dependencies.** LPW newsletter capture and email delivery; provider/consent/double opt-in undisclosed.

### Property-show event landing page — High
**Behavior.** Events page describes Lanka Property Show, participants, dates/venue and currently ended 2026 status. [35][35]
**Required dependencies.** LPW event CMS and time-dependent partner/venue information.

### Event agenda and session detail links — High
**Behavior.** Investment Forum grouped by 2026/2025/2023 with session dates/times/descriptions and Learn More links. [35][35]
**Required dependencies.** LPW event schedule and detail pages.

### Past-event archive and gallery navigation — High
**Behavior.** Gallery labels 1/8–8/8 with arrows; past events link 2025, 2023, 2020, 2019, 2018 and 2017. [35][35]
**Required dependencies.** LPW-hosted gallery assets and event archive.

### Event FAQ and attendance/investment information — High
**Behavior.** Archived FAQ covers registration, fee, discounts, developer contact, reservation changes, delivery clauses and guaranteed-rental arrangements; not universal current policy. [35][35]
**Required dependencies.** Event-specific LPW policy and individual developer terms.

### Social and external distribution links for content — High
**Behavior.** News/guide/events link Facebook, X/Twitter, Instagram, LinkedIn, Pinterest, YouTube, TikTok and app stores. [7][7]
**Required dependencies.** Third-party social networks/app stores.

## Accounts, alerts, seeker support, safety, privacy and platform controls

### Login entry and social sign-in — High
**Behavior.** Account entry exposes Facebook/Google, Email/Username, login and Register Here; CAPTCHA blocked full gated inspection. [36][36], [34][34]
**Required dependencies.** LPW auth/session, cookies, Facebook/Google identity providers and CAPTCHA.

### Account registration — High
**Behavior.** FAQ documents Google/Facebook or name/email/password registration, role (agent/developer/house owner), country and T&C/newsletter consent; no submission. [34][34], [37][37]
**Required dependencies.** LPW account DB, activation email, OAuth, role/country data, consent and newsletter service.

### Password recovery — High
**Behavior.** FAQ documents email-based lost-password path; recovery page was CAPTCHA-blocked and no request made. [34][34], [38][38]
**Required dependencies.** LPW token/recovery service, email delivery, account email and CAPTCHA.

### Activation-email resend and troubleshooting — High
**Behavior.** FAQ documents resend activation key and copying full activation link/contacting support if it fails; no resend. [34][34], [39][39]
**Required dependencies.** Activation token store, email service and support.

### Favorites/watchlist — High
**Behavior.** Public pages expose star states and Manage favorite dashboard; persistence/auth requirement not tested. [1][1], [40][40], [41][41]
**Required dependencies.** LPW favorites service, account/session, cookies and listing IDs.

### Saved searches and cross-device search history — High
**Behavior.** Results expose Save Search and dashboard; homepage says registered users can retain search history across devices; dashboard behavior not verified. [40][40], [1][1]
**Required dependencies.** LPW account/dashboard DB, login/session and criteria/listing data.

### Criteria-based email alert entry — High
**Behavior.** Results expose Create E-Mail Alerts/login gate, instant-alert and latest-offer prompts; no alert created. [40][40], [41][41]
**Required dependencies.** Account, search criteria, LPW scheduler and email/mobile delivery.

### Curated email/mobile alerts and alert management — Medium-high
**Behavior.** Email Alert page lists Below Market Value, Trending Ads and Top Investment Properties; documented success state says Email/Mobile weekly delivery and Manage Alerts. [42][42]
**Required dependencies.** LPW alert service, dashboard and unnamed email/mobile channels.

### Alerts for newly posted wanted properties — High
**Behavior.** Wanted index exposes instant-alert and latest-offer prompts for matching buyer/tenant requests; delivery not verified. [43][43]
**Required dependencies.** Wanted index, scheduler and email/mobile delivery; likely account/contact data.

### Property-wanted request capability — Medium-high
**Behavior.** Wanted index says seekers can submit wanted ads for houses, apartments, rooms, land, annexes, commercial and investor services; actual form/fields not exposed. [43][43]
**Required dependencies.** LPW wanted-request module and likely account/contact/notification data.

### Public wanted-request listings and advertiser contact — High
**Behavior.** Wanted details show request, locations, service type, requirements, budget/advance, advertiser, telephone/WhatsApp and contact path; no contact sent. [44][44]
**Required dependencies.** Advertiser content, tel/WhatsApp and LPW wanted database.

### Direct advertiser enquiry and WhatsApp/phone contact — High
**Behavior.** Property details expose advertiser, phone reveal/call, tel/WhatsApp and enquiry form; LPW states users contact owner/agent directly. [41][41], [16][16]
**Required dependencies.** Advertiser contact data, telephone/WhatsApp and LPW enquiry backend.

### Request-a-call-back — High
**Behavior.** Detail page asks for phone number and Send action for advertiser callback; no number/request. [41][41]
**Required dependencies.** LPW callback backend, advertiser notification and telephone network.

### Report listing / scam or incorrect-ad workflow — High
**Behavior.** Property/wanted details expose Report AD reasons including unavailable, incorrect contact, unrealistic price, image mismatch, spam/scam and other; no report. [41][41], [44][44]
**Required dependencies.** LPW moderation/report backend, support staff and anti-spam controls.

### Safety warnings and marketplace boundary — High
**Behavior.** Details/terms warn LPW does not vet advertisers or mediate disputes, advise payment/contact precautions and place transaction responsibility on users. [41][41], [45][45]
**Required dependencies.** User due diligence, advertiser identity/payment data and LPW moderation/legal process.

### General support/contact channels — High
**Behavior.** Contact page exposes office, phone, email, Chat with Us and Feedback/Help Needed/Others form protected by reCAPTCHA; no message. [18][18]
**Required dependencies.** LPW support channels and Google reCAPTCHA.

### Site help, live assistant and buyer assistance references — High
**Behavior.** FAQ/footer and buying guide link contact/help, assistant chat and Buyer & Seller Assistance; live provider/fulfilment unverified. [34][34], [1][1], [7][7]
**Required dependencies.** LPW support/chat and possible external legal/valuation/advisory providers.

### Newsletter subscription and unsubscribe — High
**Behavior.** FAQ/footer expose email signup; privacy policy documents unsubscribe links or contactus@lankapropertyweb.com to stop emails; no signup. [34][34], [46][46]
**Required dependencies.** LPW email marketing service, user email and unsubscribe/support processing.

### About/company and non-agent positioning — High
**Behavior.** About page identifies LPW, operation since 2007 and direct owner/agent listing/contact model; LPW says it is not an estate agent/affiliate. [16][16]
**Required dependencies.** LPW site/app and listing database.

### Terms and conditions for seeker use — High
**Behavior.** Terms permit ad refusal/removal, disclaim control over truth/safety/legality, no dispute mediation and conditional disclosure to aggrieved parties/law enforcement. [45][45]
**Required dependencies.** LPW listing/account records, moderation/legal processes and user acceptance.

### Privacy, cookies, data access and deletion request — High
**Behavior.** Privacy policy covers cookies, ads, registration/subscription/contact/chat/usage data, unsubscribe and deletion requests via email, with stated 7-working-day handling where permitted. [47][47]
**Required dependencies.** Browser cookies, Google AdSense/third-party ads, LPW stores and support; external sites have separate policies.

### Language controls/content variants — High
**Behavior.** Buying guide exposes English/Sinhala/Tamil /si and /ta routes; site-wide persistence/completeness unverified. [7][7], [48][48], [49][49]
**Required dependencies.** LPW translated CMS routes.

### Currency display and conversion — High
**Behavior.** Property detail displays LKR plus eight converted currencies; loan calculator offers LKR/USD; rate refresh and universal selector behavior unverified. [41][41], [23][23]
**Required dependencies.** LPW conversion logic, exchange-rate data and calculator logic.

## Cross-cutting implementation cautions

- No sign-in, account creation, enquiry, callback, WhatsApp contact, subscription, share, filter submission, report, loan application, quote request, newsletter signup or other form submission was performed.
- CAPTCHA blocked some rendered/browser inspections; extracted official content and official linked pages are used, and hidden/dynamic controls are not inferred.
- Counts, prices, availability, tags, rates, page totals, event status, market values and featured content are dynamic snapshots, not fixed product requirements.
- Compare controls, sorting, brochure download, several gated workflows, calculation formulas, map/provider identity, delivery guarantees and provider fulfilment remain unverified wherever stated.
- External providers are named only where directly evidenced; otherwise dependencies are marked undisclosed or implied by visible controls.

## Official source references

[1]: https://www.lankapropertyweb.com/
[2]: https://www.lankapropertyweb.com/forsale-all-Commercial.html
[3]: https://www.lankapropertyweb.com/rentals/lease-all-Commercial.html
[4]: https://www.lankapropertyweb.com/land/index.php
[5]: https://www.lankapropertyweb.com/sale/property_details-5969051.html
[6]: https://www.lankapropertyweb.com/area/
[7]: https://www.lankapropertyweb.com/features/property-buying-guide/
[8]: https://www.lankapropertyweb.com/condo-directory/
[9]: https://www.lankapropertyweb.com/apartment-finder/
[10]: https://www.lankapropertyweb.com/property-news/lankapropertyweb-unveils-apartment-finder-a-game-changer-in-the-real-estate-market/
[11]: https://www.lankapropertyweb.com/featured-projects/marina-square
[12]: https://www.lankapropertyweb.com/housing-loan-comparison/
[13]: https://www.lankapropertyweb.com/agents/estate_agents.php?page=2&type=agents
[14]: https://www.lankapropertyweb.com/agents/estate_agents.php?page=3&type=agents&agent_type=land
[15]: https://www.lankapropertyweb.com/agents/space21-estate-agency-5782478
[16]: https://www.lankapropertyweb.com/aboutus.php
[17]: https://www.lankapropertyweb.com/buyers-sellers-assistance/
[18]: https://www.lankapropertyweb.com/contact-us/
[19]: https://idealhome.lk/professionals/solicitors
[20]: https://www.lankapropertyweb.com/features/taxes-for-landlords/
[21]: https://idealhome.lk/house-construction/contractors
[22]: https://idealhome.lk/house-construction/house-builders
[23]: https://www.lankapropertyweb.com/housing-loan-calculator/
[24]: https://www.lankapropertyweb.com/sale/property_details-5919050.html
[25]: https://www.lankapropertyweb.com/invest/roi-calculator/
[26]: https://www.lankapropertyweb.com/price-meter/
[27]: https://www.lankapropertyweb.com/house_prices.php
[28]: https://www.lankapropertyweb.com/MOR26/
[29]: https://www.lankapropertyweb.com/land-prices/
[30]: https://www.lankapropertyweb.com/market-insights/
[31]: https://mail.lankapropertyweb.com/details/popular-8-acres-colonial-estate-bunglaow-for-sale-5808838/
[32]: https://www.lankapropertyweb.com/property-news/
[33]: https://www.lankapropertyweb.com/features/rent-your-property/
[34]: https://www.lankapropertyweb.com/FAQs.php
[35]: https://www.lankapropertyweb.com/events/
[36]: https://www.lankapropertyweb.com/myaccountV2/login
[37]: https://www.lankapropertyweb.com/myaccount/regform.php
[38]: https://www.lankapropertyweb.com/myaccount/lostPasswords.php
[39]: https://www.lankapropertyweb.com/myaccount/resend_act_key.php
[40]: https://www.lankapropertyweb.com/sale/index.php?filter-result=show-invest
[41]: https://www.lankapropertyweb.com/sale/property_details-5974263.html
[42]: https://www.lankapropertyweb.com/email-alert/
[43]: https://www.lankapropertyweb.com/wanted/wanted.php
[44]: https://www.lankapropertyweb.com/wanted/wanted_details.php?prop=5852363
[45]: https://www.lankapropertyweb.com/termsandcond.php
[46]: https://www.lankapropertyweb.com/privacy-policy.php
[47]: https://www.lankapropertyweb.com/privacy-policy.php
[48]: https://www.lankapropertyweb.com/features/property-buying-guide/si
[49]: https://www.lankapropertyweb.com/features/property-buying-guide/ta

## Machine-readable companion

The complete structured inventory is available at [`lpw-features.json`](./lpw-features.json), with the same 114 features, confidence labels, dependencies and numbered source URLs.
