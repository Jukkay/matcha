export const convertBirthdayToAge = (birthday: string) => {
    const now = new Date().getTime()
	const bd = new Date(birthday).getTime()
    const age = (now - bd) / (1000 * 60 * 60 * 24) / 365
    return Math.floor(age)
}