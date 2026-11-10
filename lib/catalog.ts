import data from './products.json';
export type Product = {id?:string;slug:string;name:string;price:number;image:string;url:string;category:string;description?:string;active?:boolean;featured?:boolean;stock?:number};
export const products:Product[] = data;
export const productHref=(p:Product)=>`/product/?id=${encodeURIComponent(p.slug)}`;
export const categories = ['All products', 'Fish foods', 'Plant fertilizers', 'Fish medicines', 'Aquarium cleaners', 'Bird foods'];
export const money = (n: number) => new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',maximumFractionDigits:2}).format(n);
export function description(p: Product) { if(p.description)return p.description;return `Explore ${p.name} from Prakruthi Aqua’s ${p.category.toLowerCase()} collection. Find available sizes, current stock and detailed product directions in our official shop.`; }
