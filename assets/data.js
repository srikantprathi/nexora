/* Nexora — product catalogue + copy. Plain JS, attached to window. */
(function () {
  const IMG = 'assets/images/';

  const PRODUCTS = [
    {
      id: 'halo',
      name: 'Halo',
      category: 'Bedside Clock',
      price: 79,
      tagline: 'Wake to light, not to your phone.',
      hero: IMG + 'alarm-clock-1.png',
      gallery: [IMG + 'alarm-clock-1.png', IMG + 'alarm-clock-2.png', IMG + 'alarm-clock-3.png', IMG + 'alarm-clock-4.png'],
      problem: 'Your alarm is your phone — so the first thing you touch every morning is a feed, not the day.',
      solution: 'A silent bedside clock with a sunrise wake light. You wake to a slow glow instead of a buzz, and the phone finally stays in another room.',
      hotspots: [
        { x: 50, y: 40, title: 'Sunrise wake light', body: 'Brightens over 30 minutes so you stir gently, not all at once.' },
        { x: 70, y: 64, title: 'Auto-dimming face', body: 'A light sensor reads the room — bright by day, barely-there at night.' },
        { x: 44, y: 22, title: 'Top-dial snooze', body: 'Tap the whole top. No hunting for a button in the dark.' }
      ],
      specs: ['Silent sweep movement', 'No blue light', 'USB-C, 6-month battery backup'],
    },
    {
      id: 'flow',
      name: 'Flow',
      category: 'Carry Bottle',
      price: 38,
      tagline: 'Clip it on. Never set it down.',
      hero: IMG + 'bottle-1.png',
      gallery: [IMG + 'bottle-1.png', IMG + 'bottle-2.png', IMG + 'bottle-3.png', IMG + 'bottle-4.png'],
      problem: 'Bottles slip out of full hands, and no bag ever has a spare clip when you need one.',
      solution: 'A silicone carry loop is moulded straight into the cap. Hook it on a bag, a finger, a stroller — your hands stay free and the bottle comes along.',
      hotspots: [
        { x: 62, y: 26, title: 'Integrated carry loop', body: 'One moulded piece. Holds 30× the full bottle\u2019s weight without fatigue.' },
        { x: 58, y: 18, title: 'One-flip leakproof cap', body: 'Opens with a thumb, seals with a click. Tested for 10,000 flips.' },
        { x: 46, y: 60, title: 'BPA-free Tritan', body: 'Crystal clarity, dishwasher safe, won\u2019t cloud or hold odours.' }
      ],
      specs: ['600 ml capacity', 'Dishwasher safe', 'Fits standard cup holders'],
    },
    {
      id: 'marque',
      name: 'Marque',
      category: 'Line Bookmark',
      price: 22,
      tagline: 'Find your page. And your exact line.',
      hero: IMG + 'bookmark-1.png',
      gallery: [IMG + 'bookmark-1.png', IMG + 'bookmark-2.png', IMG + 'bookmark-3.png', IMG + 'bookmark-4.png'],
      problem: 'You find the page again — but never the line you actually stopped on. So you re-read, or you lose the thread.',
      solution: 'A brass slider rides a centre channel. Nudge it down as you read; next time you open straight to the sentence you left mid-thought.',
      hotspots: [
        { x: 52, y: 50, title: 'Brass line-marker', body: 'Glides smoothly, then holds its place — even upside down in a bag.' },
        { x: 30, y: 30, title: 'Closes inside the book', body: 'Slim enough to shut the cover on. No dog-ears, no creasing.' },
        { x: 70, y: 72, title: 'Vegan suede body', body: 'Soft-touch, won\u2019t scratch pages, ages beautifully.' }
      ],
      specs: ['Solid machined brass', 'Fits books up to 220mm', 'Vegan suede'],
    },
    {
      id: 'terra',
      name: 'Terra',
      category: 'Cork Belt',
      price: 54,
      tagline: 'Leather\u2019s look. None of its weight.',
      hero: IMG + 'belt-1.png',
      gallery: [IMG + 'belt-1.png', IMG + 'belt-2.png', IMG + 'belt-3.png', IMG + 'belt-4.png'],
      problem: 'Leather belts crack and stretch, plastic ones look cheap, and both eventually give up their shape.',
      solution: 'Natural cork leather — lighter than hide, naturally water-resistant, and it holds its form for years. The grain on every belt is one of a kind.',
      hotspots: [
        { x: 40, y: 52, title: 'Trim-to-fit', body: 'No fixed holes. Cut it once to your exact waist, finish the edge clean.' },
        { x: 64, y: 46, title: 'Slide buckle', body: 'Micro-adjust to any notch. Brushed alloy, won\u2019t tarnish.' },
        { x: 22, y: 58, title: 'Water-resistant cork', body: 'Wipes clean, shrugs off rain, fully vegan.' }
      ],
      specs: ['Natural cork leather', 'Trim to size', 'Vegan & water-resistant'],
    },
    {
      id: 'nimbus',
      name: 'Nimbus',
      category: 'Quick-Dry Umbrella',
      price: 46,
      tagline: 'Goes in soaked. Comes out dry.',
      hero: IMG + 'Umbrella-2.png',
      gallery: [IMG + 'Umbrella-2.png', IMG + 'Umbrella-3.png', IMG + 'Umbrella-4.png', IMG + 'Umbrella-5.png'],
      problem: 'A wet umbrella soaks your bag and everything in it the moment the rain stops.',
      solution: 'It ships with a microfibre quick-dry sleeve that wicks every drop. Slide the umbrella in dripping, pull it out dry — your bag never gets the memo.',
      hotspots: [
        { x: 60, y: 56, title: 'Quick-dry sleeve', body: 'Absorbent microfibre lining locks water away from your bag.' },
        { x: 30, y: 40, title: 'Auto open / close', body: 'One button, both directions. Up before you\u2019re out the door.' },
        { x: 46, y: 24, title: 'Folds to 9 inches', body: 'Windproof ribbed canopy that still tucks into any bag.' }
      ],
      specs: ['Auto open/close', 'Windproof ribs', 'Folds to 9 inches'],
    },
  ];

  const BUNDLE = {
    id: 'daily-five',
    name: 'The Daily Five',
    sublabel: 'Complete your daily setup',
    items: ['halo', 'flow', 'marque', 'terra', 'nimbus'],
    saving: 30,
  };

  const REVIEWS = [
    { quote: 'I didn\u2019t know I needed the line bookmark until I used it for a week. Now I can\u2019t read without it.', name: 'Dana R.', product: 'Marque', city: 'Portland' },
    { quote: 'The bottle loop sounds like a gimmick until your hands are full and it just hangs there. Genuinely changed my commute.', name: 'Marcus L.', product: 'Flow', city: 'Chicago' },
    { quote: 'First clock that got my phone out of the bedroom. The light wake is the real thing.', name: 'Priya S.', product: 'Halo', city: 'Austin' },
    { quote: 'Slid the umbrella in soaking wet, pulled it out dry at the office. My tote thanks me.', name: 'Elif K.', product: 'Nimbus', city: 'Seattle' },
    { quote: 'The cork belt is so light I forget I\u2019m wearing it, and it has not stretched an inch in eight months.', name: 'Tomás V.', product: 'Terra', city: 'Brooklyn' },
  ];

  const TRUST = [
    { icon: 'ri-shield-check-line', title: '2-year warranty', body: 'Every essential, fully covered.' },
    { icon: 'ri-leaf-line', title: 'Considered materials', body: 'Cork, Tritan, brass, recycled microfibre.' },
    { icon: 'ri-truck-line', title: 'Free 2-day shipping', body: 'On every order, no minimum.' },
    { icon: 'ri-arrow-go-back-line', title: '60-day returns', body: 'Use it daily. Send it back if it isn\u2019t for you.' },
  ];

  window.NEXORA_DATA = { PRODUCTS, BUNDLE, REVIEWS, TRUST };
})();
