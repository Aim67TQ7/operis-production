/**
 * App revision: MAJOR.AI_EDITS.PATCH  ->  e.g. 01.001.00
 *
 * MAJOR     hand-coded, controlled by the build. Bump manually.
 * AI_EDITS  incremented by one on every AI edit of this app.
 * PATCH     hand-coded, controlled at the GitHub level. Bump manually.
 */
export const APP_REV_MAJOR = '01';
export const AI_EDIT_COUNT = 40;
export const APP_REV_PATCH = '00';

export const APP_REV = `${APP_REV_MAJOR}.${String(AI_EDIT_COUNT).padStart(3, '0')}.${APP_REV_PATCH}`;
