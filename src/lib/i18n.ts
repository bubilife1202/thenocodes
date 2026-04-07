import { cookies } from "next/headers";

const dictionaries = {
  ko: () => import("./dictionaries/ko.json").then((module) => module.default),
  en: () => import("./dictionaries/en.json").then((module) => module.default),
};

export const getLocale = async () => {
  const cookieStore = await cookies();
  return (cookieStore.get("NEXT_LOCALE")?.value as "ko" | "en") || "ko";
};

export const getDictionary = async (locale?: "ko" | "en") => {
  const selectedLocale = locale || (await getLocale());
  return dictionaries[selectedLocale]();
};
