/*global $:false, Hogan:false, template:false, navigator:false, document:false */
"use strict";

var compiled = Hogan.compile(template);

function renderPage(data) {
    var content = compiled.render(data);
    $('#content').html(content);

    $('#signin').click(function() {
        navigator.id.request();
    });

    $('#signout').click(function() {
        navigator.id.logout();
    });

    $(document).on('click', 'i.icon-remove', function() {
        var icon = $(this);
        var alias = icon.attr('data-value');

        var removeAlias = function() {
            var row = icon.closest('tr');
            row.remove();
        };

        $.ajax({
            type: 'DELETE',
            url: '/alias',
            data: {alias: alias},
            success: removeAlias
        });
    });

    var rowTemplate = Hogan.compile(
        '<tr> <td><i data-value="{{alias}}" class="icon-remove"></i></td> <td>{{alias}}</td> </tr>'
    );
    $('#create').click(function() {
        $.post('/alias', function(alias) {
            $(rowTemplate.render({alias: alias}))
            .prependTo('#aliases')
            .css('background-color', 'rgb(250, 249, 226)')
            .animate({
                'background-color': 'inherit'
            }, 4000)
            ;
        });
    });
}

function getStateAndRender(email) {
    $.getJSON('/aliases', function(aliases) {
        console.log('aliases', aliases);
        renderPage({
            email: email,
            aliases: aliases.map(function(alias) { return {alias:alias}; })
        });
    });
}

$.get('/authenticate', function(response) {
    var email = JSON.parse(response);
    console.log('logged in as', email);

    var authenticating = false;

    navigator.id.watch({
        loggedInUser: email,
        onlogin: function(assertion) {
            console.log('login');
            authenticating = true;
            $.post('/authenticate', {assertion: assertion}, function(response) {
                email = JSON.parse(response);
                console.log('logged in as', email);

                getStateAndRender(email);
            });
        },
        onlogout: function() {
            console.log('logout');
            $.ajax({type: 'DELETE', url: '/authenticate', success: function() {
                renderPage();
            }});
        },
        onready: function() {
            console.log('ready');
            if(! authenticating) {
                if(email) {
                    getStateAndRender(email);
                } else {
                    renderPage();
                }
            }
        }
    });
});

