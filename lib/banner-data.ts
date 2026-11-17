export type Banner = {id:string;label:string;eyebrow:string;title:string;accent:string;description:string;image:string;alt:string;href:string;product:string;productName:string;productImage:string;mediaType?:'image'|'video';videoDesktop?:string;videoMobile?:string;active?:boolean;position?:number};

/** Bundled videos for the first two slides, used until the admin uploads replacements. */
export const DEFAULT_HERO_VIDEOS = [
  { desktop: '/videos/hero-desktop.mp4', mobile: '/videos/hero-mobile.mp4' },
  { desktop: '/videos/hero-extra.mp4', mobile: '/videos/hero-extra.mp4' },
];
/** 30 MB upload limit for hero videos. */
export const HERO_VIDEO_MAX_BYTES = 30 * 1024 * 1024;
export function safeVideo(url: string) { return url.startsWith('/videos/') || /^https:\/\//i.test(url); }

export type HeroClip = { desktop: string; mobile: string };
/** Whether a slide shows a video. Before the media-type column exists, the first two slides keep their videos. */
export function slideIsVideo(b: Banner, index: number) {
  return b.mediaType ? b.mediaType === 'video' : !!(b.videoDesktop || b.videoMobile) || index < DEFAULT_HERO_VIDEOS.length;
}
/** The video files for a slide (desktop and mobile fall back to each other), or null for an image slide. */
export function slideClip(b: Banner, index: number): HeroClip | null {
  if (!slideIsVideo(b, index)) return null;
  const fallback = DEFAULT_HERO_VIDEOS[index];
  const desktop = b.videoDesktop || b.videoMobile || fallback?.desktop || '';
  const mobile = b.videoMobile || b.videoDesktop || fallback?.mobile || '';
  return desktop || mobile ? { desktop: desktop || mobile, mobile: mobile || desktop } : null;
}
export const initialBanners:Banner[]=[
{id:'nutrition',label:'Fish nutrition',eyebrow:'NOURISH THEIR NATURE',title:'A world of colour.',accent:'A little more life.',description:'Discover pellets and freeze-dried favourites for the fish at the heart of your aquarium.',image:'/images/aquarium.jpg',alt:'Colourful fish swimming through a spacious aquarium',href:'/shop/?category=Fish%20foods',product:'carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR',productName:'Blood Worms',productImage:'/images/carnivorx-blood-worms-premium-nutrition-for-carnivorous-aquatic-life-7ngLtR.webp',mediaType:'video',videoDesktop:'/videos/hero-desktop.mp4',videoMobile:'/videos/hero-mobile.mp4'},
{id:'plants',label:'Plant care',eyebrow:'LET YOUR UNDERWATER GARDEN GROW',title:'Rooted in nature.',accent:'Ready to flourish.',description:'Explore plant nutrition and essentials for the beautiful underwater garden you’re growing.',image:'/images/plants.jpg',alt:'Lush green aquatic plants in an underwater garden',href:'/shop/?category=Plant%20fertilizers',product:'macro-nutrients-CEJJs9',productName:'Macro Nutrients',productImage:'/images/macro-nutrients-CEJJs9.webp',mediaType:'video',videoDesktop:'/videos/hero-extra.mp4',videoMobile:'/videos/hero-extra.mp4'},
{id:'water',label:'Water wellness',eyebrow:'CARE BEYOND THE SURFACE',title:'Find your balance.',accent:'See the beauty.',description:'Care for the water that connects your whole aquarium. Discover your everyday water essentials.',image:'/images/water.jpg',alt:'A peaceful underwater ecosystem',href:'/shop/?category=Aquarium%20cleaners',product:'water-conditioner-oTMjrX',productName:'Water Conditioner',productImage:'/images/water-conditioner-oTMjrX.webp',mediaType:'image',active:false},
{id:'wellbeing',label:'Fish wellbeing',eyebrow:'FOR THE LIFE YOU LOVE',title:'Small details.',accent:'Thoughtful care.',description:'Find fish care products and connect with our team for help choosing what’s right for your aquarium.',image:'/images/birds.jpg',alt:'Vibrant tropical fish swimming around aquarium coral',href:'/shop/?category=Fish%20medicines',product:'methylene-blue-z6OTqd',productName:'Methylene Blue',productImage:'/images/methylene-blue-z6OTqd.webp',mediaType:'image',active:false},
{id:'essentials',label:'Everyday essentials',eyebrow:'A LITTLE CARE. A WORLD OF LIFE.',title:'Your little world.',accent:'Our shared passion.',description:'From everyday nutrition to aquarium essentials, bring a little more care to the world you love.',image:'/images/aquarium-essentials.jpg',alt:'An orange goldfish with flowing fins against a dark background',href:'/shop/',product:'micro-pellets-5WjXzk',productName:'Micro Pellets',productImage:'/images/micro-pellets-5WjXzk.webp',mediaType:'image',active:false},
];
