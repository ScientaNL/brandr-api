/**
 * API app requires
 */
const Koa = require('koa');
const Router = require('koa-router');
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
extractor.init({
	useBlockList : false
});

router.get('/extract/:weburi', async (ctx, next) => {
	let weburi = ctx.params.weburi;

	// Code here
	let extractions = await extractor.extract(weburi);

	ctx.body = {
		uri: weburi,
		extractions: extractions
	};
});

router.get('/info', async (ctx, next) => {
	ctx.body = await extractor.getInfo();
});

const koaLog = logger();
app.use(async function (ctx, next) {
	return debug.enabled ? koaLog(ctx, next) : await next();
});

app.use(json());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(3000);
