/**
 * API app requires
 */
const Koa = require('koa');
const Router = require('koa-router');
const URI = require('urijs');
const logger = require('koa-logger');
const json = require('koa-json');
const debug = require('debug')('http');

const app = new Koa();
const router = new Router();




/**
 * Do some scraping
 */
const Extractor = require('./lib/Extractor');
const extractor = new Extractor();

router.get('/extract/:weburi', async (ctx, next) => {
	let weburi = ctx.params.weburi;

	// Code here
	let extractions = await extractor.runStrategies(weburi);

	ctx.body = {
		uri: weburi,
		extractions: extractions
	};
});





/**
 * Example endpoint
 */
router.get('/example/:variable', async (ctx, next) => {
	let queryData = URI.parseQuery(ctx.request.querystring, true),
		error = queryData['error'] || null,
		variable = ctx.params.variable;

	if (error) {
		ctx.throw(400, 'ERROR');
	}

	ctx.body = {
		variable: variable
	};
});

const koaLog = logger();
app.use(async function (ctx, next) {
	return debug.enabled ? koaLog(ctx, next) : await next();
});

app.use(json());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
