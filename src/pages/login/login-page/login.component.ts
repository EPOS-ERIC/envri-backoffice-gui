import { Component, OnInit } from '@angular/core';
import { AaaiService } from 'src/aaai/aaai.service';
import { AAAIUser } from 'src/aaai/aaaiUser.interface';
import { environment } from 'src/environments/environment';
import { ActiveUserService } from 'src/services/activeUser.service';
import { UserBackofficeInfo } from 'src/utility/objects/userBackofficeInfo';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginPageComponent implements OnInit {
  public readonly environment = environment;

  constructor(private aaaiService: AaaiService, private activeUserService: ActiveUserService) {}

  public manageUrl!: string;
  public user: null | AAAIUser = null;
  public userInfo: UserBackofficeInfo | null = null;

  public ngOnInit(): void {
    this.manageUrl = this.aaaiService.getManageUrl();
    this.aaaiService.watchUser().subscribe((user: AAAIUser | null) => {
      this.user = user;
    });
  }

  public logIn(): void {
    if (this.user != null) {
      this.activeUserService.setActiveUserInfo(null);
      this.aaaiService.logout();
    } else {
      this.aaaiService.login();
    }
  }
}
