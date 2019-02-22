
'use strict';
const express=require('express');
const parse      = require('csv-parse');
const util       = require('util');
const fs         = require('fs');
const path       = require('path');
const mysql      = require('mysql');
const async      = require('async');
const co         = require('co');
const csvHeaders = require('csv-headers');
const leftpad    = require('leftpad');
//const router=express.Router();

//const dbhost = process.argv[2];
//const dbuser = process.argv[3];
//const dbpass = process.argv[4];
//const dbname = process.argv[5];
const tblnm  = process.argv[2];
const csvfn  = process.argv[3];

new Promise((resolve, reject) => {
    csvHeaders({
        file      : csvfn,
        delimiter : ','
    }, function(err, headers) {
        if (err) reject(err);
        else resolve({ headers });
    });
})
.then(context => {
    return new Promise((resolve, reject) => {

        context.db = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '18121995',
            database : 'dbname'
        });

        context.db.connect((err) => {
            if (err) {
                console.error('error connecting: ' + err.stack);
                reject(err);
            } else {
                resolve(context);
            }
        });
    })
})
.then(context => {
    return new Promise((resolve, reject) => {
        context.db.query(`DROP TABLE IF EXISTS ${tblnm}`,
        [ ],
        err => {
            if (err) reject(err);
            else resolve(context);
        })
    });
})
.then(context => {
    return new Promise((resolve, reject) => {
        var fields = '';
        var fieldnms = '';
        var qs = '';
        context.headers.forEach(hdr => {
            hdr = hdr.replace(' ', '_');
            if (fields !== '') fields += ',';
            if (fieldnms !== '') fieldnms += ','
            if (qs !== '') qs += ',';
            fields += ` ${hdr} TEXT`;
            fieldnms += ` ${hdr}`;
            qs += ' ?';
        });
        context.qs = qs;
        context.fieldnms = fieldnms;
        console.log(`about to create CREATE TABLE IF NOT EXISTS ${tblnm} ( ${fields} )`);
        context.db.query(`CREATE TABLE IF NOT EXISTS ${tblnm} ( ${fields} )`,
        [ ],
        err => {
            if (err) reject(err);
            else resolve(context);
        })
    });
})
.then(context => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(csvfn).pipe(parse({
            delimiter: ',',
            columns: true,
            relax_column_count: true
        }, (err, data) => {
            if (err) return reject(err);
            async.eachSeries(data, (datum, next) => {
                // console.log(`about to run INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`);
                var d = [];
                try {
                    context.headers.forEach(hdr => {
                        // In some cases the data fields have embedded blanks,
                        // which must be trimmed off
                        let tp = datum[hdr].trim();
                        // For a field with an empty string, send NULL instead
                        d.push(tp === '' ? null : tp);
                    });
                } catch (e) {
                    console.error(e.stack);
                }
                // console.log(`${d.length}: ${util.inspect(d)}`);
                if (d.length > 0) {
                    context.db.query(`INSERT INTO ${tblnm} ( ${context.fieldnms} ) VALUES ( ${context.qs} )`, d,
                    err => {
                        if (err) { console.error(err); next(err); }
                        else setTimeout(() => { next(); });
                    });
                } else { console.log(`empty row ${util.inspect(datum)} ${util.inspect(d)}`); next(); }
            },
            err => {
                if (err) reject(err);
                else resolve(context);
            });
        }));
    });
})
.then(context => { context.db.end(); })
.catch(err => { console.error(err.stack); });


//module.exports=router;
