import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw, Compass, ExternalLink, Filter, Share2, Check, Car, Bus, Train, Loader2 } from 'lucide-react';

const SIDO_LIST = [
  "🚌🚗 울산 출발 2.5~3시간 이내 (섬 포함)", "전국 (섬 포함)", "부산광역시", "대구광역시", "대전광역시", "울산광역시", "세종특별자치시", 
  "강원도", "충청북도", "충청남도", 
  "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도",
  "🏝️ 섬 여행"
];

const DIRECT_PT_LIST = [
  "서울특별시", "부산광역시", "대구광역시", "대전광역시", "광주광역시", "세종특별자치시",
  "울산광역시", "경상남도", "경상북도",
  "전주시", "군산시", "익산시",
  "청주시", "충주시", "제천시", "천안시", "아산시",
  "원주시", "춘천시", "강릉시", "동해시", "삼척시", "속초시",
  "수원시", "성남시", "의정부시", "안양시", "부천시", "광명시", "평택시", "안산시", "고양시", "용인시", "이천시", "안성시", "화성시", "오산시"
];

// Seedable random function (Mulberry32)
function createSeededRandom(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function SlotColumn({ items, isSpinning, result, delay = 0 }) {
  const [displayItems, setDisplayItems] = useState([]);
  
  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        const randomItem = items[Math.floor(Math.random() * items.length)];
        setDisplayItems(prev => [randomItem, ...prev.slice(0, 3)]);
      }, 80);
      return () => clearInterval(interval);
    }
  }, [isSpinning, items]);

  return (
    <div className="slot-column">
      <AnimatePresence mode='popLayout'>
        {isSpinning ? (
          displayItems.map((item, idx) => (
            <motion.div
              key={`${item}-${idx}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 - (idx * 0.3) }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="slot-text"
            >
              {item}
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="slot-text final"
          >
            {result || "???"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  const [districtsData, setDistrictsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSido, setSelectedSido] = useState("🚌🚗 울산 출발 2.5~3시간 이내 (섬 포함)");
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [groupSeed, setGroupSeed] = useState(null);

  useEffect(() => {
    // Fetch districts data from public folder
    fetch('./districts.json')
      .then(res => res.json())
      .then(data => {
        setDistrictsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load districts data:", err);
        setLoading(false);
      });

    const params = new URLSearchParams(window.location.search);
    const group = params.get('group');
    if (group) {
      setGroupSeed(parseInt(group));
    }
  }, []);

  const filteredDistricts = (() => {
    if (!districtsData || districtsData.length === 0) return [];
    if (selectedSido === "전국 (섬 포함)") return districtsData;
    if (selectedSido === "🏝️ 섬 여행") return districtsData.filter(d => d.isIsland);
    if (selectedSido === "🚌🚗 울산 출발 2.5~3시간 이내 (섬 포함)") {
      // Precise 2.5-3 hour radius from Ulsan
      // 1. Gyeongsang region (All)
      // 2. Daejeon, Sejong (Core)
      // 3. Eastern Jeolla (Gwangyang, Gurye, Namwon, Muju, Jangsu)
      // 4. Southern Chungbuk (Cheongju, Bo-eun, Okcheon, Yeongdong)
      // 5. Southern Gangwon (Samcheok, Donghae)
      
      const coreSidos = ["울산광역시", "부산광역시", "대구광역시", "경상북도", "경상남도", "대전광역시", "세종특별자치시"];
      const nearbySigungus = [
        "광양시", "구례군", "남원시", "무주군", "장수군", // Jeolla Eastern
        "청주시", "보은군", "옥천군", "영동군", "충주시", "제천시", "단양군", // Chungbuk
        "삼척시", "동해시", "강릉시", "원주시", // Gangwon Southern/Coastal
        "제주시", "서귀포시" // Jeju (Air)
      ];

      return districtsData.filter(d => 
        coreSidos.includes(d.sido) || 
        nearbySigungus.some(city => d.sigungu.startsWith(city))
      );
    }
    return districtsData.filter(d => d.sido === selectedSido);
  })();

  const isUlsanMode = selectedSido === "🚌🚗 울산 출발 2.5~3시간 이내 (섬 포함)";

  const startSpin = () => {
    if (isSpinning) return;
    if (filteredDistricts.length === 0) {
      alert("해당 조건의 지역이 없습니다.");
      return;
    }
    
    setIsSpinning(true);
    setResult(null);
    
    setTimeout(() => {
      let finalResult;
      if (groupSeed) {
        const seededRandom = createSeededRandom(groupSeed);
        // We use a fixed iteration to ensure the same result for the same seed/filter combo
        const randomIndex = Math.floor(seededRandom() * filteredDistricts.length);
        finalResult = filteredDistricts[randomIndex];
      } else {
        finalResult = filteredDistricts[Math.floor(Math.random() * filteredDistricts.length)];
      }
      setResult(finalResult);
      setIsSpinning(false);
    }, 2000);
  };

  const createGroupLink = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    const url = new URL(window.location.href);
    url.searchParams.set('group', randomSeed);
    navigator.clipboard.writeText(url.toString()).then(() => {
      alert("👥 그룹 전용 링크가 복사되었습니다!\n이 링크를 친구들에게 보내고 다 같이 동시에 뽑아보세요!");
    });
  };


  const handleShare = () => {
    const shareText = `나의 랜덤 여행지는 [${result.full}]입니다! 🌏\n어디갈까? 에서 당신의 다음 여행지를 뽑아보세요!\n${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: '어디갈까? 랜덤 여행지 결과',
        text: shareText,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("결과가 클립보드에 복사되었습니다! 친구들에게 공유해 보세요.");
      });
    }
  };

  const getMapUrl = (item) => {
    return `https://map.kakao.com/?q=${encodeURIComponent(item.full)}`;
  };

  // Get unique lists for spinning animation
  const sidos = districtsData.length > 0 ? [...new Set(districtsData.map(d => d.sido))] : [];
  const sigungus = districtsData.length > 0 ? [...new Set(districtsData.map(d => d.sigungu))].filter(s => s !== "") : [];
  const names = districtsData.length > 0 ? [...new Set(districtsData.map(d => d.name))] : [];

  if (loading) {
    return (
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={40} color="#6366f1" />
        </motion.div>
        <div style={{ marginTop: '1rem', color: '#94a3b8' }}>데이터를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {groupSeed && (
          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginBottom: '0.5rem', fontWeight: 700 }}>
            👥 그룹 모드 활성화됨 (번호: #{groupSeed})
          </div>
        )}
        {isUlsanMode && (
          <div style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '0.5rem', fontWeight: 700 }}>
            🚌🚗 울산 출발 2.5~3시간 이내 (섬 포함) 모드 활성화됨
          </div>
        )}
        <div className="title">어디갈까?</div>
        <div className="subtitle">도, 시, 읍·면·동까지 아우르는 무작위 여행</div>
      </motion.div>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <Filter size={16} color="#94a3b8" />
        <select 
          value={selectedSido} 
          onChange={(e) => setSelectedSido(e.target.value)}
          disabled={isSpinning}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          {SIDO_LIST.map(sido => (
            <option key={sido} value={sido} style={{ background: '#1e293b' }}>{sido}</option>
          ))}
        </select>
      </div>

      <div className="slot-machine">
        <SlotColumn items={sidos} isSpinning={isSpinning} result={result?.sido} />
        <SlotColumn items={sigungus} isSpinning={isSpinning} result={result?.sigungu} delay={0.2} />
        <SlotColumn items={names} isSpinning={isSpinning} result={result?.name} delay={0.4} />
      </div>

      {result && !isSpinning && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="transport-badges"
        >
          {(result?.isIsland || 
            ["거제시", "남해군", "울릉군", "옹진군", "신안군", "완도군", "진도군"].includes(result?.sigungu) || 
            (["욕지면", "한산면", "사량면", "화정면", "동서동"].includes(result?.name) && ["통영시", "여수시", "사천시"].includes(result?.sigungu))) && (
            <div className="island-badge" style={{ marginBottom: 0 }}>
              🏝️ 섬 여행지
            </div>
          )}
          
          {(DIRECT_PT_LIST.includes(result.sido) || DIRECT_PT_LIST.some(city => result.sigungu.startsWith(city))) && (
            <div className="transport-badge active pt">
              <Bus size={14} /> 대중교통 가능
            </div>
          )}

          <div className="transport-badge active">
            <Car size={14} /> 자차 이동 가능
          </div>
        </motion.div>
      )}

      <div style={{ margin: '2rem 0' }}>
        {!result && !isSpinning && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <button className="btn-primary" onClick={startSpin}>
              <Compass size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              여행지 뽑기
            </button>
            {!groupSeed && (
              <button className="btn-secondary" onClick={createGroupLink} style={{ margin: 0 }}>
                친구들과 같이 뽑기 (링크 생성)
              </button>
            )}
          </div>
        )}


        {isSpinning && (
          <button className="btn-primary" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
            지역을 찾는 중<span className="loading-dots"></span>
          </button>
        )}

        {result && !isSpinning && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button className="btn-primary" onClick={startSpin}>
              <RefreshCw size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
              다시 뽑기
            </button>
            
            <div className="guide-section">
              <div className="guide-title">📍 {result.name} 여행 가이드</div>
              <div className="guide-buttons">
                <a 
                  href={`https://search.naver.com/search.naver?query=${encodeURIComponent(result.full + ' 가볼만한곳')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="guide-btn naver"
                >
                  <Compass size={16} /> 네이버 리뷰
                </a>
                <a 
                  href={`https://www.instagram.com/explore/tags/${encodeURIComponent(result.name.replace(/\s+/g, ''))}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="guide-btn insta"
                >
                  <ExternalLink size={16} /> 인스타 핫플
                </a>
                <a 
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(result.full)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="guide-btn map"
                >
                  <MapPin size={16} /> 네이버 지도에서 보기
                </a>
                <button 
                  onClick={handleShare}
                  className="guide-btn share"
                >
                  <Share2 size={16} /> 결과 공유하기
                </button>
              </div>
            </div>
          </motion.div>
        )}


      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: '#475569' }}>
        총 {filteredDistricts.length.toLocaleString()}개의 읍·면·동 및 섬 지역 중에서 무작위로 선택합니다.
      </div>
    </div>
  );
}


export default App;
