/**
 * Created by programulya on 4/20/15.
 */

var app = app || {};

(function () {
    'use strict';

    app.Utils = {
        store: function (namespace, data) {
            if (data) {
                return localStorage.setItem(namespace, JSON.stringify(data));
            }

            var store = localStorage.getItem(namespace);
            return (store && JSON.parse(store)) || [];
        }
    };
})();