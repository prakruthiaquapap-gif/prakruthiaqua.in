import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const localJava=path.join(root,'.android-toolchain/java/Contents/Home');
const localSdk=path.join(root,'.android-toolchain/sdk');
const env={...process.env};
if(!env.JAVA_HOME&&fs.existsSync(localJava))env.JAVA_HOME=localJava;
if(!env.ANDROID_HOME&&fs.existsSync(localSdk))env.ANDROID_HOME=localSdk;
if(!env.GRADLE_USER_HOME)env.GRADLE_USER_HOME=path.join(root,'.android-gradle');
if(!env.ANDROID_USER_HOME)env.ANDROID_USER_HOME=path.join(root,'.android-toolchain/android-user-home');
fs.mkdirSync(env.ANDROID_USER_HOME,{recursive:true});
function run(command,args,cwd=root){const r=spawnSync(command,args,{cwd,env,stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1)}
run('node',['scripts/android-assets.mjs']);
run('npx',['cap','sync','android']);
run('./gradlew',['assembleDebug','--no-daemon'],path.join(root,'android'));
fs.mkdirSync('output/android',{recursive:true});
fs.copyFileSync('android/app/build/outputs/apk/debug/app-debug.apk','output/android/Prakruthi-Aqua-debug.apk');
console.log('APK: '+path.join(root,'output/android/Prakruthi-Aqua-debug.apk'));
