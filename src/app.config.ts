import config from "@colyseus/tools";
import { playground } from "@colyseus/playground";
import { monitor } from "@colyseus/monitor";
import express, { Express, Request, Response } from 'express';
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import * as path from "path"
import cors from "cors"

/**
 * Import your Room files
 */
import { BellGameRoom } from "./rooms/BellGameRoom";
import { BellGameRoomEinstein } from "./rooms/BellGameRoomEinstein";

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
        gameServer.define('bell_game_room_einstein', BellGameRoomEinstein);

    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        // Add a list of allowed origins.
// If you have more origins you would like to add, you can add them to the array below.
        const allowedOrigins = ['http://localhost:5173'];

        const options: cors.CorsOptions = {
        origin: allowedOrigins
        };
        app.use(cors(options))

        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        app.get("/reset_quantum", (req, res) =>{
            
            
            const adapter = new JSONFileSync<Result>("/tmp/db_quantum.json");
            const db = new LowSync(adapter, defaultResult)
            db.write()
            res.send("Done")
        })

        app.get("/reset_einstein", (req, res) =>{
            
            
            const adapter = new JSONFileSync<Result>("/tmp/db_einstein.json");
            const db = new LowSync(adapter, defaultResult)
            db.write()
            res.send("Done")
        })

        app.get("/download_quantum", (req, res) =>{
            res.download("/tmp/db_quantum.json")
        })

        app.get("/download_einstein", (req, res) =>{
            res.download("/tmp/db_einstein.json")
        })


        app.get("/analyse_quantum", (req, res) => {
            const adapter = new JSONFileSync<Result>("/tmp/db_quantum.json");
            const db = new LowSync(adapter, defaultResult)
            db.read()

            let n_won = db.data.won.filter(val => val).length
            let n_tot = db.data.won.length

            let prob = n_won/n_tot
            let err = 3*Math.sqrt(prob*(1-prob)/n_tot)

            res.send("<h1> Winning Probability = " + 
                (100*prob).toFixed(2).toString() + " <span>&#177;</span> "+(100*prob).toFixed(2).toString()+"%<h1/>"
                )
        })

        app.get("/analyse_einstein", (req, res) => {
            const adapter = new JSONFileSync<Result>("/tmp/db_einstein.json");
            const db = new LowSync(adapter, defaultResult)
            db.read()

            let n_won = db.data.won.filter(val => val).length
            let n_tot = db.data.won.length
            let prob = n_won/n_tot
            let err = 3*Math.sqrt(prob*(1-prob)/n_tot)

            res.send("<h1> Winning Probability = " + 
                (100*prob).toFixed(2).toString() + " <span>&#177;</span> "+(100*prob).toFixed(2).toString()+"%<h1/>"
                )
        })

        app.use("/debug", playground)
        app.use("/monitor", monitor())
        
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
