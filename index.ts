import axios from 'axios';

const todayString = '2019-10-01';
/*
const today = new Date()
const todayString = `${today.getFullYear()}-${today.getMonth() +
  1}-${today.getDate()}`
*/
const getEndDate = (endDateFactor: string) => {
  switch (endDateFactor) {
    case 'CMHL':
      return '2020-03-22';
    case 'GWHL':
      return '2020-03-08';
    case 'GWHL-end':
      return '2020-03-29';
    case 'end':
      return '2020-04-01';
    case 'runko':
      return '2020-02-22';
    case 'pof':
      return '2020-04-01';
    default: {
      console.log(
        "Wrong first parameter! Any of 'CMHL', 'GWHL', 'GWHL-end', 'end', 'runko', 'pof' will do."
      );
      throw Error('Wrong parameter');
    }
  }
};
const url = (endDateFactor: string) =>
  `https://statsapi.web.nhl.com/api/v1/schedule?startDate=${todayString}&endDate=${getEndDate(
    endDateFactor
  )}`;
const getData = async (endDateFactor: string) => {
  try {
    return axios(url(endDateFactor));
  } catch (e) {
    throw Error(e);
  }
};

const isHome = (game: Game, teamName: string) =>
  game.teams.home.team.name.toUpperCase().includes(teamName.toUpperCase());
const isAway = (game: Game, teamName: string) =>
  game.teams.away.team.name.toUpperCase().includes(teamName.toUpperCase());
const plays = (teamName: string) => (game: Game) => isHome(game, teamName) || isAway(game, teamName);

const bothPlay = (first: string, second: string) => (game: Game) =>
  isHome(game, first) ||
  isAway(game, first) ||
  isHome(game, second) ||
  isAway(game, second);

const sameGame = (first: string, second: string) => (game: Game) =>
  (isHome(game, first) && isAway(game, second)) ||
  (isHome(game, second) && isAway(game, first));

const sumOpponentOverlaps = (opp: string, acc: OverLappingDays, playsInSameDate: number): OverLappingDays => ({
  [opp]: opp in acc ? acc[opp] + playsInSameDate : playsInSameDate
});

const capitalize = (string: string) => string.charAt(0).toUpperCase() + string.slice(1);

type OverLappingDays = {
  [teamName: string]: number
}
const toOverlappingDates = (team: string, opponents: string[]) => (acc: OverLappingDays, currentDate: MatchDate): OverLappingDays => {
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
};

async function app (endDateFactor: string, team: string, opponents: string[]) {
  try {
    const dateData = await getData(endDateFactor);

    const toTeamGameDatesCount = (date: MatchDate) => date.games.filter(plays(team)).length;
    const sum = (acc: number, curr: number) => acc + curr;
    const gameCount = dateData.data.dates.map(toTeamGameDatesCount).reduce(sum);

    const overlappingDays = dateData.data.dates.reduce(toOverlappingDates(team, opponents), {});
    printResults(team, gameCount, overlappingDays);
  } catch (e) {
    throw Error(e);
  }
}

function printResults (team: string, gameCount: number, overlappingDays: OverLappingDays) {
  console.log('--- ' + capitalize(team) + ' ---' + gameCount);
  Object.keys(overlappingDays).forEach(opp => {
    console.log(
      capitalize(opp) +
        ': ' +
        overlappingDays[opp] +
        '   ' +
        ((overlappingDays[opp] / gameCount) * 100).toFixed(0) +
        '%'
    );
  });
}

const myArgs: string[] = process.argv.slice(2);

if (myArgs.length < 2) {
  console.log('Provide at least two team names');
} else {
  app(myArgs[0], myArgs[1], myArgs.slice(2));
}
