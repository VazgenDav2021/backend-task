const formatDate = require('./formatDate')

const formatUsersData = (array) => {
    if (!array.length) {
        return []
    }

    return array.map(el => {
        const formatedData = formatDate(el.createdAt)
        return {
            ...el,
            createdAt: formatedData
        }
    })

}

module.exports = formatUsersData