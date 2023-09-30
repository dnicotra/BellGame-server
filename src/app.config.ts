import config from "@colyseus/tools";
import express, { Express, Request, Response } from 'express';
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import * as path from "path"

/**
 * Import your Room files
 */
import { BellGameRoom } from "./rooms/BellGameRoom";

type Result = {
                player_ids  : string[][],
                input_bits  : boolean[][],
                answer_bits : boolean[][],
                won         :  boolean[]
              }
const defaultResult: Result = { player_ids: [], input_bits: [], answer_bits: [], won: [] }

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('bell_game_room', BellGameRoom);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.get("/dbreset", (req, res) =>{
            
            
            const adapter = new JSONFileSync<Result>("db.json");
            const db = new LowSync(adapter, defaultResult)
            db.write()
            res.send("Done")
        })

        app.get("/dbdownload", (req, res) =>{
            res.download(path.dirname(__dirname)+"/db.json")
        })


        app.get("/analyse", (req, res) => {
            const adapter = new JSONFileSync<Result>("db.json");
            const db = new LowSync(adapter, defaultResult)
            db.read()

            let n_won = db.data.won.filter(val => val).length
            let n_tot = db.data.won.length
            res.send("<h1> Winning Probability = " + 
                (100*n_won/n_tot).toFixed(2).toString() + "%<h1/>"
                )
        })

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
