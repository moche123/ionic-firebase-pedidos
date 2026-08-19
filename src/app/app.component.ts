import { Component, inject } from '@angular/core';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenu,
  IonMenuToggle,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { NavigationStart, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonMenuToggle,
    IonItem,
    IonLabel,
    IonIcon,
    IonRouterOutlet,
    RouterLink,
  ],
})
export class AppComponent {
  constructor() {
    // A button that triggers navigation keeps DOM focus while Ionic marks the
    // outgoing page aria-hidden mid-transition, which Chrome flags as an
    // accessibility violation. Moving focus away before the page swap avoids it.
    inject(Router)
      .events.pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => (document.activeElement as HTMLElement | null)?.blur());
  }
}
