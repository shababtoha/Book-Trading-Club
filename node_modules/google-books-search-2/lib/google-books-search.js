/**
 * google-books-search-2
 */

var https = require('https');
var extend = require('extend');
var querystring = require('querystring');
var Promise = require('bluebird');
var _ = require('lodash');


// https://developers.google.com/books/docs/v1/using#st_params
var defaultOptions = {
    // Google API key
    key: null,
    // Search in a specified field
    field: null,
    // The position in the collection at which to start the list of results (startIndex)
    offset: 0,
    // The maximum number of elements to return with this request (Max 40) (maxResults)
    limit: 10,
    // Restrict results to books or magazines (or both) (printType)
    type: 'all',
    // Order results by relevance or newest (orderBy)
    order: 'relevance',
    // Restrict results to a specified language (two-letter ISO-639-1 code) (langRestrict)
    lang: 'en'
};

// Special Keywords
var fields = {
    title: 'intitle:',
    author: 'inauthor:',
    publisher: 'inpublisher:',
    subject: 'subject:',
    isbn: 'isbn:'
};

// Base url for Google Books API
var baseUrl = "https://www.googleapis.com/books/v1/volumes?";

/**
 * Search Google Books
 *
 * @param {String} query Search term
 * @param {Object} options Search options
 */
var search = function (query, options) {

    var options = extend(defaultOptions, options || {});

    // Set any special keywords
    if (options.field) {
        query = fields[options.field] + query;
    }

    // Create the request uri
    var queryUrl = {
        q: query,
        startIndex: options.offset,
        maxResults: options.limit,
        printType: options.type,
        orderBy: options.order,
        langRestrict: options.lang
    };

    if (options.key) {
        queryUrl.key = options.key;
    }

    var uri = baseUrl + querystring.stringify(queryUrl);

    return new Promise(function (resolve, reject) {

        // Validate options
        if (!query) {
            reject(new Error("Query is required"));
            return;
        }

        if (options.offset < 0) {
            reject(new Error("Offset cannot be below 0"));
            return;
        }

        if (options.limit < 1 || options.limit > 40) {
            reject(new Error("Limit must be between 1 and 40"));
            return;
        }

        // Send Request
        https.get(uri, function (response) {

            if (response.statusCode && response.statusCode === 200) {

                var body = '';
                response.on('data', function (data) {
                    body += data;
                });

                response.on('end', function () {

                    // Parse response body
                    var data = JSON.parse(body);

                    // Array of JSON results to return
                    var results = [];

                    // Extract useful data
                    if (data.items) {

                        for (var i = 0; i < data.items.length; i++) {

                            var book = data.items[i].volumeInfo;
                            var push = {};

                            push = _.pick(book, [
                                'title',
                                'authors',
                                'publisher',
                                'publishedDate',
                                'pageCount',
                                'printType',
                                'categories',
                                'language',
                                'infoLink',
                                'description',
                                'averageRating',
                                'ratingsCount',
                                'previewLink'
                            ]);

                            // Thumbnail
                            if (book.imageLinks && book.imageLinks.thumbnail) {
                                push.thumbnail = book.imageLinks.thumbnail;
                            }

                            // ISBN
                            if (book.industryIdentifiers && book.industryIdentifiers.length > 0) {
                                var isbn13 = _.find(book.industryIdentifiers, function (item) {
                                    return item.type == "ISBN_13";
                                }, 'identifier');

                                if (isbn13) // try to get isbn13
                                    push.isbn = isbn13;
                                else
                                    push.isbn = book.industryIdentifiers[0].identifier;
                            }

                            results.push(push);

                        }

                    }

                    return resolve(results);

                });

            } else {
                return reject(new Error("Status Code: " + response.statusCode));
            }

        }).on('error', function (error) {
            return reject(error);
        });
    });

};


module.exports.search = search;