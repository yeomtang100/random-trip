import fs from 'fs';

const readmeContent = fs.readFileSync('C:\\Users\\promi\\.gemini\\antigravity\\brain\\5dd3eb5c-dbec-4deb-9091-032ff6d18e3f\\.system_generated\\steps\\219\\content.md', 'utf8');

// Match rows like: | `11110` | 종로구 | `JongnoGu` |
const regex = /\| `(\d+)` \| ([^|]+) \|/g;
let match;
const sigunguMap = {};
while ((match = regex.exec(readmeContent)) !== null) {
    sigunguMap[match[1]] = match[2].trim();
}

console.log("Map size:", Object.keys(sigunguMap).length);
console.log("Sample:", Object.entries(sigunguMap).slice(0, 5));

// Test with a known code from the README
console.log("Test 11110:", sigunguMap["11110"]);
