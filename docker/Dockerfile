FROM node:10-slim

RUN apt-get update && apt-get install -yq \
	gconf-service \
	libasound2 \
	libatk1.0-0 \
	libc6 \
	libcairo2 \
	libcups2 \
	libdbus-1-3 \
	libexpat1 \
	libfontconfig1 \
	libgcc1 \
	libgconf-2-4 \
	libgdk-pixbuf2.0-0 \
	libglib2.0-0 \
	libgtk-3-0 \
	libnspr4 \
	libpango-1.0-0 \
	libpangocairo-1.0-0 \
	libstdc++6 \
	libx11-6 \
	libx11-xcb1 \
	libxcb1 \
	libxcomposite1 \
	libxcursor1 \
	libxdamage1 \
	libxext6 \
	libxfixes3 \
	libxi6 \
	libxrandr2 \
	libxrender1 \
	libxss1 \
	libxtst6 \
	fonts-ipafont-gothic \
	fonts-wqy-zenhei \
	fonts-thai-tlwg \
	fonts-kacst \
	ttf-freefont \
	ca-certificates \
	fonts-liberation \
	libappindicator1 \
	libnss3 \
	lsb-release \
	xdg-utils \
	wget \
	gnupg \
	dirmngr \
	python \
	build-essential \
	&& wget https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64.deb \
	&& dpkg -i dumb-init_*.deb \
	&& rm -f dumb-init_*.deb \
	&& apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

#RUN groupadd --gid 1001 pptruser \
#	&& useradd --uid 1001 --gid pptruser --groups audio,video --shell /bin/bash --create-home pptruser

RUN mkdir -p /home/pptruser
RUN groupadd -r pptruser && useradd -d /home/pptruser -r -g pptruser -G audio,video pptruser
RUN chown -R pptruser:pptruser /home/pptruser

RUN yarn global add nodemon puppeteer@1.14.0 && yarn cache clean

ENV NODE_PATH="/usr/local/share/.config/yarn/global/node_modules:${NODE_PATH}"

# Set language to UTF8
ENV LANG="C.UTF-8"

WORKDIR /app

RUN wget -P /app/resources/hosts-blocklist https://github.com/notracking/hosts-blocklists/raw/master/domains.txt

# Run custom commands by overwriting docker entrypoint
COPY ./docker/docker-node-entrypoint /usr/local/bin
RUN chmod +x /usr/local/bin/docker-node-entrypoint

# Install app dependencies
COPY ./app /app/
RUN yarn install

RUN mkdir -p /output

RUN chown -R pptruser:pptruser /app
RUN chown -R pptruser:pptruser /output

USER pptruser

ENTRYPOINT ["dumb-init", "--"]

CMD [ "node", "index.js" ]
