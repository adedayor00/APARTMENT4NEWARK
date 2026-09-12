/* apartments4newark.com — data
   Listings, city words, fees/disclaimers, and required-field maps.
   Swap LISTINGS for a live fetch from Airtable/Google Sheet in production —
   see README "Recommended stack". */

// Business phone. WhatsApp, Telegram (phone-based link — swap for a
// t.me/<username> link in CONFIG.telegramUsername if Adam has one) and SMS
// all resolve to the same number.
const CONFIG = {
  phone: '8626000056',
  phoneDisplay: '(862) 600-0056',
  telegramUsername: null, // e.g. 'apartments4newark' — ask Adam
};

const LISTINGS = [
  { id: 'garside', type: 'room', address: 'Garside St', unit: '', city: 'Newark', area: 'North Newark', beds: 3, baths: '2', open: 1, price: 800, moveIn: 'Available now', deposit: 'Ask', features: [] },
  { id: 's15th', type: 'room', address: 'South 15th St', unit: '', city: 'Newark', area: 'West Ward', beds: 3, baths: '1', open: 1, price: 700, moveIn: 'Available now', deposit: 'Ask', features: ['PSE&G (gas and electric) included', 'Internet included'] },
  { id: 'eorange', type: 'room', address: 'East Orange', unit: '', city: 'East Orange', area: 'East Orange', beds: 3, baths: '1', open: 1, price: 600, moveIn: 'End of June', deposit: 'Ask', features: [] },
  { id: 's20th', type: 'room', address: 'South 20th St', unit: '', city: 'Newark', area: 'West Ward', beds: 3, baths: '1', open: 1, price: 600, moveIn: 'Available now', deposit: '$200', features: ['Big room'] },
  { id: 'roseville', type: 'apartment', address: '196 Roseville Ave', unit: 'Apt 46', city: 'Newark', area: 'North Newark', beds: 2, baths: '1', open: 2, price: 1825, moveIn: 'Available now', deposit: 'Ask', features: ['Heat and hot water included', 'Parking available'] },
  { id: 'johnson', type: 'apartment', address: '169 Johnson Ave', unit: 'Apt 2', city: 'Newark', area: 'Newark', beds: 3, baths: '2', open: 3, price: 2400, moveIn: 'Available now', deposit: 'Ask', features: ['Washer/dryer hookup'] },
  { id: 'irvine', type: 'apartment', address: '493–495 Irvine Turner Blvd', unit: 'Apt 4', city: 'Newark', area: 'Newark', beds: 3, baths: '1.5', open: 3, price: 2295, moveIn: 'Available now', deposit: 'Ask', features: ['Air conditioning', 'Parking', 'Security cameras'] },
  { id: 'tillinghast', type: 'apartment', address: '38 Tillinghast St', unit: 'Apt 3R', city: 'Newark', area: 'Newark', beds: 3, baths: '2', open: 3, price: 2150, moveIn: 'Available now', deposit: 'Ask', features: [] },
  { id: 'sorange', type: 'apartment', address: '1034 S Orange Ave', unit: 'Apt GF', city: 'Newark', area: 'Newark', beds: 3, baths: '1.5', open: 3, price: 2050, moveIn: 'Available now', deposit: 'Ask', features: ['Ground floor'] },
  { id: 'chadwick', type: 'apartment', address: '142 Chadwick Ave', unit: 'Apt 2', city: 'Newark', area: 'South Ward', beds: 3, baths: '2', open: 3, price: 2350, moveIn: 'Available now', deposit: 'Ask', features: [] },
  { id: 'boyden', type: 'apartment', address: '239 Boyden Ave', unit: 'Apt 2 · townhouse', city: 'Maplewood', area: 'Maplewood', beds: 3, baths: '2.5', open: 3, price: 4800, moveIn: 'Available now', deposit: 'Ask', features: ['Laundry hookup', 'Garage', 'Parking', 'Very clean building'] }
];

const CITY_WORDS = [
  { match: ['newark'], city: 'Newark' },
  { match: ['east orange', 'eastorange'], city: 'East Orange' },
  { match: ['maplewood'], city: 'Maplewood' }
];

const TERMS = [
  { n: '01', t: 'Looking is free', b: 'You pay nothing to browse, nothing to ask questions and nothing to tour a unit. There is no application fee and no broker fee. If anyone asks you for money simply to see an apartment, it is not us.' },
  { n: '02', t: 'The $75 background check, and when it happens', b: 'One fee exists: $75 for a background and screening check, and it is the last step rather than the first. You choose the unit, you tour it, you satisfy yourself that it is right — only then do we run the check. Every household deserves to know who is moving in next door, which is the only reason we run it at all. It covers identity, credit, eviction history and criminal record, it is charged once per adult applicant, and once run the fee is non-refundable because the cost is already spent.' },
  { n: '03', t: 'Agency fee — to be confirmed', b: 'Where an agency fee applies to a unit, the amount is set per property and is quoted to you in writing before you apply. It is not payable at the enquiry stage and never payable to view. Current status: TBD — ask us for the figure on the unit you are interested in and we will put it in writing.' },
  { n: '04', t: 'Paying the fee is not the same as getting the apartment', b: 'A completed check is not an approval and not a reservation. The landlord makes the final decision on every application, and a unit can go to someone who applied earlier. We will tell you straight away if that happens and put you first on the next matching unit.' },
  { n: '05', t: 'Prices and availability move', b: 'Rent, deposit, move-in dates and the number of rooms open are accurate when posted and can change without notice until a lease is signed. A listing on this site is information, not a binding offer.' },
  { n: '06', t: 'The landlord sets the terms', b: 'Rent, security deposit, lease length, pet and smoking rules, parking and utility arrangements are set by the owner of each property. We pass them on as given to us. Anything that matters to you should be confirmed in the written lease before you sign.' },
  { n: '07', t: 'What is in the lease is what counts', b: 'Descriptions, room counts, features and anything said in a chat are a summary for your convenience. The signed lease and any written addendum are the agreement between you and the landlord, and they override anything on this site.' },
  { n: '08', t: 'See it before you commit', b: 'We expect you to tour the unit, or have someone you trust tour it, before you pay anything or sign anything. Photos and floor plans are representative of the unit and may show a similar room in the same building.' },
  { n: '09', t: 'Equal housing', b: 'We do business in accordance with federal, New Jersey and local fair housing law. We do not refuse, steer or set different terms on the basis of race, colour, national origin, religion, sex, sexual orientation, gender identity, familial status, disability, source of lawful income or any other protected characteristic.' },
  { n: '10', t: 'Shared apartments are shared with strangers', b: 'For a room in an occupied apartment we tell you what we know about the household and keep names private until both sides agree to move forward. We do not vouch for anyone’s habits, personality or conduct, and a screening check is not a character reference. Meet the household first.' },
  { n: '11', t: 'How to pay, and how not to', b: 'Deposits and rent are paid to the landlord or the named management company by the method stated in your lease, and you always get a receipt. We never ask for cash couriers, gift cards, wire transfers to a personal account, cryptocurrency or payment to hold a unit sight unseen. Treat any such request as fraud and tell us.' },
  { n: '12', t: 'Your information', b: 'The details you send on the form are used to match you to units and are shared only with the landlord and the screening provider for the property you choose. We do not sell them. Ask us and we will delete your enquiry.' },
  { n: '13', t: 'Messaging us', b: 'WhatsApp, Telegram and SMS are provided by third parties on their own terms, and your carrier may charge for messages. We reply during business hours; a message is not a reservation until we confirm it.' },
  { n: '14', t: 'Third-party listings', b: 'Some units are marketed on behalf of independent owners and managers. Where we are not the owner we act as a marketing and coordination service, and we are not responsible for a landlord’s conduct, maintenance or the condition of a property beyond what we state in writing.' },
  { n: '15', t: 'Getting things wrong', b: 'Listings are maintained by hand and mistakes happen. If you spot an error, tell us and we will correct it. Where a stated price or feature turns out to be wrong, the correct information applies and you are free to walk away with nothing owed.' }
];

const REQ = { name: 'your name', age: 'your age', phone: 'a phone number', email: 'an email', location: 'a location', budget: 'a budget', rooms: 'how much space you need', moveIn: 'a move-in date', employment: 'your employment' };
const RREQ = { name: 'your name', age: 'your age', phone: 'a phone number', email: 'an email', work: 'what you do', address: 'the address', city: 'the city or town', beds: 'the number of bedrooms', baths: 'the number of bathrooms', rent: 'the rent for the room', from: 'the date the room is free', permission: 'confirmation that you are allowed to take a roommate' };
const LREQ = { name: 'your name', phone: 'a phone number', email: 'an email', role: 'your relationship to the property', kind: 'what you are listing', address: 'the street address', city: 'the city or town', beds: 'the number of bedrooms', baths: 'the number of bathrooms', rent: 'the monthly rent', from: 'the date it is available', permission: 'confirmation that you are allowed to rent or sublet it' };
