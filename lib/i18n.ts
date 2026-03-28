import { notFound } from "next/navigation";

export const locales = ["en", "ka", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ka: "ქართული",
  ru: "Русский",
};

export const entryTypeSections = {
  heritage: "heritage",
  vineyard: "vineyards",
  experience: "experiences",
  destination: "destinations",
} as const;

export type EntryType = keyof typeof entryTypeSections;
export type EntrySection = (typeof entryTypeSections)[EntryType];

export type LocaleText = Record<Locale, string>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) {
    notFound();
  }

  return value;
}

export function emptyLocaleText(value = ""): LocaleText {
  return {
    en: value,
    ka: value,
    ru: value,
  };
}

export function pickLocaleText(
  value: Partial<Record<Locale, string>> | null | undefined,
  locale: Locale,
) {
  return value?.[locale] || value?.[defaultLocale] || "";
}

export function getSectionFromEntryType(type: EntryType): EntrySection {
  return entryTypeSections[type];
}

export function getEntryTypeFromSection(section: string): EntryType | null {
  const match = Object.entries(entryTypeSections).find(([, value]) => value === section);
  return (match?.[0] as EntryType | undefined) ?? null;
}

type Dictionary = {
  languageSwitcherLabel: string;
  nav: {
    destinations: string;
    heritage: string;
    vineyards: string;
    experiences: string;
    cms: string;
  };
  cta: {
    planTrip: string;
    exploreCollection: string;
    readMore: string;
    discoverNow: string;
    viewMap: string;
    downloadDirections: string;
    save: string;
    upload: string;
    create: string;
  };
  home: {
    kicker: string;
    mustSee: string;
    mustSeeDescription: string;
    featuredVineyardLabel: string;
    experiencesLabel: string;
    newsletterTitle: string;
    newsletterDescription: string;
    regionsMapEyebrow: string;
    regionsMapTitle: string;
    regionsMapDescription: string;
    regionsMapHint: string;
    regionsLiveLabel: string;
    storiesLiveLabel: string;
  };
  region: {
    eyebrow: string;
    offeringsTitle: string;
    featuredStories: string;
    exploreRegion: string;
    browseDestinations: string;
    publishedStories: string;
    noStories: string;
  };
  listing: {
    heritageKicker: string;
    heritageTitle: string;
    heritageDescription: string;
    allSites: string;
    regionLabel: string;
    allRegions: string;
    conservationTitle: string;
    conservationBody: string;
    mission: string;
    sustainability: string;
    exploreMap: string;
  };
  detail: {
    storyKicker: string;
    highlightsTitle: string;
    journeyTitle: string;
    journeyDescription: string;
    locationInformation: string;
  };
  cms: {
    title: string;
    subtitle: string;
    signInTitle: string;
    signInDescription: string;
    username: string;
    password: string;
    users: string;
    dashboard: string;
    entries: string;
    media: string;
    homepage: string;
    moderatorsOnly: string;
    ownerOnly: string;
    setupRequiredTitle: string;
    setupRequiredDescription: string;
    logout: string;
    published: string;
    draft: string;
  };
  footer: {
    description: string;
    privacy: string;
    terms: string;
    contact: string;
    sustainability: string;
  };
};

const dictionaries: Record<Locale, Dictionary> = {
  en: {
    languageSwitcherLabel: "Language",
    nav: {
      destinations: "Destinations",
      heritage: "Heritage",
      vineyards: "Vineyards",
      experiences: "Experiences",
      cms: "CMS",
    },
    cta: {
      planTrip: "Plan Trip",
      exploreCollection: "Explore Collections",
      readMore: "Read More",
      discoverNow: "Discover Now",
      viewMap: "Explore Map",
      downloadDirections: "Download Directions",
      save: "Save",
      upload: "Upload",
      create: "Create",
    },
    home: {
      kicker: "Your editorial guide to mountain sanctuaries, wine valleys, and living craft.",
      mustSee: "Must-See Landmarks",
      mustSeeDescription:
        "A selective collection of monasteries, cave cities, and mountain towers across Georgia.",
      featuredVineyardLabel: "Historic Vineyards",
      experiencesLabel: "Cultural Experiences",
      newsletterTitle: "Stay in the loop.",
      newsletterDescription:
        "Get seasonal itineraries, newly restored sites, and curatorial notes from across Georgia.",
      regionsMapEyebrow: "Interactive Region Map",
      regionsMapTitle: "Hover the map, then step into a dedicated regional story.",
      regionsMapDescription:
        "Each region starts in grayscale. Move across the map to reveal its original color, preview its strongest stories, and click through to the full regional page.",
      regionsMapHint: "Hover to preview a region. Click to open its dedicated page.",
      regionsLiveLabel: "Regions live",
      storiesLiveLabel: "Stories live",
    },
    region: {
      eyebrow: "Regional Profile",
      offeringsTitle: "What this region offers",
      featuredStories: "Featured stories",
      exploreRegion: "Explore Region",
      browseDestinations: "Browse Destinations",
      publishedStories: "Published stories",
      noStories:
        "Stories for this region are being curated now. Add entries in the CMS to bring this page to life.",
    },
    listing: {
      heritageKicker: "Curated Heritage",
      heritageTitle: "Discover the Soul of Georgia.",
      heritageDescription:
        "From mountain towers to subterranean cave cities, explore a landscape where history is etched into every stone.",
      allSites: "All Sites",
      regionLabel: "Region",
      allRegions: "All Regions",
      conservationTitle: "Heritage Conservation",
      conservationBody:
        "KARTLI is dedicated to the dignified presentation and global storytelling of Georgia’s historical sites.",
      mission: "Our Mission",
      sustainability: "Sustainability Policy",
      exploreMap: "Explore Map",
    },
    detail: {
      storyKicker: "Curator's Narrative",
      highlightsTitle: "Architectural Highlights",
      journeyTitle: "Journey to the Peak",
      journeyDescription:
        "The monastery is located above the confluence of the Mtkvari and Aragvi rivers, with multiple ways to arrive.",
      locationInformation: "Location Information",
    },
    cms: {
      title: "KARTLI CMS",
      subtitle: "Editorial controls for Georgian tourism storytelling.",
      signInTitle: "CMS Sign In",
      signInDescription: "Username and password access for owners and moderators.",
      username: "Username",
      password: "Password",
      users: "Users",
      dashboard: "Dashboard",
      entries: "Entries",
      media: "Media",
      homepage: "Homepage",
      moderatorsOnly: "Moderators can edit content but cannot manage accounts.",
      ownerOnly: "Only the owner can add or remove CMS users.",
      setupRequiredTitle: "Backend Setup Required",
      setupRequiredDescription:
        "Add Neon, Better Auth, and Cloudinary environment variables to enable CMS persistence and uploads.",
      logout: "Log out",
      published: "Published",
      draft: "Draft",
    },
    footer: {
      description: "Modern cultural guide. Curated in Tbilisi.",
      privacy: "Privacy",
      terms: "Terms",
      contact: "Contact",
      sustainability: "Sustainability",
    },
  },
  ka: {
    languageSwitcherLabel: "ენა",
    nav: {
      destinations: "მიმართულებები",
      heritage: "მემკვიდრეობა",
      vineyards: "ვენახები",
      experiences: "გამოცდილებები",
      cms: "CMS",
    },
    cta: {
      planTrip: "მოგზაურობის დაგეგმვა",
      exploreCollection: "კოლექციის ნახვა",
      readMore: "ვრცლად",
      discoverNow: "აღმოაჩინე",
      viewMap: "რუკის ნახვა",
      downloadDirections: "მიმართულების ჩამოტვირთვა",
      save: "შენახვა",
      upload: "ატვირთვა",
      create: "შექმნა",
    },
    home: {
      kicker: "რედაქციული გზამკვლევი მთის სიწმინდეების, ღვინის ხეობებისა და ცოცხალი ხელობის შესახებ.",
      mustSee: "აუცილებლად სანახავი ადგილები",
      mustSeeDescription:
        "საქართველოს მონასტრები, გამოქვაბულები და მთის კოშკები ერთ შერჩეულ კოლექციაში.",
      featuredVineyardLabel: "ისტორიული ვენახები",
      experiencesLabel: "კულტურული გამოცდილებები",
      newsletterTitle: "იყავი კავშირზე.",
      newsletterDescription:
        "მიიღე სეზონური მარშრუტები, აღდგენილი ძეგლები და კურატორის ჩანაწერები საქართველოდან.",
      regionsMapEyebrow: "ინტერაქტიული რეგიონების რუკა",
      regionsMapTitle: "დააყენე კურსორი რუკაზე და გადადი კონკრეტული რეგიონის ისტორიაში.",
      regionsMapDescription:
        "ყველა რეგიონი თავიდან შავ-თეთრია. გადაადგილდი რუკაზე, რომ ფერი დაბრუნდეს, ნახო მთავარი ისტორიები და გადახვიდე რეგიონის სრულ გვერდზე.",
      regionsMapHint: "დააყენე კურსორი პრევიუსთვის. დაკლიკე რეგიონის სრულ გვერდზე გადასასვლელად.",
      regionsLiveLabel: "აქტიური რეგიონები",
      storiesLiveLabel: "აქტიური ისტორიები",
    },
    region: {
      eyebrow: "რეგიონის პროფილი",
      offeringsTitle: "რას გთავაზობს ეს რეგიონი",
      featuredStories: "რჩეული ისტორიები",
      exploreRegion: "რეგიონის ნახვა",
      browseDestinations: "ყველა მიმართულება",
      publishedStories: "გამოქვეყნებული ისტორიები",
      noStories:
        "ამ რეგიონის ისტორიები ახლა კურაციის პროცესშია. დაამატე ჩანაწერები CMS-ში, რომ გვერდი შინაარსით შეივსოს.",
    },
    listing: {
      heritageKicker: "კურირებული მემკვიდრეობა",
      heritageTitle: "აღმოაჩინე საქართველოს სული.",
      heritageDescription:
        "მთის კოშკებიდან მიწისქვეშა გამოქვაბულ ქალაქებამდე, აქ ისტორია ქვაშია ამოკვეთილი.",
      allSites: "ყველა ადგილი",
      regionLabel: "რეგიონი",
      allRegions: "ყველა რეგიონი",
      conservationTitle: "მემკვიდრეობის დაცვა",
      conservationBody:
        "KARTLI საქართველოს ისტორიული სივრცეების ღირსეულ წარდგენასა და საერთაშორისო თხრობას ემსახურება.",
      mission: "ჩვენი მისია",
      sustainability: "მდგრადობის პოლიტიკა",
      exploreMap: "რუკის ნახვა",
    },
    detail: {
      storyKicker: "კურატორის თხრობა",
      highlightsTitle: "არქიტექტურული აქცენტები",
      journeyTitle: "გზა მწვერვალამდე",
      journeyDescription:
        "მონასტერი მტკვრისა და არაგვის შესართავის ზემოთ მდებარეობს და მისასვლელად რამდენიმე გზა არსებობს.",
      locationInformation: "ლოკაციის ინფორმაცია",
    },
    cms: {
      title: "KARTLI CMS",
      subtitle: "საქართველოს ტურიზმის სარედაქციო მართვა.",
      signInTitle: "CMS შესვლა",
      signInDescription: "მომხმარებლის სახელითა და პაროლით წვდომა მფლობელებისა და მოდერატორებისთვის.",
      username: "მომხმარებელი",
      password: "პაროლი",
      users: "მომხმარებლები",
      dashboard: "დაფა",
      entries: "კონტენტი",
      media: "მედია",
      homepage: "მთავარი",
      moderatorsOnly: "მოდერატორები რედაქტირებენ კონტენტს, მაგრამ ვერ მართავენ ანგარიშებს.",
      ownerOnly: "მომხმარებლების დამატება ან წაშლა მხოლოდ მფლობელს შეუძლია.",
      setupRequiredTitle: "საჭიროა Backend-ის კონფიგურაცია",
      setupRequiredDescription:
        "დაამატე Neon, Better Auth და Cloudinary გარემოს ცვლადები CMS-ისა და ატვირთვების გასააქტიურებლად.",
      logout: "გასვლა",
      published: "გამოქვეყნებული",
      draft: "ჩანახატი",
    },
    footer: {
      description: "თანამედროვე კულტურული გზამკვლევი. კურაცია თბილისში.",
      privacy: "კონფიდენციალურობა",
      terms: "წესები",
      contact: "კონტაქტი",
      sustainability: "მდგრადობა",
    },
  },
  ru: {
    languageSwitcherLabel: "Язык",
    nav: {
      destinations: "Направления",
      heritage: "Наследие",
      vineyards: "Виноградники",
      experiences: "Впечатления",
      cms: "CMS",
    },
    cta: {
      planTrip: "Спланировать поездку",
      exploreCollection: "Открыть коллекцию",
      readMore: "Подробнее",
      discoverNow: "Смотреть",
      viewMap: "Открыть карту",
      downloadDirections: "Скачать маршрут",
      save: "Сохранить",
      upload: "Загрузить",
      create: "Создать",
    },
    home: {
      kicker: "Редакционный гид по горным святыням, винным долинам и живому ремеслу Грузии.",
      mustSee: "Главные достопримечательности",
      mustSeeDescription:
        "Избранная подборка монастырей, пещерных городов и горных башен по всей Грузии.",
      featuredVineyardLabel: "Исторические виноградники",
      experiencesLabel: "Культурные впечатления",
      newsletterTitle: "Оставайтесь на связи.",
      newsletterDescription:
        "Получайте сезонные маршруты, новости реставрации и кураторские заметки со всей Грузии.",
      regionsMapEyebrow: "Интерактивная карта регионов",
      regionsMapTitle: "Наведите на карту курсор и откройте отдельную историю региона.",
      regionsMapDescription:
        "Сначала регионы показаны в оттенках серого. Наведите курсор, чтобы вернуть исходный цвет, увидеть сильные истории и перейти на полноценную страницу региона.",
      regionsMapHint: "Наведите курсор для превью. Кликните, чтобы открыть страницу региона.",
      regionsLiveLabel: "Активные регионы",
      storiesLiveLabel: "Истории в эфире",
    },
    region: {
      eyebrow: "Профиль региона",
      offeringsTitle: "Что предлагает этот регион",
      featuredStories: "Главные истории",
      exploreRegion: "Открыть регион",
      browseDestinations: "Все направления",
      publishedStories: "Опубликованные истории",
      noStories:
        "Истории для этого региона сейчас курируются. Добавьте материалы в CMS, чтобы наполнить страницу содержанием.",
    },
    listing: {
      heritageKicker: "Кураторское наследие",
      heritageTitle: "Откройте душу Грузии.",
      heritageDescription:
        "От башен в горах до подземных пещерных городов, здесь история высечена в каждом камне.",
      allSites: "Все места",
      regionLabel: "Регион",
      allRegions: "Все регионы",
      conservationTitle: "Сохранение наследия",
      conservationBody:
        "KARTLI занимается достойным представлением и международным рассказом о грузинских исторических местах.",
      mission: "Наша миссия",
      sustainability: "Политика устойчивости",
      exploreMap: "Открыть карту",
    },
    detail: {
      storyKicker: "Кураторский рассказ",
      highlightsTitle: "Архитектурные акценты",
      journeyTitle: "Путь к вершине",
      journeyDescription:
        "Монастырь расположен над слиянием Куры и Арагви, и добраться сюда можно несколькими способами.",
      locationInformation: "Информация о месте",
    },
    cms: {
      title: "KARTLI CMS",
      subtitle: "Редакционное управление туристическим контентом о Грузии.",
      signInTitle: "Вход в CMS",
      signInDescription: "Доступ по имени пользователя и паролю для владельца и модераторов.",
      username: "Имя пользователя",
      password: "Пароль",
      users: "Пользователи",
      dashboard: "Панель",
      entries: "Материалы",
      media: "Медиа",
      homepage: "Главная",
      moderatorsOnly: "Модераторы могут редактировать контент, но не управляют аккаунтами.",
      ownerOnly: "Только владелец может добавлять и удалять пользователей CMS.",
      setupRequiredTitle: "Требуется настройка backend",
      setupRequiredDescription:
        "Добавьте переменные окружения Neon, Better Auth и Cloudinary, чтобы включить CMS и загрузки.",
      logout: "Выйти",
      published: "Опубликовано",
      draft: "Черновик",
    },
    footer: {
      description: "Современный культурный гид. Кураторская работа из Тбилиси.",
      privacy: "Конфиденциальность",
      terms: "Условия",
      contact: "Контакты",
      sustainability: "Устойчивость",
    },
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
