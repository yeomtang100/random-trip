import fs from 'fs';

const readmeContent = fs.readFileSync('C:\\Users\\promi\\.gemini\\antigravity\\brain\\5dd3eb5c-dbec-4deb-9091-032ff6d18e3f\\.system_generated\\steps\\219\\content.md', 'utf8');
const sigunguMap = {};
const regex = /\| `(\d+)` \| ([^|]+) \|/g;
let match;
while ((match = regex.exec(readmeContent)) !== null) {
    sigunguMap[match[1]] = match[2].trim();
}

const rawData = fs.readFileSync('C:\\Users\\promi\\.gemini\\antigravity\\brain\\5dd3eb5c-dbec-4deb-9091-032ff6d18e3f\\.system_generated\\steps\\95\\content.md', 'utf8');
const jsonStartIndex = rawData.indexOf('{"type":"Topology"');
const jsonData = JSON.parse(rawData.substring(jsonStartIndex));
const geometries = jsonData.objects.skorea_submunicipalities_2018_geo.geometries;

const samples = geometries.slice(0, 10).map(g => g.properties.code);
console.log("TopoJSON codes sample:", samples);

const matches = geometries.filter(g => sigunguMap[g.properties.code.substring(0, 5)]).length;
console.log("Matches found:", matches, "out of", geometries.length);

const keys = Object.keys(sigunguMap);
console.log("Example sigunguMap keys:", keys.filter(k => k.length === 5).slice(0, 5));
