import { Injectable } from "@angular/core";
import { Observable, Observer } from "rxjs";

import { StoreService, StoreState } from "../store.service";
import { Competition } from "../models/competition.model";
import { Fixture } from "../models/fixture.model";
import { Table } from "../models/table.model";

@Injectable()
export class DataActions {

  private store: StoreService;

  constructor() {
  }

  init = (store: StoreService) => {
    this.store = store;
    this.store.dispatch(state => {
      state.data = {
        competitions: [],
      };
      return state;
    });
  }

  // #################
  // #### ACTIONS ####
  // #################

  fetchCompetitions = (): Observable<StoreState> => {
    return new Observable<StoreState>((observer: Observer<StoreState>) => {
      this.store
          .get('https://api.football-data.org/v1/competitions')
          .subscribe((data: Competition[]) => {
            if (data) {
              this.$$setCompetitions(data.filter(Competition.isAvailable));
              observer.next(this.store.state);
              observer.complete();
              return;
            }
            observer.error('Invalid response!');
          });
    })
  }

  fetchFixtures = (competitionId: number): Observable<StoreState> => {
    return new Observable<StoreState>((observer: Observer<StoreState>) => {
      this.store
          .get(`https://api.football-data.org/v1/competitions/${competitionId}/fixtures`)
          .subscribe((data: any) => {
            if (data && data.fixtures) {
              console.log('fixtrs', data);
              this.$$setFixtures(competitionId, data.fixtures);
              observer.next(this.store.state);
              observer.complete();
              return;
            }
            observer.error('Invalid response!');
          });
    })
  }

  fetchTable = (competitionId: number): Observable<StoreState> => {
    return new Observable<StoreState>((observer: Observer<StoreState>) => {
      this.store
          .get(`https://api.football-data.org/v1/competitions/${competitionId}/leagueTable`)
          .subscribe((data: any) => {
            if (data) {
              console.log('tabl', data);
              this.$$setTable(competitionId, data);
              observer.next(this.store.state);
              observer.complete();
              return;
            }
            observer.error('Invalid response!');
          });
    })
  }


  // #####################
  // #### DISPATCHERS ####
  // #####################

  $$setCompetitions = (competitions: Competition[]) => {
    this.store.dispatch(state => {
      state.data.competitions = StoreService.__copyCollection(competitions);
      return state;
    });
  }

  $$setFixtures = (competitionId: number, fixtures: Fixture[]) => {
    this.store.dispatch(state => {
      let competition = StoreService.__setObjectField(state.data.competitions.find(competition => competition.id == competitionId), 'fixtures', fixtures);
      state.data.competitions = StoreService.__setCollectionItem(state.data.competitions, competition);
      return state;
    });
  }

  $$setTable = (competitionId: number, table: Table) => {
    this.store.dispatch(state => {
      let competition = StoreService.__setObjectField(state.data.competitions.find(competition => competition.id == competitionId), 'table', table);
      state.data.competitions = StoreService.__setCollectionItem(state.data.competitions, competition);
      return state;
    });
  }

}