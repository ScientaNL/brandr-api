/**
 * API app requires
 */
const Koa = require('koa');
const Router = require('koa-router');
const serveStatic = require('koa-static');
const logger = require('koa-logger');
const json = require('koa-json');
const cors = require('@koa/cors');
const debug = require('debug')('http');

/**
 * App start
 */
const app = new Koa();
const router = new Router();

/**
 * Do some scraping
 */
const Extractor = require('./lib/Extractor');
const extractor = new Extractor("/output", process.env.APP_HOST);
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
app.use(cors({
	origin: '*'
}));
app.use(router.routes());
app.use(router.allowedMethods());

app.use(serveStatic("/output"));

app.listen(80);
