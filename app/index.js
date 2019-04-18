/**
 * API app requires
 */
const Koa = require('koa');

const Router = require('koa-router');
const serveStatic = require('koa-static');
const logger = require('koa-logger');
const json = require('koa-json');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');

const conditional = require('koa-conditional-get');
const etag = require('koa-etag');

const debug = require('debug')('http');

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'; //Dynamite ;'-)


/**
 * Do some scraping
 */
const Extractor = require('./lib/Extractor');
const extractor = new Extractor("/output", process.env.API_ENDPOINT);
extractor.init({useBlockList : true});

/**
 * App start
 */
const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
	ctx.body = {
		version: process.env.API_VERSION,
		title: "BRANDr API",
		author: "Scienta",
		copyright: "\u00A9 Scienta " + (new Date()).getFullYear()
	};
});


router.post('/extract', async (ctx, next) => {
	let url = ctx.request.body.endpoint;
	if(!url) {
		ctx.throw(400,'No valid endpoint given');
	}

	ctx.body = {
		uri: url,
		extractions: await extractor.extract(url)
	};
});

router.post('/extract/:strategy/download', async (ctx, next) => {
	let url = ctx.request.body.endpoint;
	if(!url) {
		ctx.throw(400,'No valid endpoint given');
	}

	let extractions = await extractor.extract(url);

	let result = extractions[ctx.params.strategy];
	if(!result) {
		ctx.throw(400, 'Invalid strategy provided');
	} else if(Array.isArray(result)){
		result = result[0];
	}

	if(result.logo && result.logo.buffer) {
		switch(result.logo.extension) {
			case "png":
				ctx.type = "image/png";
				break;
			case "jpg":
				ctx.type = "image/jpeg";
				break;
			case "gif":
				ctx.type = "image/gif";
				break;
			case "svg":
				ctx.type = "image/svg+xml";
				break;
			default:
				ctx.throw(500, `Invalid image ${result.logo.extension}`);
				break;
		}

		ctx.body = result.logo.buffer;
	} else {
		ctx.throw(404, `Could not download result for strategy`);
	}
});

router.get('/info', async (ctx, next) => {
	ctx.body = await extractor.getInfo();
});

const koaLog = logger();
app.use(async function (ctx, next) {
	return debug.enabled ? koaLog(ctx, next) : await next();
});


app.use(bodyParser());
app.use(conditional());
app.use(etag());
app.use(json());
app.use(cors({origin: '*'}));
app.use(router.routes());
app.use(router.allowedMethods());
app.use(serveStatic("/output"));

app.listen(3000);
