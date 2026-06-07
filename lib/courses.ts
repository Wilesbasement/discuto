import rawCourses from "./courses-data.json";
export type Course={id:string;name:string;city?:string;state?:string;zip?:string;holeCount?:number;rating?:number|string;latitude?:number;longitude?:number}
const courses=(rawCourses as Course[]).filter(c=>c.id&&c.name);
export async function getCourses(query?:string){const q=query?.trim().toLowerCase(); const list=q?courses.filter(c=>[c.name,c.city,c.state,c.zip].filter(Boolean).join(" ").toLowerCase().includes(q)):courses; return list.slice(0,150)}
export async function getCourseById(id:string){return courses.find(c=>c.id===id)||null}
