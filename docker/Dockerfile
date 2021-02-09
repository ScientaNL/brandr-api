FROM node:10-slim

RUN apt-get update \
    && apt-get install -y \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    ttf-freefont \
	wget \
	gnupg \
	dirmngr \
	python \
	build-essential \
	ca-certificates \
      --no-install-recommends \
	&& wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
	&& sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
	&& apt-get update \
	&& apt-get install -y google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb \
    && apt-get clean && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

# Use installed chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN yarn global add nodemon puppeteer@1.14.0 \
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

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

ARG API_VERSION
ENV API_VERSION="${API_VERSION}"

RUN chown -R pptruser:pptruser /app
RUN chown -R pptruser:pptruser /output

USER pptruser

ENTRYPOINT ["dumb-init", "--"]

CMD [ "node", "index.js" ]
