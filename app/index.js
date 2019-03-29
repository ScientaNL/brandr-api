const puppeteer = require('puppeteer');

/**
 * API app requires
 */
const Koa = require('koa');
const Router = require('koa-router');
const URI = require('urijs');
const logger = require('koa-logger');
const json = require('koa-json');
//const debug = require('debug')('http');

const app = new Koa();
const router = new Router();

router.get('/', async (ctx, next) => {
	let queryData = URI.parseQuery(ctx.request.querystring, true),
		error = queryData['error'] || null;
	// Code here

	if (error) {
		ctx.throw(400, 'ERROR');
	}

	ctx.body = {
		response: 'RESPONDING'
	};
});

router.get('/:variable', async (ctx, next) => {
	let variable = ctx.params.variable;
	// Code here

	if (!variable) {
		ctx.throw(400, 'ERROR');
	}

	ctx.body = {
		variable: variable
	};
});

const koaLog = logger();
app.use(async function (ctx, next) {
	return koaLog(ctx, next);
});

app.use(json());
app.use(router.routes());
app.use(router.allowedMethods());

app.listen(80);
