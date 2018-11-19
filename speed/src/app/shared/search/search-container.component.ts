import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../core/store/api.service';
import { Observable } from 'rxjs';
import { GlobalStore, GlobalSlideTypes } from 'src/app/core/store/global-store.state';
import { filter, map } from 'rxjs/operators';
import { isNullOrUndefined } from 'util';

@Component({
  selector: 'app-search-container',
  templateUrl: './search-container.component.html',
  styleUrls: ['./search-container.component.css']
})
export class SearchContainerComponent implements OnInit {
  public filteredLaunches$: Observable<any[]>;
  public listToShow$: Observable<any[]>;
  private filterType: string;

  constructor(private api: ApiService, private global: GlobalStore) { }

  ngOnInit() {
    this.loadData();
  }

  onSearch = (searchParam: string) => {
    if (this.filterType === 'estado') {
      const filteredLaunches = this.global.select$(GlobalSlideTypes.launches).pipe(
        map(x => x.filter(l => l.status == searchParam))
      );
      this.filteredLaunches$ = filteredLaunches;
    } else if (this.filterType === 'agencia') {
      const filteredLaunches = this.global.select$(GlobalSlideTypes.launches).pipe(
        map(x => x.filter(l =>
        (!isNullOrUndefined(l.rocket) && !isNullOrUndefined(l.rocket.agencies) && l.rocket.agencies.some(n => n.id == searchParam) ||
          l.missions.some(m => !isNullOrUndefined(m.agencies) && m.agencies.some(a => a.id == searchParam)) ||
          l.location.pads.some(p => !isNullOrUndefined(p.agencies) && p.agencies.some(a => a.id == searchParam)))
      )));
      this.filteredLaunches$ = filteredLaunches;
    } else if (this.filterType === 'tipo') {
      const filteredLaunches = this.global.select$(GlobalSlideTypes.launches).pipe(
        map(x => x.filter(l =>
        l.missions.some(n => n.type == searchParam) ||
        (!isNullOrUndefined(l.lsp) && l.lsp.type == searchParam)
      )));
      this.filteredLaunches$ = filteredLaunches;
    }
  }

  public onSelectFilterType($event: string) {
    // this.global.dispatch(new ChangeFilterType($event));
    this.filterType = $event;
    if ('estado' === $event) {
      this.listToShow$ = this.global.select$(GlobalSlideTypes.statuses);
    } else if ('agencia' === $event) {
      this.listToShow$ = this.global.select$(GlobalSlideTypes.agencies);
    } else if ('tipo' === $event) {
      this.listToShow$ = this.global.select$(GlobalSlideTypes.types);
    }
  }

  private loadData() {
    this.api.getAgencies();
    this.api.getMissionTypes();
    this.api.getStatusTypes();
    this.api.getLaunches();
  }
}
