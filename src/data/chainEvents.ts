import { EventChoice, EventEffect, GameEvent } from '../types/game';

// ===== 抉擇 → 伏筆 =====
// 玩家做出下列選項後，會在世界中埋下「伏筆」，數年後引發連鎖事件。
// 不需修改原有事件資料，只要以選項 id 對應即可。
export const CHOICE_FLAGS: Record<string, { flag: string; hint: string }> = {
  temple_melt_bells_for_coins: { flag: 'monk_resentment', hint: '僧侶怨氣暗生，恐有後患。' },
  flood_leave_to_locals: { flag: 'flood_refugees', hint: '流民四散，不知會否聚而為寇。' },
  flood_conscript_labor: { flag: 'dike_completed', hint: '新堤落成，來年或有水利之利。' },
  purge_corrupt_officials: { flag: 'purge_fear', hint: '朝臣人人自危，暗流在殿下湧動。' },
  crush_rebellion_swiftly: { flag: 'rebel_remnants', hint: '叛軍餘黨潛入山林，未必斬草除根。' },
  nomad_appease_trade: { flag: 'nomad_trade', hint: '邊市初開，胡商的胃口恐怕不止於此。' },
  elixir_consume_greedily: { flag: 'elixir_side_effect', hint: '龍體隱隱不適，丹毒恐在體內潛伏。' },
  visit_in_person_three_times: { flag: 'sage_advisor', hint: '隱士感念知遇，或有大策獻上。' },
  privilege_hereditary_nobles: { flag: 'noble_power', hint: '世家勳貴坐大，兼併之風悄然興起。' },
  commit_national_effort: { flag: 'great_project_burden', hint: '大工程曠日持久，開支恐超出預算。' },
  firearms_build_divine_corps: { flag: 'divine_corps', hint: '新軍初成，尚待實戰檢驗。' },
  defection_accept_and_march: { flag: 'defector_general', hint: '降將雖已歸順，人心難測。' },
  harvest_tax_holiday: { flag: 'grateful_people', hint: '百姓感念恩德，或有回報。' },
  locust_pray_to_heaven: { flag: 'locust_return', hint: '蝗災只是暫退，來年恐捲土重來。' }
};

// 伏筆超過此年數仍未觸發就自然消散
export const FLAG_EXPIRE_YEARS = 8;

const ch = (
  id: string,
  text: string,
  description: string,
  previewEffects: string,
  effects: EventEffect
): EventChoice => ({ id, text, description, previewEffects, effects });

export const CHAIN_EVENTS: GameEvent[] = [
  {
    id: 'chain_monk_uprising',
    title: '僧兵借神佛之名作亂',
    category: 'politics',
    requiresFlag: 'monk_resentment',
    minDelay: 2,
    description: '當年熔毀銅像、強令僧尼還俗，如今舊怨發酵。數座名剎的僧眾聯合鄉民，打著「護法」旗號聚眾數千，攻佔了縣城倉庫。',
    historicalContext: '宗教與皇權的衝突，歷代皆有，處置得宜則可立威，失當則動搖民心。',
    choices: [
      ch('monk_uprising_crush', '派精兵鎮壓，首惡斬首示眾', '以武力迅速平亂，但會被視為滅佛暴政。', '軍力 -8, 穩定度 -8, 行政 +5, 國庫 +40', {
        military: -8, stability: -8, administration: 5, treasury: 40,
        logMessage: '官軍攻破山門，首惡伏誅，寺產盡數充公，但民間對朝廷的恐懼更深。'
      }),
      ch('monk_uprising_mediate', '遣使談判，許以免稅田換取解散', '以讓步換和平，國庫會有所損失。', '國庫 -90, 穩定度 +10, 士氣 +5', {
        treasury: -90, stability: 10, morale: 5,
        logMessage: '朝廷與僧眾達成和約，叛亂不戰而散，寺院重獲部分田產。'
      }),
      ch('monk_uprising_ignore', '嚴令地方自行處置，朝廷不作回應', '省事但風險大，亂事可能蔓延。', '穩定度 -20, 人口 -0.3, 士氣 -10', {
        stability: -20, population: -0.3, morale: -10,
        logMessage: '地方無力平亂，叛軍焚掠數縣，朝廷威信掃地。'
      })
    ]
  },
  {
    id: 'chain_refugee_bandits',
    title: '饑民聚嘯山林成寇',
    category: 'politics',
    requiresFlag: 'flood_refugees',
    minDelay: 1,
    description: '去年水患後無人賑濟的流民，如今糾集成股，在山道劫掠商旅，甚至圍攻小城。',
    choices: [
      ch('refugee_bandits_relief', '開倉放糧並招安，編入屯田', '花費糧食換取人心與勞力。', '糧食 -100, 穩定度 +12, 人口 +0.2', {
        food: -100, stability: 12, population: 0.2,
        logMessage: '流民領到糧種歸田，亂象化為開墾，地方漸安。'
      }),
      ch('refugee_bandits_suppress', '派軍圍剿，不留後患', '手段強硬但損耗兵力。', '軍力 -6, 穩定度 -5, 士氣 +5', {
        military: -6, stability: -5, morale: 5,
        logMessage: '官軍清剿山寨，賊首授首，地方暫時安靜。'
      }),
      ch('refugee_bandits_ignore', '視作地方治安，不予理會', '代價可能很大。', '國庫 -60, 穩定度 -15, 人口 -0.3', {
        treasury: -60, stability: -15, population: -0.3,
        logMessage: '盜賊勢大，商路斷絕，稅收明顯下滑。'
      })
    ]
  },
  {
    id: 'chain_dike_bumper_harvest',
    title: '新堤護佑，歲稔豐登',
    category: 'economy',
    requiresFlag: 'dike_completed',
    minDelay: 2,
    description: '當年修築的石堤歷經兩度汛期穩如磐石，沿岸良田年年豐收，鄉老聯名上書，請求立碑頌德。',
    choices: [
      ch('dike_harvest_stockpile', '增建常平倉，把餘糧存起來', '以糧備荒，長遠穩健。', '糧食 +180, 穩定度 +5', {
        food: 180, stability: 5,
        logMessage: '糧倉盈溢，朝廷底氣大增。'
      }),
      ch('dike_harvest_expand', '擴大水利，推廣沿江新田', '再投資換取長期增長。', '國庫 -60, 人口 +0.4, 行政 +6', {
        treasury: -60, population: 0.4, administration: 6,
        logMessage: '新墾沃野數十萬畝，戶口日增。'
      }),
      ch('dike_harvest_tax', '趁勢加徵一成賦稅', '短期見效，民心略損。', '國庫 +160, 穩定度 -8', {
        treasury: 160, stability: -8,
        logMessage: '國庫大進，但百姓暗怨朝廷「與民爭利」。'
      })
    ]
  },
  {
    id: 'chain_purge_conspiracy',
    title: '朝臣暗結，風聲鶴唳',
    category: 'politics',
    requiresFlag: 'purge_fear',
    minDelay: 2,
    description: '肅貪之後，朝中官員人人自危。密探回報：數位重臣私下往來頻繁，似有串聯自保，甚至圖謀不軌的跡象。',
    choices: [
      ch('purge_conspiracy_strike', '先下手為強，大興牢獄', '徹底清除隱患，但恐怖氣氛更重。', '行政 +6, 穩定度 -12, 臣將忠誠 -10', {
        administration: 6, stability: -12, characterLoyaltyChange: -10,
        logMessage: '一夜之間數十官員下獄，朝堂噤若寒蟬，卻無人再敢異動。'
      }),
      ch('purge_conspiracy_pardon', '當眾宣布既往不咎，穩定人心', '以寬宏換取忠誠，風險是姑息。', '穩定度 +10, 臣將忠誠 +10, 行政 -4', {
        stability: 10, characterLoyaltyChange: 10, administration: -4,
        logMessage: '天子一道赦令，群臣感激涕零，朝局漸漸回暖。'
      }),
      ch('purge_conspiracy_watch', '暗中監視，等待證據再動手', '折衷之策，需要一點時間成本。', '國庫 -40, 行政 +3', {
        treasury: -40, administration: 3,
        logMessage: '密探布下天羅地網，群臣收斂許多。'
      })
    ]
  },
  {
    id: 'chain_rebel_remnants',
    title: '叛軍餘黨死灰復燃',
    category: 'military',
    requiresFlag: 'rebel_remnants',
    minDelay: 2,
    description: '當年雷霆鎮壓之後，漏網的叛首竄入深山，如今糾合舊部，打出「為死者復仇」的旗號捲土重來。',
    choices: [
      ch('rebel_remnants_hunt', '派名將追剿，務必根除', '兵力損耗，但可徹底解決。', '軍力 -8, 士氣 +8, 穩定度 +5', {
        military: -8, morale: 8, stability: 5,
        logMessage: '追剿大軍搜山數月，叛首終被擒獲，此地再無亂源。'
      }),
      ch('rebel_remnants_amnesty', '赦免追隨者，只追究首惡', '分化瓦解，成本最低。', '穩定度 +6, 國庫 -30', {
        stability: 6, treasury: -30,
        logMessage: '附從者紛紛歸降，首惡孤立，不戰而潰。'
      }),
      ch('rebel_remnants_ignore', '以邊防為重，暫不理會', '風險是亂事擴大。', '穩定度 -12, 人口 -0.2', {
        stability: -12, population: -0.2,
        logMessage: '叛軍坐大，數縣陷入戰火。'
      })
    ]
  },
  {
    id: 'chain_nomad_greed',
    title: '胡商與邊將索要更多',
    category: 'diplomacy',
    requiresFlag: 'nomad_trade',
    minDelay: 2,
    description: '邊市貿易帶來了繁榮，也養大了胃口。草原部落遣使要求增加歲幣與互市份額，言辭間頗有威脅之意。',
    choices: [
      ch('nomad_greed_pay', '再增歲幣，維持和平', '花錢買平安。', '國庫 -120, 穩定度 +8', {
        treasury: -120, stability: 8,
        logMessage: '增加歲幣後邊境平靜，但朝中主戰派頗有怨言。'
      }),
      ch('nomad_greed_refuse', '嚴詞拒絕，陳兵邊境', '強硬回應，可能引發衝突。', '軍力 -5, 士氣 +10, 穩定度 -5', {
        military: -5, morale: 10, stability: -5,
        logMessage: '邊軍陳兵示威，胡使悻悻而去，局勢劍拔弩張。'
      }),
      ch('nomad_greed_split', '扶植弱部，分化草原', '耗時但長遠有益。', '國庫 -60, 行政 +5, 軍械技術 +3', {
        treasury: -60, administration: 5, technology: 3,
        logMessage: '使者挑起部落內鬥，草原再無統一勢力威脅邊疆。'
      })
    ]
  },
  {
    id: 'chain_elixir_collapse',
    title: '龍體違和，太醫束手',
    category: 'character',
    requiresFlag: 'elixir_side_effect',
    minDelay: 2,
    description: '近來君王頭暈氣促，脾氣暴躁，太醫暗中診出丹毒積於五臟，卻無人敢直言。',
    choices: [
      ch('elixir_collapse_stop', '焚丹爐、逐方士，專心調養', '壯士斷腕，保住元氣。', '君主健康 +12, 國庫 +30, 士氣 -3', {
        rulerHealth: 12, treasury: 30, morale: -3,
        logMessage: '丹爐盡毀，君王靜養數月，面色稍復。'
      }),
      ch('elixir_collapse_more', '再服新丹，求一線生機', '賭一把，後果難料。', '君主健康 -18, 國庫 -50', {
        rulerHealth: -18, treasury: -50,
        logMessage: '新丹入腹，君王一度精神煥發，隨即病勢更重。'
      }),
      ch('elixir_collapse_hide', '嚴密封鎖消息，維持朝堂秩序', '穩定朝局，但病情未除。', '穩定度 +5, 君主健康 -5', {
        stability: 5, rulerHealth: -5,
        logMessage: '宮禁森嚴，風聲未洩，但龍體仍令人憂心。'
      })
    ]
  },
  {
    id: 'chain_sage_proposal',
    title: '隱士獻上《天下大策》',
    category: 'character',
    requiresFlag: 'sage_advisor',
    minDelay: 2,
    description: '當年三顧茅廬請來的隱士，沉潛兩年後終於獻上一部長策，分別論述「強兵」「富民」「安邊」三策，只許擇其一而行。',
    choices: [
      ch('sage_proposal_army', '採「強兵」策：整編軍制，嚴格校閱', '軍力與士氣全面提升。', '軍力 +20, 士氣 +12, 國庫 -60', {
        military: 20, morale: 12, treasury: -60,
        logMessage: '軍制大革，三軍煥然一新。'
      }),
      ch('sage_proposal_wealth', '採「富民」策：輕徭薄賦，獎勵農桑', '人口與糧食雙豐收。', '人口 +0.5, 糧食 +120, 行政 +5', {
        population: 0.5, food: 120, administration: 5,
        logMessage: '政令一出，農戶歡欣，倉廩日實。'
      }),
      ch('sage_proposal_border', '採「安邊」策：築堡屯田，聯絡諸邦', '外交與邊防環境改善。', '穩定度 +12, 軍械技術 +6, 國庫 -40', {
        stability: 12, technology: 6, treasury: -40,
        logMessage: '烽燧連綿，邊境屯田漸盛，外敵不敢輕犯。'
      })
    ]
  },
  {
    id: 'chain_noble_overreach',
    title: '世家兼併田地，民不聊生',
    category: 'economy',
    requiresFlag: 'noble_power',
    minDelay: 3,
    description: '當年厚待世襲貴族，如今各州豪強兼併田產，貧民失地淪為佃戶，州縣賦稅大減，民間怨聲漸起。',
    choices: [
      ch('noble_overreach_land_reform', '推行限田令，清查隱匿田畝', '得罪權貴但根本解決問題。', '國庫 +120, 穩定度 -10, 行政 +8, 臣將忠誠 -8', {
        treasury: 120, stability: -10, administration: 8, characterLoyaltyChange: -8,
        logMessage: '限田令雷厲風行，無數隱田重入官冊。'
      }),
      ch('noble_overreach_tax_nobles', '向權貴加徵「助軍錢」', '折衷之策，權貴略有不滿。', '國庫 +80, 臣將忠誠 -4', {
        treasury: 80, characterLoyaltyChange: -4,
        logMessage: '各大世家不情願地捐出助軍錢，國庫略有補充。'
      }),
      ch('noble_overreach_tolerate', '多方安撫，維持現狀', '朝廷穩定，但國力外流。', '穩定度 +5, 國庫 -50, 人口 -0.2', {
        stability: 5, treasury: -50, population: -0.2,
        logMessage: '朝野相安無事，但庶民日子越發艱難。'
      })
    ]
  },
  {
    id: 'chain_project_overrun',
    title: '大工程超支，國庫告急',
    category: 'economy',
    requiresFlag: 'great_project_burden',
    minDelay: 2,
    description: '耗盡心力的浩大工程已近尾聲，工部卻上奏：物價飛漲，工料耗費遠超預算，若此時停工則前功盡棄。',
    choices: [
      ch('project_overrun_finish', '不惜代價完工', '工程成為不朽之功。', '國庫 -150, 行政 +8, 士氣 +10, 軍械技術 +4', {
        treasury: -150, administration: 8, morale: 10, technology: 4,
        logMessage: '工程如期完工，後世稱頌其為「千古偉業」。'
      }),
      ch('project_overrun_trim', '縮小規模，保留主體', '務實之選。', '國庫 -60, 行政 +3', {
        treasury: -60, administration: 3,
        logMessage: '縮減後的工程仍有可觀成效，國庫壓力減輕。'
      }),
      ch('project_overrun_halt', '就此停工，止損要緊', '省錢，但民心有損。', '國庫 +30, 穩定度 -12, 士氣 -8', {
        treasury: 30, stability: -12, morale: -8,
        logMessage: '工程半途而廢，民伕空手而歸，百姓議論紛紛。'
      })
    ]
  },
  {
    id: 'chain_divine_corps_test',
    title: '神機營實戰檢驗',
    category: 'military',
    requiresFlag: 'divine_corps',
    minDelay: 2,
    description: '耗資組建的新式火器營終於迎來首次檢閱，兵部請示：是否在邊境以真實戰事檢驗成效？',
    choices: [
      ch('divine_corps_battle', '派往邊境實戰', '勝則揚威，敗則損兵。', '軍力 +12, 士氣 +12, 軍械技術 +6, 國庫 -40', {
        military: 12, morale: 12, technology: 6, treasury: -40,
        logMessage: '火器齊發，敵騎潰不成軍，神機營名動天下。'
      }),
      ch('divine_corps_drill', '繼續操練改良', '穩紮穩打。', '軍械技術 +8, 國庫 -30', {
        technology: 8, treasury: -30,
        logMessage: '工匠日夜改良，火器精度大增。'
      }),
      ch('divine_corps_parade', '以閱兵震懾諸國', '外交威懾，不見血。', '士氣 +8, 穩定度 +6', {
        morale: 8, stability: 6,
        logMessage: '閱兵威勢駭人，鄰國使節面面相覷。'
      })
    ]
  },
  {
    id: 'chain_defector_choice',
    title: '降將心懷二意',
    category: 'character',
    requiresFlag: 'defector_general',
    minDelay: 2,
    description: '去年歸降的敵將近來頻頻與舊部書信往來。監察御史呈上密報，既可能是通敵，也可能只是敘舊。',
    choices: [
      ch('defector_choice_trust', '當面信任，委以重任', '賭人心：成則忠，敗則叛。', '軍力 +15, 士氣 +8, 臣將忠誠 +6', {
        military: 15, morale: 8, characterLoyaltyChange: 6,
        logMessage: '降將感激涕零，率舊部效命，軍力大增。'
      }),
      ch('defector_choice_remove', '明升暗降，奪其兵權', '穩健，但降將寒心。', '穩定度 +5, 臣將忠誠 -5', {
        stability: 5, characterLoyaltyChange: -5,
        logMessage: '降將被封為閒職，再無兵權，倒也相安無事。'
      }),
      ch('defector_choice_execute', '以謀逆之罪處斬', '殺雞儆猴，但寒了降人之心。', '士氣 -8, 穩定度 -6, 行政 +3', {
        morale: -8, stability: -6, administration: 3,
        logMessage: '降將人頭落地，其他降人人人自危。'
      })
    ]
  },
  {
    id: 'chain_grateful_people',
    title: '百姓自發獻糧謝恩',
    category: 'culture',
    requiresFlag: 'grateful_people',
    minDelay: 1,
    description: '去年減稅恩澤，今年鄉間老者們推著牛車，自發運來新穀獻給朝廷，口稱「皇恩浩蕩」。',
    choices: [
      ch('grateful_accept', '欣然接納，另賜布帛回禮', '雙贏，凝聚民心。', '糧食 +110, 穩定度 +8, 國庫 -20', {
        food: 110, stability: 8, treasury: -20,
        logMessage: '君民同樂，朝廷與鄉間親善無間。'
      }),
      ch('grateful_decline', '婉謝厚意，反賜糧種', '以德服人。', '穩定度 +15, 士氣 +8, 糧食 -30', {
        stability: 15, morale: 8, food: -30,
        logMessage: '天子之仁聲震四海，民心大悅。'
      }),
      ch('grateful_levy', '順勢定為常例，歲歲獻糧', '短期獲利，長期惹怨。', '糧食 +200, 穩定度 -12', {
        food: 200, stability: -12,
        logMessage: '「恩賜」成了新的賦稅，百姓的感激化為怨氣。'
      })
    ]
  },
  {
    id: 'chain_locust_return',
    title: '蝗群捲土重來',
    category: 'disaster',
    requiresFlag: 'locust_return',
    minDelay: 2,
    description: '去年僅靠祈禱「天譴消退」的蝗災，今夏果然復發，遮天蔽日的蝗群壓向三州莊稼，倉廩尚未備足。',
    choices: [
      ch('locust_return_fight', '動員全民撲殺，以糧換蝗', '耗費人力物力，可挽回大半收成。', '糧食 -60, 國庫 -50, 穩定度 +6', {
        food: -60, treasury: -50, stability: 6,
        logMessage: '全民撲蝗，減少損失，百姓稱許朝廷用心。'
      }),
      ch('locust_return_import', '開放市舶，向南方購糧', '用錢換糧。', '國庫 -140, 糧食 +120', {
        treasury: -140, food: 120,
        logMessage: '南方糧船北上，災區無人餓死。'
      }),
      ch('locust_return_pray', '再次祭天祈福', '賭運氣。', '穩定度 -14, 糧食 -140, 人口 -0.3', {
        stability: -14, food: -140, population: -0.3,
        logMessage: '祈禱無用，蝗群吞噬良田，民間議論朝廷昏聵。'
      })
    ]
  }
];
