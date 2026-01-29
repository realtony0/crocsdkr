import settingsData from './site-settings.json';

export function getSettings() {
  return settingsData;
}

export function getHeroSettings() {
  return settingsData.hero;
}

export function getContactSettings() {
  return settingsData.contact;
}

export function getStoreSettings() {
  return settingsData.store;
}

export function getTestimonials() {
  return settingsData.testimonials.filter((t: any) => t.active);
}

export function getWhyUs() {
  return settingsData.whyUs.filter((w: any) => w.active);
}

export function getCategories() {
  return settingsData.categories.filter((c: any) => c.active).sort((a: any, b: any) => a.order - b.order);
}

export function getMaintenance() {
  return settingsData.maintenance;
}

export function getAdminPassword() {
  return settingsData.admin.password;
}
