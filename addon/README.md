# Janus
  Firefox add-on
----------------
The add-on provides a way for end-users to make use of the Janus service
directly from their browser.

### How it works
On any site, when the user right-clicks on a text field, they are presented with
the option to fill it with an alias. If the user decides to do this, the add-on
connects to the Janus server, retrieves a new alias, and pastes it into the
field on the page.

Note that, for this to work, the user needs to be signed into Janus. If they are
not, then the Janus website will be opened, so that they can sign in.

### Development
The add-on is built using [Jetpack](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/)
(aka the [add-on SDK](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/)).
Per the standard organization, the main logic is located in `lib/main.js`, with
the content-scripts in the `data` directory.

### Building
You can build the add-on using the [cfx tool](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/getting-started-with-cfx.html)
by running `cfx xpi`. You can run an instance of Firefox with the add-on
installed with `cfx run`.
