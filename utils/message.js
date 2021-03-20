const _ = require('lodash')

const resultGet = (data, meta, error) => {
    let message = "Chưa có dữ liệu";
    if (data.length > 0) {
        message = `Tìm thấy ${data.length} dữ liệu`;
    }

    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, meta, error }
}

const resultGetById = (data, error) => {
    let message = "Không tìm thấy dữ liệu";
    if (data) {
        message = "Tìm thấy dữ liệu";
    }

    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, error }
}

const resultCreate = (data, error) => {
    let message = "Thêm mới thất bại";
    if (data) {
        message = "Thêm mới thành công";
    }
    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, error }
}

const resultUpdate = (data, error) => {
    let message = "Cập nhật thất bại";
    if (data) {
        message = "Cập nhật thành công";
    }
    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, error }
}

const resultActive = (data, error) => {
    let message = "Cập nhật thất bại";
    if (data) {
        message = "Cập nhật thành công";
    }
    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, error }
}

const resultActiveMany = (data, error) => {
    let message = "Cập nhật thất bại";
    if (data.length > 0) {
        message = `Cập nhậtthành công ${data.length} dữ liệu`;
    }
    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, error }
}

const resultdelete = (data, error) => {
    let message = "Xóa thất bại";
    if (data.length > 0) {
        message = `Xóa thành công ${data.length} dữ liệu`;
    }
    if (_.get(error, 'message')) {
        message = error.message
    }
    return { message, data, error }
}

module.exports = { resultGet, resultGetById, resultCreate, resultUpdate, resultActive, resultActiveMany, resultdelete }