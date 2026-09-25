import { GameEvent } from '../types/game';

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'yellow_river_flood',
    title: 'The Great River Breaches the Dykes (黃河決口)',
    category: 'disaster',
    description: 'Torrential summer rains have broken the main river levees. Floodwaters have engulfed three central prefectures, displacing hundreds of thousands of peasants and destroying granaries.',
    historicalContext: 'Floods were viewed as celestial tests of the Mandate of Heaven, requiring massive treasury mobilizations.',
    choices: [
      {
        id: 'flood_open_granaries',
        text: 'Open imperial granaries and dispatch disaster relief officials.',
        description: 'Provide food immediately to calm unrest and preserve population, at severe expense to reserves.',
        previewEffects: 'Food -120, Treasury -80, Stability +15, Morale +10',
        effects: {
          food: -120,
          treasury: -80,
          stability: 15,
          morale: 10,
          population: -0.1,
          logMessage: 'The emperor opened imperial granaries; the peasants wept in gratitude.'
        }
      },
      {
        id: 'flood_conscript_labor',
        text: 'Conscript 100,000 corvée laborers to re-engineer stone dykes.',
        description: 'Fix the river channels permanently with state force, improving administration at the cost of short-term stability.',
        previewEffects: 'Treasury -120, Stability -10, Administration +8, Technology +5',
        effects: {
          treasury: -120,
          stability: -10,
          administration: 8,
          technology: 5,
          population: -0.2,
          logMessage: 'Dams and sluices were completed along the river; state infrastructure was reinforced.'
        }
      },
      {
        id: 'flood_leave_to_locals',
        text: 'Order local gentry and merchants to handle disaster relief.',
        description: 'Spare the imperial treasury, but widespread dissatisfaction will weaken state authority and morale.',
        previewEffects: 'Treasury -10, Stability -25, Morale -15, Administration -5',
        effects: {
          treasury: -10,
          stability: -25,
          morale: -15,
          administration: -5,
          population: -0.4,
          logMessage: 'The court refused to disburse funds. The populace murmured with deep resentment.'
        }
      }
    ]
  },
  {
    id: 'grand_autumn_harvest',
    title: 'Auspicious Golden Harvest (天下大稔)',
    category: 'economy',
    description: 'Favorable winds and timely rains across all imperial river basins have produced an unprecedented autumn harvest. Barns and granaries overflow with golden grain.',
    historicalContext: 'A bumper harvest brought high morale and the luxury to stock grain for future campaigns or grant tax holidays.',
    choices: [
      {
        id: 'harvest_stockpile',
        text: 'Stockpile grain in strategic border granaries for future campaigns.',
        description: 'Maximize food reserves and supply lines for upcoming military expeditions.',
        previewEffects: 'Food +180, Military +30, Morale +10',
        effects: {
          food: 180,
          military: 30,
          morale: 10,
          logMessage: 'Grain was transported along waterways to fill national military granaries.'
        }
      },
      {
        id: 'harvest_tax_holiday',
        text: 'Grant a 50% agricultural tax holiday to foster population growth.',
        description: 'Bolster public affection and stability; farmers marry early and cultivate new lands.',
        previewEffects: 'Food +80, Population +0.5M, Stability +20, Morale +15',
        effects: {
          food: 80,
          population: 0.5,
          stability: 20,
          morale: 15,
          logMessage: 'The emperor declared a benevolent tax holiday. Thousands of new households registered.'
        }
      },
      {
        id: 'harvest_commercial_conversion',
        text: 'Sell surplus grain on open merchant markets to replenish the treasury.',
        description: 'Convert agricultural surplus into liquid silver for state finances.',
        previewEffects: 'Treasury +160, Food +60, Administration +5',
        effects: {
          treasury: 160,
          food: 60,
          administration: 5,
          logMessage: 'State grain trading enriched the imperial treasury.'
        }
      }
    ]
  },
  {
    id: 'border_nomad_incursion',
    title: 'Border Vanguard Clashes (塞外鐵騎進逼)',
    category: 'military',
    description: 'Fierce foreign cavalry have gathered along our northern frontier passes, raiding watchtowers and driving off hundreds of cattle and horses.',
    choices: [
      {
        id: 'nomad_crush_offensive',
        text: 'Dispatch elite vanguard generals for an immediate preemptive strike.',
        description: 'Engage the raiders directly to assert imperial dominance.',
        previewEffects: 'Treasury -60, Food -50, Military +20, Morale +15',
        effects: {
          treasury: -60,
          food: -50,
          military: 20,
          morale: 15,
          stability: 10,
          logMessage: 'Imperial cavalry routed the invaders outside the passes, returning with war trophies.'
        }
      },
      {
        id: 'nomad_fortify_garrisons',
        text: 'Strengthen pass fortifications and employ crossbow garrisons.',
        description: 'A defensive strategy minimizing casualties, consuming steady treasury for stone and iron.',
        previewEffects: 'Treasury -90, Administration +10, Stability +10',
        effects: {
          treasury: -90,
          administration: 10,
          stability: 10,
          morale: 5,
          logMessage: 'Border beacons and bastions were reinforced; raiders withdrew without finding purchase.'
        }
      },
      {
        id: 'nomad_appease_trade',
        text: 'Open border horse-tea trade markets and grant honorary titles.',
        description: 'Pacify the nomads with diplomatic gifts and trade monopolies.',
        previewEffects: 'Treasury -50, Food -30, Stability +15, Morale -10',
        effects: {
          treasury: -50,
          food: -30,
          stability: 15,
          morale: -10,
          logMessage: 'Border markets opened. Peace was secured through silver and silk trade treaties.'
        }
      }
    ]
  },
  {
    id: 'court_corruption_scandal',
    title: 'Grand Treasury Embezzlement Uncovered (戶部巨蠹案發)',
    category: 'politics',
    description: 'An imperial censor has secretly presented evidence proving that high-ranking tax officials and salt commissioners have embezzled millions of strings of copper cash.',
    choices: [
      {
        id: 'purge_corrupt_officials',
        text: 'Execute all guilty officials, seize their estates, and purge their clans.',
        description: 'Terrorize corrupt bureaucrats, recover huge stolen wealth, but rattle court stability.',
        previewEffects: 'Treasury +150, Administration +15, Stability -10, Morale +10',
        effects: {
          treasury: 150,
          administration: 15,
          stability: -10,
          morale: 10,
          logMessage: 'The emperor ordered merciless executions and confiscations; corrupt officials trembled.'
        }
      },
      {
        id: 'reorganize_audit_bureau',
        text: 'Establish an independent Court of Judicial Review and audit system.',
        description: 'Institutional legal reform targeting systematic loopholes rather than bloody purges.',
        previewEffects: 'Treasury -40, Administration +25, Stability +10, Technology +8',
        effects: {
          treasury: -40,
          administration: 25,
          stability: 10,
          technology: 8,
          logMessage: 'A new oversight bureau was founded, raising bureaucratic efficiency across all provinces.'
        }
      },
      {
        id: 'quiet_amnesty_repayment',
        text: 'Grant confidential pardons in exchange for voluntary full restitution.',
        description: 'Recover state funds discreetly without causing panic among noble families.',
        previewEffects: 'Treasury +80, Administration -10, Stability +10',
        effects: {
          treasury: 80,
          administration: -10,
          stability: 10,
          morale: -5,
          logMessage: 'Stolen funds were quietly paid back, preserving court decorum at the cost of legal rigour.'
        }
      }
    ]
  },
  {
    id: 'talented_hermit_scholar',
    title: 'A Legendary Strategist Descends the Mountain (大賢出山)',
    category: 'character',
    description: 'Rumors tell of a reclusive genius living in a bamboo hermitage, thoroughly versed in Sun Tzu, hydraulics, and imperial governance. Multiple kingdoms seek his allegiance.',
    choices: [
      {
        id: 'visit_in_person_three_times',
        text: 'Visit his thatched cottage in person three times with imperial honors.',
        description: 'Demonstrate utmost humility and respect to secure unwavering loyalty.',
        previewEffects: 'Administration +15, Morale +15, Stability +10, Treasury -30',
        effects: {
          administration: 15,
          morale: 15,
          stability: 10,
          treasury: -30,
          characterLoyaltyChange: 15,
          logMessage: 'The emperor personally welcomed the grand strategist into the imperial council.'
        }
      },
      {
        id: 'offer_peerage_and_gold',
        text: 'Send imperial envoys with a wagonload of gold and a Marquis title.',
        description: 'Lure the sage with aristocratic prestige and silver.',
        previewEffects: 'Treasury -80, Administration +10, Military +10',
        effects: {
          treasury: -80,
          administration: 10,
          military: 10,
          logMessage: 'The master accepted office, impressed by imperial lavishness.'
        }
      },
      {
        id: 'dismiss_as_pedant',
        text: 'Dismiss him as a vain pedant; rely strictly on existing veterans.',
        description: 'Save treasury and avoid creating jealousy among the current cabinet.',
        previewEffects: 'Treasury +0, Morale -5',
        effects: {
          morale: -5,
          logMessage: 'The secluded scholar departed to rival lands, sighing at the emperor’s lack of vision.'
        }
      }
    ]
  },
  {
    id: 'peasant_grain_rebellion',
    title: 'Starving Peasants Seize Border Granaries (饑民揭竿而起)',
    category: 'disaster',
    description: 'Extreme taxes in border prefectures have driven thousands of impoverished tenant farmers to rise up under rebel banners, occupying county seats.',
    choices: [
      {
        id: 'crush_rebellion_swiftly',
        text: 'Order the regional garrison to suppress the rebels without mercy.',
        description: 'Restore law and order through overwhelming military force.',
        previewEffects: 'Military -25, Stability +15, Morale -10, Population -0.3M',
        effects: {
          military: -25,
          stability: 15,
          morale: -10,
          population: -0.3,
          logMessage: 'The army stormed rebel stockades; rebel ringleaders were executed at the marketplace.'
        }
      },
      {
        id: 'grant_amnesty_and_seed',
        text: 'Execute predatory county magistrates and grant rebels grain and seed.',
        description: 'Win back the hearts of commoners by punishing bad officials and providing land.',
        previewEffects: 'Treasury -60, Food -70, Stability +25, Morale +15, Population +0.2M',
        effects: {
          treasury: -60,
          food: -70,
          stability: 25,
          morale: 15,
          population: 0.2,
          logMessage: 'The emperor replaced corrupt magistrates and distributed land; rebels turned back to farming.'
        }
      },
      {
        id: 'conscript_rebels_into_army',
        text: 'Pardon the rebel warriors and enroll their vanguard into new shock battalions.',
        description: 'Harness the battle-hardened rebels into loyal imperial assault troops.',
        previewEffects: 'Military +45, Treasury -40, Stability -5, Morale +5',
        effects: {
          military: 45,
          treasury: -40,
          stability: -5,
          morale: 5,
          logMessage: 'Tough rebel fighters were inducted into the imperial vanguard battalions.'
        }
      }
    ]
  },
  {
    id: 'grand_canal_or_wall_project',
    title: 'The Sovereign’s Grand Monolithic Project (浩大土木之役)',
    category: 'politics',
    description: 'Court engineers submit proposals for a continental waterway canal or grand frontier fortress line to link provinces together for generations.',
    choices: [
      {
        id: 'commit_national_effort',
        text: 'Mobilize national resources and begin construction immediately.',
        description: 'Enormous drain on treasury and manpower today, but will yield immense long-term development.',
        previewEffects: 'Treasury -180, Food -120, Administration +25, Technology +15, Stability -10',
        effects: {
          treasury: -180,
          food: -120,
          administration: 25,
          technology: 15,
          stability: -10,
          population: -0.2,
          logMessage: 'Vast canals and bastions now connect the empire, ensuring trade and rapid mobilization for centuries.'
        }
      },
      {
        id: 'scale_down_gradual',
        text: 'Undertake construction gradually over decades using convict labor.',
        description: 'A measured build that limits fiscal strain while steadily expanding logistics.',
        previewEffects: 'Treasury -70, Food -40, Administration +10, Technology +6',
        effects: {
          treasury: -70,
          food: -40,
          administration: 10,
          technology: 6,
          logMessage: 'Work crews steadily paved new roads and sluice gates without overburdening taxpayers.'
        }
      },
      {
        id: 'shelve_proposal',
        text: 'Shelve the proposal: "The state must first nurture the people."',
        description: 'Conserve wealth and prevent fatigue among the peasantry.',
        previewEffects: 'Stability +10, Morale +10, Treasury +20',
        effects: {
          stability: 10,
          morale: 10,
          treasury: 20,
          logMessage: 'The grand project was postponed; peasants praised the sovereign’s restraint.'
        }
      }
    ]
  },
  {
    id: 'rival_diplomatic_envoy',
    title: 'Rival Imperial Envoys Arrive with Golden Gifts (鄰國國書盟好)',
    category: 'diplomacy',
    description: 'Envoys from a powerful neighboring empire arrive bearing fine jade and stallions, proposing mutual trade rights and a non-aggression pact.',
    choices: [
      {
        id: 'sign_solemn_alliance',
        text: 'Swear a solemn alliance with animal blood sacrifices.',
        description: 'Secure our border and improve foreign relations, freeing our armies to focus elsewhere.',
        previewEffects: 'Morale +10, Stability +15, Treasury +50',
        effects: {
          morale: 10,
          stability: 15,
          treasury: 50,
          logMessage: 'An auspicious treaty was signed, forging mutual trade and peace.'
        }
      },
      {
        id: 'accept_gifts_give_cold_shoulder',
        text: 'Accept their tribute gifts politely, but give non-committal answers.',
        description: 'Pocket their gold without tying imperial hands to any promise.',
        previewEffects: 'Treasury +70, Administration +5',
        effects: {
          treasury: 70,
          administration: 5,
          logMessage: 'The court accepted the tribute stallions while keeping strategic options open.'
        }
      },
      {
        id: 'berate_envoy_and_expel',
        text: 'Scorn their treaty and threaten their envoys: "Submit or be conquered!"',
        description: 'Rouse fiery martial spirit, intimidating the realm at the cost of diplomatic hostility.',
        previewEffects: 'Military +30, Morale +20, Stability -10',
        effects: {
          military: 30,
          morale: 20,
          stability: -10,
          logMessage: 'The arrogant foreign envoy was banished from court; soldiers cheered for imminent war.'
        }
      }
    ]
  },
  {
    id: 'military_examination_reforms',
    title: 'Imperial Military Examination & Weaponry Reforms (革新武舉神機之變)',
    category: 'military',
    description: 'The Ministry of War advises establishing competitive military exams and state armor workshops to end aristocratic nepotism in army commands.',
    choices: [
      {
        id: 'institute_meritocratic_exams',
        text: 'Institute national military examinations open to commoners and peasants.',
        description: 'Discover fearless field commanders from ordinary ranks.',
        previewEffects: 'Treasury -70, Military +50, Morale +15, Administration +10',
        effects: {
          treasury: -70,
          military: 50,
          morale: 15,
          administration: 10,
          logMessage: 'Commoner warriors competed before the emperor; brilliant new field captains emerged.'
        }
      },
      {
        id: 'equip_heavy_repeating_crossbows',
        text: 'Invest treasury into mass production of heavy iron crossbows and armor.',
        description: 'Focus technological capital on weapon quality and battlefield lethality.',
        previewEffects: 'Treasury -100, Technology +20, Military +40',
        effects: {
          treasury: -100,
          technology: 20,
          military: 40,
          logMessage: 'Imperial arsenals turned out thousands of iron suits and lethal repeating crossbows.'
        }
      },
      {
        id: 'privilege_hereditary_nobles',
        text: 'Retain traditional hereditary clan officers to maintain court harmony.',
        description: 'Avoid alienating powerful aristocrats, preserving stability at the expense of military sharpness.',
        previewEffects: 'Stability +15, Administration -10, Military -10',
        effects: {
          stability: 15,
          administration: -10,
          military: -10,
          logMessage: 'Hereditary aristocrats thanked the emperor for protecting clan privileges.'
        }
      }
    ]
  },
  {
    id: 'great_locust_plague',
    title: 'Black Clouds of Locusts Blot Out the Sun (飛蝗蔽日赤地千里)',
    category: 'disaster',
    description: 'A biblical swarm of locusts has descended from the western plains, stripping wheat and sorghum stalks down to dry earth within days.',
    choices: [
      {
        id: 'locust_bounty_collection',
        text: 'Pay peasants a bounty in silver for every bushel of locusts captured.',
        description: 'Turn pest eradication into public works employment.',
        previewEffects: 'Treasury -80, Food -50, Stability +10, Morale +10',
        effects: {
          treasury: -80,
          food: -50,
          stability: 10,
          morale: 10,
          logMessage: 'Millions of locust bushels were captured and buried; peasants earned emergency silver.'
        }
      },
      {
        id: 'locust_purchase_southern_rice',
        text: 'Dispatch ships to buy emergency rice supplies from southern maritime ports.',
        description: 'Use the treasury to stabilize grain market prices.',
        previewEffects: 'Treasury -110, Food +100, Stability +15',
        effects: {
          treasury: -110,
          food: 100,
          stability: 15,
          logMessage: 'Grain fleets arrived at the capital, keeping flour and rice prices steady.'
        }
      },
      {
        id: 'locust_pray_to_heaven',
        text: 'Fast and perform the Great Rite of Self-Chastisement before Heaven.',
        description: 'Rely on divine rites and moral authority rather than spending state silver.',
        previewEffects: 'Treasury +0, Food -90, Stability -15, Morale -15',
        effects: {
          food: -90,
          stability: -15,
          morale: -15,
          rulerHealth: -5,
          logMessage: 'The emperor fasted in white robes; the famine nonetheless took a bitter toll.'
        }
      }
    ]
  },
  {
    id: 'elixir_of_immortality',
    title: 'The Daoist Alchemist and the Golden Elixir (方士進獻金丹)',
    category: 'politics',
    description: 'An enigmatic alchemist arrives at court presenting a shimmering casket containing pills brewed from cinnabar, gold leaf, and rare mountain fungi, promising eternal life.',
    choices: [
      {
        id: 'elixir_consume_greedily',
        text: 'Consume the Golden Pill: "The Son of Heaven shall reign forever!"',
        description: 'Vigorous psychological zeal, but dangerous heavy metal toxicity.',
        previewEffects: 'Morale +20, Ruler Health -18, Stability -5',
        effects: {
          morale: 20,
          rulerHealth: -18,
          stability: -5,
          logMessage: 'The emperor swallowed the cinnabar pill; fever raged through his body despite manic energy.'
        }
      },
      {
        id: 'elixir_test_on_condemned',
        text: 'Force death-row prisoners to ingest it first under physician supervision.',
        description: 'A ruthless, scientific imperial mind verifying the substance.',
        previewEffects: 'Administration +10, Treasury -30',
        effects: {
          administration: 10,
          treasury: -30,
          logMessage: 'The test subjects perished within weeks; the fraud alchemist was boiled in oil.'
        }
      },
      {
        id: 'elixir_banish_alchemist',
        text: 'Execute the charlatan and publish an edict condemning superstitious poisons.',
        description: 'Promote Confucian rationalism and genuine longevity practices.',
        previewEffects: 'Administration +15, Stability +15, Ruler Health +5',
        effects: {
          administration: 15,
          stability: 15,
          rulerHealth: 5,
          logMessage: 'The emperor cast away the false elixirs and took walks in the imperial gardens.'
        }
      }
    ]
  },
  {
    id: 'assassination_attempt',
    title: 'Dagger Hidden Within the Map (圖窮匕見刺客之變)',
    category: 'character',
    description: 'During a formal audience, an assassin disguised as an envoy drew a poisoned blade and lunged toward the dragon throne!',
    choices: [
      {
        id: 'assassin_parry_and_slay',
        text: 'Draw the imperial longsword and duel the assassin hand-to-hand!',
        description: 'Demonstrate heroic martial valor before all assembled court officials.',
        previewEffects: 'Morale +30, Military +20, Ruler Health -10',
        effects: {
          morale: 30,
          military: 20,
          rulerHealth: -10,
          logMessage: 'The emperor severed the assassin’s limb with the imperial sword; ministers knelt in awe.'
        }
      },
      {
        id: 'assassin_bodyguards_shield',
        text: 'Imperial halberdiers throw themselves forward to pin the assassin.',
        description: 'Prudently let the elite imperial guards protect the sovereign.',
        previewEffects: 'Military -10, Stability +10',
        effects: {
          military: -10,
          stability: 10,
          logMessage: 'Loyal imperial bodyguards fell defending the throne, and the assassin was captured.'
        }
      },
      {
        id: 'assassin_uncover_conspiracy',
        text: 'Hand the assassin to the secret police to root out foreign co-conspirators.',
        description: 'Unravel the espionage web behind the plot.',
        previewEffects: 'Administration +20, Stability +15, Treasury -20',
        effects: {
          administration: 20,
          stability: 15,
          treasury: -20,
          logMessage: 'Under torture, the assassin confessed; five foreign spy rings were dismantled.'
        }
      }
    ]
  },
  {
    id: 'foreign_firearms_tribute',
    title: 'Red-Barbarian Cannon and Musket Blueprints (神機火器密圖)',
    category: 'military',
    description: 'Western coastal merchants and master gunsmiths present cast-bronze breech-loading swivel cannons and black powder chemistry formulas.',
    choices: [
      {
        id: 'firearms_build_divine_corps',
        text: 'Found the "Divine Machine Artillery Corps" with massive foundry casting.',
        description: 'Revolutionize military warfare with devastating siege firepower.',
        previewEffects: 'Treasury -130, Technology +30, Military +60',
        effects: {
          treasury: -130,
          technology: 30,
          military: 60,
          morale: 10,
          logMessage: 'Foundries roared day and night; terrifying thunderous cannons lined the fortress battlements.'
        }
      },
      {
        id: 'firearms_study_and_archive',
        text: 'Commission the Imperial Academy to translate and document the formulas.',
        description: 'Adopt theoretical sciences while minimizing explosive military costs.',
        previewEffects: 'Treasury -40, Technology +15, Administration +10',
        effects: {
          treasury: -40,
          technology: 15,
          administration: 10,
          logMessage: 'Scholars compiled manuals on metallurgy and gunnery for future generations.'
        }
      },
      {
        id: 'firearms_reject_tradition',
        text: 'Reject firearms: "Superior morale and horse archery are the soul of our armies!"',
        description: 'Save treasury and maintain traditional martial pride.',
        previewEffects: 'Morale +10, Treasury +10, Technology -10',
        effects: {
          morale: 10,
          treasury: 10,
          technology: -10,
          logMessage: 'The court reaffirmed orthodox archery and cavalry doctrine.'
        }
      }
    ]
  },
  {
    id: 'border_defection_opportunity',
    title: 'Rival Fortress Governor Offers Midnight Surrender (敵鎮密信請降)',
    category: 'military',
    description: 'A discontented governor of an adjacent rival border region has sent secret envoys with city keys, promising to open the city gates at midnight if granted an imperial marquisate.',
    choices: [
      {
        id: 'defection_accept_and_march',
        text: 'Dispatch an army immediately to receive the city and garrison the gates.',
        description: 'Seize a strategic region without siege casualties, though risk an ambush.',
        previewEffects: 'Treasury -60, Military +30, Morale +20',
        effects: {
          treasury: -60,
          military: 30,
          morale: 20,
          stability: 10,
          logMessage: 'Imperial flags were hoisted above the rival ramparts as dawn broke!'
        }
      },
      {
        id: 'defection_demand_hostages',
        text: 'Demand his sons as hostages before moving any imperial forces.',
        description: 'Prudent caution ensuring loyalty before making any military commitment.',
        previewEffects: 'Administration +15, Treasury -20',
        effects: {
          administration: 15,
          treasury: -20,
          logMessage: 'Hostages were delivered to the capital; the defection proceeded safely.'
        }
      },
      {
        id: 'defection_inform_rival_ruler',
        text: 'Send the secret letter to the rival ruler to sow discord and suspicion.',
        description: 'Psychological espionage causing our enemy to execute their own capable general.',
        previewEffects: 'Administration +15, Morale +15',
        effects: {
          administration: 15,
          morale: 15,
          logMessage: 'The rival emperor suspected treason and executed his general; their border fractured.'
        }
      }
    ]
  },
  {
    id: 'monastery_temple_wealth',
    title: 'Monasteries Amassing Tax-Free Gold & Grain (沙門豪富私匿部曲)',
    category: 'economy',
    description: 'Across the empire, wealthy monasteries have acquired vast tracts of prime agricultural land, housing tens of thousands of tax-exempt lay laborers and bronze temple bells.',
    choices: [
      {
        id: 'temple_melt_bells_for_coins',
        text: 'Melt down bronze idols for coinage and return monks to the tax registers.',
        description: 'Vast economic windfall and labor replenishment, but enrages devout subjects.',
        previewEffects: 'Treasury +180, Food +90, Military +30, Stability -15, Morale -10',
        effects: {
          treasury: 180,
          food: 90,
          military: 30,
          stability: -15,
          morale: -10,
          logMessage: 'Thousands of bronze statues were cast into cash; hundreds of thousands returned to farming.'
        }
      },
      {
        id: 'temple_impose_monastic_tax',
        text: 'Impose a moderate annual registration tax on large monastic estates.',
        description: 'Pragmatic compromise balancing spiritual peace and state revenue.',
        previewEffects: 'Treasury +75, Administration +10, Stability +5',
        effects: {
          treasury: 75,
          administration: 10,
          stability: 5,
          logMessage: 'A regulated licensing tax was levied on grand temples without provoking riots.'
        }
      },
      {
        id: 'temple_patronize_grand_abbot',
        text: 'Patronize the abbot and build a Golden Pagoda to pray for national blessing.',
        description: 'Leverage religious fervor to deepen popular contentment and spiritual loyalty.',
        previewEffects: 'Treasury -80, Stability +25, Morale +20',
        effects: {
          treasury: -80,
          stability: 25,
          morale: 20,
          logMessage: 'Chants for imperial longevity echoed through mountain temples; peasants rejoiced.'
        }
      }
    ]
  },
  {
    id: 'silk_road_merchant_boom',
    title: 'Golden Caravans on the Silk and Sea Routes (萬里商旅雲集)',
    category: 'economy',
    description: 'Traders from Persia, Central Asia, and the Southern Seas crowd the imperial capital markets, trading jade, spices, glass, and Arabian thoroughbred horses for fine silk and porcelain.',
    choices: [
      {
        id: 'trade_build_harbor_customs',
        text: 'Build Maritime Customs Offices and lower tariffs to stimulate commerce.',
        description: 'Transform imperial cities into global commercial emporiums.',
        previewEffects: 'Treasury +140, Technology +15, Administration +15',
        effects: {
          treasury: 140,
          technology: 15,
          administration: 15,
          logMessage: 'Trade flowed unceasingly; customs revenue filled the imperial coffers to the brim.'
        }
      },
      {
        id: 'trade_buy_warhorses',
        text: 'Use trade profits exclusively to purchase 30,000 fine western warhorses.',
        description: 'Upgrade the cavalry shock power of imperial strike armies.',
        previewEffects: 'Treasury -50, Military +60, Morale +15',
        effects: {
          treasury: -50,
          military: 60,
          morale: 15,
          logMessage: 'Sweat-blood stallions were distributed among imperial cavalry regiments.'
        }
      },
      {
        id: 'trade_restrict_foreign_entry',
        text: 'Impose strict curfews and isolate foreign merchants in designated compounds.',
        description: 'Guard state secrets and cultural purity at the cost of mercantile wealth.',
        previewEffects: 'Stability +10, Administration +5, Treasury -20',
        effects: {
          stability: 10,
          administration: 5,
          treasury: -20,
          logMessage: 'Foreign enclaves were strictly regulated by the Ministry of Rites.'
        }
      }
    ]
  },
  {
    id: 'celestial_omen_comet',
    title: 'A White Comet Streaks Across the Night Sky (彗星襲月太白晝見)',
    category: 'politics',
    description: 'Astronomers report that a blazing comet with a trailing white tail swept past the Purple Forbidden Enclosure, sparking ominous whispers of impending regime change.',
    choices: [
      {
        id: 'comet_issue_edict_of_virtue',
        text: 'Issue an Edict of Self-Reflection, pardoning minor convicts across all provinces.',
        description: 'Demonstrate exemplary imperial humility, soothing popular anxiety.',
        previewEffects: 'Stability +20, Morale +15, Administration +10',
        effects: {
          stability: 20,
          morale: 15,
          administration: 10,
          logMessage: 'The sovereign’s virtuous edict dispelled rumors; the realm felt comforted.'
        }
      },
      {
        id: 'comet_rebrand_as_conquest_omen',
        text: 'Declare the celestial comet as an omen that the six rival kings will fall!',
        description: 'Turn an astrological crisis into a fiery rally for continental unification.',
        previewEffects: 'Morale +25, Military +30, Stability -5',
        effects: {
          morale: 25,
          military: 30,
          stability: -5,
          logMessage: 'The court astrologer proclaimed the sword-shaped comet signaled final conquest!'
        }
      },
      {
        id: 'comet_ignore_superstition',
        text: 'Execute trembling astrologers for spreading defeatist rumors.',
        description: 'Rule through supreme iron will and brook no superstitious dissent.',
        previewEffects: 'Administration +15, Stability -10, Morale -10',
        effects: {
          administration: 15,
          stability: -10,
          morale: -10,
          logMessage: 'The astrologers were silenced; court fear kept ministers utterly quiet.'
        }
      }
    ]
  }
];
