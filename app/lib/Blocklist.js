const fs = require('fs');
const readline = require('readline');
const stream = require('stream');

class Blocklist
{
	constructor()
	{
		this.hosts = {};
	}

	async isHostInBlocklist(hostName)
	{
		return this.hosts[hostName];
	}

	async loadHosts()
	{
		let skipNext = false;
		let readHosts = function ({ input }) {
			const output = new stream.PassThrough({ objectMode: true });
			const rl = readline.createInterface({ input });

			rl.on('line', line => {
				if (skipNext || line[0] === '#') {
					return;
				}
				skipNext = true;
				let parts = line.split(' ');
				if (parts.length === 2 && parts[0] === '0.0.0.0') {
					output.write(parts[1].trim());
				}
			});

			rl.on('close', () => {
				output.push(null);
			});

			return output;
		};

		const input = fs.createReadStream('/app/resources/hosts-blocklist/hostnames.txt', {encoding: 'utf8'});
		let hosts = {};
		for await (const host of readHosts({ input })) {
			hosts[host] = true;
		}

		this.hosts = hosts;
	}
}

module.exports = Blocklist;
