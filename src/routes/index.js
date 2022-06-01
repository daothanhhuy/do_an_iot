// const dashboardRouter = require('./dashboard');
// const mainRouter = require('./main');
// const chartsRouter = require('./charts');
// const logsRouter = require('./logs');
const updateRouter = require('./update.js');
// const refreshRouter = require('./refresh.js');
// const ledsRouter = require('./leds.js');
// const loginRouter = require('./login.js');
// const signUpRouter = require('./sign-up.js');
//const signUpRouter = require('./');
const loginRouter = require('./login.js');
function route(app) {
    app.use('/', loginRouter);
    app.use('/update', updateRouter) // /update
}

module.exports = route;
