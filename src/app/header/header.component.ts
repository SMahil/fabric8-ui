import { ContextMenuItem } from './../models/context-menu-item';
import { DummyService } from './../dummy/dummy.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Logger } from '../shared/logger.service';
import { User } from '../models/user';
import { UserService } from '../user/user.service';
import { AuthenticationService } from '../auth/authentication.service';
import { Broadcaster } from '../shared/broadcaster.service';
import { ToggleService } from '../toggle/toggle.service';
import { Toggle } from '../toggle/toggle';

@Component({
  selector: 'alm-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [ToggleService]
})

export class HeaderComponent implements OnInit {
  title = 'Almighty';
  loggedInUser: User;
  loggedIn: Boolean = false;
  imgLoaded: Boolean = false;
  togglePaths: Toggle[];
  urlFeatureToggle: string = '';
  selectedFeatureToggle: string = 'Production';

  constructor(
    public router: Router,
    private userService: UserService,
    private logger: Logger,
    private toggleService: ToggleService,
    private auth: AuthenticationService,
    private broadcaster: Broadcaster,
    public dummy: DummyService) {}

  getLoggedUser(): void {
    if (this.loggedIn) {
      this.userService.getUser();
    }
    this.loggedInUser = this.userService.getSavedLoggedInUser();
  }

  getTogglePath(): void {
    this.toggleService
        .getToggles()
        .then(togglePaths => this.togglePaths = togglePaths);
  }

  setFeatureToggle(toggle: Toggle): void {
    this.toggleService.featureToggle = toggle;
    this.urlFeatureToggle = toggle.path;
    this.selectedFeatureToggle = toggle.name;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/public']);
  }

  login() {
    this.router.navigate(['login']);
  }

  ngOnInit(): void {
    this.loggedIn = this.auth.isLoggedIn();
    this.listenToEvents();
    this.getLoggedUser();
    this.getTogglePath();
  }

  onImgLoad() {
    this.imgLoaded = true;
  }

  resetData(): void {
    this.loggedInUser = null as User;
    this.loggedIn = false;
    this.imgLoaded = false;
  }

  listenToEvents() {
    this.broadcaster.on<string>('logout')
      .subscribe(message => {
        this.resetData();
      });
  }

  context(): ContextMenuItem {
    // Find the most specific context menu path and display it
    // TODO This is brittle
    let defaultItem;
    let ret;
    for (let m of this.dummy.contextMenuItems) {
      if (this.router.url.startsWith(m.path)) {
        if (ret == null || m.path.length > ret.path.length) {
          ret = m;
        }
      }
      if (m.default) {
        defaultItem = m;
      }
    }
    return ret || defaultItem;
  }
}
