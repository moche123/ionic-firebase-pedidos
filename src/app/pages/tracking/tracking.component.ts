import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import * as L from 'leaflet';
import { OrderStatus } from '../../models';
import { CartService } from '../../services/cart.service';

// Simulated delivery route around downtown Austin, TX — no routing API needed,
// this is a straight line between two real US coordinates purely for the demo.
const RESTAURANT: L.LatLngTuple = [30.2711, -97.7437];
const CUSTOMER_ADDRESS: L.LatLngTuple = [30.29, -97.73];

const STEPS: { status: OrderStatus; label: string; atProgress: number }[] = [
  { status: 'sent', label: 'Order placed', atProgress: 0 },
  { status: 'seen', label: 'Restaurant confirmed', atProgress: 0.05 },
  { status: 'on-the-way', label: 'Courier on the way', atProgress: 0.1 },
  { status: 'delivered', label: 'Delivered', atProgress: 1 },
];

const TRIP_DURATION_MS = 10000;
const TICK_MS = 100;

function courierIcon(): L.DivIcon {
  return L.divIcon({
    html: '<div class="courier-marker">🛵</div>',
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function pinIcon(emoji: string): L.DivIcon {
  return L.divIcon({
    html: `<div class="pin-marker">${emoji}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

@Component({
  selector: 'app-tracking',
  templateUrl: './tracking.component.html',
  styleUrls: ['./tracking.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, RouterLink],
})
export class TrackingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') private mapContainer!: ElementRef<HTMLDivElement>;

  private router = inject(Router);
  cartService = inject(CartService);

  readonly steps = STEPS;
  /** Map tiles come from OpenStreetMap over the network — the delivery simulation
   * itself doesn't need it, but the background map won't draw without internet. */
  readonly mapTilesUnavailable = signal(false);
  private map?: L.Map;
  private courierMarker?: L.Marker;
  private tickHandle?: ReturnType<typeof setInterval>;
  private startedAt = 0;
  private resizeObserver?: ResizeObserver;

  constructor() {
    if (!this.cartService.activeOrder()) {
      this.router.navigate(['/cart']);
    }
  }

  ngAfterViewInit(): void {
    if (!this.cartService.activeOrder()) return;
    this.initMap();
    this.startSimulation();
  }

  ngOnDestroy(): void {
    if (this.tickHandle) clearInterval(this.tickHandle);
    this.resizeObserver?.disconnect();
    this.map?.remove();
  }

  currentStatus(): OrderStatus {
    return this.cartService.activeOrder()?.status ?? 'sent';
  }

  isStepDone(step: OrderStatus): boolean {
    const currentIndex = STEPS.findIndex(s => s.status === this.currentStatus());
    const stepIndex = STEPS.findIndex(s => s.status === step);
    return stepIndex <= currentIndex;
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    })
      .on('tileerror', () => this.mapTilesUnavailable.set(true))
      .on('tileload', () => this.mapTilesUnavailable.set(false))
      .addTo(this.map);

    L.marker(RESTAURANT, { icon: pinIcon('🍔') }).addTo(this.map);
    L.marker(CUSTOMER_ADDRESS, { icon: pinIcon('📍') }).addTo(this.map);

    const route = L.polyline([RESTAURANT, CUSTOMER_ADDRESS], {
      color: '#ff5a3c',
      weight: 4,
      dashArray: '2 10',
      lineCap: 'round',
    }).addTo(this.map);

    this.map.fitBounds(route.getBounds(), { padding: [48, 48] });

    this.courierMarker = L.marker(RESTAURANT, { icon: courierIcon() }).addTo(this.map);

    // The map's container isn't always at its final size yet when Leaflet first
    // measures it (Ionic page-transition animation, lazy-loaded chunk, ion-content
    // layout settling) — that's what makes the map render only partially/tiled.
    // Re-measuring on a couple of rAF ticks and whenever the container resizes fixes it.
    requestAnimationFrame(() => {
      this.map?.invalidateSize();
      this.map?.fitBounds(route.getBounds(), { padding: [48, 48] });
    });
    setTimeout(() => this.map?.invalidateSize(), 300);

    this.resizeObserver = new ResizeObserver(() => this.map?.invalidateSize());
    this.resizeObserver.observe(this.mapContainer.nativeElement);
  }

  private startSimulation(): void {
    this.startedAt = Date.now();
    this.tickHandle = setInterval(() => this.tick(), TICK_MS);
  }

  private tick(): void {
    const elapsed = Date.now() - this.startedAt;
    const progress = Math.min(elapsed / TRIP_DURATION_MS, 1);

    const nextStep = [...STEPS].reverse().find(step => progress >= step.atProgress);
    if (nextStep && nextStep.status !== this.currentStatus()) {
      this.cartService.setOrderStatus(nextStep.status);
    }

    if (this.courierMarker) {
      const lat = RESTAURANT[0] + (CUSTOMER_ADDRESS[0] - RESTAURANT[0]) * progress;
      const lng = RESTAURANT[1] + (CUSTOMER_ADDRESS[1] - RESTAURANT[1]) * progress;
      this.courierMarker.setLatLng([lat, lng]);
    }

    if (progress >= 1 && this.tickHandle) {
      clearInterval(this.tickHandle);
      this.tickHandle = undefined;
    }
  }
}
