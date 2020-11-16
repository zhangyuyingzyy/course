// const isPro = Object.is(process.env.NODE_ENV, 'production')
const isPro = process.env.NODE_ENV === 'production'

module.exports = {
    baseUrl: isPro ? 'https://tmin.u-thinker.com/api/' : 'https://tmin.u-thinker.com/api/'
}