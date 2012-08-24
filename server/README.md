# Janus
  server
----------------

### Overview
The Janus server fulfills the service by providing the following functionality:

- Janus web interface
  where users are able to create, view, and delete aliases
- Janus web API  
  used by the website and the add-on to create aliases (and possibly more, in
  the future)
- mail server  
  listens for mail to the aliases and forwards the messages if appropriate
- Persona Identity Provider (IdP)  
  verifies active aliases as valid emails according to the BrowserID protocol
- BrowserID certifier service  
  used internally by the IdP to create certificates

This functionality is implemented through independently-running four processes:

1. web process (`server.js`)  
   implements all aspects of the web interface,
   including the IdP endpoints (.well-known/browserid and authorization and
   provisioning pages)
2. mail process (`mail/index.js`)  
   runs an SMTP server to process incoming mail,
   handles outgoing mail by sending it to an outgoing SMTP server
3. [BrowserID certifier]() process (`browserid-certifier`)  
   an internal process (i.e., not exposed to the outside world) used to issue
   certificates when vouching for email addresses as part of the IdP process
4. proxy process (`proxy.js`)  
   The web process is run as an HTTP server, but the .well-known/browserid file
   (for the IdP process) needs to be served over HTTPS. To make sure this
   happens, and keep everything as simple as possible, the entire website is
   served over HTTPS. The proxy server makes this happen. It proxies all traffic
   to the external HTTPS port (specified in `config.json`) to the web process's
   port. It also redirects all traffic to the external HTTP port to go through
   HTTPS.

### Setup and configuration
The hardest part of the setup is getting all the crypto stuff working, so let's
start with that.

#### BrowserID certifier
Start by making sure you have the browserid-certifier repo checked out. (It's
included as a git submodule.)

    git submodule init
    git submodule update
    cd browserid-certifier

Now would be a good time to take a look at the certifier's README. The relevant
portion starts in the _Installation_ section. You can ignore the portion about
dependencies (it's out of date?), but you *will* need to create a config file in
`config/local.json`. It'll look like this

    {
      "ip": "0.0.0.0",
      "issuer_hostname": "janus.im",
      "port": 8080,
      "pub_key_path": "var/key.publickey",
      "priv_key_path": "var/key.secretkey"
    }

You'll want to change the `issuer_hostname` to be the hostname where you'll be
running the server.

Next, follow the directions under _Generating the Keypair_. After the first
section, you'll end up with a ``key.publickey`` and ``key.secretkey`` in the
`var` directory. This is the right place for them; you can leave them there.

The second part will help you create a `.well-known/browserid` file. Create a
directory called `var` in the `server` directory, and put the file there, naming
it `browserid`.

__You'll need to modify the `browserid` file, changing the URLs to the
following:__

    {
        "authentication": "/authentication.html", 
        "provisioning": "/provisioning.html", 
        "public-key": { ... }
    }

#### Setting up HTTPS
For your website to be treated as a BrowserID IdP, it needs to serve the
`.well-known/browserid` file over HTTPS. As explained above, we serve the entire
site over HTTPS while we're at it.

This means that you'll need an SSL certificate for everything to work.

##### I already a certificate.
Great!

1. Create a directory named `cert` in the `var` directory
2. Put the private key there and name it `server.key`
3. Put the certificate file there and name it `server.crt`

That should be it.

##### I don't have a certificate.
For testing and development, you can use a self-signed certificate.

__Warning! If you use a self-signed certificate:__

1. Visitors to the site will be presented with scary warnings by their browser.
2. If the user hasn't clicked through the warnings, but try using the site
   (through the add-on or under the hood of the Persona sign-in process), things
   will fail silently and surprisingly.
3. The production instance of Persona (https://login.persona.org) will refuse to
   accept self-signed certificates. Local and dev (https://login.dev.anosrep.org/)
   instances are okay, though.

This is all to say: a self-signed certificate is manageable during development
but is unusable in production.

To create a self-signed certificate, [follow these instructions](https://devcenter.heroku.com/articles/ssl-certificate-self).

#### Setting up incoming mail
Janus uses the [simplesmtp library][simplesmtp] library for handling messages. It is
included as a git submodule, so you should already have the code from
initializing the submodule system a few steps ago.

A word of advice: if you're doing development and are using local hostnames, you
may find mail being rejected, because the library rejects messages if it cannot
resolve the MX records for the domains of the sender or the recipient. If this
is causing you problems, you may want to comment out the relevant lines in
`simplesmtp/lib/server.js`.

#### Setting up outgoing mail
When the mail server gets mail, it checks if the target alias exists and, if it
does, forwards the message to the correct email address. The SMTP server
processes incoming mail and acts as an SMTP client for outgoing mail, but the
actual delivery of the forwarded mail is delegated to another SMTP server.

Its credentials are specified in `config.json`:

```javascript
    "send": {
        "port": 465,
        "host": "smtp.gmail.com",
        "options": {
            "secureConnection": true,
            "auth": {
                "user": "some.user.name@gmail.com",
                "pass": "..."
            }
        }
    }
```

You can use any SMTP server you want. If you need to specify more options, check
out the documentation for the [simplesmtp][] library.

[simplesmtp]: https://github.com/andris9/simplesmtp "simplesmtp node library"

#### Setting up storage
Janus uses [redis](http://redis.io/) for data storage. You'll need to have it
installed and running when you start the server.

#### Installing additional dependencies
Any additional dependencies can be installed by running `npm install`.

#### Other configurations
Finally, you'll need to make some changes to the configuration file, which must
be located in the `server` directory and called `config.json`. A sample file is
included as `config.json.dist`.

```javascript
{
    /* The port on which the web process runs. */
    "port": 8008,
    /* HTTPS traffic to this port will be proxied to the web process. */
    "httpsPort": 443,
    /* Traffic to this port will be redirected to the audience URL (paths preserved) */
    "httpPort": 80,
    /* The SMTP server will be listening on this port. */
    "smtpPort": 25,
    /* Your website's address. It will be used for redirection and assertion generation. */
    "audience": "https://janus.im",
    /* Aliases will be issued as alias@domain. */
    "domain": "janus.im",
    /* Outgoing SMTP server information. See above. */
    "send": { ... }
    /* The host where the certifier process is running. */
    "certifierHost": "127.0.0.1",
    /* The port on which the certifier process is listening. */
    "certifierPort": 8080
}
```

