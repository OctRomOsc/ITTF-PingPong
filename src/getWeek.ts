export default function getWeek(): number {
    const currentDate: Date = new Date();

    const year = currentDate.getFullYear();
    const januaryFirst = new Date(year, 0, 1);
    const janDay = januaryFirst.getDay();
    
    

    // Calculate days to next Tuesday (ranking week starts on Tuesday)
    const daysToNextTuesday = (janDay === 2) ? 0 : (9 - janDay) % 7;

    const nextTuesday = new Date(year, 0, januaryFirst.getDate() + daysToNextTuesday);

    // Check if currentDate is before nextTuesday
    if (currentDate < nextTuesday) {
        return 52; // Or handle as week 1, depending on your logic
    } else if (currentDate > nextTuesday) {
        const diffMs = currentDate.getTime() - nextTuesday.getTime();
        const diffDays = diffMs / (1000 * 3600 * 24);
        const weekNumber = Math.ceil(diffDays / 7) + 1; // +1 because first week of the year is week 0, but ITTF calls it week 1
        return weekNumber;
    } else {
        // currentDate is exactly nextTuesday
        return 1;
    }
}
