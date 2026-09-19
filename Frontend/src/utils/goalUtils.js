/**
 * Localizes goal titles dynamically based on user language.
 * Prevents hardcoded database strings like 'दीदी की सुरक्षा गुल्लक (Safety Gullak)'
 * from appearing across English or Telugu interfaces.
 */
export function getLocalizedGoalTitle(title, category, t) {
  if (!title) {
    return t ? t('dashboard.savings_goal_title') : 'Emergency Savings';
  }

  const raw = String(title).trim();
  const lower = raw.toLowerCase();

  // If it's the emergency / safety gullak goal
  if (
    raw.includes('सुरक्षा गुल्लक') ||
    raw.includes('दीदी की') ||
    lower.includes('safety gullak') ||
    lower.includes('emergency savings') ||
    lower.includes('emergency buffer') ||
    category === 'emergency'
  ) {
    return t ? t('dashboard.savings_goal_title') : 'Emergency Savings';
  }

  // If title is just a category keyword, map to localized category name
  if (category && t) {
    const catKey = `goals.cat_${category}`;
    const translatedCat = t(catKey);
    if (translatedCat && translatedCat !== catKey && lower === category.toLowerCase()) {
      return translatedCat;
    }
  }

  return title;
}
