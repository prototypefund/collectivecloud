const byName = (a, b) => a.name.localeCompare(b.name, OC.getLanguage())
const byTitle = (a, b) => a.title.localeCompare(b.title, OC.getLanguage())
const byTimestamp = (a, b) => b.timestamp - a.timestamp

const pageOrders = {
	byTimestamp: 0,
	byTitle: 1,
}

export {
	byName,
	byTitle,
	byTimestamp,
	pageOrders,
}
