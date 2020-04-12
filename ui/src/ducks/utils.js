export const calculateMortality = (deaths, confirmed) => {
  const mortality = {}

  if (deaths !== null && confirmed !== null) {
    for (const country of Object.keys(deaths)) {
      for (const date of Object.keys(deaths[country])) {
        const deathAtDate = deaths[country][date]

        if (!Object.prototype.hasOwnProperty.call(confirmed, country)) {
          continue
        }
        const confirmedAtDate = confirmed[country][date]

        if (!Object.prototype.hasOwnProperty.call(mortality, country)) {
          mortality[country] = {}
        }
        mortality[country][date] = deathAtDate / confirmedAtDate
      }
    }
  }

  return { mortality }
}

export const extractLatestCounts = (stats, daysAgo = 0) => {
  const regionWithLatestCounts = []

  for (const region of Object.keys(stats)) {
    const dates = Object.keys(stats[region]).sort()

    const lastDate = dates[dates.length - daysAgo - 1]

    const yesterDate = dates[dates.length - daysAgo - 2]

    const currentNumbers = stats[region][lastDate]
    const yesterdayNumbers = stats[region][yesterDate]

    regionWithLatestCounts.push({
      region,
      stats: currentNumbers,
      dayChange: currentNumbers - yesterdayNumbers
    })
  }

  return regionWithLatestCounts
}
