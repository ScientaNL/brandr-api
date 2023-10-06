import puppeteer from 'puppeteer';
import debugPackage from 'debug';
import Blocklist from './Blocklist.js';

const debug = debugPackage('navigator');
debugPackage.log = console.log.bind(console);

export default class Navigator {
	constructor() {
		this.pageLoadTimeout = 5000;

		this.blocklist = null;
		this.browserPromise = null;

		this.defaultPuppeteerOptions = {
			args: ['--no-sandbox', '--disable-dev-shm-usage'],
			defaultViewport: {
				width: 1920,
				height: 1080,
			},
			headless: 'new',
			devtools: true,
		};
	}

	async getInfo() {
		const browser = await this.getBrowser();

		return {
			hasBlockList: this.blocklist === null,
			chromePath: puppeteer.executablePath(),
			defaultArgs: puppeteer.defaultArgs(),
			defaultOptions: this.defaultPuppeteerOptions,
			browser: {
				version: browser.version(),
				userAgent: browser.userAgent(),
			},
		};
	}

	async initBlockList() {
		this.blocklist = new Blocklist();
		await this.blocklist.loadHosts();
	}

	async clearBlocklist() {
		this.blocklist = null;
	}

	/**
	 * Custom load await logic. Wait for load event, but if it doesn't come within time, accept domcontentloaded as
	 * valid event as a marker of page load.
	 */
	async newPage(uri) {
		const browser = await this.getBrowser();

		const page = await browser.newPage();
		const cdp = await page.target()
			.createCDPSession();
		await cdp.send('DOM.enable');
		await cdp.send('CSS.enable');

		await this.configurePage(page, uri);

		return new Promise((resolve, reject) => {

			let domcontentloaded = false;
			page.on("domcontentloaded", () => domcontentloaded = true);

			let navigationResponse = page.goto(uri, {
				timeout: this.pageLoadTimeout,
				waitUntil: 'networkidle0',
			});
			navigationResponse.then(() => {
				resolve({
					page: page,
					cdp: cdp,
				});
			}, (e) => {
				if (domcontentloaded === true) {
					resolve({
						page: page,
						cdp: cdp,
					});
				} else {
					reject(e);
				}
			});
		});
	}

	async configurePage(page, uri) {
		await page.setBypassCSP(true);
		await page.setRequestInterception(true);

		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36');

		let originalHost = null, uriParts = uri.split('/');
		if (uriParts.length > 2) {
			originalHost = uriParts[2];
		}

		page.on('console', this.pageConsoleHandler());
		page.on('pageerror', this.pageErrorHandler());
		page.on('request', this.pageRequestHandler(originalHost));
		page.on('response', this.pageResponseHandler());
		page.on('requestfailed', this.pageRequestFailedHandler());
	}

	async getBrowser() {
		if (this.browserPromise) {
			return this.browserPromise;
		}

		return this.browserPromise = puppeteer.launch(this.defaultPuppeteerOptions);
	}

	pageConsoleHandler() {
		return (msg) => {
			debug.extend('notice')('page-console:', msg.text());
		};
	}

	pageErrorHandler() {
		return (error) => {
			debug.extend('notice')('page-error:', error.message);
		};
	}

	pageRequestHandler(originalHost) {
		return (request) => {
			if (!this.blocklist) {
				request.continue();
				return;
			}

			let hostName = null,
				fileExt = null,
				rqParts = request.url()
					.split('/');
			if (rqParts.length > 2) {
				hostName = rqParts[2];
				let filePathParts = rqParts[rqParts.length - 1].split('?')
					.shift()
					.split('.');
				if (filePathParts.length > 1) {
					fileExt = filePathParts.pop();
				}
			}

			let differentHost = hostName && hostName !== originalHost;
			if (this.blocklist.blockExtension(fileExt)) {
				debug.extend('notice')('page-request-blocked:', fileExt, request.url());
				request.abort();
			} else if (differentHost && this.blocklist.blockHost(hostName)) {
				debug.extend('notice')('page-request-blocked:', hostName, request.url());
				request.abort();
			} else {
				if (differentHost) {
					debug.extend('info')('page-request-not-blocked:', hostName, request.url());
				}
				request.continue();
			}
		};
	}

	pageResponseHandler() {
		return (response) => {
			debug.extend('info')('page-response:', response.status(), response.url());
		};
	}

	pageRequestFailedHandler() {
		return (request) => {
			debug.extend('info')('page-requestfailed:', request.failure().errorText, request.url());
		};
	}
}
