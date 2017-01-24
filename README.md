Patter
======

Patter is a web client for participating in public and private chat
rooms over pnut.io.

Although you can run your own private instances, the main deployment
is located at:

[patter.s3rv.com](http://patter.s3rv.com)

## Setting up patter

Everything depends on you having node, npm, and grunt-cli installed. We are going to install all the dependencies and then setup a config file.

Your `/config.json` files should have your app client_id and should look like this:

```json
{
    "patter_client_id": "sQZSnTo-Cw9EIQyaXm-RnCKijCanJwxL"
}
```

### Run these commands to get started

Before getting started make sure you have created a config.json file.

```sh
>>> npm install
>>> grunt server
```

You should now be able to navigate to http://localhost:9001 and see your local copy of patter running.

## NOTE there is an issue building, and you will have to `grunt server --force`, and then copy the /src/js/core/config.js file to the equivalent core folder with the client_id replaced.

### To Distribute Patter

Once you are finished developing patter you can then distribute patter to a production environment. To do so you must generate a version of patter, and then copy all the files to your webserver.

For example:

```sh
>>> grunt dist
>>> rsync -avzt dist/* username@remote.host:/var/www/patter.example.com/
```

Once all your files are uploaded you should then have a working version of patter.