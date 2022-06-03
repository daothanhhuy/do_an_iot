
const updateRouter = require('./update.js');
const refreshRouter = require('./refresh.js');
const loginRouter = require('./login.js');
const dashboardRouter = require('./dashboard.js');
const logoutRouter = require('./logout.js');
const chartsRouter = require('./charts.js');
const mainRouter = require('./main.js');
const manualRouter = require('./manual.js');
function route(app) {
    
    app.use('/dashboard', dashboardRouter);
    app.use('/logout', logoutRouter);
    app.use('/update', updateRouter); // /update
    app.use('/refresh', refreshRouter);
    app.use('/main', mainRouter);
    app.use('/charts', chartsRouter);
    app.use('/manual', manualRouter);
    app.use('/', loginRouter);
}

module.exports = route;
