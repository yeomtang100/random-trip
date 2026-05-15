import fs from 'fs';

// 1. Read Sigungu (Municipalities) mapping from the downloaded TopoJSON
const muniRawData = fs.readFileSync('C:\\Users\\promi\\.gemini\\antigravity\\brain\\5dd3eb5c-dbec-4deb-9091-032ff6d18e3f\\.system_generated\\steps\\295\\content.md', 'utf8');
const muniJsonStartIndex = muniRawData.indexOf('{"type":"Topology"');
const muniJsonData = JSON.parse(muniRawData.substring(muniJsonStartIndex));
const muniGeometries = muniJsonData.objects.skorea_municipalities_2018_geo.geometries;

const sigunguMap = {};
muniGeometries.forEach(g => {
    sigunguMap[g.properties.code] = g.properties.name;
});

// 2. Read the Sub-municipalities TopoJSON file
const subMuniRawData = fs.readFileSync('C:\\Users\\promi\\.gemini\\antigravity\\brain\\5dd3eb5c-dbec-4deb-9091-032ff6d18e3f\\.system_generated\\steps\\95\\content.md', 'utf8');
const subMuniJsonStartIndex = subMuniRawData.indexOf('{"type":"Topology"');
const subMuniJsonData = JSON.parse(subMuniRawData.substring(subMuniJsonStartIndex));
const subMuniGeometries = subMuniJsonData.objects.skorea_submunicipalities_2018_geo.geometries;

// Sido mapping
const sidoMap = {
    "11": "서울특별시", "21": "부산광역시", "22": "대구광역시", "23": "인천광역시", 
    "24": "광주광역시", "25": "대전광역시", "26": "울산광역시", "29": "세종특별자치시", 
    "31": "경기도", "32": "강원도", "33": "충청북도", "34": "충청남도", 
    "35": "전라북도", "36": "전라남도", "37": "경상북도", "38": "경상남도", "39": "제주특별자치도"
};

const islandSigunguCodes = ["23320", "23310", "37430", "36460", "36480", "36470", "38450", "39010", "39020"];

const districts = subMuniGeometries
    .map(g => {
        const code = g.properties.code;
        const name = g.properties.name;
        const sidoCode = code.substring(0, 2);
        const sigunguCode = code.substring(0, 5);
        
        const sido = sidoMap[sidoCode] || "기타";
        const sigungu = sigunguMap[sigunguCode] || "";
        
        let isIsland = islandSigunguCodes.includes(sigunguCode);
        if (name === "삼산면" && (sidoCode === "21" || sidoCode === "36")) isIsland = true;

        return {
            sido,
            sigungu,
            name,
            full: `${sido} ${sigungu} ${name}`,
            isIsland
        };
    });


fs.writeFileSync('src/districts.json', JSON.stringify(districts, null, 2));
console.log(`Saved ${districts.length} districts with accurate Sigungu names.`);
