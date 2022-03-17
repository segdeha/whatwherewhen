const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

function todaysDay() {
    const today = new Date()
    const day = today.getUTCDay()
    return days[day]
}

export default todaysDay
