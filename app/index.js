/**
 * API app requires
 */
const Koa = require('koa');
const Router = require('koa-router');
const serveStatic = require('koa-static');
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

router.get('/download/:path', async (ctx, next) => {
	let relPath = ctx.params.path;

	ctx.body = {
		uri: relPath
	};
});


const koaLog = logger();
app.use(async function (ctx, next) {
	return debug.enabled ? koaLog(ctx, next) : await next();
});

app.use(json());
app.use(router.routes());
app.use(serveStatic("/test"));

// app.use(router.allowedMethods());

app.listen(3000);
