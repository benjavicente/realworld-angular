import addIcon from '../assets/icons/add.svg';
import bookmarkCheckIcon from '../assets/icons/bookmark-check.svg';
import bookmarkIcon from '../assets/icons/bookmark.svg';
import cancelIcon from '../assets/icons/cancel.svg';
import checkIcon from '../assets/icons/check.svg';
import chevronLeftIcon from '../assets/icons/chevron-left.svg';
import chevronRightIcon from '../assets/icons/chevron-right.svg';
import closeIcon from '../assets/icons/close.svg';
import contentCopyIcon from '../assets/icons/content-copy.svg';
import deleteIcon from '../assets/icons/delete.svg';
import deliveryIcon from '../assets/icons/delivery.svg';
import editIcon from '../assets/icons/edit.svg';
import emptyShoppingCartIcon from '../assets/icons/empty-shopping-cart.svg';
import errorIcon from '../assets/icons/error.svg';
import externalLinkIcon from '../assets/icons/external-link.svg';
import folderOffIcon from '../assets/icons/folder-off.svg';
import locationOffIcon from '../assets/icons/location-off.svg';
import menuIcon from '../assets/icons/menu.svg';
import personAddIcon from '../assets/icons/person-add.svg';
import personCancelIcon from '../assets/icons/person-cancel.svg';
import personOffIcon from '../assets/icons/person-off.svg';
import removeIcon from '../assets/icons/remove.svg';
import searchIcon from '../assets/icons/search.svg';
import shoppingCartIcon from '../assets/icons/shopping-cart.svg';
import successIcon from '../assets/icons/success.svg';
import visibilityOffIcon from '../assets/icons/visibility-off.svg';
import visibilityIcon from '../assets/icons/visibility.svg';
import faviconIco from '../assets/images/favicon.ico';
import faviconPng from '../assets/images/favicon.png';
import faviconSvg from '../assets/images/favicon.svg';
import heroBannerImage from '../assets/images/realworld-angular-banner.png';
import lightLogoGif from '../assets/images/light-logo.gif';
import lightLogoSvg from '../assets/images/light-logo.svg';
import fallbackPizzaImage from '../assets/images/pizza.jpg';
import fallbackPizzeriaImage from '../assets/images/pizzeria.jpg';
import pizza1Image from '../assets/images/pizzas/pizza-1.jpg';
import pizzaImage from '../assets/images/pizzas/pizza.jpg';
import pizzeria1Image from '../assets/images/pizzerias/pizzeria-1.jpg';
import pizzeriaImage from '../assets/images/pizzerias/pizzeria.png';

export const icons = {
  add: addIcon,
  'bookmark-check': bookmarkCheckIcon,
  bookmark: bookmarkIcon,
  cancel: cancelIcon,
  check: checkIcon,
  'chevron-left': chevronLeftIcon,
  'chevron-right': chevronRightIcon,
  close: closeIcon,
  'content-copy': contentCopyIcon,
  delete: deleteIcon,
  delivery: deliveryIcon,
  edit: editIcon,
  'empty-shopping-cart': emptyShoppingCartIcon,
  error: errorIcon,
  'external-link': externalLinkIcon,
  'folder-off': folderOffIcon,
  'location-off': locationOffIcon,
  menu: menuIcon,
  'person-add': personAddIcon,
  'person-cancel': personCancelIcon,
  'person-off': personOffIcon,
  remove: removeIcon,
  search: searchIcon,
  'shopping-cart': shoppingCartIcon,
  success: successIcon,
  'visibility-off': visibilityOffIcon,
  visibility: visibilityIcon,
} as const;

export const images = {
  fallbackPizza: fallbackPizzaImage,
  fallbackPizzeria: fallbackPizzeriaImage,
  faviconIco,
  faviconPng,
  faviconSvg,
  heroBanner: heroBannerImage,
  lightLogoGif,
  lightLogoSvg,
  pizza: pizzaImage,
  pizza1: pizza1Image,
  pizzeria: pizzeriaImage,
  pizzeria1: pizzeria1Image,
} as const;

export type IconName = keyof typeof icons;
