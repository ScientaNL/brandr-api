# BRANDr API
BRANDr is an API which retrieves the logos and branding colors of a website. You can use it to obtain branding information of a website based on a URL.

The project utilizes [Puppeteer](https://github.com/GoogleChrome/puppeteer) in order to load a website and perform strategies to assert what the logo and branding colors of a website could be. There are various strategies deployed:
- DOM parsing
- Meta parsing
- Social data parsing
- Color usage parsing


## Deploying the BRANDr API
Checkout the repository, create your own `.env` file (the defaults should be fine) and deploy the BRANDr API Docker container using `docker-compose`:

```shell
docker-compose -f docker-compose.yml up -d --force-recreate \
  && docker-compose -f docker-compose.yml logs -f
```

This command uses `docker logs` to monitor the container usage and debug information.


## Using the API
Check out the API with your favorite REST request tool, such as Postman.


### Request
Fire a x-form-urlencoded POST request to BRANDr endpoint

| Item        | Value                             |
|-------------|-----------------------------------|
| Endpoint    | *endpoint specified in .env file* |
| Method      | POST                              |
| Body        | x-form-urlencoded form parameters |
|  - endpoint | `<<website URL to retrieve>>`     |


### Response
A response could like the result displayed below. The logo array contains our guess. The other properties are the best guesses for their respective strategy.

```json
{
    "uri": "https://www.scienta.nl",
    "extractions": {
        "logo": [
            "<<host>>/520582509e2936254f0bb430d0da3a46.png",
            "<<host>>/aadc84c2b34d58618564d8ab721f8f7d.jpg",
            "<<host>>/39766a4fd1f3d8149ea1f266c8a8a996.png"
        ],
        "dom-logo": "<<host>>/520582509e2936254f0bb430d0da3a46.png",
        "social-logo": "<<host>>/aadc84c2b34d58618564d8ab721f8f7d.jpg",
        "meta-logo": "<<host>>/6816a7546d517431aa9d5894f27c0c42.png",
        "site-style": [
            {
                "colors": [
                    "rgb(230, 81, 0)"
                ],
                "grays": [
                    "rgb(51, 51, 51)",
                    "rgb(0, 0, 0)"
                ]
            }
        ]
    }
}
```
