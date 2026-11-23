import fs from 'node:fs/promises';
import sharp from 'sharp';
const icon = (await fs.readFile('public/images/prakruthi-icon.svg')).toString('base64');
const svg = (background, inset) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${background ? `<rect width="1024" height="1024" fill="${background}"/>` : ''}<image href="data:image/svg+xml;base64,${icon}" x="${inset}" y="${inset}" width="${1024-inset*2}" height="${1024-inset*2}"/></svg>`;
const legacy=Buffer.from(svg('#f7f8ef',120));
const foreground=Buffer.from(svg('',245));
for(const [density,size] of [['mdpi',48],['hdpi',72],['xhdpi',96],['xxhdpi',144],['xxxhdpi',192]]) {
 const folder=`android/app/src/main/res/mipmap-${density}`;
 await fs.mkdir(folder,{recursive:true});
 for(const name of ['ic_launcher','ic_launcher_round']) await sharp(legacy).resize(size,size).png().toFile(`${folder}/${name}.png`);
 await sharp(foreground).resize(Math.round(size*108/48)).png().toFile(`${folder}/ic_launcher_foreground.png`);
}
await fs.mkdir('android/app/src/main/res/drawable-nodpi',{recursive:true});
await sharp(Buffer.from(svg('',100))).resize(256,256).png().toFile('android/app/src/main/res/drawable-nodpi/splash_logo.png');
console.log('Generated Prakruthi Aqua launcher and splash assets.');
