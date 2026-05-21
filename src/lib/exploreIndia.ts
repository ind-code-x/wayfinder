export interface ExplorePlace {
  id: string;
  name: string;
  state: string;
  category: 'Temple' | 'Hill Station' | 'City' | 'Beach' | 'Heritage' | 'Nature';
  imageUrl: string;
  summary: string;
  bestFor: string;
  searchFrom: string;
  searchTo: string;
}

export const EXPLORE_FALLBACK_IMAGE = 'https://commons.wikimedia.org/wiki/Special:Redirect/file/India%20gate%20new%20delhi.jpg?width=900';

export const EXPLORE_PLACES: ExplorePlace[] = [
  {
    id: 'varanasi',
    name: 'Varanasi',
    state: 'Uttar Pradesh',
    category: 'Temple',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Janki_ghat_Varanasi_at_sunset.JPG?width=900',
    summary: 'Ancient ghats, temple lanes, Ganga aarti, and one of India’s strongest spiritual travel experiences.',
    bestFor: 'Spiritual trips and heritage walks',
    searchFrom: 'Hyderabad, India',
    searchTo: 'Varanasi, India',
  },
  {
    id: 'tirupati',
    name: 'Tirupati',
    state: 'Andhra Pradesh',
    category: 'Temple',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Tirumala_temple.JPG?width=900',
    summary: 'A major pilgrimage base for Sri Venkateswara Temple with strong rail, road, and flight connectivity.',
    bestFor: 'Pilgrimage planning',
    searchFrom: 'Hyderabad, India',
    searchTo: 'Tirupati, India',
  },
  {
    id: 'rameswaram',
    name: 'Rameswaram',
    state: 'Tamil Nadu',
    category: 'Temple',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Ramanathaswamy_Temple_corridor_03.jpg?width=900',
    summary: 'A coastal temple town known for Ramanathaswamy Temple, sea views, and the Pamban bridge approach.',
    bestFor: 'Temple and coastal routes',
    searchFrom: 'Chennai, India',
    searchTo: 'Rameswaram, India',
  },
  {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    category: 'Hill Station',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Cityscape_of_Shimla.jpg?width=900',
    summary: 'Cedar forests, Mall Road, Jakhoo Hill, and the famous Kalka-Shimla mountain railway experience.',
    bestFor: 'Summer hill station breaks',
    searchFrom: 'Delhi, India',
    searchTo: 'Shimla, India',
  },
  {
    id: 'ooty',
    name: 'Ooty',
    state: 'Tamil Nadu',
    category: 'Hill Station',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/The_ooty_lake.jpg?width=900',
    summary: 'Nilgiri scenery, lake views, gardens, tea country, and mountain railway routes from the plains.',
    bestFor: 'Cool-weather family trips',
    searchFrom: 'Bengaluru, India',
    searchTo: 'Ooty, India',
  },
  {
    id: 'munnar',
    name: 'Munnar',
    state: 'Kerala',
    category: 'Hill Station',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Munnar_hillstation_kerala.jpg?width=900',
    summary: 'Tea estates, high-range viewpoints, waterfalls, and winding road trips through Kerala’s hills.',
    bestFor: 'Tea gardens and scenic drives',
    searchFrom: 'Kochi, India',
    searchTo: 'Munnar, India',
  },
  {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    category: 'City',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hawa_Mahal_2011.jpg?width=900',
    summary: 'Palaces, forts, bazaars, and one of India’s most accessible heritage city circuits.',
    bestFor: 'Weekend heritage trips',
    searchFrom: 'Delhi, India',
    searchTo: 'Jaipur, India',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    category: 'City',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Gateway%20of%20India-Mumbai-Maharashtra-DSC%200174.jpg?width=900',
    summary: 'Gateway of India, marine drives, food, theatre, and India’s busiest business travel corridor.',
    bestFor: 'Urban culture and business travel',
    searchFrom: 'Delhi, India',
    searchTo: 'Mumbai, India',
  },
  {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    category: 'Beach',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Vagator_Beach_-_Goa.jpg?width=900',
    summary: 'Beaches, churches, temples, food, music, and short flights from major Indian cities.',
    bestFor: 'Beach holidays',
    searchFrom: 'Hyderabad, India',
    searchTo: 'Goa, India',
  },
  {
    id: 'hampi',
    name: 'Hampi',
    state: 'Karnataka',
    category: 'Heritage',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Hampi_stone_chariot.jpg?width=900',
    summary: 'A dramatic heritage landscape of ruins, boulders, temples, and Tungabhadra river views.',
    bestFor: 'History and photography',
    searchFrom: 'Bengaluru, India',
    searchTo: 'Hampi, India',
  },
  {
    id: 'kaziranga',
    name: 'Kaziranga',
    state: 'Assam',
    category: 'Nature',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Kaziranga_Rhinoceros.jpg?width=900',
    summary: 'Wildlife safaris, grasslands, wetlands, and one of India’s most famous national park trips.',
    bestFor: 'Wildlife and nature',
    searchFrom: 'Kolkata, India',
    searchTo: 'Kaziranga National Park, India',
  },
  {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    category: 'Heritage',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:Redirect/file/Udaipur_City_Palace,_Udaipur_India.jpg?width=900',
    summary: 'Lake views, palaces, old-city streets, and romantic Rajasthan itineraries.',
    bestFor: 'Palace stays and lake views',
    searchFrom: 'Mumbai, India',
    searchTo: 'Udaipur, India',
  },
];

export function getDailyExplorePlaces(date = new Date()): ExplorePlace[] {
  const daySeed = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return [...EXPLORE_PLACES]
    .map((place, index) => ({ place, score: (index * 37 + daySeed) % EXPLORE_PLACES.length }))
    .sort((a, b) => a.score - b.score)
    .map(({ place }) => place);
}
