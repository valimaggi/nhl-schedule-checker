declare interface MatchDate {
  games: Game[]
}

declare interface Game {
  teams: {
    away: {
      team: {
        name: string
      }
    }
    home: {
      team: {
        name: string
      }
    }
  }
}
