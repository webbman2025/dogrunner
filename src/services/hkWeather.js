const HK_RHRREAD_URL =
  'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=en';
const HK_WARNSUM_URL =
  'https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=warnsum&lang=en';

export const HK_WEATHER_EFFECTS = {
  NORMAL: 'normal',
  SUNNY: 'sunny',
  RAIN: 'rain',
  WINDY: 'windy',
  STORM: 'storm',
};

const SUNNY_ICON_CODES = new Set([50, 51, 52, 53, 54, 70, 71, 72, 73, 74, 75, 76, 77]);
const RAIN_ICON_CODES = new Set([53, 54, 62, 63, 64]);
const STORM_ICON_CODES = new Set([65]);
const WINDY_ICON_CODES = new Set([80]);

function getIconCode(rhrread) {
  const iconEntry = rhrread?.icon?.[0];
  if (typeof iconEntry === 'number') {
    return iconEntry;
  }

  if (typeof iconEntry === 'object' && iconEntry != null) {
    return iconEntry.value ?? 50;
  }

  return 50;
}

function getHumidity(rhrread) {
  const value = rhrread?.humidity?.data?.[0]?.value;
  return typeof value === 'number' ? value : 0;
}

function isActiveWarning(entry) {
  if (!entry?.code) {
    return false;
  }

  return !String(entry.code).toUpperCase().includes('CANCEL');
}

function hasTyphoonSignal8OrAbove(warnsum) {
  const cyclone = warnsum?.WTCSGNL;
  if (!isActiveWarning(cyclone)) {
    return false;
  }

  return /TC(8|9|10)/i.test(String(cyclone.code));
}

function hasRainstormWarning(warnsum) {
  return isActiveWarning(warnsum?.WRAIN);
}

function hasThunderstormWarning(warnsum) {
  return isActiveWarning(warnsum?.WTS);
}

function hasStrongMonsoonWarning(warnsum) {
  return isActiveWarning(warnsum?.WMSGNL);
}

export async function fetchHKWeatherSnapshot() {
  const [readResponse, warnResponse] = await Promise.all([
    fetch(HK_RHRREAD_URL),
    fetch(HK_WARNSUM_URL),
  ]);

  if (!readResponse.ok || !warnResponse.ok) {
    throw new Error('Hong Kong weather API request failed');
  }

  const rhrread = await readResponse.json();
  const warnsum = await warnResponse.json();

  return {
    iconCode: getIconCode(rhrread),
    humidity: getHumidity(rhrread),
    warnsum,
    updateTime: rhrread?.updateTime ?? null,
  };
}

export function resolveHKWeatherEffect(snapshot) {
  const { iconCode, humidity, warnsum } = snapshot;

  if (hasTyphoonSignal8OrAbove(warnsum)) {
    return {
      effect: HK_WEATHER_EFFECTS.STORM,
      label: 'T8+ typhoon signal',
      windIntensity: 1,
      skyColor: '#333333',
    };
  }

  if (hasThunderstormWarning(warnsum) || STORM_ICON_CODES.has(iconCode)) {
    return {
      effect: HK_WEATHER_EFFECTS.STORM,
      label: 'Thunderstorm warning',
      windIntensity: 0.85,
      skyColor: '#3a4455',
    };
  }

  if (hasRainstormWarning(warnsum) || RAIN_ICON_CODES.has(iconCode) || humidity > 80) {
    return {
      effect: HK_WEATHER_EFFECTS.RAIN,
      label: hasRainstormWarning(warnsum) ? 'Rainstorm warning' : 'Rainy conditions',
      windIntensity: 0.2,
      skyColor: '#6b8fa3',
    };
  }

  if (hasStrongMonsoonWarning(warnsum) || WINDY_ICON_CODES.has(iconCode)) {
    return {
      effect: HK_WEATHER_EFFECTS.WINDY,
      label: 'Windy conditions',
      windIntensity: 0.75,
      skyColor: '#7ba3b8',
    };
  }

  if (SUNNY_ICON_CODES.has(iconCode)) {
    return {
      effect: HK_WEATHER_EFFECTS.SUNNY,
      label: 'Sunny skies',
      windIntensity: 0,
      skyColor: '#87ceeb',
    };
  }

  return {
    effect: HK_WEATHER_EFFECTS.NORMAL,
    label: 'Fair weather',
    windIntensity: 0,
    skyColor: '#87ceeb',
  };
}
