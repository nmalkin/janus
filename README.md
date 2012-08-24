Janus
=====
making it easy to anonymously sign into sites that require your email address

At its core is a service for creating aliases for your real email address.
Created on demand, they immediately start forwarding mail to your address,
stopping if and when you decide to delete the alias.

Another important part of the project is a Firefox add-on, which allows you to
create aliases directly from your browser, without having to visit the Janus
website. All you need to do is right-click on an email field for an alias to be
generated and automatically entered into it.

### Janus and Mozilla Persona
The project features deep integration with [Mozilla Persona][Persona] on two
different levels.

First, Janus uses Persona for signing in (meaning no new accounts or passwords
for you to manage and remember).

Additionally, Janus is a [Persona Identity Provider][IdP] (IdP), which allows
you to sign into Persona-enabled sites (RPs) with your alises *without* having
to verify your email address (as you might need to do otherwise).

### More information and technical details
The project is split into two main components:

- the Janus server
- a Firefox add-on

For more information on each, consult the READMEs in the respective directories.


[Persona]: https://login.persona.org/ "Mozilla Persona"
[IdP]: https://developer.mozilla.org/en-US/docs/Persona/Identity_Provider_Overview "IdP Overview"
