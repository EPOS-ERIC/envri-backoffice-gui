import { Group } from 'generated/backofficeSchemas';
import { UserGroupRequestStatus } from 'src/utility/enums/userGroupRequestStatus.enum';
import { UserRole } from 'src/utility/enums/UserRole.enum';

export interface GroupRequest {
  [key: string]: Group['users'];
}

export interface GroupRequestTable {
  firstName: string;
  lastName: string;
  email: string;
  request: string;
  status: UserGroupRequestStatus;
  role: UserRole;
  userid: string;
  groupid: string | undefined;
}
