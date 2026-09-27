import { GameEvent } from '../types/game';

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'yellow_river_flood',
    title: '黃河決堤氾濫',
    category: 'disaster',
    description: '夏秋之際暴雨連綿，大河兩岸決堤潰決數十處，泥流吞沒三郡良田，百姓流離失所，地方官庫倉廩皆被沖毀。',
    historicalContext: '治水乃立國之根本，稍有不慎即動搖天命社稷與天下人心。',
    choices: [
      {
        id: 'flood_open_granaries',
        text: '大開常平倉賑濟災民，並派欽差督辦救災',
        description: '立即撥發糧草與帑銀安撫流民，雖重創儲備，但能迅速穩定民心。',
        previewEffects: '糧食 -120, 國庫 -80, 穩定度 +15, 士氣 +10',
        effects: {
          food: -120,
          treasury: -80,
          stability: 15,
          morale: 10,
          population: -0.1,
          logMessage: '朝廷開倉賑濟、招撫流民，百姓感泣皇恩，地方動盪漸平。'
        }
      },
      {
        id: 'flood_conscript_labor',
        text: '大舉徵發十萬民伕，修築石堤疏浚故道',
        description: '以朝廷威權根治水患，雖短期民怨四起，但能使水利經久安瀾。',
        previewEffects: '國庫 -120, 穩定度 -10, 行政 +8, 軍械技術 +5',
        effects: {
          treasury: -120,
          stability: -10,
          administration: 8,
          technology: 5,
          population: -0.2,
          logMessage: '數萬民伕日夜挑土築壩，新石堤落成，大河河道徹底穩固。'
        }
      },
      {
        id: 'flood_leave_to_locals',
        text: '責令沿河鄉紳富戶自行救助，朝廷暫不發帑',
        description: '節省國庫存銀，但將導致流民群起怨懟，損害朝廷威信。',
        previewEffects: '國庫 -10, 穩定度 -25, 士氣 -15, 行政 -5',
        effects: {
          treasury: -10,
          stability: -25,
          morale: -15,
          administration: -5,
          population: -0.4,
          logMessage: '朝廷未予撥糧賑災，民間怨聲載道，盜賊流寇趁勢而起。'
        }
      }
    ]
  },
  {
    id: 'grand_autumn_harvest',
    title: '天下風調雨順大稔',
    category: 'economy',
    description: '歲稔年豐，九州大地風調雨順，各州郡麥穗金黃、稻穀飄香，各處官倉私廩堆積如山。',
    historicalContext: '天下大稔之年，既可充實軍實以備征伐，亦可輕徭薄賦涵養生息。',
    choices: [
      {
        id: 'harvest_stockpile',
        text: '悉數充入邊境軍倉，籌備出師遠征之資',
        description: '極大化糧餉儲備，為即將到來的擴張戰役提供萬全保障。',
        previewEffects: '糧食 +180, 軍力 +30k, 士氣 +10',
        effects: {
          food: 180,
          military: 30,
          morale: 10,
          logMessage: '千車糧餉順水路源源運抵邊防各要塞，三軍士氣倍增。'
        }
      },
      {
        id: 'harvest_tax_holiday',
        text: '普免天下田賦五成，與萬民休養生息',
        description: '贏得海內萬民愛戴，農戶提早嫁娶耕稼，戶口大幅滋生。',
        previewEffects: '糧食 +80, 人口 +0.5M, 穩定度 +20, 士氣 +15',
        effects: {
          food: 80,
          population: 0.5,
          stability: 20,
          morale: 15,
          logMessage: '聖天子施恩減賦，民氣歡騰，四方投奔歸附者不可勝數。'
        }
      },
      {
        id: 'harvest_commercial_conversion',
        text: '以平準之法發售官糧，換取現銀充實國庫',
        description: '將豐收糧產轉化為充裕的國庫現銀，靈活應對朝政開支。',
        previewEffects: '國庫 +160, 糧食 +60, 行政 +5',
        effects: {
          treasury: 160,
          food: 60,
          administration: 5,
          logMessage: '官府平準轉售餘糧，國庫歲入大增，錢糧調度裕如。'
        }
      }
    ]
  },
  {
    id: 'border_nomad_incursion',
    title: '邊境烽火游牧犯境',
    category: 'military',
    description: '塞外游牧驍騎數萬掩殺邊防哨卡，烽火連天，抄掠牛馬人口，邊關守將急發羽檄求援。',
    historicalContext: '外患臨近之際，主戰、主守、主和往往引發朝堂激烈爭執。',
    choices: [
      {
        id: 'nomad_crush_offensive',
        text: '派遣開國名將統率精銳鐵騎出塞迎敵',
        description: '以攻為守，痛擊外敵以彰顯大國軍威。',
        previewEffects: '國庫 -60, 糧食 -50, 軍力 +20k, 士氣 +15',
        effects: {
          treasury: -60,
          food: -50,
          military: 20,
          morale: 15,
          stability: 10,
          logMessage: '大將率精騎出關迎戰，大破敵軍前鋒，斬將搴旗凱旋而歸。'
        }
      },
      {
        id: 'nomad_fortify_garrisons',
        text: '緊閉要隘深溝高壘，以強弩長矛嚴密設防',
        description: '採取守勢以逸待勞，消耗敵軍補給，傷亡最小但需持續耗銀。',
        previewEffects: '國庫 -90, 行政 +10, 穩定度 +10',
        effects: {
          treasury: -90,
          administration: 10,
          stability: 10,
          morale: 5,
          logMessage: '邊塞堅壁清野、弩箭如雨，敵騎無隙可乘，無功遁退塞外。'
        }
      },
      {
        id: 'nomad_appease_trade',
        text: '開闢互市互通有無，遣使賜金絹議和',
        description: '以歲幣商貿暫弭兵戈，安撫強鄰以專注內政。',
        previewEffects: '國庫 -50, 糧食 -30, 穩定度 +15, 士氣 -10',
        effects: {
          treasury: -50,
          food: -30,
          stability: 15,
          morale: -10,
          logMessage: '邊關開設茶馬互市，雙方歃血暫息烽煙，邊境獲短暫寧謐。'
        }
      }
    ]
  },
  {
    id: 'court_corruption_scandal',
    title: '戶部巨蠹貪瀆大案',
    category: 'politics',
    description: '御史台秘密呈遞奏本，揭露戶部要員與鹽鐵官吏勾結，私吞數百萬貫稅銀，牽連滿朝權貴。',
    historicalContext: '整飭綱紀還是維持朝堂平衡，考驗君王的政治手腕與決心。',
    choices: [
      {
        id: 'purge_corrupt_officials',
        text: '雷霆徹查！將主犯抄家處斬，追繳全部贓銀',
        description: '重挫貪鄙官僚，充盈國庫，但會震動朝堂百官人心。',
        previewEffects: '國庫 +150, 行政 +15, 穩定度 -10, 士氣 +10',
        effects: {
          treasury: 150,
          administration: 15,
          stability: -10,
          morale: 10,
          logMessage: '天子震怒，巨蠹伏法抄沒家財，百官惕息，風氣肅然一新。'
        }
      },
      {
        id: 'reorganize_audit_bureau',
        text: '改組考功御史審計體系，從制度上根絕舞弊',
        description: '不以人命為威，著眼於建立現代化的官僚監督架構。',
        previewEffects: '國庫 -40, 行政 +25, 穩定度 +10, 軍械技術 +8',
        effects: {
          treasury: -40,
          administration: 25,
          stability: 10,
          technology: 8,
          logMessage: '設立專責審計法度，各州賦稅帳目明晰，官僚行政效能大躍升。'
        }
      },
      {
        id: 'quiet_amnesty_repayment',
        text: '法外施恩，限期全額補繳贓款即可免死革職',
        description: '低調追回帑銀，避免朝臣人人自危引發政局動盪。',
        previewEffects: '國庫 +80, 行政 -10, 穩定度 +10',
        effects: {
          treasury: 80,
          administration: -10,
          stability: 10,
          morale: -5,
          logMessage: '贓銀陸續補入國庫，政局平穩渡過，但法紀稍顯寬弛。'
        }
      }
    ]
  },
  {
    id: 'talented_hermit_scholar',
    title: '南陽高人山中隱士出山',
    category: 'character',
    description: '風聞深山草廬之中有隱居大賢，通曉兵法陣圖與水利農桑，具經天緯地之才，天下各勢力皆爭相招攬。',
    historicalContext: '得良相大將者得天下，求賢若渴自古為開國明君之特質。',
    choices: [
      {
        id: 'visit_in_person_three_times',
        text: '天子親自屈駕三顧草廬，以師徒之禮隆重延攬',
        description: '以至誠之心感動大賢，獲取其死心塌地的耿耿忠心。',
        previewEffects: '行政 +15, 士氣 +15, 穩定度 +10, 國庫 -30',
        effects: {
          administration: 15,
          morale: 15,
          stability: 10,
          treasury: -30,
          characterLoyaltyChange: 15,
          logMessage: '天子屈尊三顧，高士感念知遇之恩出山輔政，群臣敬服。'
        }
      },
      {
        id: 'offer_peerage_and_gold',
        text: '遣欽差賜千金車馬與侯爵之位相邀入朝',
        description: '以名利重爵延攬，迅速納入體系。',
        previewEffects: '國庫 -80, 行政 +10, 軍力 +10k',
        effects: {
          treasury: -80,
          administration: 10,
          military: 10,
          logMessage: '高士感於朝廷厚幣重賞，奉詔入京供職於樞密院。'
        }
      },
      {
        id: 'dismiss_as_pedant',
        text: '嗤之為山野腐儒，不予理會，專心倚賴現有班底',
        description: '不耗費國庫精力，亦不引發朝中宿將舊臣嫉妒。',
        previewEffects: '士氣 -5',
        effects: {
          morale: -5,
          logMessage: '高士飄然他去，轉投他邦，朝野士林略有微詞。'
        }
      }
    ]
  },
  {
    id: 'peasant_grain_rebellion',
    title: '邊郡饑民聚眾揭竿起義',
    category: 'disaster',
    description: '邊遠偏狹之郡因天災重稅，破產佃農數萬人鋌而走險，斬木為兵攻陷縣城，劫掠官倉。',
    historicalContext: '民心向背乃王朝興衰之晴雨表，剿撫之間往往關乎國運。',
    choices: [
      {
        id: 'crush_rebellion_swiftly',
        text: '命駐軍大開殺戒，以雷霆萬鈞之勢進剿叛卒',
        description: '以絕對鐵血壓制叛亂，立威天下，但損耗地方元氣。',
        previewEffects: '軍力 -25k, 穩定度 +15, 士氣 -10, 人口 -0.3M',
        effects: {
          military: -25,
          stability: 15,
          morale: -10,
          population: -0.3,
          logMessage: '鐵騎疾馳圍殲叛眾，首惡皆伏誅，地方動亂被徹底撲滅。'
        }
      },
      {
        id: 'grant_amnesty_and_seed',
        text: '罷免酷吏貪官，赦免從逆百姓並發放種糧',
        description: '以仁政收攬民心，化解階級仇怨，使流民重歸耕桑。',
        previewEffects: '國庫 -60, 糧食 -70, 穩定度 +25, 士氣 +15, 人口 +0.2M',
        effects: {
          treasury: -60,
          food: -70,
          stability: 25,
          morale: 15,
          population: 0.2,
          logMessage: '朝廷處置貪暴縣令並補貼牛種，百姓感激泣涕，解散歸農。'
        }
      },
      {
        id: 'conscript_rebels_into_army',
        text: '招撫叛軍悍卒，整編成前鋒敢死營效力軍前',
        description: '化敵為友，將百戰悍卒收編為開疆拓土的敢死戰力。',
        previewEffects: '軍力 +45k, 國庫 -40, 穩定度 -5, 士氣 +5',
        effects: {
          military: 45,
          treasury: -40,
          stability: -5,
          morale: 5,
          logMessage: '凶悍起義健兒接受整編，歸入禁軍先鋒營，作戰分外勇猛。'
        }
      }
    ]
  },
  {
    id: 'grand_canal_or_wall_project',
    title: '浩大土木要塞工程開議',
    category: 'politics',
    description: '工部尚書呈請興築跨流域大運河或橫貫北境的大長城要塞，功在千秋，但當下耗費極劇。',
    historicalContext: '大興土木常使當代承擔沉重勞役，卻為後世奠定數百年帝國血脈。',
    choices: [
      {
        id: 'commit_national_effort',
        text: '舉全國之力限期完工！開山鑿渠、加築雄關',
        description: '大幅耗竭國庫糧草，但能徹底打通國家命脈，促成飛躍發展。',
        previewEffects: '國庫 -180, 糧食 -120, 行政 +25, 軍械技術 +15, 穩定度 -10',
        effects: {
          treasury: -180,
          food: -120,
          administration: 25,
          technology: 15,
          stability: -10,
          population: -0.2,
          logMessage: '水陸要道貫通，南北物資調度暢行無阻，邊關固若金湯。'
        }
      },
      {
        id: 'scale_down_gradual',
        text: '分期分段修築，主要動用刑徒與駐軍緩慢推進',
        description: '穩健推行工程，在維持財政均衡與拓展基建間取得折衷。',
        previewEffects: '國庫 -70, 糧食 -40, 行政 +10, 軍械技術 +6',
        effects: {
          treasury: -70,
          food: -40,
          administration: 10,
          technology: 6,
          logMessage: '工程按部就班推進，未曾加派苛捐雜稅，民間生息自如。'
        }
      },
      {
        id: 'shelve_proposal',
        text: '留中不發，斥責浮誇之風：「國以民為本，不可苦役萬民」',
        description: '休養民力，不讓民伕負擔勞役之苦。',
        previewEffects: '穩定度 +10, 士氣 +10, 國庫 +20',
        effects: {
          stability: 10,
          morale: 10,
          treasury: 20,
          logMessage: '浩大土木工程獲准暫停，萬民交相稱頌天子仁民愛物之德。'
        }
      }
    ]
  },
  {
    id: 'rival_diplomatic_envoy',
    title: '鄰邦國書請修盟好',
    category: 'diplomacy',
    description: '鄰近強勢政權遣重臣為使，攜寶玉神駒奉表請和，提請締結兩國互不侵犯與通商盟約。',
    historicalContext: '外交無定規，或合縱連橫，或示好以待破綻，皆在帝王一念之間。',
    choices: [
      {
        id: 'sign_solemn_alliance',
        text: '歃血締結盟好，互派留質，共衛疆土',
        description: '穩固特定邊界，免除兩面受敵之虞，可騰出手來經略四方。',
        previewEffects: '士氣 +10, 穩定度 +15, 國庫 +50',
        effects: {
          morale: 10,
          stability: 15,
          treasury: 50,
          logMessage: '兩國國書交契，邊貿大興，邊陲防線壓力為之一空。'
        }
      },
      {
        id: 'accept_gifts_give_cold_shoulder',
        text: '禮收貢禮，含糊應對，不作實質定約',
        description: '白納財帛玉帛，保持戰略主動性與用兵彈性。',
        previewEffects: '國庫 +70, 行政 +5',
        effects: {
          treasury: 70,
          administration: 5,
          logMessage: '朝廷優容其使節但拒絕死盟，進可攻退可守，主動在我。'
        }
      },
      {
        id: 'berate_envoy_and_expel',
        text: '怒斥外使狂悖，叱令其國速降：「天下唯有一帝！」',
        description: '激勵本朝將士求戰血性，向天下宣告統一大志。',
        previewEffects: '軍力 +30k, 士氣 +20, 穩定度 -10',
        effects: {
          military: 30,
          morale: 20,
          stability: -10,
          logMessage: '外使被斥逐出朝，邊關將士拔刀請戰，聲威震動四方。'
        }
      }
    ]
  },
  {
    id: 'military_examination_reforms',
    title: '革新武舉軍制神機營',
    category: 'military',
    description: '兵部尚書密陳軍制改革疏，主張破除世家門閥世襲將校之弊，特開天子武舉並添設精銳神機火器部隊。',
    historicalContext: '軍制革新攸關王朝征戰效能與皇權對軍隊的直接掌控。',
    choices: [
      {
        id: 'institute_meritocratic_exams',
        text: '開創武科殿試，廣納草莽豪傑破格擢拔將校',
        description: '讓民間軍事天才有晉升階梯，大幅提振基層戰力與忠誠度。',
        previewEffects: '國庫 -70, 軍力 +50k, 士氣 +15, 行政 +10',
        effects: {
          treasury: -70,
          military: 50,
          morale: 15,
          administration: 10,
          logMessage: '天子親校武場，草莽驍將脫穎而出，新軍陣容為之大盛。'
        }
      },
      {
        id: 'equip_heavy_repeating_crossbows',
        text: '撥重金予工部大規模鑄造神弩鐵甲與重砲',
        description: '以頂級軍備強化戰場殺傷力，提升攻堅克難的硬實力。',
        previewEffects: '國庫 -100, 軍械技術 +20, 軍力 +40k',
        effects: {
          treasury: -100,
          technology: 20,
          military: 40,
          logMessage: '官造軍械精良無匹，精鋼重甲與神弩裝備全軍，摧枯拉朽。'
        }
      },
      {
        id: 'privilege_hereditary_nobles',
        text: '維持世襲勳貴統領舊制，以安元勳功臣之心',
        description: '不觸怒朝中開國勳貴勢力，維持朝堂表面團結與平穩。',
        previewEffects: '穩定度 +15, 行政 -10, 軍力 -10k',
        effects: {
          stability: 15,
          administration: -10,
          military: -10,
          logMessage: '世家勳臣皆感念天子眷顧恩情，但軍伍進取鋒芒稍遜。'
        }
      }
    ]
  },
  {
    id: 'great_locust_plague',
    title: '飛蝗蔽日赤地千里',
    category: 'disaster',
    description: '盛夏狂風大作，億萬飛蝗遮蔽天日而來，所過之處禾稼草木俱盡，數處糧倉顆粒無收。',
    historicalContext: '古人視蝗災為天降厲罰，應對得宜者安邦，措手不及者動亂。',
    choices: [
      {
        id: 'locust_bounty_collection',
        text: '官府以銅錢糧食懸賞收購蝗蟲，發動萬民捕埋',
        description: '化害為利，以工代賑，迅速撲滅蟲源並發放度荒盤纏。',
        previewEffects: '國庫 -80, 糧食 -50, 穩定度 +10, 士氣 +10',
        effects: {
          treasury: -80,
          food: -50,
          stability: 10,
          morale: 10,
          logMessage: '萬民攜箕捕蝗換取錢米，蝗害迅速平息，未釀成大動亂。'
        }
      },
      {
        id: 'locust_purchase_southern_rice',
        text: '速調水路舟師自未受災州郡採買轉運平價糧米',
        description: '以雄厚財力自他處調配救急糧源，強行壓抑市井糧價。',
        previewEffects: '國庫 -110, 糧食 +100, 穩定度 +15',
        effects: {
          treasury: -110,
          food: 100,
          stability: 15,
          logMessage: '轉運糧船滿載白米抵京，市面糧價平穩，民心大定。'
        }
      },
      {
        id: 'locust_pray_to_heaven',
        text: '天子素服避殿，齋戒祭告天地神祇請罪祈福',
        description: '不支用庫銀，依循古禮祈求天意自退。',
        previewEffects: '糧食 -90, 穩定度 -15, 士氣 -15, 君主健康 -5',
        effects: {
          food: -90,
          stability: -15,
          morale: -15,
          rulerHealth: -5,
          logMessage: '天子祈天雖誠，但蝗害仍無情肆虐，田園荒蕪、餓殍載道。'
        }
      }
    ]
  },
  {
    id: 'elixir_of_immortality',
    title: '方士進獻萬壽金丹',
    category: 'politics',
    description: '雲遊方士攜紫金寶匣上殿，進獻以硃砂、水銀與天山雪蓮秘煉之「長生金丹」，自稱服之可壽與天齊。',
    historicalContext: '千古帝王多迷戀羽化成仙，然而鉛汞之毒每每戕害聖體。',
    choices: [
      {
        id: 'elixir_consume_greedily',
        text: '欣然吞服：「朕承天命統御萬方，自當長生不死！」',
        description: '雖能產生短暫精神狂熱興奮，卻暗藏劇毒重金屬侵害體魄。',
        previewEffects: '士氣 +20, 君主健康 -18, 穩定度 -5',
        effects: {
          morale: 20,
          rulerHealth: -18,
          stability: -5,
          logMessage: '天子服食金丹，面赤狂躁發熱，聖躬受到丹毒嚴重虧損。'
        }
      },
      {
        id: 'elixir_test_on_condemned',
        text: '命太醫院於死囚身上嚴密試服觀察數月',
        description: '保持冷靜理智之帝王心術，科學驗明真偽。',
        previewEffects: '行政 +10, 國庫 -30',
        effects: {
          administration: 10,
          treasury: -30,
          logMessage: '試服死囚不數旬皆七竅流血而亡，方士騙局敗露伏誅。'
        }
      },
      {
        id: 'elixir_banish_alchemist',
        text: '痛斥妖言惑眾，杖斃妖道，布告天下崇正斥邪',
        description: '力崇儒法清明治道，遠離方術迷信，善加養生自重。',
        previewEffects: '行政 +15, 穩定度 +15, 君主健康 +5',
        effects: {
          administration: 15,
          stability: 15,
          rulerHealth: 5,
          logMessage: '天子斥逐方士，端正朝野風氣，修心養性使龍體更加康泰。'
        }
      }
    ]
  },
  {
    id: 'assassination_attempt',
    title: '圖窮匕見刺客猝發',
    category: 'character',
    description: '朝會之際，敵國歸降使臣於呈遞版圖卷軸時突然暴起，抽出一柄淬毒匕首，直刺御座御駕！',
    historicalContext: '荊軻刺秦之險，非大智大勇之君無以臨危應變。',
    choices: [
      {
        id: 'assassin_parry_and_slay',
        text: '親拔帝劍！親手於殿上格殺逆賊',
        description: '在群臣面前展示天子無畏神武之威嚴！',
        previewEffects: '士氣 +30, 軍力 +20k, 君主健康 -10',
        effects: {
          morale: 30,
          military: 20,
          rulerHealth: -10,
          logMessage: '天子長劍出鞘斬殺刺客，雖受皮肉微傷，但威震百官殿堂！'
        }
      },
      {
        id: 'assassin_bodyguards_shield',
        text: '大內金甲衛士飛身阻截，合力擒拿刺客',
        description: '倚仗忠心護衛捨身護駕，最穩妥安全的避險抉擇。',
        previewEffects: '軍力 -10k, 穩定度 +10',
        effects: {
          military: -10,
          stability: 10,
          logMessage: '數名近衛力戰殉職擒拿刺客，護衛聖駕安然無恙。'
        }
      },
      {
        id: 'assassin_uncover_conspiracy',
        text: '生擒刺客交付廷尉密審，深挖幕後主謀勢力',
        description: '順藤摸瓜瓦解潛藏於暗處的間諜細作網。',
        previewEffects: '行政 +20, 穩定度 +15, 國庫 -20',
        effects: {
          administration: 20,
          stability: 15,
          treasury: -20,
          logMessage: '刺客招供暗藏黨羽，朝廷火速誅除敵國三座內應暗樁。'
        }
      }
    ]
  },
  {
    id: 'foreign_firearms_tribute',
    title: '神機火器與紅衣大砲密卷',
    category: 'military',
    description: '沿海商賈與西洋火器巧匠進呈新鑄佛郎機砲與火藥配方圖卷，聲若雷霆，開山裂石。',
    historicalContext: '火藥武器的引進與技術迭代，將深遠改變冷兵器時代的攻城守禦作戰。',
    choices: [
      {
        id: 'firearms_build_divine_corps',
        text: '撥款設立「神機大營」，重金開爐大規模鑄砲',
        description: '大幅提升圍城攻堅與平原野戰的壓倒性火力。',
        previewEffects: '國庫 -130, 軍械技術 +30, 軍力 +60k, 士氣 +10',
        effects: {
          treasury: -130,
          technology: 30,
          military: 60,
          morale: 10,
          logMessage: '神機砲位列陣雷鳴動天，三軍攻堅拔城如摧枯拉朽。'
        }
      },
      {
        id: 'firearms_study_and_archive',
        text: '交由工部慢慢推敲研習，編修《兵仗密略》備用',
        description: '以最小開銷吸收前沿技術，留待日後財政充裕時裝備。',
        previewEffects: '國庫 -40, 軍械技術 +15, 行政 +10',
        effects: {
          treasury: -40,
          technology: 15,
          administration: 10,
          logMessage: '工部妥善譯修圖譜，技術秘典深藏宮中內府。'
        }
      },
      {
        id: 'firearms_reject_tradition',
        text: '恪守騎射古訓，斥之為奇技淫巧不予採納',
        description: '節省銀餉開支，維持軍隊純粹的武勇與馬背騎射傳統。',
        previewEffects: '士氣 +10, 國庫 +10, 軍械技術 -10',
        effects: {
          morale: 10,
          treasury: 10,
          technology: -10,
          logMessage: '朝廷堅守刀馬弓矢之法，未撥款購置西洋火器。'
        }
      }
    ]
  },
  {
    id: 'border_defection_opportunity',
    title: '敵國邊鎮密信乞降',
    category: 'military',
    description: '鄰邦重鎮守將與其主君生隙，私遣心腹攜帶城防城門鑰匙暗中納款，許諾若封侯授爵，願舉城投誠。',
    historicalContext: '誘降敵將不費一兵一卒，然亦需提防佯降之詐術計謀。',
    choices: [
      {
        id: 'defection_accept_and_march',
        text: '欣然應允！速遣大軍趁夜銜枚疾走進駐城防',
        description: '冒一定奇襲風險，迅速拿下兵家必爭之地。',
        previewEffects: '國庫 -60, 軍力 +30k, 士氣 +20',
        effects: {
          treasury: -60,
          military: 30,
          morale: 20,
          stability: 10,
          logMessage: '王師黎明之際順利接管要塞，皇旗迎風招展，不血刃而克重鎮！'
        }
      },
      {
        id: 'defection_demand_hostages',
        text: '命其先遣送子嗣與親隨為質，方許接防',
        description: '老成謀國之策，防備敵軍設下伏兵反噬。',
        previewEffects: '行政 +15, 國庫 -20',
        effects: {
          administration: 15,
          treasury: -20,
          logMessage: '降將送質納款證明誠意，大軍穩妥進駐城池。'
        }
      },
      {
        id: 'defection_inform_rival_ruler',
        text: '反將密信故意漏給敵國君王，行反間之計',
        description: '坐看敵邦自相猜忌屠戮大將，坐收漁翁之利。',
        previewEffects: '行政 +15, 士氣 +15',
        effects: {
          administration: 15,
          morale: 15,
          logMessage: '敵主果然中計誅殺大將，邊防大亂，軍心離散瓦解。'
        }
      }
    ]
  },
  {
    id: 'monastery_temple_wealth',
    title: '沙門豪富私匿田產人口',
    category: 'economy',
    description: '各方名剎寺觀廣占膏腴良田數十萬頃，坐擁巨額金銀銅鐘，庇蔭無數佃客部曲逃避國賦徭役。',
    historicalContext: '三武一宗滅佛之爭，本質皆是國家財政土地與宗教免稅特權的較量。',
    choices: [
      {
        id: 'temple_melt_bells_for_coins',
        text: '毀銅像以鑄銅錢！勒令僧尼還俗歸農服役納賦',
        description: '獲得極龐大的流動財政與勞動力補充，但會引發善男信女不滿。',
        previewEffects: '國庫 +180, 糧食 +90, 軍力 +30k, 穩定度 -15, 士氣 -10',
        effects: {
          treasury: 180,
          food: 90,
          military: 30,
          stability: -15,
          morale: -10,
          logMessage: '千萬斤銅像銷鑄為通寶大錢，數萬丁壯還俗開荒入伍。'
        }
      },
      {
        id: 'temple_impose_monastic_tax',
        text: '頒發度牒管制寺產，對廟田徵收定額度牒稅',
        description: '兼顧信仰平穩與國庫實利，溫和而持久的稅源補充。',
        previewEffects: '國庫 +75, 行政 +10, 穩定度 +5',
        effects: {
          treasury: 75,
          administration: 10,
          stability: 5,
          logMessage: '寺觀按額納糧輸稅，朝廷財用得補，教派各安其分。'
        }
      },
      {
        id: 'temple_patronize_grand_abbot',
        text: '敕賜名山大剎，請高僧為國祈福延壽',
        description: '利用宗教號召安撫天下萬民精神，深固神聖天子之位。',
        previewEffects: '國庫 -80, 穩定度 +25, 士氣 +20',
        effects: {
          treasury: -80,
          stability: 25,
          morale: 20,
          logMessage: '梵音高奏祈祝國祚綿長，百姓歸心向善，天下戾氣化解。'
        }
      }
    ]
  },
  {
    id: 'silk_road_merchant_boom',
    title: '萬里絲路海舶商賈雲集',
    category: 'economy',
    description: '西域胡商與南海番舶絡繹不絕匯聚於國都市肆，攜琉璃香料珠寶與阿拉伯駿馬，競購中原絲綢瓷器。',
    historicalContext: '商貿之利足以充國，開放互通方顯盛世氣度。',
    choices: [
      {
        id: 'trade_build_harbor_customs',
        text: '增設市舶司與驛站關隘，輕徭減稅以廣招四海商旅',
        description: '大幅提升商貿流通效能，帶來源源不絕的豐沛關稅。',
        previewEffects: '國庫 +140, 軍械技術 +15, 行政 +15',
        effects: {
          treasury: 140,
          technology: 15,
          administration: 15,
          logMessage: '商旅雲集商稅大興，各方財寶充溢庫府，都市空前繁榮。'
        }
      },
      {
        id: 'trade_buy_warhorses',
        text: '撥付專款大量搜購西域汗血戰馬，擴建禁衛鐵騎',
        description: '將商貿利潤全數轉化為強悍的野戰騎兵戰力。',
        previewEffects: '國庫 -50, 軍力 +60k, 士氣 +15',
        effects: {
          treasury: -50,
          military: 60,
          morale: 15,
          logMessage: '精壯戰馬源源入廄，皇家鐵騎馳驟如風，突擊力倍增。'
        }
      },
      {
        id: 'trade_restrict_foreign_entry',
        text: '嚴格宵禁查驗文引，限制番商深入腹地各郡',
        description: '防止機密外洩與風俗侵染，維持秩序但損及商賈財利。',
        previewEffects: '穩定度 +10, 行政 +5, 國庫 -20',
        effects: {
          stability: 10,
          administration: 5,
          treasury: -20,
          logMessage: '市舶法令嚴飭，防諜戒備森嚴，然海外商貿漸顯沉寂。'
        }
      }
    ]
  },
  {
    id: 'celestial_omen_comet',
    title: '白虹貫日彗星襲月天象',
    category: 'politics',
    description: '欽天監急奏：夜觀天象，忽見長星劃破紫微帝座，芒角掃天，民間流言四起，紛傳大變將至。',
    historicalContext: '災異天象為古代正統政治之重壓，端視君主如何引導天命人心。',
    choices: [
      {
        id: 'comet_issue_edict_of_virtue',
        text: '天子下《罪己詔》，大赦天下輕微刑徒以順天心',
        description: '以無私誠懇之德行消弭流言惶恐，深得黎庶愛戴。',
        previewEffects: '穩定度 +20, 士氣 +15, 行政 +10',
        effects: {
          stability: 20,
          morale: 15,
          administration: 10,
          logMessage: '天子推誠自責施恩赦罪，萬民感佩聖明，人心頓安。'
        }
      },
      {
        id: 'comet_rebrand_as_conquest_omen',
        text: '借題發揮！昭告天下：「彗星乃天兵天劍，預示掃除六國統一天下！」',
        description: '將天變災異轉化為發動統一大業的強大輿論號召！',
        previewEffects: '士氣 +25, 軍力 +30k, 穩定度 -5',
        effects: {
          morale: 25,
          military: 30,
          stability: -5,
          logMessage: '檄文傳佈海內，將士熱血沸騰，皆視天象為統一天下之吉兆。'
        }
      },
      {
        id: 'comet_ignore_superstition',
        text: '廷杖妄言妖書之欽天監術士，厲禁民間散布流言',
        description: '以君臨天下之剛強鐵腕橫掃迷信譫語。',
        previewEffects: '行政 +15, 穩定度 -10, 士氣 -10',
        effects: {
          administration: 15,
          stability: -10,
          morale: -10,
          logMessage: '妖言立止，百官噤若寒蟬，宮闈秩序肅殺嚴正。'
        }
      }
    ]
  }
];
