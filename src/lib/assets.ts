import cancelIcon from '../assets/icons/cancel.svg';
import chevronLeftIcon from '../assets/icons/chevron-left.svg';
import chevronRightIcon from '../assets/icons/chevron-right.svg';
import closeIcon from '../assets/icons/close.svg';
import deleteIcon from '../assets/icons/delete.svg';
import deliveryIcon from '../assets/icons/delivery.svg';
import editIcon from '../assets/icons/edit.svg';
import emptyShoppingCartIcon from '../assets/icons/empty-shopping-cart.svg';
import errorIcon from '../assets/icons/error.svg';
import externalLinkIcon from '../assets/icons/external-link.svg';
import folderOffIcon from '../assets/icons/folder-off.svg';
import menuIcon from '../assets/icons/menu.svg';
import searchIcon from '../assets/icons/search.svg';
import shoppingCartIcon from '../assets/icons/shopping-cart.svg';
import successIcon from '../assets/icons/success.svg';
import visibilityOffIcon from '../assets/icons/visibility-off.svg';
import visibilityIcon from '../assets/icons/visibility.svg';
import faviconSvg from '../assets/images/favicon.svg';
import heroBannerImage from '../assets/images/unrealworld-angular-banner.png';

export const icons = {
  cancel: cancelIcon,
  'chevron-left': chevronLeftIcon,
  'chevron-right': chevronRightIcon,
  close: closeIcon,
  delete: deleteIcon,
  delivery: deliveryIcon,
  edit: editIcon,
  'empty-shopping-cart': emptyShoppingCartIcon,
  error: errorIcon,
  'external-link': externalLinkIcon,
  'folder-off': folderOffIcon,
  menu: menuIcon,
  search: searchIcon,
  'shopping-cart': shoppingCartIcon,
  success: successIcon,
  'visibility-off': visibilityOffIcon,
  visibility: visibilityIcon,
} as const;

export const images = {
  faviconSvg,
  heroBanner: heroBannerImage,
} as const;

export type IconName = keyof typeof icons;
