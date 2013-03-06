Chrome Pong (working title)
===========================


## Building

  **Requirements:**

  * python (2.7.2 tested)
  * node (0.8.x tested)
  * make (GNU Make 3.81 tested, should come with xcode dev tools on mac)

  Building is done using a `Makefile` which in turn uses `npm` and `component` for packages and `jade` and `stylus` for templating.

  But to get started all you have to do it make sure `python` and `node` is installed and then:

    $ make

  While developing I'd recommend using [watch](http://github.com/visionmedia/watch) so you don't have to keep running that command manually. The Makefile is set up to only run whenever something changes.


## Testing

  **Requirements:**

  * Go App Engine (`brew install go-app-engine-64`)

  To get it up and running on a local machine the app engine dev server must be up and running. Start it with:

    $ dev_appserver.py .


## Deploying

  To deploy you must first be added to the app engine user list. Then it's simply a matter of using `make`:

    $ make deploy-webrtcgame

  Where the `webrtcgame` part depends on the app you want to deploy to. See the Makefile for available options.

### Versioned deploys

  Right now it will automatically increment the version number on each deploy. Simply because it will be easier to refer to a version while doing QA.

  If you want to deploy to a specific version (like to version 1 which will be the default) you add `v=` like this:

    $ make deploy-webrtcgame v=1

  The version can be anything that can be a subdomain such as "hello-there-123". Which would be accessible at http://hello-there-123.webrtcgame.appspot.com/.