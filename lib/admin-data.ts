import { products as seedProducts,categories as seedCategories,type Product } from './catalog';
import { initialBanners,type Banner } from './banner-data';
export type Category={id:string;name:string;active:boolean;position:number};
export type OrderItem={slug:string;name:string;price:number;quantity:number};
export type Order={id:string;order_number:string;created_at:string;customer_name:string;email:string;phone:string;address:string;notes:string;status:'pending'|'confirmed'|'processing'|'shipped'|'delivered'|'cancelled';payment_status:'unpaid'|'paid'|'refunded';total:number;items:OrderItem[];source?:string};
export type StoreData={products:Product[];categories:Category[];banners:Banner[];orders:Order[]};
export const DEMO_KEY='prakruthi-admin-preview-v1';
export function initialStore():StoreData{return{products:seedProducts.map((p,i)=>({...p,id:p.slug,active:true,featured:[0,4,6,9].includes(i),stock:0,description:''})),categories:seedCategories.filter(c=>c!=='All products').map((name,i)=>({id:`category-${i}`,name,active:true,position:i})),banners:initialBanners.map((b,i)=>({...b,active:true,position:i})),orders:[]}}
export function readDemo():StoreData{try{const data=JSON.parse(localStorage.getItem(DEMO_KEY)||'null');if(data&&Array.isArray(data.products)&&Array.isArray(data.banners)&&Array.isArray(data.categories)&&Array.isArray(data.orders))return data}catch{}return initialStore()}
export function writeDemo(data:StoreData){localStorage.setItem(DEMO_KEY,JSON.stringify(data));window.dispatchEvent(new Event('prakruthi-catalog-changed'))}
export function demoPreviewEnabled(){return typeof window!=='undefined'&&sessionStorage.getItem('prakruthi-demo-preview')==='1'}
export function safeImage(url:string,allowDemo=false){return (allowDemo&&/^data:image\/(jpeg|png|webp|gif);base64,[a-zA-Z0-9+/=]+$/.test(url))|| url.startsWith('/images/')||/^https:\/\//i.test(url)}
export function safeLink(url:string){return /^\/(?!\/)/.test(url)||/^https:\/\//i.test(url)}
