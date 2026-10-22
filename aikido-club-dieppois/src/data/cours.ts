import { useTranslation } from "react-i18next";
type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
type Slot = { day: DayKey; time: string | null };
type Course = { id: string; kanji: string; slots: Slot[] };

export const courses: Course[] = [
  { id: "all", kanji: "皆", slots: [{ day: "wed", time: "18h30 - 20h" }, { day: "fri", time: "18h30 - 20h" }] },
  { id: "teen", kanji: "若", slots: [{ day: "wed", time: "18h30 - 20h" }, { day: "fri", time: "18h30 - 20h" }] },
  { id: "weapons", kanji: "剣", slots: [{ day: "wed", time: "17h30 - 18h30" }, { day: "fri", time: "17h30 - 18h30" }] },
  { id: "taiso", kanji: "体", slots: [{ day: "mon", time: "17h30 - 18h30" }] },
  { id: "advanced", kanji: "段", slots: [{ day: "mon", time: "20h - 21h" }, { day: "wed", time: "20h - 21h" }, { day: "fri", time: "20h - 21h" }] },
  { id: "themed", kanji: "題", slots: [{ day: "mon", time: "17h30 - 18h30" }] },
];

export const useWeeklySchedule = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'cours' });

  return [
    {
      day: t('days.mon'),
      short: "LUN",
      courses: [
        {
          time: `${t('from')} 17h 30 ${t('to')} 18h 30`,
          name: t('items.taiso.name'),
          audience: t('items.taiso.audience'),
          detail: t('items.taiso.description'),
        },
        {
          time: `${t('from')} 18h 30 ${t('to')} 20h`,
          name: t('items.themed.name'),
          audience: t('items.themed.audience'),
          detail: t('items.themed.description'),
        },
        {
          time: `${t('from')} 20h ${t('to')} 21h`,
          name: t('items.advanced.name'),
          audience: t('items.advanced.audience'),
          detail: t('items.advanced.description'),
        },
      ],
    },
    {
      day: t('days.tue'),
      short: "MAR",
      courses: [],
    },
    {
      day: t('days.wed'),
      short: "MER",
      courses: [
        {
          time: `${t('from')} 17h 30 ${t('to')} 18h 30`,
          name: t('items.weapons.name'),
          audience: t('items.weapons.audience'),
          detail: t('items.weapons.description'),
        },
        {
          time: `${t('from')} 18h 30 ${t('to')} 20h`,
          name: t('items.all.name'),
          audience: t('items.all.audience'),
          detail: t('items.all.description'),
        },
        {
          time: `${t('from')} 18h 30 ${t('to')} 20h`,
          name: t('items.teen.name'),
          audience: t('items.teen.audience'),
          detail: t('items.teen.description'),
        },
        {
          time: `${t('from')} 20h ${t('to')} 21h`,
          name: t('items.advanced.name'),
          audience: t('items.advanced.audience'),
          detail: t('items.advanced.description'),
        },
      ],
    },
    {
      day: t('days.thu'),
      short: "JEU",
      courses: [],
    },
    {
      day: t('days.fri'),
      short: "VEN",
      courses: [
        {
          time: `${t('from')} 17h 30 ${t('to')} 18h 30`,
          name: t('items.weapons.name'),
          audience: t('items.weapons.audience'),
          detail: t('items.weapons.description'),
        },
        {
          time: `${t('from')} 18h 30 ${t('to')} 20h`,
          name: t('items.all.name'),
          audience: t('items.all.audience'),
          detail: t('items.all.description'),
        },
        {
          time: `${t('from')} 18h 30 ${t('to')} 20h`,
          name: t('items.teen.name'),
          audience: t('items.teen.audience'),
          detail: t('items.teen.description'),
        },
        {
          time: `${t('from')} 20h ${t('to')} 21h`,
          name: t('items.advanced.name'),
          audience: t('items.advanced.audience'),
          detail: t('items.advanced.description'),
        },
      ],
    },
    {
      day: t('days.sat'),
      short: "SAM",
      courses: [],
    },
    {
      day: t('days.sun'),
      short: "DIM",
      courses: [],
    },
  ];
};

export const usePricing = () => {
  const { t } = useTranslation('translation', { keyPrefix: 'cours' });
  return [
    {
    season: "2026-2027",
    pdf: "/documents/tarifs/tarifs2026-2027.pdf",
    plans: [
      {
        key: "adult",
        name: t('maj'),
        price: 175 as number | null,
        description: "",
      },
      {
        key: "child",
        name: t('min'),
        price: 115 as number | null,
        description: "",
      },
    ],}
  ]
};