/*
         Copyright 2021 EPOS ERIC

 Licensed under the Apache License, Version 2.0 (the License); you may not
 use this file except in compliance with the License.  You may obtain a copy
 of the License at

   http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an AS IS BASIS, WITHOUT
 WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
 License for the specific language governing permissions and limitations under
 the License.
 */
import { User } from './user.interface';
import { Confirm } from './utility/preconditions';

export class SimpleUser implements User {

  constructor(
    private readonly id: string,
    private readonly username: string,
    private readonly token: string,
    private readonly email: string
  ) {
    Confirm.isValidString(id, true);
    Confirm.isValidString(username, true);
    Confirm.isValidString(token, true);
  }

  public getName(): string {
    return this.username;
  }

  public getToken(): string {
    return this.token;
  }

  public getIdentifier(): string {
    return this.id;
  }

  public getEmail(): string {
    return this.email;
  }
}
