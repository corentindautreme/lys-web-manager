export const isWithinSeason = (date: Date) => {
    // nf season = after August || before March || in March, before or on the 15th
    return date.getMonth() > 7 || date.getMonth() < 2 || (date.getMonth() == 2 && date.getDate() <= 15);
}