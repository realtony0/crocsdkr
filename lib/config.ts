import { getContactSettings, getStoreSettings } from './settings';

const contact = getContactSettings();
const store = getStoreSettings();

export const config = {
  whatsapp: {
    phone: contact.whatsapp,
  },
  store: {
    name: store.name,
    slogan: store.slogan,
    instagram: contact.instagram,
    location: contact.location,
  },
};
