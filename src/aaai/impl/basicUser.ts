import { AAAIUser } from '../aaaiUser.interface';
import { UserInfo } from 'angular-oauth2-oidc';
import { User } from '../user.interface';
import { SimpleUser } from '../simpleUser';
import { LogService } from 'src/services/log.service';
import { inject } from '@angular/core';

export class BasicUser implements AAAIUser {
  private constructor(
    private readonly id: string,
    private readonly username: string,
    private readonly token: string,
    private readonly email: string
  ) { }

  public static make(
    id: null | string,
    name: null | string,
    token: string,
    email: null | string
  ): null | BasicUser {
    if (id && id !== '' && name && name !== '' && token && token !== '' && email && email !== '') {
      return new BasicUser(id, name, token, email);
    }

    return null;
  }

  public static makeOrDefault(
    id: null | string,
    name: null | string,
    token: string,
    email: null | string,
  ): null | AAAIUser {
    return BasicUser.make(id, name, token, email);
  }

  // public static makeDefault(): AAAIUser {
  //   return BasicUser.make('guest', 'Guest', 'guest-token', false);
  // }

  public static makeFromProfileResponse(token: string, profileObject: UserInfo): null | AAAIUser {
    const logger = inject(LogService);
    logger.info(profileObject);
    // Needs updating when we know what the object looks like
    return BasicUser.make(profileObject['info'].email, profileObject['info'].email, token, profileObject['info'].email);
  }

  public getUsername(): string {
    return this.username;
  }

  public getEmail(): string {
    return this.email;
  }

  public getToken(): string {
    return this.token;
  }

  public getIdentifier(): string {
    return this.id;
  }

  public getAsApiUser(): User {
    return new SimpleUser(this.getIdentifier(), this.getUsername(), this.getToken(), this.getEmail());
  }
}
