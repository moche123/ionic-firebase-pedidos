import { addIcons } from 'ionicons';
import {
  add,
  addCircleOutline,
  bicycle,
  cartOutline,
  cartSharp,
  checkmarkCircle,
  cloudOfflineOutline,
  createSharp,
  fastFoodOutline,
  menuSharp,
  personCircle,
  removeCircleOutline,
  restaurant,
  storefrontSharp,
  trashBin,
} from 'ionicons/icons';

/**
 * Ionic's standalone components render icons purely from registered SVG data
 * (no more implicit fetch-by-name from assets/svg) — every name used anywhere
 * in a template must be registered here once, at bootstrap.
 */
export function registerIcons(): void {
  addIcons({
    add,
    'add-circle-outline': addCircleOutline,
    bicycle,
    'cart-outline': cartOutline,
    'cart-sharp': cartSharp,
    'checkmark-circle': checkmarkCircle,
    'cloud-offline-outline': cloudOfflineOutline,
    'create-sharp': createSharp,
    'fast-food-outline': fastFoodOutline,
    'menu-sharp': menuSharp,
    'person-circle': personCircle,
    'remove-circle-outline': removeCircleOutline,
    restaurant,
    'storefront-sharp': storefrontSharp,
    'trash-bin': trashBin,
  });
}
