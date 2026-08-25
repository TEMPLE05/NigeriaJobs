// Single source of truth for the site's mascot/logo image. Every component
// that shows it imports from here instead of hardcoding the path, so
// swapping brands (e.g. white-labeling this for another organization) is a
// one-line change instead of hunting through every component that uses it.
export const MASCOT_ICON_URL = '/logo.app/in-site.png';
