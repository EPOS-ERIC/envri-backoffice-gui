/* eslint-disable @angular-eslint/no-output-on-prefix, @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { ActionsService } from 'src/services/actions.service';
import { FilterItem } from 'src/shared/interfaces/form.interface';
import { Status } from 'src/utility/enums/status.enum';
import { ActiveUserService } from 'src/services/activeUser.service';
import { GroupEnum } from 'src/shared/enums/group.enum';

// All SaveComment code in this file has been commented out since it's not in use at the moment, but might turn in useful in the future
/* const COMMENT_KEY = 'commentSearchText'; */

/** Returns sessionStorage keys namespaced by sectionName to avoid collisions between sections */
function filterKeys(sectionName: string) {
  return {
    status: `${sectionName}_filterStatus`,
    title: `${sectionName}_filterTitle`,
    author: `${sectionName}_filterAuthor`,
    authorOption: `${sectionName}_filterAuthorOption`,
    group: `${sectionName}_filterGroup`,
    groupOption: `${sectionName}_filterGroupOption`,
  };
}

export interface FilterEmit {
  status: any;
  title: string;
  /* changeComment: any; */
  author: any;
}

@Component({
  selector: 'app-table-filter',
  templateUrl: './table-filter.component.html',
  styleUrls: ['./table-filter.component.scss'],
})
export class TableFilterComponent implements OnInit {
  constructor(private actionsService: ActionsService, private activeUserService: ActiveUserService) { }

  @Input() sectionName!: string;
  @Input() editorIdsMapping!: Map<string, string>;
  // the list of groups the user belongs to
  @Input() groupFilterOptions!: Array<string>;

  @Output() onFilter: EventEmitter<FilterEmit> = new EventEmitter();
  @Output() onSubmit: EventEmitter<null> = new EventEmitter();
  @Output() onClear: EventEmitter<null> = new EventEmitter();

  public statusOptions: FilterItem[] = [
    {
      option: '',
      label: 'Any',
    },
    {
      option: Status.DRAFT,
      label: 'Draft',
    },
    {
      option: Status.SUBMITTED,
      label: 'Submitted',
    },
    {
      option: Status.PUBLISHED,
      label: 'Published',
    },
    {
      option: Status.DISCARDED,
      label: 'Discarded',
    },
    {
      option: Status.ARCHIVED,
      label: 'Archived',
    },
  ];
  public authorOptions: FilterItem[] = [
    {
      option: 'all',
      label: 'ALL',
    },
    {
      option: 'me',
      label: 'Me',
    },
  ];
  public selectedAuthorOption = 'all';

  public selectedGroupOption = GroupEnum.ALL;

  public filteredGroupOptions: FilterItem[] = [];

  public filters = {
    status: '',
    title: '',
    /* changeComment: '', */
    // Empty author filter means no filtering ("all")
    author: '',
    group: '',
  };

  public isExpanded = false;

  /**
   * Restores all filter values from sessionStorage so they survive
   * the location.reload() triggered by the back button.
   */
  public ngOnInit(): void {
    const keys = filterKeys(this.sectionName);

    this.filters.status = sessionStorage.getItem(keys.status) ?? '';
    this.filters.title = sessionStorage.getItem(keys.title) ?? '';
    this.filters.author = sessionStorage.getItem(keys.author) ?? '';
    this.filters.group = sessionStorage.getItem(keys.group) ?? '';
    this.selectedAuthorOption = sessionStorage.getItem(keys.authorOption) ?? 'all';
    this.selectedGroupOption = (sessionStorage.getItem(keys.groupOption) as GroupEnum) ?? GroupEnum.ALL;
    this.handleViewResults();

    if (
      this.filters.status !== '' ||
      this.filters.title !== '' ||
      this.filters.author !== '' ||
      this.filters.group !== ''
    ) {
      this.isExpanded = true;
    }
  }

  public handleFilterByStatus(event: MatSelectChange): void {
    this.filters.status = event.value;
    sessionStorage.setItem(filterKeys(this.sectionName).status, event.value);
  }

  public handleFilterByAuthor(event: MatSelectChange): void {
    this.selectedAuthorOption = event.value;
    sessionStorage.setItem(filterKeys(this.sectionName).authorOption, event.value);

    if (event.value === 'me') {
      if (this.activeUserService.getActiveUser()) {
        const myId = this.editorIdsMapping.get(this.activeUserService.getActiveUser()?.authIdentifier as string);
        if (myId) {
          this.filters.author = myId;
          sessionStorage.setItem(filterKeys(this.sectionName).author, myId);
        }
      } else {
        this.filters.author = '';
        sessionStorage.removeItem(filterKeys(this.sectionName).author);
      }
    } else {
      // just passing empty filter for ALL value (empty author filter = no filtering, all results are shown)
      this.filters.author = '';
      sessionStorage.removeItem(filterKeys(this.sectionName).author);
    }
  }

  public handleFilterByGroup(event: MatSelectChange): void {
    this.selectedGroupOption = event.value;
    sessionStorage.setItem(filterKeys(this.sectionName).groupOption, event.value);

    switch (event.value) {
      case GroupEnum.SEISOMOLOGY:
      case GroupEnum.NEAR_FAULT_OBSERVATORIES:
      case GroupEnum.GNSS_DATA_AND_PRODUCTS:
      case GroupEnum.VOLCANO_OBSERVATIONS:
      case GroupEnum.SATELLITE_DATA:
      case GroupEnum.GEOMAGNETIC_OBSERVATIONS:
      case GroupEnum.ANTHROPOGENIC_HAZARDS:
      case GroupEnum.GEOLOGICAL_INFORMATION_AND_MODELING:
      case GroupEnum.MULTI_SCALE_LABORATORIES:
      case GroupEnum.TSUNAMI:
        this.filters.group = event.value;
        sessionStorage.setItem(filterKeys(this.sectionName).group, event.value);
        break;
      case GroupEnum.ALL:
        this.filters.group = '';
        sessionStorage.removeItem(filterKeys(this.sectionName).group);
        break;
      default:
        break;
    }
  }

  public handleTitleSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filters.title = target.value;
    sessionStorage.setItem(filterKeys(this.sectionName).title, target.value);
  }

  /* public handleCommentSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filters.changeComment = target.value;
    sessionStorage.setItem(COMMENT_KEY, target.value);
  } */

  public handleClearFilters(): void {
    this.filters.status = '';
    this.filters.title = '';
    /* this.filters.changeComment = ''; */
    this.filters.author = '';
    this.filters.group = '';
    this.selectedAuthorOption = 'all';
    this.selectedGroupOption = GroupEnum.ALL;

    // Clear all persisted filter values from sessionStorage
    const keys = filterKeys(this.sectionName);
    Object.values(keys).forEach((key) => sessionStorage.removeItem(key));

    this.onClear.emit();
  }

  public handleViewResults(): void {
    this.onFilter.emit(this.filters);
  }

  public userCanAtLeastEdit() {
    const user = this.activeUserService.getActiveUser();
    if (user) {
      const canAtLeastEdit = user.groups?.some(
        (group) => group.role === 'EDITOR' || group.role === 'REVIEWER' || group.role === 'ADMIN',
      );
      if (canAtLeastEdit) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
