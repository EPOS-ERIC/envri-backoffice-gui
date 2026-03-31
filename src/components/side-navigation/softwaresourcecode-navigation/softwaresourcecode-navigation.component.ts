import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/services/navigation.service';

@Component({
  selector: 'app-softwaresourcecode-navigation',
  templateUrl: './softwaresourcecode-navigation.component.html',
  styleUrl: './softwaresourcecode-navigation.component.scss',
})
export class SoftwareSourceCodeNavigationComponent implements OnInit {
  constructor(private navigationService: NavigationService) {}

  public menuListItems = [
    {
      id: 'generalinformation',
      name: 'General Information',
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
      id: 'categories',
      name: 'Categories',
    },
  ];
  public activeListItem: string = '';

  private initSubscriptions(): void {
    this.navigationService.softwareSourceCodeActiveItemObs.subscribe((id: string) => {
      this.activeListItem = id;
    });
  }

  public ngOnInit(): void {
    this.initSubscriptions();
  }

  public handleClick(id: string): void {
    this.navigationService.setSoftwareSourceCodeActiveItem(id);
    const active = this.menuListItems.find((item) => item.id === id);
    if (active) {
      this.navigationService.setSoftwareSourceCodeActiveItemTitle(active.name);
    }
  }
}
