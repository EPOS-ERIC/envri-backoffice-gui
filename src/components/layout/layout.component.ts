import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { ActivatedRoute, ActivationStart, Router, RouterOutlet } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';
import { AaaiService } from 'src/aaai/aaai.service';
import { AAAIUser } from 'src/aaai/aaaiUser.interface';
import { ActionsService } from 'src/services/actions.service';
import { ActiveUserService } from 'src/services/activeUser.service';
import { PersistorService, StorageType } from 'src/services/persistor.service';
import { StorageKey } from 'src/utility/enums/storageKey.enum';
import { ApiService } from 'src/apiAndObjects/api/api.service';
import { Entity } from 'src/utility/enums/entity.enum';
import { DialogService } from '../dialogs/dialog.service';
import { DialogSelectGroupComponent } from '../dialogs/dialog-select-group/dialog-select-group.component';
import { Group, User } from 'generated/backofficeSchemas';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('snav') sidenav!: MatSidenav;
  @ViewChild('dialog') dialog!: ElementRef<HTMLElement>;
  @ViewChild(RouterOutlet) outlet!: RouterOutlet;

  private readonly subscriptions: Array<Subscription> = new Array<Subscription>();
  public dropdown = '';
  public readonly environment = environment;
  public user: null | AAAIUser = null;
  public userInfo: User | null = null;
  public sidenavOpen = true;
  public liveChanges = new BehaviorSubject<boolean>(false);
  public userName = '';
  public navigationType = '';
  public manageUrl!: string;
  public entityNavigationType: string = '';

  constructor(
    private router: Router,
    private actRoute: ActivatedRoute,
    private aaai: AaaiService,
    private persistorService: PersistorService,
    public actionsService: ActionsService,
    private cdr: ChangeDetectorRef,
    private activeUserService: ActiveUserService,
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  public ngOnInit(): void {
    this.manageUrl = this.aaai.getManageUrl();
    this.initClick();
    this.navigationType = this.actRoute.parent?.snapshot.url[0].path || '';

    if (window.location.pathname.includes('softwareapplication')) {
      this.entityNavigationType = 'softwareapplication';
    } else if (window.location.pathname.includes('softwaresourcecode')) {
      this.entityNavigationType = 'softwaresourcecode';
    } else if (window.location.pathname.includes('dataproduct')) {
      this.entityNavigationType = 'dataproduct';
    } else if (window.location.pathname.includes('distribution')) {
      this.entityNavigationType = 'distribution';
    }

    this.router.events.subscribe((e) => {
      if (e instanceof ActivationStart) {
        this.outlet.deactivate();
      }
    });

    this.subscriptions.push(
      this.aaai.watchUser().subscribe((user: AAAIUser | null) => {
        this.user = user;
        if (
          null != this.persistorService.getValueFromStorage(StorageType.SESSION_STORAGE, StorageKey.ACCESS_TOKEN) &&
          this.userInfo == null
        ) {
          this.getLoginData();
        }
      }),
      this.activeUserService.activeUserInfoObservable.subscribe((userInfo: User | null) => {
        this.userInfo = userInfo as User;
      }),
    );
  }

  public ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
  }

  public ngAfterViewChecked(): void {
    this.actionsService.liveChangesObservable.subscribe((value) => {
      this.liveChanges.next(value);
      this.cdr.detectChanges();
    });
  }

  private initClick(): void {
    this.onDocumentClick = this.onDocumentClick.bind(this);
    document.addEventListener('click', this.onDocumentClick);
  }

  private onDocumentClick(event: MouseEvent) {
    if (this.dialog.nativeElement.contains(event.target as Node)) {
      return;
    }
    this.dropdown = '';
  }

  public handleToggle(): void {
    this.sidenav.toggle();
    this.sidenavOpen = !this.sidenavOpen;
  }

  public handleClick(): void {
    this.router.navigate(['/home']);
  }

  public toggleDropdown(dropdownName: string): void {
    if (this.dropdown === dropdownName) {
      this.dropdown = '';
    } else {
      this.dropdown = dropdownName;
    }
  }

  public login(): void {
    this.aaai.login();
  }

  public getLoginData() {
    this.apiService.endpoints[Entity.USER].get
      .call({
        available_section: true,
      })
      .then((userInfo: User) => {
        this.activeUserService.setActiveUserInfo(userInfo);
      });
  }

  public handleLogOut(): void {
    this.aaai.logout();
  }

  public handleSelectGroup(): void {
    this.apiService.endpoints['Group'].getAll.call().then((groups: Group[]) => {
      this.dialogService.openDialogForComponent(DialogSelectGroupComponent, {
        groups: groups,
      });
    });
  }

  get isDataProductNav(): string | undefined {
    if (this.entityNavigationType === 'dataproduct' || this.entityNavigationType === 'distribution') {
      return this.entityNavigationType;
    }
    return undefined;
  }
}
