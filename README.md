# nhl-schedule-checker

NHL schedule checker for overlapping match days between teams

## How to use

Run `node index.js` in the command line with arguments described below:

- 1st argument: Detrmines which end date is used
  - `CMHL` => `2020-03-22`
  - `GWHL` => `2020-03-08`
  - `end` => `2020-04-01`
  - `runko` => `2020-02-22`
  - `pof` => `2020-04-01`
- 2st argument: Team whose overlapping matches are to be checked
- 3nd to nth argument: Teams whose the 2nd argument team's matches are being checked against for overlaps

Team names can be used as `nashville` or `predators` or `"nashville predators"`
