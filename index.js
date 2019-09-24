const fs = require('fs')

const path = require('path')
const filePath = path.join(__dirname, 'data.json')
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

const isHome = (game, team) => game.teams.home.team.name.toUpperCase().includes(team.toUpperCase())
const isAway = (game, team) => game.teams.away.team.name.toUpperCase().includes(team.toUpperCase())

const bothPlay = (first, second) => game =>
  isHome(game, first) || isAway(game, first) || isHome(game, second) || isAway(game, second)

const sameGame = (first, second) => game =>
  (isHome(game, first) && isAway(game, second)) || (isHome(game, second) && isAway(game, first))

const sumOpponentOverlaps = (opp, acc, playsInSameDate) =>
  ({ [opp]: (opp in acc ? acc[opp] + playsInSameDate : playsInSameDate) })

const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1)

function printResults (team, overlappingDays) {
  console.log('--- ' + capitalize(team) + ' ---')
  Object.keys(overlappingDays).forEach(opp => {
    console.log(capitalize(opp) + ': ' + overlappingDays[opp])
  })
}

function app (team, ...opponents) {
  const overlappingDays = data.dates.reduce((acc, currentDate) => {
    const summedOpponents = opponents.map(opp => {
      const bothPlayInDate = bothPlay(team, opp)
      const sameGameInDate = sameGame(team, opp)
      const bothPlays =
        currentDate.games.filter(bothPlayInDate).length === 2 ||
        currentDate.games.filter(sameGameInDate).length > 0
          ? 1
          : 0
      return sumOpponentOverlaps(opp, acc, bothPlays)
    })
    return Object.assign({}, ...summedOpponents)
  }, {})
  printResults(team, overlappingDays)
}
const myArgs = process.argv.slice(2)

if (myArgs.length < 2) {
  console.log('Provide at least two team names')
} else {
  app(...myArgs)
}
