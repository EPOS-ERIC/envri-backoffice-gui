import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from 'src/apiAndObjects/api/api.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private panelOpened = new BehaviorSubject<boolean>(false);
  public panelOpenedObs = this.panelOpened.asObservable();

  constructor(private apiService: ApiService) {}

  // public getUserSpecifcGroups(userGroupIds: Array<string>): Promise<Array<Group>> {
  //   let userSpecifGroups: Array<Group> = [];
  //   this.apiService.endpoints.Group.getAll.call().then((allGroups: Array<Group>) => {
  //     userSpecifGroups = allGroups.filter((group) => userGroupIds.some((userGroupIds) => group.id === userGroupIds));
  //   });
  // }
}
