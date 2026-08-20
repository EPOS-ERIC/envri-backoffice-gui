import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/services/navigation.service';

@Component({
  selector: 'app-dataproduct-navigation',
  templateUrl: './dataproduct-navigation.component.html',
  styleUrl: './dataproduct-navigation.component.scss',
})
export class DataproductNavigationComponent implements OnInit {
  constructor(private navigationService: NavigationService) {}

  public menuListItems = [
    {
      id: 'generalinformation',
      name: 'General Information',
    },
    {
      id: 'spatialcoverage',
      name: 'Spatial Coverage',
    },
    {
      id: 'temporalcoverage',
      name: 'Temporal Coverage',
    },
    {
      id: 'persistentidentifier',
      name: 'Persistent Identifier',
    },
    {
      id: 'contactpoint',
      name: 'Contact Point',
    },
    {
      id: 'dataproviders',
      name: 'Data Providers',
    },
    {
      id: 'categories',
      name: 'Categories',
    },
    {
      id: 'distribution',
      name: 'Distribution',
    },
  ];
  public activeListItem: string = '';

  private initSubscriptions(): void {
    this.navigationService.dataProductActiveItemObs.subscribe((id: string) => {
      this.activeListItem = id;
    });
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public handleClick(id: string): void {
    this.navigationService.setDataProductActiveItem(id);
    const active = this.menuListItems.find((item) => item.id === id);
    if (active) {
      this.navigationService.setDataProductActiveItemTitle(active.name);
    }
  }
}
