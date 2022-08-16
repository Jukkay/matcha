export const convertBirthdayToAge = (birthday: string) => {
    const now = new Date().getTime()
	const bd = new Date(birthday).getTime()
    const age = (now - bd) / (1000 * 60 * 60 * 24) / 365
    return Math.floor(age)
}

export const reformatDate = (date: string) => {
    const dateObject = new Date(date)
    return `${dateObject.getFullYear()}-${dateObject.getMonth()}-${dateObject.getDate()}`
}

export const convertAgeToBirthday = (age: number) => {
    const now = new Date().getTime()
    const ageInMilliseconds = age * 31556952000
	const bd = new Date(now - ageInMilliseconds)
    return `${bd.getFullYear()}-${bd.getMonth()}-${bd.getDate()}`
}

export const convertMIN_AGE = (age: number) => {
    const now = new Date().getTime()
    const ageInMilliseconds = (age * 31556952000)
	const bd = new Date(now - ageInMilliseconds)
    return `${bd.getFullYear()}-${bd.getMonth()}-${bd.getDate()}`
}

export const convertMAX_AGE = (age: number) => {
    const now = new Date().getTime()
    const ageInMilliseconds = (age * 31556952000) + (364 * 86400000)
	const bd = new Date(now - ageInMilliseconds)
    return `${bd.getFullYear()}-${bd.getMonth()}-${bd.getDate()}`
}