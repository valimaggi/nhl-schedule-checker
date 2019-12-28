const axios = require('axios');

const today = new Date();
const todayString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
const url = isPlayoffs =>
  `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${todayString}&endDate=${
    isPlayoffs ? '2020-04-01' : '2020-02-22'
  }`;
const getData = async isPlayoffs => await axios(url(isPlayoffs));

const isHome = (game, team) => game.teams.home.team.name.toUpperCase().includes(team.toUpperCase());
const isAway = (game, team) => game.teams.away.team.name.toUpperCase().includes(team.toUpperCase());
const plays = team => game => isHome(game, team) || isAway(game, team);

const bothPlay = (first, second) => game =>
  isHome(game, first) || isAway(game, first) || isHome(game, second) || isAway(game, second);

const sameGame = (first, second) => game =>
  (isHome(game, first) && isAway(game, second)) || (isHome(game, second) && isAway(game, first));

const sumOpponentOverlaps = (opp, acc, playsInSameDate) => ({
  [opp]: opp in acc ? acc[opp] + playsInSameDate : playsInSameDate,
});

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

function printResults(team, gameCount, overlappingDays) {
  console.log('--- ' + capitalize(team) + ' ---' + gameCount);
  Object.keys(overlappingDays).forEach(opp => {
    console.log(
      capitalize(opp) +
        ': ' +
        overlappingDays[opp] +
        '   ' +
        ((overlappingDays[opp] / gameCount) * 100).toFixed(0) +
        '%',
    );
  });
}

async function app(po, team, ...opponents) {
  const isPlayoffs = po === 'playoffs' || po === 'po';
  const dateData = await getData(isPlayoffs);
  let gameCount = 0;
  const overlappingDays = dateData.data.dates.reduce((acc, currentDate) => {
    gameCount += currentDate.games.filter(plays(team)).length;
    const summedOpponents = opponents.map(opp => {
      const bothPlayInDate = bothPlay(team, opp);
      const sameGameInDate = sameGame(team, opp);
      const bothPlays =
        currentDate.games.filter(bothPlayInDate).length === 2 ||
        currentDate.games.filter(sameGameInDate).length > 0
          ? 1
          : 0;
      return sumOpponentOverlaps(opp, acc, bothPlays);
    });
    return Object.assign({}, ...summedOpponents);
  }, {});
  printResults(team, gameCount, overlappingDays);
}
const myArgs = process.argv.slice(2);

if (myArgs.length < 2) {
  console.log('Provide at least two team names');
} else {
  app(...myArgs);
}
